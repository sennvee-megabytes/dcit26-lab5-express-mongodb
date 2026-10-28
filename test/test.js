// Test suite for DCIT 26 Lab 5 REST API
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

async function runTests() {
  console.log(`\n--- Running API Tests against ${BASE_URL} ---\n`);
  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  \x1b[32m✔ PASS:\x1b[0m ${name}`);
      passed++;
    } catch (err) {
      console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${name}`);
      console.error(`         ${err.message}`);
    }
  }

  // 1. Health endpoint
  await test('GET /api/health -> 200 OK', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    if (res.status !== 200 || data.status !== 'ok') {
      throw new Error(`Expected 200 {status: "ok"}, got ${res.status} ${JSON.stringify(data)}`);
    }
  });

  // 2. POST create student
  let studentId = '';
  await test('POST /api/students -> 201 Created (valid payload)', async () => {
    const res = await fetch(`${BASE_URL}/api/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Juan Dela Cruz',
        course: 'BSIT',
        yearLevel: 2,
        section: 'IT-2A'
      })
    });
    const data = await res.json();
    if (res.status !== 201 || !data._id || data.fullName !== 'Juan Dela Cruz') {
      throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(data)}`);
    }
    studentId = data._id;
  });

  // 3. GET all students
  await test('GET /api/students -> 200 OK (returns array)', async () => {
    const res = await fetch(`${BASE_URL}/api/students`);
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data)) {
      throw new Error(`Expected array with status 200, got ${res.status}`);
    }
    const found = data.some(s => s._id === studentId);
    if (!found) throw new Error('Created student ID not found in GET all list');
  });

  // 4. GET student by ID
  await test('GET /api/students/:id -> 200 OK (finds created student)', async () => {
    const res = await fetch(`${BASE_URL}/api/students/${studentId}`);
    const data = await res.json();
    if (res.status !== 200 || data._id !== studentId) {
      throw new Error(`Expected 200 with matching ID, got ${res.status}`);
    }
  });

  // 5. PUT update student
  await test('PUT /api/students/:id -> 200 OK (updates yearLevel and section)', async () => {
    const res = await fetch(`${BASE_URL}/api/students/${studentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Juan Dela Cruz',
        course: 'BSIT',
        yearLevel: 3,
        section: 'IT-3A'
      })
    });
    const data = await res.json();
    if (res.status !== 200 || data.yearLevel !== 3 || data.section !== 'IT-3A') {
      throw new Error(`Expected updated yearLevel 3 & section IT-3A, got: ${JSON.stringify(data)}`);
    }
  });

  // 6. DELETE student
  await test('DELETE /api/students/:id -> 200 OK (deletes record)', async () => {
    const res = await fetch(`${BASE_URL}/api/students/${studentId}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (res.status !== 200 || data.message !== 'Student deleted' || data.id !== studentId) {
      throw new Error(`Expected 200 with delete confirmation, got ${res.status}`);
    }
  });

  // 7. GET deleted student (404)
  await test('GET /api/students/:id -> 404 Not Found (after deletion)', async () => {
    const res = await fetch(`${BASE_URL}/api/students/${studentId}`);
    const data = await res.json();
    if (res.status !== 404 || data.error !== 'Student not found') {
      throw new Error(`Expected 404 "Student not found", got ${res.status}: ${JSON.stringify(data)}`);
    }
  });

  // 8. Validation: Missing required field
  await test('POST /api/students -> 400 Bad Request (missing fullName)', async () => {
    const res = await fetch(`${BASE_URL}/api/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course: 'BSIT', yearLevel: 1 })
    });
    const data = await res.json();
    if (res.status !== 400 || !data.error) {
      throw new Error(`Expected 400 with validation error, got ${res.status}`);
    }
  });

  // 9. Validation: Out-of-range yearLevel
  await test('POST /api/students -> 400 Bad Request (yearLevel > 4)', async () => {
    const res = await fetch(`${BASE_URL}/api/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Juan', course: 'BSIT', yearLevel: 5 })
    });
    const data = await res.json();
    if (res.status !== 400 || !data.error) {
      throw new Error(`Expected 400 for yearLevel 5, got ${res.status}`);
    }
  });

  // 10. Validation: Decimal yearLevel
  await test('POST /api/students -> 400 Bad Request (non-integer yearLevel: 2.5)', async () => {
    const res = await fetch(`${BASE_URL}/api/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Juan', course: 'BSIT', yearLevel: 2.5 })
    });
    const data = await res.json();
    if (res.status !== 400 || !data.error) {
      throw new Error(`Expected 400 for yearLevel 2.5, got ${res.status}`);
    }
  });

  // 11. Malformed ObjectId
  await test('GET /api/students/123 -> 400 Bad Request (invalid ObjectId format)', async () => {
    const res = await fetch(`${BASE_URL}/api/students/123`);
    const data = await res.json();
    if (res.status !== 400 || data.error !== 'Invalid student ID') {
      throw new Error(`Expected 400 "Invalid student ID", got ${res.status}: ${JSON.stringify(data)}`);
    }
  });

  // 12. Malformed JSON Body
  await test('POST /api/students -> 400 Bad Request (malformed JSON syntax)', async () => {
    const res = await fetch(`${BASE_URL}/api/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"unclosed_json: true'
    });
    const data = await res.json();
    if (res.status !== 400 || data.error !== 'Invalid input') {
      throw new Error(`Expected 400 "Invalid input", got ${res.status}: ${JSON.stringify(data)}`);
    }
  });

  console.log(`\n-----------------------------------------`);
  console.log(`Summary: ${passed} passed, ${total - passed} failed out of ${total} tests.`);
  console.log(`-----------------------------------------\n`);
  process.exit(passed === total ? 0 : 1);
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
