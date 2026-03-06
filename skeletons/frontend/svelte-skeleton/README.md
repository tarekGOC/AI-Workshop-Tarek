# Svelte Skeleton

## Use Make

Build the application:

```bash
make build
```

Run the development server:

```bash
make dev
```

The app is served at `http://localhost:5173`.

## Native Build

```bash
npm install
npm run build
```

## Verify

This skeleton does not expose a dedicated health endpoint. Use the root URL as a smoke test:

```bash
curl -I http://localhost:5173/
```
