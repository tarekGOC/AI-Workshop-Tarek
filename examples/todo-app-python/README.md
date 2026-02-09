# Todo List Application

## Prerequisites

- Docker and Docker Compose

## Run with Docker

```bash
cd examples/todo-app-python
docker-compose up --build
```

Open http://localhost:5000.

## Run Locally (with live reload)

```bash
cd examples/todo-app-python

# Start the database only
docker-compose up postgres -d

# Install dependencies
pip install -r requirements.txt

# Run the app
python app.py
```

Open http://localhost:5000. Changes to the code will auto-reload.

## Stop

```bash
docker-compose down
```
