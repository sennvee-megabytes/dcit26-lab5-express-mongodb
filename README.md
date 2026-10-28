# Student Records REST API (DCIT 26 - Lab 5)

A RESTful backend service for managing student records built with **Node.js**, **Express**, **MongoDB**, and **Mongoose**. This project implements full CRUD operations, strict schema validation, centralized error handling, and robust persistence in MongoDB.

---

## 📌 Project Overview

This repository satisfies the requirements of **DCIT 26: Application Development and Emerging Technologies - Laboratory 5: Express and MongoDB**.

### Core Architecture & Workflow
* **Express**: Serves as the web server/routing layer to process HTTP requests and deliver clean JSON responses.
* **Mongoose**: Acts as the ODM (Object Data Modeling) layer, defining schema definitions, data sanitization (`trim: true`), and strict validations (required fields, integer checks, range limits).
* **MongoDB**: Serves as the permanent persistence store (`lab5_students` database), ensuring data remains intact across server restarts without relying on transient in-memory arrays.

---

## 🛠 Prerequisites

Before running the application, make sure you have the following installed:
* [Node.js](https://nodejs.org/) (v18.x or newer recommended; tested on v26+)
* [npm](https://www.npmjs.com/) (Node Package Manager)
* [MongoDB Community Server](https://www.mongodb.com/try/download/community) (running locally on port `27017`) or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
* [MongoDB Compass](https://www.mongodb.com/products/compass) or `mongosh` (for database inspection)
* [Postman](https://www.postman.com/), [Thunder Client](https://www.thunderclient.com/), or `curl` (for API testing)

---

## 🚀 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/dcit26-lab5-express-mongodb.git
   cd dcit26-lab5-express-mongodb
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the `.env.example` template to `.env`:
   ```bash
   # On Windows (cmd)
   copy .env.example .env

   # On Windows (PowerShell) / macOS / Linux
   cp .env.example .env
   ```

4. **Review Database Configuration:**
   Inside your `.env` file, configure your MongoDB connection string and server port:
   ```env
   # Local MongoDB connection
   MONGODB_URI=mongodb://127.0.0.1:27017/lab5_students
   PORT=5000
   ```
   > **Note on MongoDB Atlas:** If you prefer using cloud MongoDB instead of a local instance, update `MONGODB_URI` to your Atlas connection URI:
   > ```env
   > MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/lab5_students?retryWrites=true&w=majority
   > ```

---

## 🏃 Running the Server

* **Development mode (with auto-reload using `nodemon`):**
  ```bash
  npm run dev
  ```

* **Production mode:**
  ```bash
  npm start
  ```

Once started, the console will confirm:
```text
MongoDB connected
API on port 5000
```
> **Fail-Safe Mechanism**: The Express server will only begin listening for requests **after** the MongoDB connection is successfully established. If the connection fails, a descriptive error is logged and the process safely terminates (`process.exit(1)`).

---

## 📋 Data Model (Student Schema)

| Field | Type | Required | Constraints / Validation |
| :--- | :--- | :--- | :--- |
| `fullName` | String | Yes | Trimmed whitespace, descriptive error message |
| `course` | String | Yes | Trimmed whitespace, descriptive error message |
| `yearLevel` | Number | Yes | Min: `1`, Max: `4`, Whole integer (`Number.isInteger`) |
| `section` | String | No | Trimmed whitespace |
| `createdAt` | Date | No | Defaults to current timestamp (`Date.now`) |

---

## 🌐 API Endpoints & Routes

| Method | Endpoint | Description | Expected Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status check | `200 OK` |
| `GET` | `/api/students` | Retrieve all student records | `200 OK` |
| `GET` | `/api/students/:id` | Retrieve a single student by MongoDB `_id` | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `POST` | `/api/students` | Create a new student record | `201 Created`, `400 Bad Request` |
| `PUT` | `/api/students/:id` | Update an existing student record | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/api/students/:id` | Delete a student record by `_id` | `200 OK`, `400 Bad Request`, `404 Not Found` |

---

## 🧪 Testing with cURL / Request Examples

### 1. Health Check
```bash
curl http://localhost:5000/api/health
```
**Response (`200 OK`):**
```json
{
  "status": "ok"
}
```

### 2. Create Student (`POST /api/students`)
```bash
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Alex Santos",
    "course": "BSIT",
    "yearLevel": 2,
    "section": "IT-2A"
  }'
```
**Response (`201 Created`):**
```json
{
  "_id": "6ae1fb93ea33347d5fbe348f",
  "fullName": "Alex Santos",
  "course": "BSIT",
  "yearLevel": 2,
  "section": "IT-2A",
  "createdAt": "2026-10-28T13:41:39.119Z",
  "__v": 0
}
```

### 3. Get All Students (`GET /api/students`)
```bash
curl http://localhost:5000/api/students
```
**Response (`200 OK`):**
```json
[
  {
    "_id": "6ae1fb93ea33347d5fbe348f",
    "fullName": "Alex Santos",
    "course": "BSIT",
    "yearLevel": 2,
    "section": "IT-2A",
    "createdAt": "2026-10-28T13:41:39.119Z",
    "__v": 0
  }
]
```

### 4. Get Student by ID (`GET /api/students/:id`)
```bash
curl http://localhost:5000/api/students/6ae1fb93ea33347d5fbe348f
```
**Response (`200 OK`):**
```json
{
  "_id": "6ae1fb93ea33347d5fbe348f",
  "fullName": "Alex Santos",
  "course": "BSIT",
  "yearLevel": 2,
  "section": "IT-2A",
  "createdAt": "2026-10-28T13:41:39.119Z",
  "__v": 0
}
```

### 5. Update Student (`PUT /api/students/:id`)
```bash
curl -X PUT http://localhost:5000/api/students/6ae1fb93ea33347d5fbe348f \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Alex Santos",
    "course": "BSIT",
    "yearLevel": 3,
    "section": "IT-3A"
  }'
```
**Response (`200 OK`):**
```json
{
  "_id": "6ae1fb93ea33347d5fbe348f",
  "fullName": "Alex Santos",
  "course": "BSIT",
  "yearLevel": 3,
  "section": "IT-3A",
  "createdAt": "2026-10-28T13:41:39.119Z",
  "__v": 0
}
```

### 6. Delete Student (`DELETE /api/students/:id`)
```bash
curl -X DELETE http://localhost:5000/api/students/6ae1fb93ea33347d5fbe348f
```
**Response (`200 OK`):**
```json
{
  "message": "Student deleted",
  "id": "6ae1fb93ea33347d5fbe348f"
}
```

---

## 🛡️ Error Handling & Status Codes Cheat Sheet

| HTTP Status | Reason / Condition | Sample Response Body |
| :--- | :--- | :--- |
| `200 OK` | Successful retrieval, update, or deletion | `{ ... }` or `[ ... ]` |
| `201 Created` | Successful student creation | `{ "_id": "...", ... }` |
| `400 Bad Request` | Validation failure, non-integer or out-of-range year, invalid ObjectId, or malformed JSON | `{"error": ["fullName is required"]}` or `{"error": "Invalid input"}` |
| `404 Not Found` | Valid ID format but no matching student document exists | `{"error": "Student not found"}` |
| `500 Server Error` | Unexpected internal server error (stack traces sanitized) | `{"error": "Internal server error"}` |

---

## 🔒 Security & Git Hygiene

* The `.env` file containing local credentials/configuration is strictly ignored via `.gitignore` and is **never** committed.
* Only the safe `.env.example` template is committed to the repository.
* Strict request body picking ensures clients cannot tamper with internal schema properties such as `_id` or `createdAt`.
* Database validation is enforced on both `POST` and `PUT` operations (`runValidators: true`).

---

## 📁 Repository Structure

```text
dcit26-lab5-express-mongodb/
├── backend/
│   ├── models/
│   │   └── Student.js      # Mongoose Student schema and validation rules
│   └── server.js           # Express app, CRUD routes, and central error handler
├── .env                    # Local environment variables (ignored by Git)
├── .env.example            # Environment configuration template for grading
├── .gitignore              # Ignores node_modules and .env
├── package.json            # Project metadata, dependencies, and npm scripts
├── package-lock.json       # Locked dependency tree
└── README.md               # Complete project documentation
```
