# Rust REST API Skeleton Application

A minimal Rust REST API application template with no endpoints defined. This serves as a starting point for building Rust REST APIs, ideal for demonstrating how to use GitHub Copilot to add new functionality.

## Features

- ✅ Actix Web application structure
- ✅ Health check endpoint included
- ✅ Serde JSON serialization/deserialization
- ✅ Structured logging with env_logger
- ✅ Multi-stage Docker build for small images
- ✅ Docker and Docker Compose configuration
- ✅ Ready to add endpoints using AI-assisted development

## Prerequisites

- Rust 1.84+ and Cargo (for local development)
- Docker and Docker Compose (for containerized deployment)

## Setup and Installation

### Option 1: Local Development

#### 1. Install Dependencies

```bash
# Navigate to the project directory
cd skeletons/rust-skeleton

# Download and compile dependencies
cargo build
```

#### 2. Run the Application

```bash
# Start the development server
RUST_LOG=info cargo run

# Or use Make
make dev
```

The application will start at `http://localhost:8080`

#### 3. Build a Release Binary

```bash
# Build optimized release binary
make build

# Run it
RUST_LOG=info ./target/release/rust-skeleton
```

### Option 2: Docker Deployment

#### 1. Build and Run with Docker Compose

```bash
# Navigate to the project directory
cd skeletons/rust-skeleton

# Build and start the container
docker-compose up --build

# Or run in detached mode
docker-compose up -d
```

The application will start at `http://localhost:8080`

#### 2. Stop the Container

```bash
docker-compose down
```

## Project Structure

```
rust-skeleton/
├── src/
│   ├── main.rs                  # Application entry point
│   ├── handlers.rs              # Request handlers
│   └── routes.rs                # Route configuration
├── docker-compose.yml           # Docker Compose configuration
├── Dockerfile                   # Multi-stage Docker image definition
├── Cargo.toml                   # Rust package manifest
├── Makefile                     # Build automation
└── README.md                    # This file
```

## Adding New Endpoints

This skeleton application is ready for you to add endpoints. Use GitHub Copilot or other AI-assisted tools to:

1. Add new handler functions in `src/handlers.rs`
2. Register routes in `src/routes.rs`
3. Create additional modules for models, services, and middleware

### Example: Adding a Simple Endpoint

```rust
// In src/handlers.rs
use actix_web::{web, HttpResponse};
use serde::Serialize;

#[derive(Serialize)]
pub struct Item {
    pub name: String,
}

pub async fn list_items() -> HttpResponse {
    let items = vec![
        Item { name: "item1".to_string() },
        Item { name: "item2".to_string() },
    ];
    HttpResponse::Ok().json(items)
}
```

Then register it in `src/routes.rs`:

```rust
cfg.service(
    web::scope("/api/v1")
        .route("/items", web::get().to(handlers::list_items))
);
```

## Verifying the Application

Once the application is running, test the health check endpoint:

```bash
curl http://localhost:8080/health
```

Expected response:
```json
{
  "status": "healthy",
  "message": "Rust REST API application is running"
}
```

## Development Tips

- **Actix Web**: [Actix Web](https://actix.rs/) is one of the fastest web frameworks, built on the Actix actor system and Tokio async runtime
- **Serde**: Use Serde derive macros (`Serialize`, `Deserialize`) for automatic JSON handling
- **Clippy**: Run `make lint` to catch common mistakes and follow Rust idioms
- **Type Safety**: Leverage Rust's ownership system and `Result` types for robust error handling
- **cargo-watch**: Install `cargo install cargo-watch` and run `cargo watch -x run` for automatic recompilation on file changes

## Next Steps

1. Define your data models as Rust structs with Serde derives
2. Create handler functions for your endpoints
3. Register routes in the route configuration
4. Add database integration (e.g., with SQLx or Diesel)
5. Implement authentication and authorization middleware
6. Add comprehensive error handling with custom error types
7. Write tests for your handlers

## License

This is a template/example project for educational purposes.
