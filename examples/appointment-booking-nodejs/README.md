# Appointment Booking System

## Prerequisites

- Node.js 20+
- Docker and Docker Compose

## Run

```bash
cd examples/appointment-booking-nodejs
make up
```

Wait ~30-60 seconds for all services to start, then open http://localhost:4200.

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
