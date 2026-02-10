# Quarkus Skeleton Application

A minimal Quarkus application template with no custom endpoints defined. This serves as a starting point for building Quarkus applications, ideal for demonstrating how to use GitHub Copilot to add new functionality.

## Features

- ✅ Quarkus 3.17.5 with Java 21
- ✅ SmallRye Health for health check endpoints
- ✅ RESTEasy Reactive (JAX-RS) for REST endpoints
- ✅ Jackson for JSON serialization
- ✅ Maven wrapper (no Maven installation required)
- ✅ Docker and Docker Compose configuration
- ✅ Quarkus Dev Mode with live reload
- ✅ Ready to add endpoints using AI-assisted development

## Prerequisites

- Java 21 JDK (for local development)
- Docker and Docker Compose (for containerized deployment)

## Setup and Installation

### Option 1: Local Development with Maven Wrapper

#### 1. Verify Java Installation

```bash
# Check Java version (should be 21)
java -version
```

If you don't have Java 21 installed, download it from:
- [Eclipse Temurin](https://adoptium.net/) (recommended)
- [Oracle JDK](https://www.oracle.com/java/technologies/downloads/)

#### 2. Build the Application

```bash
# Navigate to the project directory
cd skeletons/backend/quarkus-skeleton

# Build the application (downloads dependencies and compiles)
./mvnw clean package

# On Windows:
# mvnw.cmd clean package
```

#### 3. Run the Application

```bash
# Run in Quarkus dev mode (with live reload)
./mvnw quarkus:dev

# Or run the packaged JAR directly
java -jar target/quarkus-app/quarkus-run.jar
```

The application will start at `http://localhost:8080`

#### 4. Access Application Health Check

SmallRye Health provides production-ready endpoints:

- **Health (all checks)**: http://localhost:8080/q/health
- **Liveness**: http://localhost:8080/q/health/live
- **Readiness**: http://localhost:8080/q/health/ready

### Option 2: Docker Deployment

#### 1. Build and Run with Docker Compose

```bash
# Navigate to the project directory
cd skeletons/backend/quarkus-skeleton

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
quarkus-skeleton/
├── .mvn/
│   └── wrapper/
│       └── maven-wrapper.properties    # Maven wrapper configuration
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── example/
│   │   │           └── skeleton/
│   │   │               └── SkeletonApplication.java  # Main application class
│   │   └── resources/
│   │       └── application.properties  # Application configuration
│   └── test/
│       └── java/
│           └── com/
│               └── example/
│                   └── skeleton/
│                       └── SkeletonApplicationTest.java  # Basic test
├── .gitignore                          # Git ignore rules
├── docker-compose.yml                  # Docker Compose configuration
├── Dockerfile                          # Multi-stage Docker image definition
├── Makefile                            # Build automation targets
├── mvnw                                # Maven wrapper script (Unix/Linux)
├── mvnw.cmd                            # Maven wrapper script (Windows)
├── pom.xml                             # Maven project configuration
└── README.md                           # This file
```

## Adding New Endpoints

This skeleton application is ready for you to add REST endpoints. Use GitHub Copilot or other AI-assisted tools to:

1. Create new `@Path` resource classes in `src/main/java/com/example/skeleton/resource/`
2. Add new services in `src/main/java/com/example/skeleton/service/`
3. Create data models in `src/main/java/com/example/skeleton/model/`
4. Implement repositories if using databases

### Example: Adding a Simple REST Resource

Create a new file `src/main/java/com/example/skeleton/resource/ItemResource.java`:

```java
package com.example.skeleton.resource;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.util.List;

@Path("/api/items")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ItemResource {

    @GET
    public List<String> getItems() {
        return List.of("item1", "item2", "item3");
    }

    @POST
    public String createItem(String item) {
        return "Item created: " + item;
    }
}
```

## Verifying the Application

Once the application is running, test the health check endpoint:

```bash
curl http://localhost:8080/q/health/ready
```

Expected response:
```json
{
    "status": "UP",
    "checks": []
}
```

## Development Tips

- **Maven Wrapper**: The `mvnw` script automatically downloads the correct Maven version, so you don't need Maven installed
- **Dev Mode**: Quarkus dev mode (`./mvnw quarkus:dev`) provides live reload — code changes are picked up automatically without restarting
- **Dev UI**: In dev mode, access the Quarkus Dev UI at http://localhost:8080/q/dev-ui for interactive tools
- **Health Endpoints**: Customize health checks by implementing `org.eclipse.microprofile.health.HealthCheck`
- **Configuration**: Use `application.properties` for configuration; Quarkus supports profile-based config with `%dev.`, `%test.`, `%prod.` prefixes
- **Testing**: Run tests with `./mvnw test`; Quarkus starts a test instance automatically
- **Packaging**: Create the JAR with `./mvnw clean package`

## Running Tests

```bash
# Run all tests
./mvnw test

# Run tests with detailed output
./mvnw test -X
```

## Next Steps

1. Create JAX-RS resource classes for your API endpoints
2. Define data models (DTOs/Entities)
3. Implement service layer with CDI beans (`@ApplicationScoped`, `@Inject`)
4. Add database integration (Quarkus Hibernate ORM with Panache)
5. Configure security (Quarkus Security / OIDC)
6. Add Bean Validation annotations (`@Valid`, `@NotNull`, etc.)
7. Write comprehensive unit and integration tests
8. Configure logging and monitoring

## Common Maven Commands

```bash
# Clean build artifacts
./mvnw clean

# Compile the project
./mvnw compile

# Run tests
./mvnw test

# Package as JAR
./mvnw package

# Skip tests during build
./mvnw package -DskipTests

# Run in dev mode
./mvnw quarkus:dev

# List dependency tree
./mvnw dependency:tree
```

## Troubleshooting

### Port Already in Use

If port 8080 is already in use, change it in `src/main/resources/application.properties`:

```properties
quarkus.http.port=8081
```

### Maven Wrapper Permission Denied

On Unix/Linux, make sure the wrapper script is executable:

```bash
chmod +x mvnw
```

### Java Version Mismatch

Ensure `JAVA_HOME` points to Java 21:

```bash
# Check JAVA_HOME
echo $JAVA_HOME

# Set JAVA_HOME (example for Linux/Mac)
export JAVA_HOME=/path/to/java-21
```

## License

This is a template/example project for educational purposes.
