# Micronaut Skeleton

Requires Java 21 and Maven.

## Use Make

Build the application:

```bash
make build
```

Run the development server:

```bash
make dev
```

The server listens on `http://localhost:8080`.

## Native Build

```bash
mvn clean package -DskipTests
```

## Verify

```bash
curl http://localhost:8080/health
```

Expect an HTTP 200 response from the Micronaut health endpoint.
