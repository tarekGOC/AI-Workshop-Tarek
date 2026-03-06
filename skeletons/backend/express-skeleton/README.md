# Express Skeleton

## Use Make

Build the application:

```bash
make build
```

Run the development server:

```bash
make dev
```

The server listens on `http://localhost:3000`.

## Native Build

```bash
npm install
npm run build
```

## Verify

```bash
curl http://localhost:3000/health
```

Expect an HTTP 200 response with a JSON body containing a healthy status.
