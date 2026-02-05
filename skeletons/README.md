# Application Skeletons

This directory contains minimal skeleton applications for various frameworks and technologies. Each skeleton provides a clean starting point for building applications and is designed to work with AI-assisted development tools like GitHub Copilot and Claude.

## Available Skeletons

### Frontend Frameworks

#### 1. React Skeleton (`react-skeleton/`)
A minimal React application built with Vite and TypeScript.

**Tech Stack:**
- React 18 with TypeScript
- Vite for fast development and optimized builds
- Hot Module Replacement (HMR)
- Docker support

**Quick Start:**
```bash
cd react-skeleton
npm install
npm run dev
```

Access at: `http://localhost:5173`

[View detailed README](react-skeleton/README.md)

---

#### 2. Angular Skeleton (`angular-skeleton/`)
A minimal Angular application using standalone components.

**Tech Stack:**
- Angular 20 (LTS) with standalone components
- TypeScript strict mode
- Angular Signals for reactive state management
- Docker support

**Quick Start:**
```bash
cd angular-skeleton
npm install
npm start
```

Access at: `http://localhost:4200`

[View detailed README](angular-skeleton/README.md)

---

### Backend Frameworks

#### 3. FastAPI Skeleton (`fastapi-skeleton/`)
A minimal Python FastAPI application template.

**Tech Stack:**
- FastAPI (Python web framework)
- Python 3.11+
- Automatic interactive API documentation (Swagger UI)
- Hot-reload enabled
- Docker support

**Quick Start:**
```bash
cd fastapi-skeleton
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Access at: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

[View detailed README](fastapi-skeleton/README.md)

---

#### 4. Spring Boot Skeleton (`spring-boot-skeleton/`)
A minimal Java Spring Boot application template.

**Tech Stack:**
- Spring Boot 3.4.2 with Java 21
- Spring Boot Actuator for production-ready features
- Maven wrapper (no Maven installation required)
- Docker support

**Quick Start:**
```bash
cd spring-boot-skeleton
./mvnw spring-boot:run
```

Access at: `http://localhost:8080`
Health Check: `http://localhost:8080/actuator/health`

[View detailed README](spring-boot-skeleton/README.md)

---

## Common Features

All skeletons include:

- **Docker & Docker Compose** - Ready for containerized deployment
- **Development Hot-Reload** - Changes reflect immediately during development
- **Sample Components/Endpoints** - Minimal examples to demonstrate patterns
- **Clean Structure** - Organized file structure following framework best practices
- **Production-Ready** - Build configurations for optimized production deployments

## Using These Skeletons

### Local Development

Each skeleton can be run locally using the standard tooling for that framework:

1. Navigate to the skeleton directory
2. Install dependencies
3. Run the development server
4. Start building your application

### Docker Deployment

All skeletons support Docker deployment:

```bash
cd <skeleton-name>
docker-compose up --build
```

### AI-Assisted Development

These skeletons are designed to work seamlessly with AI-assisted development tools:

- **GitHub Copilot** - Get intelligent code suggestions as you type
- **Claude** - Use conversational AI to add features, refactor code, and solve problems
- **Other AI Tools** - Any AI coding assistant can help extend these applications

## Choosing a Skeleton

### Frontend Development

- **React** - Choose if you want a flexible, component-based library with a large ecosystem
- **Angular** - Choose if you want a comprehensive framework with opinionated structure and built-in solutions

### Backend Development

- **FastAPI** - Choose if you want a modern Python framework with automatic API documentation
- **Spring Boot** - Choose if you want a mature Java framework with enterprise-grade features

## Next Steps

1. Choose the skeleton that matches your project needs
2. Navigate to its directory
3. Read its README for detailed setup instructions
4. Start building your application
5. Use AI-assisted tools to accelerate development

## Requirements Summary

### Frontend Skeletons
- Node.js 20+
- npm or yarn
- Docker (optional)

### Backend Skeletons
- **FastAPI**: Python 3.11+, Docker (optional)
- **Spring Boot**: Java 21 JDK, Docker (optional)

## Support and Documentation

Each skeleton includes:
- Comprehensive README with setup instructions
- Troubleshooting guide
- Development tips
- Next steps and extension ideas
- Links to official framework documentation

## License

These are template/example projects for educational purposes.
