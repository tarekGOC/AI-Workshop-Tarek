# Rust Skeleton

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
cargo build --release
```

## Verify

```bash
curl http://localhost:8080/health
```

Expect an HTTP 200 response with a JSON body containing a healthy status.
