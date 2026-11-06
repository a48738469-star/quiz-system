let currentUser = null;

async function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorEl = document.getElementById('loginError');

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        currentUser = data.user;
        document.getElementById('loginView').classList.add('hidden');
        document.getElementById('userHeader').classList.remove('hidden');
        document.getElementById('welcomeMsg').textContent = `User: ${currentUser.username} (${currentUser.role.toUpperCase()})`;

        if (currentUser.role === 'admin') {
            document.getElementById('adminView').classList.remove('hidden');
            loadResults();
        } else {
            document.getElementById('studentView').classList.remove('hidden');
            showTakeQuiz();
        }
    } catch (err) {
        errorEl.textContent = err.message;
    }
}

function logout() {
    currentUser = null;
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('loginView').classList.remove('hidden');
    document.getElementById('userHeader').classList.add('hidden');
    document.getElementById('studentView').classList.add('hidden');
    document.getElementById('adminView').classList.add('hidden');
    document.getElementById('resultsTableContainer').classList.add('hidden');
}

async function showTakeQuiz() {
    document.getElementById('resultsTableContainer').classList.add('hidden');
    document.getElementById('scoreSummary').classList.add('hidden');
    const form = document.getElementById('quizForm');
    form.innerHTML = 'Loading questions...';

    const res = await fetch('/api/questions');
    const questions = await res.json();

    form.innerHTML = '';
    questions.forEach((q, idx) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <p><strong>Q${idx + 1}: ${q.question}</strong></p>
            <label class="option-label"><input type="radio" name="q_${q.id}" value="A"> A) ${q.option_a}</label>
            <label class="option-label"><input type="radio" name="q_${q.id}" value="B"> B) ${q.option_b}</label>
            <label class="option-label"><input type="radio" name="q_${q.id}" value="C"> C) ${q.option_c}</label>
            <label class="option-label"><input type="radio" name="q_${q.id}" value="D"> D) ${q.option_d}</label>
        `;
        form.appendChild(card);
    });

    document.getElementById('submitBtn').style.display = questions.length > 0 ? 'block' : 'none';
}

async function submitQuiz() {
    const form = document.getElementById('quizForm');
    const formData = new FormData(form);
    const answers = {};

    for (let [key, value] of formData.entries()) {
        const qId = key.replace('q_', '');
        answers[qId] = value;
    }

    const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, answers })
    });

    const result = await res.json();
    form.innerHTML = '';
    document.getElementById('submitBtn').style.display = 'none';

    const summary = document.getElementById('scoreSummary');
    summary.classList.remove('hidden');
    document.getElementById('scoreDisplay').textContent = `${result.score} / ${result.total}`;
    document.getElementById('scoreDetails').textContent = `Calculated Percentage: ${result.percentage}%`;
}

async function loadResults() {
    document.getElementById('quizContainer').querySelector('form').innerHTML = '';
    document.getElementById('submitBtn').style.display = 'none';
    document.getElementById('scoreSummary').classList.add('hidden');
    const tableContainer = document.getElementById('resultsTableContainer');
    tableContainer.classList.remove('hidden');

    const res = await fetch(`/api/results?userId=${currentUser.id}&role=${currentUser.role}`);
    const data = await res.json();

    const header = document.getElementById('tableHeader');
    const body = document.getElementById('resultsBody');

    if (currentUser.role === 'admin') {
        header.innerHTML = `<th>ID</th><th>Student</th><th>Score</th><th>Total</th><th>Percentage</th><th>Date</th>`;
        body.innerHTML = data.map(r => `
            <tr>
                <td>#${r.id}</td>
                <td>${r.username}</td>
                <td>${r.score}</td>
                <td>${r.total}</td>
                <td><span class="badge ${r.percentage >= 50 ? 'badge-pass' : 'badge-fail'}">${r.percentage}%</span></td>
                <td>${new Date(r.attempted_at).toLocaleString()}</td>
            </tr>
        `).join('');
    } else {
        header.innerHTML = `<th>Attempt ID</th><th>Score</th><th>Total</th><th>Percentage</th><th>Date</th>`;
        body.innerHTML = data.map(r => `
            <tr>
                <td>#${r.id}</td>
                <td>${r.score}</td>
                <td>${r.total}</td>
                <td><span class="badge ${r.percentage >= 50 ? 'badge-pass' : 'badge-fail'}">${r.percentage}%</span></td>
                <td>${new Date(r.attempted_at).toLocaleString()}</td>
            </tr>
        `).join('');
    }
}

async function addQuestion() {
    const question = document.getElementById('newQuestion').value.trim();
    const option_a = document.getElementById('optA').value.trim();
    const option_b = document.getElementById('optB').value.trim();
    const option_c = document.getElementById('optC').value.trim();
    const option_d = document.getElementById('optD').value.trim();
    const correct_option = document.getElementById('correctOpt').value;

    if (!question || !option_a || !option_b || !option_c || !option_d) {
        alert('Please fill out all question fields.');
        return;
    }

    const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, option_a, option_b, option_c, option_d, correct_option })
    });

    if (res.ok) {
        alert('Question added successfully!');
        document.getElementById('newQuestion').value = '';
        document.getElementById('optA').value = '';
        document.getElementById('optB').value = '';
        document.getElementById('optC').value = '';
        document.getElementById('optD').value = '';
    }
}

function toggleAdminTab(tab) {
    if (tab === 'addQ') {
        document.getElementById('adminAddQ').classList.remove('hidden');
        document.getElementById('resultsTableContainer').classList.add('hidden');
    } else {
        document.getElementById('adminAddQ').classList.add('hidden');
        loadResults();
    }
}