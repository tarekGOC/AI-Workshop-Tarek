# Spring Boot Skeleton Application

A minimal Spring Boot application template with no custom endpoints defined. This serves as a starting point for building Spring Boot applications, ideal for demonstrating how to use GitHub Copilot to add new functionality.

## Features

- ✅ Spring Boot 3.4.2 with Java 21
- ✅ Spring Boot Actuator for production-ready features
- ✅ Health check endpoint included via Actuator
- ✅ Maven wrapper (no Maven installation required)
- ✅ Docker and Docker Compose configuration
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
cd examples/spring-boot-skeleton

# Build the application (downloads dependencies and compiles)
./mvnw clean package

# On Windows:
# mvnw.cmd clean package
```

#### 3. Run the Application

```bash
# Run the Spring Boot application
./mvnw spring-boot:run

# Or run the JAR directly
java -jar target/skeleton-0.0.1-SNAPSHOT.jar
```

The application will start at `http://localhost:8080`

#### 4. Access Application Health Check

Spring Boot Actuator provides production-ready endpoints:

- **Health Check**: http://localhost:8080/actuator/health
- **Application Info**: http://localhost:8080/actuator/info

### Option 2: Docker Deployment

#### 1. Build the Application First

```bash
# Navigate to the project directory
cd examples/spring-boot-skeleton

# Build the JAR file using Maven wrapper
./mvnw clean package
```

#### 2. Build and Run with Docker Compose

```bash
# Build and start the container
docker-compose up --build

# Or run in detached mode
docker-compose up -d
```

The application will start at `http://localhost:8080`

#### 3. Stop the Container

```bash
docker-compose down
```

## Project Structure

```
spring-boot-skeleton/
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
│   │       └── application.yml         # Application configuration
│   └── test/
│       └── java/
│           └── com/
│               └── example/
│                   └── skeleton/
│                       └── SkeletonApplicationTests.java  # Basic test
├── .gitignore                          # Git ignore rules
├── docker-compose.yml                  # Docker Compose configuration
├── Dockerfile                          # Docker image definition
├── mvnw                                # Maven wrapper script (Unix/Linux)
├── mvnw.cmd                            # Maven wrapper script (Windows)
├── pom.xml                             # Maven project configuration
└── README.md                           # This file
```

## Adding New Endpoints

This skeleton application is ready for you to add REST endpoints. Use GitHub Copilot or other AI-assisted tools to:

1. Create new `@RestController` classes in `src/main/java/com/example/skeleton/controller/`
2. Add new services in `src/main/java/com/example/skeleton/service/`
3. Create data models in `src/main/java/com/example/skeleton/model/`
4. Implement repositories if using databases

### Example: Adding a Simple REST Controller

Create a new file `src/main/java/com/example/skeleton/controller/ItemController.java`:

```java
package com.example.skeleton.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    @GetMapping
    public List<String> getItems() {
        return List.of("item1", "item2", "item3");
    }

    @PostMapping
    public String createItem(@RequestBody String item) {
        return "Item created: " + item;
    }
}
```

## Verifying the Application

Once the application is running, test the health check endpoint:

```bash
curl http://localhost:8080/actuator/health
```

Expected response:
```json
{
  "status": "UP"
}
```

## Development Tips

- **Maven Wrapper**: The `mvnw` script automatically downloads the correct Maven version, so you don't need Maven installed
- **Hot Reload**: Use Spring Boot DevTools (add to pom.xml) for automatic restart during development
- **Actuator Endpoints**: Customize exposed endpoints in `application.yml` under `management.endpoints.web.exposure.include`
- **Application Properties**: Use `application.yml` or `application.properties` for configuration
- **Testing**: Run tests with `./mvnw test`
- **Packaging**: Create JAR with `./mvnw clean package`

## Running Tests

```bash
# Run all tests
./mvnw test

# Run tests with detailed output
./mvnw test -X
```

## Next Steps

1. Create REST controllers for your API endpoints
2. Define data models (DTOs/Entities)
3. Implement service layer for business logic
4. Add database integration (Spring Data JPA)
5. Configure security (Spring Security)
6. Add validation annotations (@Valid, @NotNull, etc.)
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

# Run the application
./mvnw spring-boot:run

# Generate project information
./mvnw dependency:tree
```

## Troubleshooting

### Port Already in Use

If port 8080 is already in use, change it in `src/main/resources/application.yml`:

```yaml
server:
  port: 8081
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
