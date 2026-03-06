# Application Skeletons

This directory contains minimal skeleton applications for various frameworks and technologies. Each skeleton provides a clean starting point for building applications.

## Common Features

All skeletons include:

- **Makefile** - Standard build targets for applications
- **Docker & Docker Compose** - Ready for containerized deployment (although you might have to fight with CA certificates)
- **Development Hot-Reload** - Changes reflect immediately during development
- **Clean Structure** - Organized file structure following framework best practices

## Local Development

```
cd <backend|frontend>/<framework-skeleton>
make dev
```