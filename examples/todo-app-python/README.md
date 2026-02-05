# Todo List Application

A simple web-based todo list application built with Flask and PostgreSQL. Manage your daily tasks with an easy-to-use interface featuring create, read, update, delete operations, along with search and filtering capabilities.

## Features

- ✓ Create new todo items with title and description
- ✓ View all todos with pagination support
- ✓ Toggle todo completion status
- ✓ Edit todo details
- ✓ Delete todos with confirmation
- ✓ Search todos by keywords
- ✓ Filter by completion status
- ✓ Audit logging for all operations
- ✓ Server-side rendered HTML interface
- ✓ PostgreSQL database for data persistence

## Prerequisites

- Python 3.11 or higher
- Docker and Docker Compose (for database)
- pip (Python package manager)

## Project Structure

```
todo-app-python/
├── app.py                 # Main Flask application
├── init.sql              # Database initialization script
├── requirements.txt      # Python dependencies
├── Dockerfile           # Container configuration for app
├── docker-compose.yml   # Docker Compose configuration
├── templates/           # HTML templates
│   ├── index.html      # Main todo list page
│   └── edit.html       # Edit todo page
└── static/             # Static assets
    └── style.css       # Application styles
```

## Setup and Installation

### Option 1: Local Development (Recommended for Development)

1. **Configure environment variables:**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env file if you need to change default values
   ```

2. **Start the PostgreSQL database:**
   ```bash
   docker-compose up postgres -d
   ```

3. **Create and activate a Python virtual environment:**
   ```bash
   # Create virtual environment
   python -m venv venv
   
   # Activate on Linux/Mac
   source venv/bin/activate
   
   # Activate on Windows
   venv\Scripts\activate
   ```

4. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Load environment variables and run the Flask application:**
   ```bash
   # On Linux/Mac
   export $(cat .env | xargs) && python app.py
   
   # On Windows (PowerShell)
   Get-Content .env | ForEach-Object { $var = $_.Split('='); [System.Environment]::SetEnvironmentVariable($var[0], $var[1]) }; python app.py
   
   # Or simply run (uses defaults for local development with DB_HOST=localhost)
   python app.py
   ```

6. **Access the application:**
   - Open your browser and navigate to: http://localhost:5000
   - The database will be automatically initialized on first startup

### Option 2: Docker Deployment (Run Everything in Containers)

1. **Configure environment variables:**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env file if you need to change default values
   ```

2. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Open your browser and navigate to: http://localhost:5000

4. **Stop the services:**
   ```bash
   docker-compose down
   ```

## Usage

### Creating a Todo
1. Enter a title (required, max 100 characters)
2. Optionally add a description (max 500 characters)
3. Click "Add Todo"

### Viewing Todos
- All todos are displayed on the main page
- Sorted by creation date (newest first)
- Pagination automatically activates when there are more than 50 items

### Updating Todo Status
- Click the status button to toggle between Complete and Incomplete

### Editing a Todo
1. Click "Edit" next to any todo
2. Modify the title and/or description
3. Click "Update Todo" to save changes

### Deleting a Todo
1. Click "Delete" next to any todo
2. Confirm the deletion in the popup dialog

### Searching and Filtering
- Use the search box to find todos by title or description
- Filter by status: All, Completed, or Incomplete
- Multiple filters can be combined
- Click "Clear" to reset search and filters

## Configuration

The application uses environment variables for database configuration. These are stored in a `.env` file:

- `POSTGRES_DB` - Database name (default: tododb)
- `POSTGRES_USER` - Database user (default: todouser)
- `POSTGRES_PASSWORD` - Database password (default: todopass)
- `DB_HOST` - Database hostname (default: localhost for local dev, postgres for Docker)
- `DB_PORT` - Database port (default: 5432)

A `.env.example` file is provided as a template. Copy it to `.env` and modify values as needed.

**Note:** For local development without Docker Compose, make sure to set `DB_HOST=localhost` in your environment or let it use the default.

## Database

The application uses PostgreSQL for data storage. The database schema includes:

- **todos table**: Stores todo items with id, title, description, completion status, and timestamps
- Automatic indexing on created_at and completed columns for query performance

## Audit Logging

All create, update, and delete operations are logged to the console with timestamps for audit trail purposes.

## Stopping the Application

### Local Development:
- Press `Ctrl+C` in the terminal running the Flask app
- Stop the database: `docker-compose down`

### Docker Deployment:
- `docker-compose down` (stops and removes containers)
- `docker-compose down -v` (also removes database volume - **WARNING: deletes all data**)

## Development Notes

- The application runs in debug mode by default for easier development
- Hot reload is enabled when running locally or with docker-compose
- All HTML templates use server-side rendering with Jinja2
- Static files are served from the `/static` directory

## Pagination

The application supports custom pagination parameters:
- `?page=N` - Navigate to page N
- `?limit=N` - Show N items per page (default: 50)

Example: http://localhost:5000?page=2&limit=25
