require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Student = require('./models/Student');

const app = express();
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Helper Functions
const pick = b => ({
  fullName: b.fullName,
  course: b.course,
  yearLevel: b.yearLevel,
  section: b.section
});

const validId = id => mongoose.isObjectIdOrHexString(id);
const badId = res => res.status(400).json({ error: 'Invalid student ID' });
const notFound = res => res.status(404).json({ error: 'Student not found' });

// CRUD Routes
app.get('/api/students', async (req, res, next) => {
  try {
    res.json(await Student.find());
  } catch (e) {
    next(e);
  }
});

app.get('/api/students/:id', async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return badId(res);
    const s = await Student.findById(req.params.id);
    s ? res.json(s) : notFound(res);
  } catch (e) {
    next(e);
  }
});

app.post('/api/students', async (req, res, next) => {
  try {
    res.status(201).json(await Student.create(pick(req.body)));
  } catch (e) {
    next(e);
  }
});

app.put('/api/students/:id', async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return badId(res);
    const s = await Student.findByIdAndUpdate(
      req.params.id,
      pick(req.body),
      { new: true, runValidators: true }
    );
    s ? res.json(s) : notFound(res);
  } catch (e) {
    next(e);
  }
});

app.delete('/api/students/:id', async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return badId(res);
    const s = await Student.findByIdAndDelete(req.params.id);
    s ? res.json({ message: 'Student deleted', id: req.params.id }) : notFound(res);
  } catch (e) {
    next(e);
  }
});

// Centralized Error Handler (must be registered after all routes)
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: Object.values(err.errors).map(e => e.message) });
  }
  if (err.name === 'CastError' || err.type === 'entity.parse.failed' || (err instanceof SyntaxError && err.status === 400)) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  console.error(err); // details stay on the server
  res.status(500).json({ error: 'Internal server error' });
});

// Connect to MongoDB and then start listening
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`API on port ${PORT}`));
  })
  .catch(err => {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  });
