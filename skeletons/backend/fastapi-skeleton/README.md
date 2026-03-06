# FastAPI Skeleton

## Use Make

Build the application:

```bash
make build
```

Run the development server:

```bash
make dev
```

The server listens on `http://localhost:8000`.

## Native Build

```bash
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
./venv/bin/python -m py_compile app/main.py app/__init__.py
```

## Verify

```bash
curl http://localhost:8000/health
```

Expect an HTTP 200 response with a JSON body containing a healthy status.
