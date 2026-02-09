# Appointment Booking System

## Prerequisites

- Node.js 20+
- Docker and Docker Compose

## Run with Docker

```bash
cd examples/appointment-booking-nodejs
make up
```

Wait ~30-60 seconds for all services to start, then open http://localhost:4200.

## Run Locally (with live reload)

```bash
cd examples/appointment-booking-nodejs
make dev
```

This starts Postgres and Keycloak in Docker, then runs the API and Angular frontend locally with live reload. Press `Ctrl+C` to stop. To stop the infrastructure containers afterwards:

```bash
make dev-down
```

## Test Users

| Username   | Password | Role     |
|------------|----------|----------|
| provider1  | password | Provider |
| provider2  | password | Provider |
| customer1  | password | Customer |
| customer2  | password | Customer |

## Stop

```bash
make down
```
