# FastAPI Skeleton Application

A minimal FastAPI application template with no endpoints defined. This serves as a starting point for building FastAPI applications, ideal for demonstrating how to use GitHub Copilot to add new functionality.

## Features

- ✅ FastAPI application structure
- ✅ Health check endpoint included
- ✅ Docker and Docker Compose configuration
- ✅ Hot-reload enabled for development
- ✅ Ready to add endpoints using AI-assisted development

## Prerequisites

- Python 3.11+ (for local development)
- Docker and Docker Compose (for containerized deployment)

## Setup and Installation

### Option 1: Local Development with Virtual Environment

#### 1. Create Virtual Environment

```bash
# Navigate to the project directory
cd skeletons/fastapi-skeleton

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate
```

#### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

#### 3. Run the Application

```bash
# Start the development server with hot-reload
uvicorn app.main:app --reload

# Or specify host and port explicitly
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The application will start at `http://localhost:8000`

#### 4. Access Interactive API Documentation

FastAPI automatically generates interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Option 2: Docker Deployment

#### 1. Build and Run with Docker Compose

```bash
# Navigate to the project directory
cd skeletons/fastapi-skeleton

# Build and start the container
docker-compose up --build

# Or run in detached mode
docker-compose up -d
```

The application will start at `http://localhost:8000`

#### 2. Stop the Container

```bash
docker-compose down
```

## Project Structure

```
fastapi-skeleton/
├── app/
│   ├── __init__.py          # Package initialization
│   └── main.py              # FastAPI application entry point
├── .gitignore               # Git ignore rules
├── docker-compose.yml       # Docker Compose configuration
├── Dockerfile               # Docker image definition
├── README.md                # This file
└── requirements.txt         # Python dependencies
```

## Adding New Endpoints

This skeleton application is ready for you to add endpoints. Use GitHub Copilot or other AI-assisted tools to:

1. Add new route handlers in `app/main.py`
2. Create additional modules in the `app/` directory
3. Implement business logic, data models, and services

### Example: Adding a Simple Endpoint

```python
@app.get("/items")
async def get_items():
    return {"items": ["item1", "item2", "item3"]}

@app.post("/items")
async def create_item(item: dict):
    return {"message": "Item created", "item": item}
```

## Verifying the Application

Once the application is running, test the health check endpoint:

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "message": "FastAPI application is running"
}
```

## Development Tips

- **Hot Reload**: Both local and Docker setups include hot-reload, so changes to your code will automatically restart the server
- **API Documentation**: Visit `/docs` to see and test your endpoints interactively
- **Type Hints**: FastAPI leverages Python type hints for automatic validation and documentation
- **Pydantic Models**: Use Pydantic models for request/response validation

## Next Steps

1. Define your data models using Pydantic
2. Create endpoint route handlers
3. Implement business logic
4. Add database integration (if needed)
5. Implement authentication and authorization
6. Add comprehensive error handling
7. Write tests for your endpoints

## Deactivating Virtual Environment

When you're done working:

```bash
deactivate
```

## License

This is a template/example project for educational purposes.
