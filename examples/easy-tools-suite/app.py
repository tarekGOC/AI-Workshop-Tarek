import os
import json
import sqlite3
import hashlib
import csv
import io
import re
from datetime import datetime, date, timedelta
from functools import wraps

from flask import (
    Flask, render_template, request, jsonify, g, send_file
)
import markdown
import bleach

app = Flask(__name__)
app.config['DATABASE'] = os.path.join(app.instance_path, 'toolsuite.db')

os.makedirs(app.instance_path, exist_ok=True)

# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(app.config['DATABASE'])
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA journal_mode=WAL")
        g.db.execute("PRAGMA foreign_keys=ON")
    return g.db


@app.teardown_appcontext
def close_db(exc):
    db = g.pop('db', None)
    if db is not None:
        db.close()


def init_db():
    db = get_db()
    db.executescript('''
        -- 1. Todo
        CREATE TABLE IF NOT EXISTS todos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            completed INTEGER DEFAULT 0,
            version INTEGER DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        -- 2. Temperature history
        CREATE TABLE IF NOT EXISTS temp_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_value REAL NOT NULL,
            source_scale TEXT NOT NULL,
            target_scale TEXT NOT NULL,
            result_value REAL NOT NULL,
            created_at TEXT NOT NULL
        );
        -- 4. Expenses
        CREATE TABLE IF NOT EXISTS expense_categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        );
        INSERT OR IGNORE INTO expense_categories (name) VALUES
            ('Food'),('Transport'),('Utilities'),('Entertainment'),
            ('Shopping'),('Health'),('Education'),('Other');

        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL NOT NULL,
            currency TEXT DEFAULT 'USD',
            category_id INTEGER NOT NULL,
            description TEXT DEFAULT '',
            expense_date TEXT NOT NULL,
            deleted INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (category_id) REFERENCES expense_categories(id)
        );
        -- 5. Quotes
        CREATE TABLE IF NOT EXISTS quotes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            author TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS quote_favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quote_id INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (quote_id) REFERENCES quotes(id)
        );
        -- 6. Contacts
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            phone TEXT DEFAULT '',
            email TEXT DEFAULT '',
            address TEXT DEFAULT '',
            notes TEXT DEFAULT '',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        -- 7. Notes (Markdown)
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT DEFAULT '',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        );
        CREATE TABLE IF NOT EXISTS note_tags (
            note_id INTEGER NOT NULL,
            tag_id INTEGER NOT NULL,
            PRIMARY KEY (note_id, tag_id),
            FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        );
        -- 8. Habits
        CREATE TABLE IF NOT EXISTS habits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT DEFAULT '',
            frequency TEXT DEFAULT 'daily',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS habit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            habit_id INTEGER NOT NULL,
            log_date TEXT NOT NULL,
            created_at TEXT NOT NULL,
            UNIQUE(habit_id, log_date),
            FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
        );
        -- 9. Unit converter history
        CREATE TABLE IF NOT EXISTS unit_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            source_value REAL NOT NULL,
            source_unit TEXT NOT NULL,
            target_unit TEXT NOT NULL,
            result_value REAL NOT NULL,
            created_at TEXT NOT NULL
        );
        -- 10. Flashcards
        CREATE TABLE IF NOT EXISTS decks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT DEFAULT '',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS flashcards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            deck_id INTEGER NOT NULL,
            front TEXT NOT NULL,
            back TEXT NOT NULL,
            confidence TEXT DEFAULT 'new',
            next_review TEXT,
            review_count INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
        );
        -- Audit log
        CREATE TABLE IF NOT EXISTS audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entity_type TEXT NOT NULL,
            entity_id INTEGER,
            action TEXT NOT NULL,
            details TEXT DEFAULT '',
            created_at TEXT NOT NULL
        );
    ''')
    # Seed quotes if empty
    if db.execute("SELECT COUNT(*) FROM quotes").fetchone()[0] == 0:
        quotes = [
            ("The only way to do great work is to love what you do.", "Steve Jobs"),
            ("Innovation distinguishes between a leader and a follower.", "Steve Jobs"),
            ("Stay hungry, stay foolish.", "Steve Jobs"),
            ("Life is what happens when you're busy making other plans.", "John Lennon"),
            ("The future belongs to those who believe in the beauty of their dreams.", "Eleanor Roosevelt"),
            ("It is during our darkest moments that we must focus to see the light.", "Aristotle"),
            ("The purpose of our lives is to be happy.", "Dalai Lama"),
            ("Get busy living or get busy dying.", "Stephen King"),
            ("You only live once, but if you do it right, once is enough.", "Mae West"),
            ("Many of life's failures are people who did not realize how close they were to success when they gave up.", "Thomas Edison"),
            ("If you look at what you have in life, you'll always have more.", "Oprah Winfrey"),
            ("Life is really simple, but we insist on making it complicated.", "Confucius"),
            ("The best time to plant a tree was 20 years ago. The second best time is now.", "Chinese Proverb"),
            ("Your time is limited, don't waste it living someone else's life.", "Steve Jobs"),
            ("Not how long, but how well you have lived is the main thing.", "Seneca"),
            ("If life were predictable it would cease to be life, and be without flavor.", "Eleanor Roosevelt"),
            ("The whole secret of a successful life is to find out what is one's destiny to do, and then do it.", "Henry Ford"),
            ("In order to write about life first you must live it.", "Ernest Hemingway"),
            ("The big lesson in life is never be scared of anyone or anything.", "Frank Sinatra"),
            ("Sing like no one's listening, love like you've never been hurt, dance like nobody's watching.", "Satchel Paige"),
            ("Curiosity about life in all of its aspects, I think, is still the secret of great creative people.", "Leo Burnett"),
            ("Life is not a problem to be solved, but a reality to be experienced.", "Søren Kierkegaard"),
            ("The unexamined life is not worth living.", "Socrates"),
            ("Turn your wounds into wisdom.", "Oprah Winfrey"),
            ("The mind is everything. What you think you become.", "Buddha"),
            ("Strive not to be a success, but rather to be of value.", "Albert Einstein"),
            ("Two roads diverged in a wood, and I — I took the one less traveled by, and that has made all the difference.", "Robert Frost"),
            ("Do what you can, with what you have, where you are.", "Theodore Roosevelt"),
            ("Be yourself; everyone else is already taken.", "Oscar Wilde"),
            ("To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.", "Ralph Waldo Emerson"),
            ("Act as if what you do makes a difference. It does.", "William James"),
            ("Success is not final, failure is not fatal: it is the courage to continue that counts.", "Winston Churchill"),
            ("Believe you can and you're halfway there.", "Theodore Roosevelt"),
            ("The only impossible journey is the one you never begin.", "Tony Robbins"),
            ("Everything you've ever wanted is on the other side of fear.", "George Addair"),
            ("Happiness is not something ready made. It comes from your own actions.", "Dalai Lama"),
            ("Perfection is not attainable, but if we chase perfection we can catch excellence.", "Vince Lombardi"),
            ("Life is 10% what happens to us and 90% how we react to it.", "Charles R. Swindoll"),
            ("What lies behind us and what lies before us are tiny matters compared to what lies within us.", "Ralph Waldo Emerson"),
            ("The best revenge is massive success.", "Frank Sinatra"),
            ("Dream big and dare to fail.", "Norman Vaughan"),
            ("It does not matter how slowly you go as long as you do not stop.", "Confucius"),
            ("Quality is not an act, it is a habit.", "Aristotle"),
            ("What we achieve inwardly will change outer reality.", "Plutarch"),
            ("Keep your face always toward the sunshine — and shadows will fall behind you.", "Walt Whitman"),
            ("The way to get started is to quit talking and begin doing.", "Walt Disney"),
            ("Don't let yesterday take up too much of today.", "Will Rogers"),
            ("The secret of getting ahead is getting started.", "Mark Twain"),
            ("A person who never made a mistake never tried anything new.", "Albert Einstein"),
            ("You miss 100% of the shots you don't take.", "Wayne Gretzky"),
        ]
        db.executemany("INSERT INTO quotes (text, author) VALUES (?, ?)", quotes)
    db.commit()


def audit(entity_type, entity_id, action, details=""):
    db = get_db()
    db.execute(
        "INSERT INTO audit_log (entity_type, entity_id, action, details, created_at) VALUES (?,?,?,?,?)",
        (entity_type, entity_id, action, details, datetime.utcnow().isoformat())
    )
    db.commit()


def now_iso():
    return datetime.utcnow().isoformat()


# ---------------------------------------------------------------------------
# Input validation helpers
# ---------------------------------------------------------------------------

def sanitize(text, max_len=500):
    if text is None:
        return ""
    text = str(text).strip()
    return bleach.clean(text[:max_len])


def validate_required(data, fields):
    missing = [f for f in fields if not data.get(f, "").strip()]
    if missing:
        return f"Missing required fields: {', '.join(missing)}"
    return None


# ---------------------------------------------------------------------------
# Routes – Page
# ---------------------------------------------------------------------------

@app.route('/')
def index():
    return render_template('index.html')


# =========================================================================
# 1. TODO API
# =========================================================================

@app.route('/api/todos', methods=['GET'])
def get_todos():
    db = get_db()
    page = max(1, int(request.args.get('page', 1)))
    per_page = 50
    search = sanitize(request.args.get('q', ''), 100)
    offset = (page - 1) * per_page

    if search:
        rows = db.execute(
            "SELECT * FROM todos WHERE (title LIKE ? OR description LIKE ?) ORDER BY created_at DESC LIMIT ? OFFSET ?",
            (f'%{search}%', f'%{search}%', per_page, offset)
        ).fetchall()
        total = db.execute(
            "SELECT COUNT(*) FROM todos WHERE title LIKE ? OR description LIKE ?",
            (f'%{search}%', f'%{search}%')
        ).fetchone()[0]
    else:
        rows = db.execute("SELECT * FROM todos ORDER BY created_at DESC LIMIT ? OFFSET ?", (per_page, offset)).fetchall()
        total = db.execute("SELECT COUNT(*) FROM todos").fetchone()[0]

    return jsonify({"items": [dict(r) for r in rows], "total": total, "page": page, "per_page": per_page})


@app.route('/api/todos', methods=['POST'])
def create_todo():
    data = request.get_json(force=True)
    title = sanitize(data.get('title', ''), 100)
    desc = sanitize(data.get('description', ''), 500)
    err = validate_required({'title': title}, ['title'])
    if err:
        return jsonify({"error": err}), 400

    db = get_db()
    ts = now_iso()
    cur = db.execute("INSERT INTO todos (title, description, created_at, updated_at) VALUES (?,?,?,?)",
                     (title, desc, ts, ts))
    db.commit()
    audit("todo", cur.lastrowid, "create", f"title={title}")
    return jsonify({"id": cur.lastrowid}), 201


@app.route('/api/todos/<int:tid>', methods=['PUT'])
def update_todo(tid):
    data = request.get_json(force=True)
    db = get_db()
    todo = db.execute("SELECT * FROM todos WHERE id=?", (tid,)).fetchone()
    if not todo:
        return jsonify({"error": "Not found"}), 404

    version = data.get('version', todo['version'])
    if version != todo['version']:
        return jsonify({"error": "Conflict: item was modified by another request"}), 409

    title = sanitize(data.get('title', todo['title']), 100)
    desc = sanitize(data.get('description', todo['description']), 500)
    completed = 1 if data.get('completed', bool(todo['completed'])) else 0
    ts = now_iso()

    db.execute("UPDATE todos SET title=?, description=?, completed=?, version=version+1, updated_at=? WHERE id=?",
               (title, desc, completed, ts, tid))
    db.commit()
    audit("todo", tid, "update", f"completed={completed}")
    return jsonify({"ok": True})


@app.route('/api/todos/<int:tid>', methods=['DELETE'])
def delete_todo(tid):
    db = get_db()
    db.execute("DELETE FROM todos WHERE id=?", (tid,))
    db.commit()
    audit("todo", tid, "delete")
    return jsonify({"ok": True})


# =========================================================================
# 2. TEMPERATURE CONVERTER API
# =========================================================================

def convert_temp(value, src, tgt):
    # Convert to Celsius first
    if src == 'C':
        c = value
    elif src == 'F':
        c = (value - 32) * 5 / 9
    elif src == 'K':
        c = value - 273.15
    else:
        return None
    # Convert from Celsius to target
    if tgt == 'C':
        return round(c, 2)
    elif tgt == 'F':
        return round(c * 9 / 5 + 32, 2)
    elif tgt == 'K':
        return round(c + 273.15, 2)
    return None


MIN_TEMPS = {'C': -273.15, 'F': -459.67, 'K': 0}


@app.route('/api/temperature/convert', methods=['POST'])
def temp_convert():
    data = request.get_json(force=True)
    values = data.get('values', [])
    src = sanitize(data.get('source', ''), 1).upper()
    tgt = sanitize(data.get('target', ''), 1).upper()

    if src not in MIN_TEMPS or tgt not in MIN_TEMPS:
        return jsonify({"error": "Invalid scale. Use C, F, or K"}), 400

    if not isinstance(values, list):
        values = [values]

    results = []
    db = get_db()
    ts = now_iso()
    for v in values:
        try:
            val = float(v)
        except (ValueError, TypeError):
            results.append({"input": v, "error": "Invalid number"})
            continue
        if val < MIN_TEMPS[src]:
            results.append({"input": v, "error": f"Below absolute zero for {src}"})
            continue
        r = convert_temp(val, src, tgt)
        results.append({"input": val, "result": r, "source": src, "target": tgt})
        db.execute("INSERT INTO temp_history (source_value,source_scale,target_scale,result_value,created_at) VALUES (?,?,?,?,?)",
                   (val, src, tgt, r, ts))
    db.commit()
    return jsonify({"results": results})


@app.route('/api/temperature/history', methods=['GET'])
def temp_history():
    db = get_db()
    rows = db.execute("SELECT * FROM temp_history ORDER BY created_at DESC LIMIT 100").fetchall()
    return jsonify({"items": [dict(r) for r in rows]})


@app.route('/api/temperature/history', methods=['DELETE'])
def clear_temp_history():
    db = get_db()
    db.execute("DELETE FROM temp_history")
    db.commit()
    return jsonify({"ok": True})


# =========================================================================
# 3. PASSWORD STRENGTH CHECKER (client-side only, but expose scoring API)
# =========================================================================

COMMON_PASSWORDS = {
    "password", "123456", "12345678", "qwerty", "abc123", "monkey", "master",
    "dragon", "111111", "baseball", "iloveyou", "trustno1", "sunshine",
    "letmein", "football", "shadow", "123456789", "1234567890", "000000",
    "password1", "welcome", "admin", "login", "passw0rd",
}

KEYBOARD_PATTERNS = [
    "qwerty", "asdfgh", "zxcvbn", "qazwsx", "123456", "654321",
    "abcdef", "fedcba",
]


@app.route('/api/password/check', methods=['POST'])
def check_password():
    data = request.get_json(force=True)
    pw = data.get('password', '')
    if not pw:
        return jsonify({"error": "No password provided"}), 400

    score = 0
    feedback = []
    criteria = {}

    # Length
    length = len(pw)
    criteria['length'] = length >= 8
    if length >= 8:
        score += 20
    if length >= 12:
        score += 10
    if length >= 16:
        score += 5
    if length < 8:
        feedback.append(f"Add {8 - length} more characters (minimum 8)")

    # Character classes
    has_upper = bool(re.search(r'[A-Z]', pw))
    has_lower = bool(re.search(r'[a-z]', pw))
    has_digit = bool(re.search(r'[0-9]', pw))
    has_special = bool(re.search(r'[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]', pw))

    criteria['uppercase'] = has_upper
    criteria['lowercase'] = has_lower
    criteria['numbers'] = has_digit
    criteria['special'] = has_special

    if has_upper:
        score += 15
    else:
        feedback.append("Add uppercase letters (A-Z)")
    if has_lower:
        score += 10
    else:
        feedback.append("Add lowercase letters (a-z)")
    if has_digit:
        score += 15
    else:
        feedback.append("Add numbers (0-9)")
    if has_special:
        score += 15
    else:
        feedback.append("Add special characters (!@#$%^&*)")

    # Patterns
    pw_lower = pw.lower()
    warnings = []

    # Sequential characters
    for i in range(len(pw) - 2):
        if ord(pw[i]) + 1 == ord(pw[i + 1]) == ord(pw[i + 2]) - 1:
            warnings.append("Contains sequential characters")
            score -= 5
            break

    # Repeated characters
    if re.search(r'(.)\1{2,}', pw):
        warnings.append("Contains repeated characters")
        score -= 5

    # Keyboard patterns
    for pat in KEYBOARD_PATTERNS:
        if pat in pw_lower:
            warnings.append(f"Contains common keyboard pattern '{pat}'")
            score -= 10
            break

    # Common passwords
    if pw_lower in COMMON_PASSWORDS:
        warnings.append("This is a commonly used password")
        score -= 20

    # Common substitutions check
    substituted = pw_lower.replace('@', 'a').replace('1', 'i').replace('!', 'i').replace('0', 'o').replace('3', 'e').replace('$', 's')
    if substituted in COMMON_PASSWORDS:
        warnings.append("Uses common character substitutions of a weak password")
        score -= 10

    score = max(0, min(100, score))

    if score >= 80:
        level = "very strong"
    elif score >= 60:
        level = "strong"
    elif score >= 40:
        level = "moderate"
    else:
        level = "weak"

    # Never log the password
    return jsonify({
        "score": score,
        "level": level,
        "criteria": criteria,
        "feedback": feedback,
        "warnings": warnings,
    })


# =========================================================================
# 4. EXPENSE TRACKER API
# =========================================================================

@app.route('/api/expenses/categories', methods=['GET'])
def get_categories():
    db = get_db()
    rows = db.execute("SELECT * FROM expense_categories ORDER BY name").fetchall()
    return jsonify({"items": [dict(r) for r in rows]})


@app.route('/api/expenses/categories', methods=['POST'])
def create_category():
    data = request.get_json(force=True)
    name = sanitize(data.get('name', ''), 50)
    if not name:
        return jsonify({"error": "Name required"}), 400
    db = get_db()
    try:
        cur = db.execute("INSERT INTO expense_categories (name) VALUES (?)", (name,))
        db.commit()
        return jsonify({"id": cur.lastrowid}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Category already exists"}), 409


@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    db = get_db()
    start = sanitize(request.args.get('start', ''), 10)
    end = sanitize(request.args.get('end', ''), 10)
    cat = request.args.get('category', '')
    page = max(1, int(request.args.get('page', 1)))
    per_page = 50
    offset = (page - 1) * per_page

    query = "SELECT e.*, c.name as category_name FROM expenses e JOIN expense_categories c ON e.category_id=c.id WHERE e.deleted=0"
    params = []
    if start:
        query += " AND e.expense_date >= ?"
        params.append(start)
    if end:
        query += " AND e.expense_date <= ?"
        params.append(end)
    if cat:
        query += " AND e.category_id = ?"
        params.append(int(cat))

    count_query = query.replace("SELECT e.*, c.name as category_name", "SELECT COUNT(*)")
    total = db.execute(count_query, params).fetchone()[0]

    query += " ORDER BY e.expense_date DESC LIMIT ? OFFSET ?"
    params.extend([per_page, offset])
    rows = db.execute(query, params).fetchall()

    return jsonify({"items": [dict(r) for r in rows], "total": total, "page": page})


@app.route('/api/expenses', methods=['POST'])
def create_expense():
    data = request.get_json(force=True)
    amount = data.get('amount')
    try:
        amount = round(float(amount), 2)
        if amount <= 0:
            raise ValueError()
    except (ValueError, TypeError):
        return jsonify({"error": "Amount must be a positive number"}), 400

    category_id = data.get('category_id')
    expense_date = sanitize(data.get('expense_date', date.today().isoformat()), 10)
    desc = sanitize(data.get('description', ''), 200)
    currency = sanitize(data.get('currency', 'USD'), 3)
    ts = now_iso()

    db = get_db()
    cur = db.execute(
        "INSERT INTO expenses (amount,currency,category_id,description,expense_date,created_at,updated_at) VALUES (?,?,?,?,?,?,?)",
        (amount, currency, category_id, desc, expense_date, ts, ts)
    )
    db.commit()
    audit("expense", cur.lastrowid, "create", f"amount={amount}")
    return jsonify({"id": cur.lastrowid}), 201


@app.route('/api/expenses/<int:eid>', methods=['PUT'])
def update_expense(eid):
    data = request.get_json(force=True)
    db = get_db()
    exp = db.execute("SELECT * FROM expenses WHERE id=? AND deleted=0", (eid,)).fetchone()
    if not exp:
        return jsonify({"error": "Not found"}), 404

    amount = data.get('amount', exp['amount'])
    try:
        amount = round(float(amount), 2)
        if amount <= 0:
            raise ValueError()
    except (ValueError, TypeError):
        return jsonify({"error": "Amount must be positive"}), 400

    category_id = data.get('category_id', exp['category_id'])
    expense_date = sanitize(data.get('expense_date', exp['expense_date']), 10)
    desc = sanitize(data.get('description', exp['description']), 200)
    currency = sanitize(data.get('currency', exp['currency']), 3)
    ts = now_iso()

    db.execute(
        "UPDATE expenses SET amount=?,currency=?,category_id=?,description=?,expense_date=?,updated_at=? WHERE id=?",
        (amount, currency, category_id, desc, expense_date, ts, eid)
    )
    db.commit()
    audit("expense", eid, "update", f"amount={amount}")
    return jsonify({"ok": True})


@app.route('/api/expenses/<int:eid>', methods=['DELETE'])
def delete_expense(eid):
    db = get_db()
    db.execute("UPDATE expenses SET deleted=1, updated_at=? WHERE id=?", (now_iso(), eid))
    db.commit()
    audit("expense", eid, "delete")
    return jsonify({"ok": True})


@app.route('/api/expenses/summary', methods=['GET'])
def expense_summary():
    db = get_db()
    month = sanitize(request.args.get('month', ''), 7)  # YYYY-MM
    if not month:
        month = date.today().strftime('%Y-%m')

    rows = db.execute('''
        SELECT c.name, SUM(e.amount) as total
        FROM expenses e JOIN expense_categories c ON e.category_id=c.id
        WHERE e.deleted=0 AND e.expense_date LIKE ?
        GROUP BY c.name ORDER BY total DESC
    ''', (f'{month}%',)).fetchall()

    items = [dict(r) for r in rows]
    grand = sum(i['total'] for i in items)
    for i in items:
        i['percentage'] = round(i['total'] / grand * 100, 1) if grand > 0 else 0

    return jsonify({"items": items, "total": grand, "month": month})


@app.route('/api/expenses/export', methods=['GET'])
def export_expenses():
    db = get_db()
    rows = db.execute(
        "SELECT e.*, c.name as category_name FROM expenses e JOIN expense_categories c ON e.category_id=c.id WHERE e.deleted=0 ORDER BY e.expense_date DESC"
    ).fetchall()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Date', 'Amount', 'Currency', 'Category', 'Description'])
    for r in rows:
        writer.writerow([r['expense_date'], r['amount'], r['currency'], r['category_name'], r['description']])

    mem = io.BytesIO()
    mem.write(output.getvalue().encode('utf-8'))
    mem.seek(0)
    return send_file(mem, mimetype='text/csv', as_attachment=True, download_name='expenses.csv')


# =========================================================================
# 5. QUOTE OF THE DAY API
# =========================================================================

@app.route('/api/quotes/today', methods=['GET'])
def quote_today():
    db = get_db()
    total = db.execute("SELECT COUNT(*) FROM quotes").fetchone()[0]
    if total == 0:
        return jsonify({"error": "No quotes available"}), 404
    day_num = date.today().toordinal() % total
    quote = db.execute("SELECT * FROM quotes LIMIT 1 OFFSET ?", (day_num,)).fetchone()
    fav = db.execute("SELECT id FROM quote_favorites WHERE quote_id=?", (quote['id'],)).fetchone()
    q = dict(quote)
    q['is_favorite'] = fav is not None
    return jsonify(q)


@app.route('/api/quotes/date/<dt>', methods=['GET'])
def quote_by_date(dt):
    db = get_db()
    try:
        d = date.fromisoformat(sanitize(dt, 10))
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400
    total = db.execute("SELECT COUNT(*) FROM quotes").fetchone()[0]
    day_num = d.toordinal() % total
    quote = db.execute("SELECT * FROM quotes LIMIT 1 OFFSET ?", (day_num,)).fetchone()
    fav = db.execute("SELECT id FROM quote_favorites WHERE quote_id=?", (quote['id'],)).fetchone()
    q = dict(quote)
    q['is_favorite'] = fav is not None
    return jsonify(q)


@app.route('/api/quotes/favorite', methods=['POST'])
def toggle_favorite():
    data = request.get_json(force=True)
    qid = data.get('quote_id')
    db = get_db()
    existing = db.execute("SELECT id FROM quote_favorites WHERE quote_id=?", (qid,)).fetchone()
    if existing:
        db.execute("DELETE FROM quote_favorites WHERE quote_id=?", (qid,))
    else:
        db.execute("INSERT INTO quote_favorites (quote_id, created_at) VALUES (?,?)", (qid, now_iso()))
    db.commit()
    return jsonify({"is_favorite": existing is None})


@app.route('/api/quotes/favorites', methods=['GET'])
def get_favorites():
    db = get_db()
    sort = sanitize(request.args.get('sort', 'date'), 10)
    order = "qf.created_at DESC"
    if sort == 'author':
        order = "q.author ASC"
    elif sort == 'text':
        order = "q.text ASC"

    rows = db.execute(f'''
        SELECT q.*, qf.created_at as favorited_at FROM quotes q
        JOIN quote_favorites qf ON q.id=qf.quote_id
        ORDER BY {order}
    ''').fetchall()
    return jsonify({"items": [dict(r) for r in rows]})


@app.route('/api/quotes/search', methods=['GET'])
def search_quotes():
    db = get_db()
    q = sanitize(request.args.get('q', ''), 100)
    if not q:
        return jsonify({"items": []})
    rows = db.execute(
        "SELECT * FROM quotes WHERE text LIKE ? OR author LIKE ? LIMIT 50",
        (f'%{q}%', f'%{q}%')
    ).fetchall()
    return jsonify({"items": [dict(r) for r in rows]})


# =========================================================================
# 6. CONTACT BOOK API
# =========================================================================

@app.route('/api/contacts', methods=['GET'])
def get_contacts():
    db = get_db()
    search = sanitize(request.args.get('q', ''), 100)
    sort = sanitize(request.args.get('sort', 'last_name'), 20)
    page = max(1, int(request.args.get('page', 1)))
    per_page = 50
    offset = (page - 1) * per_page

    allowed_sorts = {'last_name': 'last_name', 'first_name': 'first_name', 'created_at': 'created_at'}
    order = allowed_sorts.get(sort, 'last_name')

    if search:
        rows = db.execute(
            f"SELECT * FROM contacts WHERE first_name LIKE ? OR last_name LIKE ? OR phone LIKE ? OR email LIKE ? ORDER BY {order} LIMIT ? OFFSET ?",
            (f'%{search}%', f'%{search}%', f'%{search}%', f'%{search}%', per_page, offset)
        ).fetchall()
        total = db.execute(
            "SELECT COUNT(*) FROM contacts WHERE first_name LIKE ? OR last_name LIKE ? OR phone LIKE ? OR email LIKE ?",
            (f'%{search}%', f'%{search}%', f'%{search}%', f'%{search}%')
        ).fetchone()[0]
    else:
        rows = db.execute(f"SELECT * FROM contacts ORDER BY {order} LIMIT ? OFFSET ?", (per_page, offset)).fetchall()
        total = db.execute("SELECT COUNT(*) FROM contacts").fetchone()[0]

    return jsonify({"items": [dict(r) for r in rows], "total": total, "page": page})


@app.route('/api/contacts', methods=['POST'])
def create_contact():
    data = request.get_json(force=True)
    first = sanitize(data.get('first_name', ''), 50)
    last = sanitize(data.get('last_name', ''), 50)
    err = validate_required({'first_name': first, 'last_name': last}, ['first_name', 'last_name'])
    if err:
        return jsonify({"error": err}), 400

    phone = sanitize(data.get('phone', ''), 20)
    email = sanitize(data.get('email', ''), 100)
    address = sanitize(data.get('address', ''), 300)
    notes = sanitize(data.get('notes', ''), 500)

    if email and not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email):
        return jsonify({"error": "Invalid email format"}), 400

    ts = now_iso()
    db = get_db()

    # Check duplicates
    if phone:
        dup = db.execute("SELECT id FROM contacts WHERE phone=?", (phone,)).fetchone()
        if dup:
            return jsonify({"warning": "A contact with this phone already exists", "duplicate_id": dup['id']}), 200

    cur = db.execute(
        "INSERT INTO contacts (first_name,last_name,phone,email,address,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)",
        (first, last, phone, email, address, notes, ts, ts)
    )
    db.commit()
    audit("contact", cur.lastrowid, "create")
    return jsonify({"id": cur.lastrowid}), 201


@app.route('/api/contacts/<int:cid>', methods=['PUT'])
def update_contact(cid):
    data = request.get_json(force=True)
    db = get_db()
    c = db.execute("SELECT * FROM contacts WHERE id=?", (cid,)).fetchone()
    if not c:
        return jsonify({"error": "Not found"}), 404

    first = sanitize(data.get('first_name', c['first_name']), 50)
    last = sanitize(data.get('last_name', c['last_name']), 50)
    phone = sanitize(data.get('phone', c['phone']), 20)
    email = sanitize(data.get('email', c['email']), 100)
    address = sanitize(data.get('address', c['address']), 300)
    notes = sanitize(data.get('notes', c['notes']), 500)

    if email and not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email):
        return jsonify({"error": "Invalid email format"}), 400

    ts = now_iso()
    db.execute(
        "UPDATE contacts SET first_name=?,last_name=?,phone=?,email=?,address=?,notes=?,updated_at=? WHERE id=?",
        (first, last, phone, email, address, notes, ts, cid)
    )
    db.commit()
    audit("contact", cid, "update")
    return jsonify({"ok": True})


@app.route('/api/contacts/<int:cid>', methods=['DELETE'])
def delete_contact(cid):
    db = get_db()
    db.execute("DELETE FROM contacts WHERE id=?", (cid,))
    db.commit()
    audit("contact", cid, "delete")
    return jsonify({"ok": True})


@app.route('/api/contacts/export', methods=['GET'])
def export_contacts():
    db = get_db()
    rows = db.execute("SELECT * FROM contacts ORDER BY last_name").fetchall()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['First Name', 'Last Name', 'Phone', 'Email', 'Address', 'Notes'])
    for r in rows:
        writer.writerow([r['first_name'], r['last_name'], r['phone'], r['email'], r['address'], r['notes']])
    mem = io.BytesIO()
    mem.write(output.getvalue().encode('utf-8'))
    mem.seek(0)
    return send_file(mem, mimetype='text/csv', as_attachment=True, download_name='contacts.csv')


@app.route('/api/contacts/import', methods=['POST'])
def import_contacts():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    f = request.files['file']
    content = f.read().decode('utf-8')
    reader = csv.DictReader(io.StringIO(content))
    db = get_db()
    ts = now_iso()
    count = 0
    for row in reader:
        first = sanitize(row.get('First Name', row.get('first_name', '')), 50)
        last = sanitize(row.get('Last Name', row.get('last_name', '')), 50)
        if not first or not last:
            continue
        phone = sanitize(row.get('Phone', row.get('phone', '')), 20)
        email = sanitize(row.get('Email', row.get('email', '')), 100)
        address = sanitize(row.get('Address', row.get('address', '')), 300)
        notes = sanitize(row.get('Notes', row.get('notes', '')), 500)
        db.execute(
            "INSERT INTO contacts (first_name,last_name,phone,email,address,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)",
            (first, last, phone, email, address, notes, ts, ts)
        )
        count += 1
    db.commit()
    return jsonify({"imported": count})


# =========================================================================
# 7. MARKDOWN NOTES API
# =========================================================================

@app.route('/api/notes', methods=['GET'])
def get_notes():
    db = get_db()
    search = sanitize(request.args.get('q', ''), 100)
    tag = sanitize(request.args.get('tag', ''), 30)
    page = max(1, int(request.args.get('page', 1)))
    per_page = 50
    offset = (page - 1) * per_page

    query = "SELECT DISTINCT n.* FROM notes n"
    params = []
    if tag:
        query += " JOIN note_tags nt ON n.id=nt.note_id JOIN tags t ON nt.tag_id=t.id"
        query += " WHERE t.name=?"
        params.append(tag)
        if search:
            query += " AND (n.title LIKE ? OR n.content LIKE ?)"
            params.extend([f'%{search}%', f'%{search}%'])
    elif search:
        query += " WHERE n.title LIKE ? OR n.content LIKE ?"
        params.extend([f'%{search}%', f'%{search}%'])

    count_q = query.replace("SELECT DISTINCT n.*", "SELECT COUNT(DISTINCT n.id)")
    total = db.execute(count_q, params).fetchone()[0]

    query += " ORDER BY n.updated_at DESC LIMIT ? OFFSET ?"
    params.extend([per_page, offset])
    rows = db.execute(query, params).fetchall()

    items = []
    for r in rows:
        d = dict(r)
        tags = db.execute(
            "SELECT t.name FROM tags t JOIN note_tags nt ON t.id=nt.tag_id WHERE nt.note_id=?", (r['id'],)
        ).fetchall()
        d['tags'] = [t['name'] for t in tags]
        items.append(d)

    return jsonify({"items": items, "total": total, "page": page})


@app.route('/api/notes', methods=['POST'])
def create_note():
    data = request.get_json(force=True)
    title = sanitize(data.get('title', ''), 100)
    content = data.get('content', '')  # Don't sanitize markdown content on storage, sanitize on render
    if not title:
        return jsonify({"error": "Title required"}), 400

    ts = now_iso()
    db = get_db()
    cur = db.execute("INSERT INTO notes (title, content, created_at, updated_at) VALUES (?,?,?,?)",
                     (title, content, ts, ts))
    note_id = cur.lastrowid

    tags = data.get('tags', [])
    for tag_name in tags:
        tag_name = sanitize(tag_name, 30)
        if not tag_name:
            continue
        db.execute("INSERT OR IGNORE INTO tags (name) VALUES (?)", (tag_name,))
        tag = db.execute("SELECT id FROM tags WHERE name=?", (tag_name,)).fetchone()
        db.execute("INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?,?)", (note_id, tag['id']))

    db.commit()
    audit("note", note_id, "create")
    return jsonify({"id": note_id}), 201


@app.route('/api/notes/<int:nid>', methods=['GET'])
def get_note(nid):
    db = get_db()
    note = db.execute("SELECT * FROM notes WHERE id=?", (nid,)).fetchone()
    if not note:
        return jsonify({"error": "Not found"}), 404
    d = dict(note)
    tags = db.execute("SELECT t.name FROM tags t JOIN note_tags nt ON t.id=nt.tag_id WHERE nt.note_id=?", (nid,)).fetchall()
    d['tags'] = [t['name'] for t in tags]
    # Render markdown safely
    rendered = markdown.markdown(note['content'], extensions=['fenced_code', 'tables', 'codehilite'])
    d['rendered'] = bleach.clean(rendered, tags=[
        'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'del', 's',
        'ul', 'ol', 'li', 'code', 'pre', 'blockquote', 'a', 'img', 'table',
        'thead', 'tbody', 'tr', 'th', 'td', 'br', 'hr', 'div', 'span',
    ], attributes={'a': ['href', 'title'], 'img': ['src', 'alt', 'title'], 'code': ['class'], 'div': ['class'], 'span': ['class']})
    return jsonify(d)


@app.route('/api/notes/<int:nid>', methods=['PUT'])
def update_note(nid):
    data = request.get_json(force=True)
    db = get_db()
    note = db.execute("SELECT * FROM notes WHERE id=?", (nid,)).fetchone()
    if not note:
        return jsonify({"error": "Not found"}), 404

    title = sanitize(data.get('title', note['title']), 100)
    content = data.get('content', note['content'])
    ts = now_iso()
    db.execute("UPDATE notes SET title=?, content=?, updated_at=? WHERE id=?", (title, content, ts, nid))

    if 'tags' in data:
        db.execute("DELETE FROM note_tags WHERE note_id=?", (nid,))
        for tag_name in data['tags']:
            tag_name = sanitize(tag_name, 30)
            if not tag_name:
                continue
            db.execute("INSERT OR IGNORE INTO tags (name) VALUES (?)", (tag_name,))
            tag = db.execute("SELECT id FROM tags WHERE name=?", (tag_name,)).fetchone()
            db.execute("INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?,?)", (nid, tag['id']))

    db.commit()
    audit("note", nid, "update")
    return jsonify({"ok": True})


@app.route('/api/notes/<int:nid>', methods=['DELETE'])
def delete_note(nid):
    db = get_db()
    db.execute("DELETE FROM notes WHERE id=?", (nid,))
    db.commit()
    audit("note", nid, "delete")
    return jsonify({"ok": True})


@app.route('/api/notes/tags', methods=['GET'])
def get_tags():
    db = get_db()
    rows = db.execute("SELECT t.*, COUNT(nt.note_id) as count FROM tags t LEFT JOIN note_tags nt ON t.id=nt.tag_id GROUP BY t.id ORDER BY t.name").fetchall()
    return jsonify({"items": [dict(r) for r in rows]})


@app.route('/api/notes/render', methods=['POST'])
def render_markdown():
    data = request.get_json(force=True)
    content = data.get('content', '')
    rendered = markdown.markdown(content, extensions=['fenced_code', 'tables', 'codehilite'])
    safe = bleach.clean(rendered, tags=[
        'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'del', 's',
        'ul', 'ol', 'li', 'code', 'pre', 'blockquote', 'a', 'img', 'table',
        'thead', 'tbody', 'tr', 'th', 'td', 'br', 'hr', 'div', 'span',
    ], attributes={'a': ['href', 'title'], 'img': ['src', 'alt', 'title'], 'code': ['class'], 'div': ['class'], 'span': ['class']})
    return jsonify({"html": safe})


# =========================================================================
# 8. HABIT TRACKER API
# =========================================================================

@app.route('/api/habits', methods=['GET'])
def get_habits():
    db = get_db()
    rows = db.execute("SELECT * FROM habits ORDER BY created_at DESC").fetchall()
    today = date.today().isoformat()
    items = []
    for r in rows:
        d = dict(r)
        # Check if completed today
        log = db.execute("SELECT id FROM habit_logs WHERE habit_id=? AND log_date=?", (r['id'], today)).fetchone()
        d['completed_today'] = log is not None
        # Current streak
        d['current_streak'] = calc_streak(db, r['id'], r['frequency'])
        # Longest streak
        d['longest_streak'] = calc_longest_streak(db, r['id'], r['frequency'])
        items.append(d)
    return jsonify({"items": items})


def calc_streak(db, habit_id, frequency):
    today = date.today()
    streak = 0
    d = today
    while True:
        if frequency == 'weekdays' and d.weekday() >= 5:
            d -= timedelta(days=1)
            continue
        log = db.execute("SELECT id FROM habit_logs WHERE habit_id=? AND log_date=?", (habit_id, d.isoformat())).fetchone()
        if log:
            streak += 1
            d -= timedelta(days=1)
        else:
            break
    return streak


def calc_longest_streak(db, habit_id, frequency):
    logs = db.execute("SELECT log_date FROM habit_logs WHERE habit_id=? ORDER BY log_date", (habit_id,)).fetchall()
    if not logs:
        return 0
    dates = sorted(set(date.fromisoformat(l['log_date']) for l in logs))
    longest = 1
    current = 1
    for i in range(1, len(dates)):
        diff = (dates[i] - dates[i - 1]).days
        if frequency == 'weekdays':
            # Skip weekends
            expected = 1
            d = dates[i - 1] + timedelta(days=1)
            while d < dates[i] and d.weekday() >= 5:
                d += timedelta(days=1)
            if d == dates[i]:
                current += 1
            else:
                current = 1
        else:
            if diff == 1:
                current += 1
            else:
                current = 1
        longest = max(longest, current)
    return longest


@app.route('/api/habits', methods=['POST'])
def create_habit():
    data = request.get_json(force=True)
    name = sanitize(data.get('name', ''), 80)
    if not name:
        return jsonify({"error": "Name required"}), 400
    desc = sanitize(data.get('description', ''), 300)
    freq = sanitize(data.get('frequency', 'daily'), 20)
    if freq not in ('daily', 'weekdays'):
        freq = 'daily'
    ts = now_iso()
    db = get_db()
    cur = db.execute("INSERT INTO habits (name,description,frequency,created_at,updated_at) VALUES (?,?,?,?,?)",
                     (name, desc, freq, ts, ts))
    db.commit()
    audit("habit", cur.lastrowid, "create")
    return jsonify({"id": cur.lastrowid}), 201


@app.route('/api/habits/<int:hid>', methods=['PUT'])
def update_habit(hid):
    data = request.get_json(force=True)
    db = get_db()
    h = db.execute("SELECT * FROM habits WHERE id=?", (hid,)).fetchone()
    if not h:
        return jsonify({"error": "Not found"}), 404
    name = sanitize(data.get('name', h['name']), 80)
    desc = sanitize(data.get('description', h['description']), 300)
    freq = sanitize(data.get('frequency', h['frequency']), 20)
    ts = now_iso()
    db.execute("UPDATE habits SET name=?,description=?,frequency=?,updated_at=? WHERE id=?",
               (name, desc, freq, ts, hid))
    db.commit()
    audit("habit", hid, "update")
    return jsonify({"ok": True})


@app.route('/api/habits/<int:hid>', methods=['DELETE'])
def delete_habit(hid):
    db = get_db()
    db.execute("DELETE FROM habits WHERE id=?", (hid,))
    db.commit()
    audit("habit", hid, "delete")
    return jsonify({"ok": True})


@app.route('/api/habits/<int:hid>/toggle', methods=['POST'])
def toggle_habit(hid):
    db = get_db()
    today = date.today().isoformat()
    existing = db.execute("SELECT id FROM habit_logs WHERE habit_id=? AND log_date=?", (hid, today)).fetchone()
    if existing:
        db.execute("DELETE FROM habit_logs WHERE id=?", (existing['id'],))
        completed = False
    else:
        db.execute("INSERT INTO habit_logs (habit_id, log_date, created_at) VALUES (?,?,?)", (hid, today, now_iso()))
        completed = True
    db.commit()
    return jsonify({"completed": completed})


@app.route('/api/habits/<int:hid>/calendar', methods=['GET'])
def habit_calendar(hid):
    db = get_db()
    month = sanitize(request.args.get('month', date.today().strftime('%Y-%m')), 7)
    logs = db.execute("SELECT log_date FROM habit_logs WHERE habit_id=? AND log_date LIKE ?",
                      (hid, f'{month}%')).fetchall()
    dates = [l['log_date'] for l in logs]

    # Count days in month
    year, m = int(month[:4]), int(month[5:7])
    if m == 12:
        days_in_month = 31
    else:
        days_in_month = (date(year, m + 1, 1) - timedelta(days=1)).day
    pct = round(len(dates) / days_in_month * 100, 1) if days_in_month > 0 else 0

    return jsonify({"dates": dates, "month": month, "completion_pct": pct, "days_in_month": days_in_month})


@app.route('/api/habits/stats', methods=['GET'])
def habit_stats():
    db = get_db()
    habits = db.execute("SELECT * FROM habits").fetchall()
    today = date.today()
    stats = []
    for h in habits:
        total_logs = db.execute("SELECT COUNT(*) FROM habit_logs WHERE habit_id=?", (h['id'],)).fetchone()[0]
        days_since = (today - date.fromisoformat(h['created_at'][:10])).days + 1
        rate = round(total_logs / days_since * 100, 1) if days_since > 0 else 0
        stats.append({
            "id": h['id'],
            "name": h['name'],
            "total_completions": total_logs,
            "days_tracked": days_since,
            "completion_rate": rate,
            "current_streak": calc_streak(db, h['id'], h['frequency']),
            "longest_streak": calc_longest_streak(db, h['id'], h['frequency']),
        })
    return jsonify({"items": stats})


# =========================================================================
# 9. UNIT CONVERTER API
# =========================================================================

UNIT_CONVERSIONS = {
    "length": {
        "base": "meters",
        "units": {
            "meters": 1, "kilometers": 1000, "centimeters": 0.01,
            "millimeters": 0.001, "miles": 1609.344, "yards": 0.9144,
            "feet": 0.3048, "inches": 0.0254,
        }
    },
    "weight": {
        "base": "kilograms",
        "units": {
            "kilograms": 1, "grams": 0.001, "milligrams": 0.000001,
            "pounds": 0.453592, "ounces": 0.0283495, "tonnes": 1000,
            "stones": 6.35029,
        }
    },
    "volume": {
        "base": "liters",
        "units": {
            "liters": 1, "milliliters": 0.001, "gallons (US)": 3.78541,
            "quarts": 0.946353, "pints": 0.473176, "cups": 0.236588,
            "fluid ounces": 0.0295735, "tablespoons": 0.0147868,
            "teaspoons": 0.00492892,
        }
    },
    "area": {
        "base": "sq meters",
        "units": {
            "sq meters": 1, "sq kilometers": 1000000, "sq centimeters": 0.0001,
            "sq feet": 0.092903, "sq yards": 0.836127, "sq miles": 2589988.11,
            "acres": 4046.86, "hectares": 10000,
        }
    },
    "speed": {
        "base": "m/s",
        "units": {
            "m/s": 1, "km/h": 0.277778, "mph": 0.44704,
            "knots": 0.514444, "ft/s": 0.3048,
        }
    },
}


@app.route('/api/units/categories', methods=['GET'])
def unit_categories():
    result = {}
    for cat, data in UNIT_CONVERSIONS.items():
        result[cat] = list(data['units'].keys())
    return jsonify(result)


@app.route('/api/units/convert', methods=['POST'])
def unit_convert():
    data = request.get_json(force=True)
    category = sanitize(data.get('category', ''), 20)
    source_unit = data.get('source_unit', '')
    target_unit = data.get('target_unit', '')
    values = data.get('values', [])

    if category not in UNIT_CONVERSIONS:
        return jsonify({"error": f"Unknown category: {category}"}), 400

    cat = UNIT_CONVERSIONS[category]
    if source_unit not in cat['units'] or target_unit not in cat['units']:
        return jsonify({"error": "Unknown unit"}), 400

    if not isinstance(values, list):
        values = [values]

    results = []
    db = get_db()
    ts = now_iso()
    for v in values:
        try:
            val = float(v)
        except (ValueError, TypeError):
            results.append({"input": v, "error": "Invalid number"})
            continue
        if val < 0 and category in ('weight', 'volume', 'area'):
            results.append({"input": v, "error": "Value cannot be negative for this category"})
            continue
        # Convert: source -> base -> target
        base_val = val * cat['units'][source_unit]
        result = round(base_val / cat['units'][target_unit], 4)
        results.append({"input": val, "result": result, "source_unit": source_unit, "target_unit": target_unit})
        db.execute(
            "INSERT INTO unit_history (category,source_value,source_unit,target_unit,result_value,created_at) VALUES (?,?,?,?,?,?)",
            (category, val, source_unit, target_unit, result, ts)
        )
    db.commit()
    return jsonify({"results": results})


@app.route('/api/units/history', methods=['GET'])
def unit_history():
    db = get_db()
    rows = db.execute("SELECT * FROM unit_history ORDER BY created_at DESC LIMIT 100").fetchall()
    return jsonify({"items": [dict(r) for r in rows]})


@app.route('/api/units/history', methods=['DELETE'])
def clear_unit_history():
    db = get_db()
    db.execute("DELETE FROM unit_history")
    db.commit()
    return jsonify({"ok": True})


# =========================================================================
# 10. FLASHCARD STUDY API
# =========================================================================

@app.route('/api/decks', methods=['GET'])
def get_decks():
    db = get_db()
    rows = db.execute("SELECT * FROM decks ORDER BY updated_at DESC").fetchall()
    items = []
    for r in rows:
        d = dict(r)
        stats = db.execute('''
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN confidence='mastered' THEN 1 ELSE 0 END) as mastered,
                SUM(CASE WHEN confidence='learning' THEN 1 ELSE 0 END) as learning,
                SUM(CASE WHEN confidence='new' THEN 1 ELSE 0 END) as new_cards
            FROM flashcards WHERE deck_id=?
        ''', (r['id'],)).fetchone()
        d.update(dict(stats))
        items.append(d)
    return jsonify({"items": items})


@app.route('/api/decks', methods=['POST'])
def create_deck():
    data = request.get_json(force=True)
    name = sanitize(data.get('name', ''), 80)
    if not name:
        return jsonify({"error": "Name required"}), 400
    desc = sanitize(data.get('description', ''), 300)
    ts = now_iso()
    db = get_db()
    try:
        cur = db.execute("INSERT INTO decks (name,description,created_at,updated_at) VALUES (?,?,?,?)",
                         (name, desc, ts, ts))
        db.commit()
        return jsonify({"id": cur.lastrowid}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Deck name must be unique"}), 409


@app.route('/api/decks/<int:did>', methods=['PUT'])
def update_deck(did):
    data = request.get_json(force=True)
    db = get_db()
    deck = db.execute("SELECT * FROM decks WHERE id=?", (did,)).fetchone()
    if not deck:
        return jsonify({"error": "Not found"}), 404
    name = sanitize(data.get('name', deck['name']), 80)
    desc = sanitize(data.get('description', deck['description']), 300)
    ts = now_iso()
    db.execute("UPDATE decks SET name=?,description=?,updated_at=? WHERE id=?", (name, desc, ts, did))
    db.commit()
    return jsonify({"ok": True})


@app.route('/api/decks/<int:did>', methods=['DELETE'])
def delete_deck(did):
    db = get_db()
    db.execute("DELETE FROM decks WHERE id=?", (did,))
    db.commit()
    audit("deck", did, "delete")
    return jsonify({"ok": True})


@app.route('/api/decks/<int:did>/cards', methods=['GET'])
def get_cards(did):
    db = get_db()
    search = sanitize(request.args.get('q', ''), 100)
    if search:
        rows = db.execute("SELECT * FROM flashcards WHERE deck_id=? AND (front LIKE ? OR back LIKE ?) ORDER BY created_at DESC",
                          (did, f'%{search}%', f'%{search}%')).fetchall()
    else:
        rows = db.execute("SELECT * FROM flashcards WHERE deck_id=? ORDER BY created_at DESC", (did,)).fetchall()
    return jsonify({"items": [dict(r) for r in rows]})


@app.route('/api/decks/<int:did>/cards', methods=['POST'])
def create_card(did):
    data = request.get_json(force=True)
    front = sanitize(data.get('front', ''), 500)
    back = sanitize(data.get('back', ''), 1000)
    if not front or not back:
        return jsonify({"error": "Front and back required"}), 400
    ts = now_iso()
    db = get_db()
    cur = db.execute(
        "INSERT INTO flashcards (deck_id,front,back,confidence,next_review,created_at,updated_at) VALUES (?,?,?,'new',?,?,?)",
        (did, front, back, ts, ts, ts)
    )
    db.commit()
    return jsonify({"id": cur.lastrowid}), 201


@app.route('/api/cards/<int:cid>', methods=['PUT'])
def update_card(cid):
    data = request.get_json(force=True)
    db = get_db()
    card = db.execute("SELECT * FROM flashcards WHERE id=?", (cid,)).fetchone()
    if not card:
        return jsonify({"error": "Not found"}), 404
    front = sanitize(data.get('front', card['front']), 500)
    back = sanitize(data.get('back', card['back']), 1000)
    ts = now_iso()
    db.execute("UPDATE flashcards SET front=?,back=?,updated_at=? WHERE id=?", (front, back, ts, cid))
    db.commit()
    return jsonify({"ok": True})


@app.route('/api/cards/<int:cid>', methods=['DELETE'])
def delete_card(cid):
    db = get_db()
    db.execute("DELETE FROM flashcards WHERE id=?", (cid,))
    db.commit()
    return jsonify({"ok": True})


@app.route('/api/decks/<int:did>/study', methods=['GET'])
def study_deck(did):
    db = get_db()
    now = now_iso()
    # Prioritize: hard > new > learning > easy (spaced repetition)
    cards = db.execute('''
        SELECT * FROM flashcards WHERE deck_id=?
        ORDER BY
            CASE confidence
                WHEN 'new' THEN 0
                WHEN 'learning' THEN 1
                WHEN 'mastered' THEN 2
            END,
            next_review ASC
    ''', (did,)).fetchall()
    return jsonify({"items": [dict(c) for c in cards]})


@app.route('/api/cards/<int:cid>/rate', methods=['POST'])
def rate_card(cid):
    data = request.get_json(force=True)
    rating = sanitize(data.get('rating', ''), 10)
    if rating not in ('easy', 'medium', 'hard'):
        return jsonify({"error": "Rating must be easy, medium, or hard"}), 400

    db = get_db()
    card = db.execute("SELECT * FROM flashcards WHERE id=?", (cid,)).fetchone()
    if not card:
        return jsonify({"error": "Not found"}), 404

    now = datetime.utcnow()
    review_count = card['review_count'] + 1

    if rating == 'easy':
        confidence = 'mastered'
        next_review = (now + timedelta(days=7)).isoformat()
    elif rating == 'medium':
        confidence = 'learning'
        next_review = (now + timedelta(days=3)).isoformat()
    else:
        confidence = 'learning'
        next_review = (now + timedelta(hours=8)).isoformat()

    db.execute("UPDATE flashcards SET confidence=?, next_review=?, review_count=?, updated_at=? WHERE id=?",
               (confidence, next_review, review_count, now.isoformat(), cid))
    db.commit()
    return jsonify({"confidence": confidence, "next_review": next_review})


# ---------------------------------------------------------------------------
# Dashboard aggregation
# ---------------------------------------------------------------------------

@app.route('/api/dashboard', methods=['GET'])
def dashboard():
    db = get_db()
    today = date.today().isoformat()

    # Todos
    todo_total = db.execute("SELECT COUNT(*) FROM todos").fetchone()[0]
    todo_open = db.execute("SELECT COUNT(*) FROM todos WHERE completed=0").fetchone()[0]

    # Expenses this month
    month_start = date.today().replace(day=1).isoformat()
    expense_month = db.execute(
        "SELECT COALESCE(SUM(amount),0) FROM expenses WHERE deleted=0 AND expense_date>=?",
        (month_start,)
    ).fetchone()[0]
    expense_count = db.execute("SELECT COUNT(*) FROM expenses WHERE deleted=0").fetchone()[0]

    # Notes
    note_count = db.execute("SELECT COUNT(*) FROM notes").fetchone()[0]

    # Contacts
    contact_count = db.execute("SELECT COUNT(*) FROM contacts").fetchone()[0]

    # Habits
    habit_count = db.execute("SELECT COUNT(*) FROM habits").fetchone()[0]
    habits_done_today = db.execute(
        "SELECT COUNT(DISTINCT habit_id) FROM habit_logs WHERE log_date=?", (today,)
    ).fetchone()[0]

    # Flashcards
    deck_count = db.execute("SELECT COUNT(*) FROM decks").fetchone()[0]
    card_total = db.execute("SELECT COUNT(*) FROM flashcards").fetchone()[0]
    card_mastered = db.execute("SELECT COUNT(*) FROM flashcards WHERE confidence='mastered'").fetchone()[0]
    cards_due = db.execute(
        "SELECT COUNT(*) FROM flashcards WHERE next_review<=?", (now_iso(),)
    ).fetchone()[0]

    # Conversions today
    conversions_today = db.execute(
        "SELECT COUNT(*) FROM unit_history WHERE created_at>=?", (today,)
    ).fetchone()[0]
    temp_today = db.execute(
        "SELECT COUNT(*) FROM temp_history WHERE created_at>=?", (today,)
    ).fetchone()[0]

    # Recent audit entries
    recent_activity = db.execute(
        "SELECT entity_type, action, details, created_at FROM audit_log ORDER BY created_at DESC LIMIT 8"
    ).fetchall()

    # Quote of the day
    total_quotes = db.execute("SELECT COUNT(*) FROM quotes").fetchone()[0]
    qotd = None
    if total_quotes > 0:
        day_num = date.today().toordinal() % total_quotes
        q = db.execute("SELECT text, author FROM quotes LIMIT 1 OFFSET ?", (day_num,)).fetchone()
        if q:
            qotd = {"text": q["text"], "author": q["author"]}

    return jsonify({
        "todos": {"total": todo_total, "open": todo_open},
        "expenses": {"month_total": round(expense_month, 2), "count": expense_count},
        "notes": {"count": note_count},
        "contacts": {"count": contact_count},
        "habits": {"total": habit_count, "done_today": habits_done_today},
        "flashcards": {"decks": deck_count, "cards": card_total, "mastered": card_mastered, "due": cards_due},
        "conversions": {"today": conversions_today + temp_today},
        "quote": qotd,
        "recent_activity": [dict(r) for r in recent_activity],
    })


# ---------------------------------------------------------------------------
# Global search across tools
# ---------------------------------------------------------------------------

@app.route('/api/search', methods=['GET'])
def global_search():
    q = sanitize(request.args.get('q', ''), 100).strip()
    if len(q) < 2:
        return jsonify({"results": []})
    like = f'%{q}%'
    db = get_db()
    results = []

    # Todos
    for r in db.execute("SELECT id, title, description FROM todos WHERE title LIKE ? OR description LIKE ? LIMIT 5", (like, like)).fetchall():
        results.append({"type": "todo", "id": r["id"], "title": r["title"], "subtitle": r["description"][:80] if r["description"] else "", "tool": "todos"})

    # Notes
    for r in db.execute("SELECT id, title, content FROM notes WHERE title LIKE ? OR content LIKE ? LIMIT 5", (like, like)).fetchall():
        results.append({"type": "note", "id": r["id"], "title": r["title"], "subtitle": r["content"][:80] if r["content"] else "", "tool": "notes"})

    # Contacts
    for r in db.execute("SELECT id, first_name, last_name, email FROM contacts WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? LIMIT 5", (like, like, like)).fetchall():
        results.append({"type": "contact", "id": r["id"], "title": f'{r["first_name"]} {r["last_name"]}', "subtitle": r["email"], "tool": "contacts"})

    # Flashcards
    for r in db.execute("SELECT id, front, back FROM flashcards WHERE front LIKE ? OR back LIKE ? LIMIT 5", (like, like)).fetchall():
        results.append({"type": "flashcard", "id": r["id"], "title": r["front"], "subtitle": r["back"][:80], "tool": "flashcards"})

    # Expenses
    for r in db.execute("SELECT id, description, amount FROM expenses WHERE deleted=0 AND description LIKE ? LIMIT 5", (like,)).fetchall():
        results.append({"type": "expense", "id": r["id"], "title": r["description"] or "Expense", "subtitle": f'${r["amount"]:.2f}', "tool": "expenses"})

    # Habits
    for r in db.execute("SELECT id, name, description FROM habits WHERE name LIKE ? OR description LIKE ? LIMIT 3", (like, like)).fetchall():
        results.append({"type": "habit", "id": r["id"], "title": r["name"], "subtitle": r["description"][:80] if r["description"] else "", "tool": "habits"})

    return jsonify({"results": results})


# ---------------------------------------------------------------------------
# Demo templates (one-click sample data per challenge)
# ---------------------------------------------------------------------------

@app.route('/api/templates/<tool>', methods=['POST'])
def create_template(tool):
    db = get_db()
    ts = now_iso()
    today = date.today().isoformat()
    key = sanitize(tool, 20).lower()

    if key == 'todos':
        samples = [
            ("Launch MVP landing page", "Ship first version with analytics and error tracking.", 0),
            ("Review pull requests", "Review open PRs and leave actionable feedback.", 0),
            ("Book quarterly planning", "Coordinate product and engineering roadmap review.", 1),
        ]
        ids = []
        for title, desc, done in samples:
            cur = db.execute(
                "INSERT INTO todos (title, description, completed, created_at, updated_at) VALUES (?,?,?,?,?)",
                (title, desc, done, ts, ts),
            )
            ids.append(cur.lastrowid)
            audit("todo", cur.lastrowid, "template-create", "demo template")
        db.commit()
        return jsonify({"ok": True, "message": "Todo templates created", "ids": ids})

    if key == 'temperature':
        src, tgt, val = 'C', 'F', 21.0
        result = convert_temp(val, src, tgt)
        db.execute(
            "INSERT INTO temp_history (source_value,source_scale,target_scale,result_value,created_at) VALUES (?,?,?,?,?)",
            (val, src, tgt, result, ts),
        )
        db.commit()
        return jsonify({"ok": True, "message": "Temperature template added to history", "result": result})

    if key == 'password':
        return jsonify({
            "ok": True,
            "message": "Password template prepared",
            "sample_password": "ProdReady!2026",
        })

    if key == 'expenses':
        cat = db.execute("SELECT id FROM expense_categories WHERE name='Food'").fetchone()
        if not cat:
            cur_cat = db.execute("INSERT INTO expense_categories (name) VALUES ('Food')")
            category_id = cur_cat.lastrowid
        else:
            category_id = cat['id']
        cur = db.execute(
            "INSERT INTO expenses (amount,currency,category_id,description,expense_date,created_at,updated_at) VALUES (?,?,?,?,?,?,?)",
            (24.50, 'USD', category_id, 'Team lunch template entry', today, ts, ts),
        )
        db.commit()
        audit("expense", cur.lastrowid, "template-create", "demo template")
        return jsonify({"ok": True, "message": "Expense template created", "id": cur.lastrowid})

    if key == 'quotes':
        total = db.execute("SELECT COUNT(*) FROM quotes").fetchone()[0]
        if total == 0:
            return jsonify({"error": "No quotes available"}), 404
        day_num = date.today().toordinal() % total
        quote = db.execute("SELECT * FROM quotes LIMIT 1 OFFSET ?", (day_num,)).fetchone()
        db.execute("INSERT OR IGNORE INTO quote_favorites (quote_id, created_at) VALUES (?,?)", (quote['id'], ts))
        db.commit()
        return jsonify({"ok": True, "message": "Quote template favorited", "quote_id": quote['id']})

    if key == 'contacts':
        cur = db.execute(
            "INSERT INTO contacts (first_name,last_name,phone,email,address,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)",
            (
                'Ava',
                'Patel',
                '+1-555-0199',
                'ava.patel@example.com',
                '100 Market St, San Francisco, CA',
                'Design lead - prefers async updates',
                ts,
                ts,
            ),
        )
        db.commit()
        audit("contact", cur.lastrowid, "template-create", "demo template")
        return jsonify({"ok": True, "message": "Contact template created", "id": cur.lastrowid})

    if key == 'notes':
        title = f"Sprint Notes Template {datetime.utcnow().strftime('%H%M%S')}"
        content = (
            "# Sprint Planning\n\n"
            "## Goals\n"
            "- Finalize API contracts\n"
            "- Ship onboarding improvements\n\n"
            "## Risks\n"
            "- Dependency on third-party auth\n"
            "- Limited QA bandwidth\n\n"
            "```python\n"
            "print('template note')\n"
            "```\n"
        )
        cur = db.execute(
            "INSERT INTO notes (title, content, created_at, updated_at) VALUES (?,?,?,?)",
            (title, content, ts, ts),
        )
        note_id = cur.lastrowid
        for tag_name in ('work', 'planning', 'template'):
            db.execute("INSERT OR IGNORE INTO tags (name) VALUES (?)", (tag_name,))
            tag = db.execute("SELECT id FROM tags WHERE name=?", (tag_name,)).fetchone()
            db.execute("INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?,?)", (note_id, tag['id']))
        db.commit()
        audit("note", note_id, "template-create", "demo template")
        return jsonify({"ok": True, "message": "Markdown note template created", "id": note_id})

    if key == 'habits':
        cur = db.execute(
            "INSERT INTO habits (name,description,frequency,created_at,updated_at) VALUES (?,?,?,?,?)",
            ('Daily Deep Work', 'Focus block without meetings for 90 minutes.', 'weekdays', ts, ts),
        )
        hid = cur.lastrowid
        d = date.today()
        inserted = 0
        while inserted < 4:
            if d.weekday() < 5:
                db.execute(
                    "INSERT OR IGNORE INTO habit_logs (habit_id, log_date, created_at) VALUES (?,?,?)",
                    (hid, d.isoformat(), ts),
                )
                inserted += 1
            d -= timedelta(days=1)
        db.commit()
        audit("habit", hid, "template-create", "demo template")
        return jsonify({"ok": True, "message": "Habit template created", "id": hid})

    if key == 'units':
        category = 'length'
        source_unit = 'kilometers'
        target_unit = 'miles'
        value = 5.0
        base_val = value * UNIT_CONVERSIONS[category]['units'][source_unit]
        result = round(base_val / UNIT_CONVERSIONS[category]['units'][target_unit], 4)
        db.execute(
            "INSERT INTO unit_history (category,source_value,source_unit,target_unit,result_value,created_at) VALUES (?,?,?,?,?,?)",
            (category, value, source_unit, target_unit, result, ts),
        )
        db.commit()
        return jsonify({"ok": True, "message": "Unit conversion template added", "result": result})

    if key == 'flashcards':
        suffix = datetime.utcnow().strftime('%H%M%S')
        deck_name = f"JavaScript Interview Deck {suffix}"
        cur = db.execute(
            "INSERT INTO decks (name,description,created_at,updated_at) VALUES (?,?,?,?)",
            (deck_name, 'Template deck with front/back cards and spacing metadata.', ts, ts),
        )
        did = cur.lastrowid
        cards = [
            ("What is a closure in JavaScript?", "A closure is a function that retains access to its lexical scope."),
            ("What is event bubbling?", "Event bubbling is propagation from the target element up through ancestors."),
            ("Difference between let and var?", "let is block-scoped and var is function-scoped."),
        ]
        ids = []
        for front, back in cards:
            card_cur = db.execute(
                "INSERT INTO flashcards (deck_id,front,back,confidence,next_review,created_at,updated_at) VALUES (?,?,?,'new',?,?,?)",
                (did, front, back, ts, ts, ts),
            )
            ids.append(card_cur.lastrowid)
        db.commit()
        audit("deck", did, "template-create", "demo template")
        return jsonify({"ok": True, "message": "Deck template created", "deck_id": did, "card_ids": ids})

    return jsonify({"error": f"Unknown template tool: {key}"}), 400


# ---------------------------------------------------------------------------
# Init on first request
# ---------------------------------------------------------------------------

with app.app_context():
    init_db()


if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5005)
