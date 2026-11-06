const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'quiz.db'), (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

db.serialize(() => {
    // 1. Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT CHECK(role IN ('admin', 'student'))
    )`);

    // 2. Questions Table
    db.run(`CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        option_a TEXT NOT NULL,
        option_b TEXT NOT NULL,
        option_c TEXT NOT NULL,
        option_d TEXT NOT NULL,
        correct_option TEXT NOT NULL
    )`);

    // 3. Results Table
    db.run(`CREATE TABLE IF NOT EXISTS results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        score INTEGER,
        total INTEGER,
        percentage REAL,
        attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    // Default users
    db.run(`INSERT OR IGNORE INTO users (id, username, password, role) VALUES 
        (1, 'admin', 'admin123', 'admin'),
        (2, 'student1', 'student123', 'student')
    `);

    // Seed questions
    db.get(`SELECT COUNT(*) AS count FROM questions`, (err, row) => {
        if (row && row.count === 0) {
            const stmt = db.prepare(`INSERT INTO questions (question, option_a, option_b, option_c, option_d, correct_option) VALUES (?, ?, ?, ?, ?, ?)`);
            stmt.run("What does SQL stand for?", "Structured Question Language", "Structured Query Language", "Strong Question Logic", "Simplified Query Layout", "B");
            stmt.run("Which HTTP method is typically used to create a new resource in a REST API?", "GET", "DELETE", "POST", "PUT", "C");
            stmt.run("In Node.js, which module is used to create an HTTP server?", "http", "fs", "path", "url", "A");
            stmt.run("Which HTML attribute is used to define inline CSS styles?", "class", "style", "font", "styles", "B");
            stmt.finalize();
            console.log("Default questions seeded successfully.");
        }
    });
});

module.exports = db;