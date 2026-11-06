const path = require('path');
const db = require('./database');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. Authentication
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT id, username, role FROM users WHERE username = ? AND password = ?', [username, password], (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        res.json({ message: 'Login successful', user });
    });
});

// 2. Fetch Questions
app.get('/api/questions', (req, res) => {
    db.all('SELECT id, question, option_a, option_b, option_c, option_d FROM questions', [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch questions' });
        res.json(rows);
    });
});

// 3. Admin: Add Question
app.post('/api/questions', (req, res) => {
    const { question, option_a, option_b, option_c, option_d, correct_option } = req.body;
    if (!question || !option_a || !option_b || !option_c || !option_d || !correct_option) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    const stmt = db.prepare('INSERT INTO questions (question, option_a, option_b, option_c, option_d, correct_option) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run([question, option_a, option_b, option_c, option_d, correct_option.toUpperCase()], function (err) {
        if (err) return res.status(500).json({ error: 'Failed to add question' });
        res.json({ message: 'Question added successfully', id: this.lastID });
    });
});

// 4. Submit Quiz & Automatic Calculation
app.post('/api/submit', (req, res) => {
    const { userId, answers } = req.body;

    db.all('SELECT id, correct_option FROM questions', [], (err, questions) => {
        if (err) return res.status(500).json({ error: 'Evaluation failed' });

        let score = 0;
        const total = questions.length;

        questions.forEach((q) => {
            if (answers && answers[q.id] && answers[q.id].toUpperCase() === q.correct_option) {
                score++;
            }
        });

        const percentage = total > 0 ? ((score / total) * 100).toFixed(2) : 0;

        db.run('INSERT INTO results (user_id, score, total, percentage) VALUES (?, ?, ?, ?)', 
            [userId, score, total, percentage], 
            function (err) {
                if (err) return res.status(500).json({ error: 'Error saving result' });
                res.json({ score, total, percentage, resultId: this.lastID });
            }
        );
    });
});

// 5. Results Dashboard
app.get('/api/results', (req, res) => {
    const { userId, role } = req.query;

    if (role === 'admin') {
        const query = `
            SELECT results.id, users.username, results.score, results.total, results.percentage, results.attempted_at 
            FROM results 
            JOIN users ON results.user_id = users.id 
            ORDER BY results.attempted_at DESC
        `;
        db.all(query, [], (err, rows) => {
            if (err) return res.status(500).json({ error: 'Failed to fetch results' });
            res.json(rows);
        });
    } else {
        const query = `
            SELECT id, score, total, percentage, attempted_at 
            FROM results 
            WHERE user_id = ? 
            ORDER BY attempted_at DESC
        `;
        db.all(query, [userId], (err, rows) => {
            if (err) return res.status(500).json({ error: 'Failed to fetch personal results' });
            res.json(rows);
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});