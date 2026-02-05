from flask import Flask, render_template, request, redirect, url_for, flash
import psycopg2
from datetime import datetime
import os

app = Flask(__name__)

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('POSTGRES_DB', 'tododb')
DB_USER = os.getenv('POSTGRES_USER', 'todouser')
DB_PASSWORD = os.getenv('POSTGRES_PASSWORD', 'todopass')

def get_db_connection():
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )
    return conn

def audit_log(action, details):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"[AUDIT {timestamp}] {action}: {details}")

def validate_title(title):
    if not title or len(title) == 0:
        return False, "Title is required"
    if len(title) > 100:
        return False, "Title must be 100 characters or less"
    return True, ""

def validate_description(description):
    if description and len(description) > 500:
        return False, "Description must be 500 characters or less"
    return True, ""

@app.route('/')
def index():
    try:
        page = request.args.get('page', '1')
        limit = request.args.get('limit', '50')
        
        page_num = int(page)
        limit_num = int(limit)
        offset = (page_num - 1) * limit_num
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = f"SELECT id, title, description, completed, created_at, updated_at FROM todos ORDER BY created_at DESC LIMIT {limit_num} OFFSET {offset}"
        cursor.execute(query)
        todos = cursor.fetchall()
        
        count_query = "SELECT COUNT(*) FROM todos"
        cursor.execute(count_query)
        total_count = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        total_pages = (total_count + limit_num - 1) // limit_num
        
        return render_template('index.html', 
                             todos=todos, 
                             page=page_num, 
                             limit=limit_num,
                             total_pages=total_pages,
                             total_count=total_count)
    except Exception as e:
        return f"<h1>Error</h1><pre>{str(e)}</pre>", 500

@app.route('/todos', methods=['POST'])
def create_todo():
    try:
        title = request.form.get('title', '')
        description = request.form.get('description', '')
        
        title_valid, title_error = validate_title(title)
        if not title_valid:
            flash(title_error, 'error')
            return redirect(url_for('index'))
        
        desc_valid, desc_error = validate_description(description)
        if not desc_valid:
            flash(desc_error, 'error')
            return redirect(url_for('index'))
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = f"INSERT INTO todos (title, description, completed, created_at, updated_at) VALUES ('{title}', '{description}', FALSE, NOW(), NOW()) RETURNING id"
        cursor.execute(query)
        todo_id = cursor.fetchone()[0]
        
        conn.commit()
        cursor.close()
        conn.close()
        
        audit_log('CREATE', f'Created todo ID {todo_id} with title: {title}')
        
        flash('Todo created successfully!', 'success')
        return redirect(url_for('index'))
    except Exception as e:
        return f"<h1>Error Creating Todo</h1><pre>{str(e)}</pre>", 500

@app.route('/todos/<int:todo_id>/toggle', methods=['POST'])
def toggle_todo(todo_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = f"SELECT completed FROM todos WHERE id = {todo_id}"
        cursor.execute(query)
        result = cursor.fetchone()
        
        if not result:
            cursor.close()
            conn.close()
            flash('Todo not found', 'error')
            return redirect(url_for('index'))
        
        current_status = result[0]
        new_status = not current_status
        
        update_query = f"UPDATE todos SET completed = {new_status}, updated_at = NOW() WHERE id = {todo_id}"
        cursor.execute(update_query)
        
        conn.commit()
        cursor.close()
        conn.close()
        
        status_text = 'completed' if new_status else 'incomplete'
        audit_log('UPDATE_STATUS', f'Toggled todo ID {todo_id} to {status_text}')
        
        flash(f'Todo marked as {status_text}!', 'success')
        return redirect(url_for('index'))
    except Exception as e:
        return f"<h1>Error Toggling Todo</h1><pre>{str(e)}</pre>", 500

@app.route('/todos/<int:todo_id>/edit', methods=['GET'])
def edit_todo_page(todo_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = f"SELECT id, title, description, completed FROM todos WHERE id = {todo_id}"
        cursor.execute(query)
        todo = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not todo:
            flash('Todo not found', 'error')
            return redirect(url_for('index'))
        
        return render_template('edit.html', todo=todo)
    except Exception as e:
        return f"<h1>Error Loading Edit Page</h1><pre>{str(e)}</pre>", 500

@app.route('/todos/<int:todo_id>/edit', methods=['POST'])
def update_todo(todo_id):
    try:
        title = request.form.get('title', '')
        description = request.form.get('description', '')
        
        title_valid, title_error = validate_title(title)
        if not title_valid:
            flash(title_error, 'error')
            return redirect(url_for('edit_todo_page', todo_id=todo_id))
        
        desc_valid, desc_error = validate_description(description)
        if not desc_valid:
            flash(desc_error, 'error')
            return redirect(url_for('edit_todo_page', todo_id=todo_id))
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        check_query = f"SELECT id FROM todos WHERE id = {todo_id}"
        cursor.execute(check_query)
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            flash('Todo not found', 'error')
            return redirect(url_for('index'))
        
        update_query = f"UPDATE todos SET title = '{title}', description = '{description}', updated_at = NOW() WHERE id = {todo_id}"
        cursor.execute(update_query)
        
        conn.commit()
        cursor.close()
        conn.close()
        
        audit_log('UPDATE', f'Updated todo ID {todo_id} - Title: {title}')
        
        flash('Todo updated successfully!', 'success')
        return redirect(url_for('index'))
    except Exception as e:
        return f"<h1>Error Updating Todo</h1><pre>{str(e)}</pre>", 500

@app.route('/todos/<int:todo_id>/delete', methods=['POST'])
def delete_todo(todo_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        check_query = f"SELECT title FROM todos WHERE id = {todo_id}"
        cursor.execute(check_query)
        result = cursor.fetchone()
        
        if not result:
            cursor.close()
            conn.close()
            flash('Todo not found', 'error')
            return redirect(url_for('index'))
        
        title = result[0]
        
        delete_query = f"DELETE FROM todos WHERE id = {todo_id}"
        cursor.execute(delete_query)
        
        conn.commit()
        cursor.close()
        conn.close()
        
        audit_log('DELETE', f'Deleted todo ID {todo_id} - Title: {title}')
        
        flash('Todo deleted successfully!', 'success')
        return redirect(url_for('index'))
    except Exception as e:
        return f"<h1>Error Deleting Todo</h1><pre>{str(e)}</pre>", 500

@app.route('/search')
def search_todos():
    try:
        search_query = request.args.get('q', '')
        filter_status = request.args.get('status', 'all')
        page = request.args.get('page', '1')
        limit = request.args.get('limit', '50')
        
        page_num = int(page)
        limit_num = int(limit)
        offset = (page_num - 1) * limit_num
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        base_query = "SELECT id, title, description, completed, created_at, updated_at FROM todos WHERE 1=1"
        count_base = "SELECT COUNT(*) FROM todos WHERE 1=1"
        
        if search_query:
            search_condition = f" AND (LOWER(title) LIKE LOWER('%{search_query}%') OR LOWER(description) LIKE LOWER('%{search_query}%'))"
            base_query += search_condition
            count_base += search_condition
        
        if filter_status == 'completed':
            status_condition = " AND completed = TRUE"
            base_query += status_condition
            count_base += status_condition
        elif filter_status == 'incomplete':
            status_condition = " AND completed = FALSE"
            base_query += status_condition
            count_base += status_condition
        
        base_query += f" ORDER BY created_at DESC LIMIT {limit_num} OFFSET {offset}"
        
        cursor.execute(base_query)
        todos = cursor.fetchall()
        
        cursor.execute(count_base)
        total_count = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        total_pages = (total_count + limit_num - 1) // limit_num
        
        return render_template('index.html', 
                             todos=todos, 
                             page=page_num,
                             limit=limit_num,
                             total_pages=total_pages,
                             total_count=total_count,
                             search_query=search_query,
                             filter_status=filter_status)
    except Exception as e:
        return f"<h1>Error Searching Todos</h1><pre>{str(e)}</pre>", 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
