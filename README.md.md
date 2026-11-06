# Online Quiz Management System

An asynchronous, three-tier Full Stack Web Application engineered for automated assessment, role-based access management, and secure server-side evaluation. Developed as an individual portfolio project for **Full Stack Technologies (22CSE71)**.

---

## 📌 Project Overview

The **Online Quiz Management System** provides an end-to-end platform for conducting multiple-choice quizzes with zero client-side evaluation vulnerability. It delivers role-based access for students and administrators, processes quiz evaluations strictly on the server tier, and records persistent attempts inside an ACID-compliant SQLite relational database.

### Key Highlights
- **Role-Based Access Control (RBAC):** Distinct dashboards and access scopes for Students and Administrators.
- **Client-Side SPA Architecture:** Dynamic Single-Page Application (SPA) workflow powered by standard Web APIs (`fetch`), eliminating full-page reloads.
- **Server-Side Grading Integrity:** Answer keys are withheld from the client bundle to eliminate frontend inspection cheating; scores and percentages are verified on the backend.
- **Relational Data Persistence:** Structured relational storage using SQLite with foreign key enforcement and relational table joins.
- **Admin Management:** Enables instructors to dynamically seed new questions, set answer keys, and monitor class-wide score analytics.

---

## 🏛️ System Architecture

The project adheres to the standard three-tier web architecture:

```
┌────────────────────────────────────────────────────────┐
│               Presentation Tier (Frontend)             │
│   HTML5 • CSS3 (Custom Responsive Layout) • JavaScript │
│      (Dynamic DOM Manipulation & Asynchronous Fetch)    │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP / JSON (REST API)
┌──────────────────────────▼─────────────────────────────┐
│               Application Tier (Backend)               │
│               Node.js Runtime & Express.js             │
│   Routing Engine • Request Parsing • Evaluation Logic  │
└──────────────────────────┬─────────────────────────────┘
                           │ SQLite3 Driver (SQL Queries)
┌──────────────────────────▼─────────────────────────────┐
│                 Data Tier (Database)                   │
│             SQLite Embedded Relational DB              │
│       Tables: users, questions, results (FK / Joins)   │
└────────────────────────────────────────────────────────┘
```

---

## 💻 Tech Stack & Tools

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, Modern JavaScript (ES6+) | Single-Page Application UI, dynamic DOM rendering, async network calls |
| **Backend** | Node.js, Express.js | REST API routing, session/role verification, payload parsing |
| **Database** | SQLite3 | Relational data persistence, schema constraints, joined reporting |
| **Environment** | npm, Visual Studio Code | Package management, workspace development, debugging |

---

## 🗄️ Database Schema Design

The SQLite database (`quiz.db`) maintains relational integrity through three core entities:

```sql
-- 1. Users Table (Authentication & Roles)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'student')) NOT NULL
);

-- 2. Questions Table (Quiz Repository)
CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option TEXT NOT NULL
);

-- 3. Results Table (Historical Submissions & Analytics)
CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    percentage REAL NOT NULL,
    attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 🔌 RESTful API Endpoints

| Method | Endpoint | Access | Description |
| :---: | :--- | :---: | :--- |
| `POST` | `/api/login` | Public | Authenticates credentials and returns user role |
| `GET` | `/api/questions` | Student / Admin | Fetches questions (**answer keys omitted for students**) |
| `POST` | `/api/questions` | Admin Only | Inserts a new MCQ question into the database |
| `POST` | `/api/submit` | Student Only | Evaluates submitted choices and records scores |
| `GET` | `/api/results/:userId` | Student | Retrieves attempt history for a specific student |
| `GET` | `/api/admin/results` | Admin Only | Retrieves overall class results via relational `JOIN` |

---

## 📂 Project Directory Structure

```text
quiz-system/
├── public/
│   ├── index.html        # Primary SPA user interface structure
│   ├── style.css         # Modern responsive styling and card layouts
│   └── app.js            # Client-side state handling and fetch requests
├── database.js           # SQLite connection, table schemas, default seeds
├── server.js             # Express server setup, REST routing, evaluation logic
├── package.json          # Project metadata, dependencies, start scripts
├── package-lock.json     # Resolved dependency lock file
└── README.md             # Project documentation and setup guide
```

---

## 🚀 Getting Started & Installation

### Prerequisites
- **Node.js** (v18.x, v20.x, or newer)
- **npm** (bundled with Node.js)
- A modern web browser (Chrome, Edge, Firefox)

### 1. Clone the Repository
```bash
git clone https://github.com/a48738469-star/quiz-system.git
cd quiz-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Launch the Application
```bash
node server.js
```

You should observe the following terminal confirmation:
```text
Connected to SQLite database.
Default questions seeded successfully.
Server running at http://localhost:3000
```

### 4. Open in Browser
Visit **`http://localhost:3000`** in your browser.

---

## 🔑 Default Credentials for Testing

| Role | Username | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` | Add questions, inspect class submissions, analytics |
| **Student** | `student1` | `student123` | Attempt live quizzes, receive scores, view past history |

---

## 🛡️ Engineering Best Practices Implemented

1. **Answer Masking:** The student question fetch endpoint (`GET /api/questions`) strips out the `correct_option` field from the query response so students cannot inspect client-side network traffic to discover answers.
2. **Server-Side Scoring:** User choices are submitted as key-value pairs (`{ questionId: selectedOption }`). Express queries the persistent database, matches keys, computes the total score, and commits the result atomically.
3. **Relational Joined Reporting:** The Administrator dashboard performs an inner join between `results` and `users` tables, demonstrating structured SQL data modeling rather than flat file logging.

---

## 👨‍💻 Author

- **Name:** Abhishek Narayan Singh
- **Course:** Full Stack Technologies (22CSE71)
- **Department:** Computer Science & Engineering