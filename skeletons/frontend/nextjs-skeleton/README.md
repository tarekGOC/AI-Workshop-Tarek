# Next.js Skeleton

A minimal, ready-to-run Next.js application skeleton with TypeScript, App Router, and Docker support.

## Features

- **Next.js 15** with App Router and Turbopack for fast development
- **TypeScript** for type-safe development
- **React 19** with Server and Client Components
- **CSS Modules** for scoped component styling
- **Dark mode** support via `prefers-color-scheme`
- **Interactive click counter** demonstrating React hooks
- **ESLint** configured with Next.js recommended rules
- **Docker** support for containerized development
- **Fast Refresh** for instant feedback during development

## Prerequisites

- **Node.js** >= 22.x (LTS recommended)
- **npm** >= 10.x
- **Docker** and **Docker Compose** (optional, for containerized development)

## Quick Start

### Local Development

1. Install dependencies:
   ```bash
   make install
   ```
2. Start the development server:
   ```bash
   make dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker

1. Build and start the container:
   ```bash
   docker compose up --build
   ```
2. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
nextjs-skeleton/
├── Dockerfile              # Container image definition
├── Makefile                # Development commands
├── README.md               # This file
├── docker-compose.yml      # Docker Compose configuration
├── eslint.config.mjs       # ESLint configuration
├── next.config.ts          # Next.js configuration
├── package.json            # Dependencies and scripts
├── public/                 # Static assets (served at /)
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout (HTML shell)
│   │   ├── page.tsx        # Home page
│   │   └── page.module.css # Home page styles
│   ├── components/
│   │   ├── Welcome.tsx     # Interactive Welcome component
│   │   └── Welcome.module.css
│   └── styles/
│       └── globals.css     # Global styles and CSS variables
└── tsconfig.json           # TypeScript configuration
```

## Adding New Pages & Components

### Pages (App Router)

Create a new directory under `src/app/` with a `page.tsx` file:

```
src/app/about/page.tsx    → /about
src/app/blog/page.tsx     → /blog
src/app/blog/[slug]/page.tsx → /blog/:slug
```

### API Routes

Create route handlers under `src/app/api/`:

```typescript
// src/app/api/hello/route.ts
export async function GET() {
  return Response.json({ message: "Hello from Next.js!" });
}
```

### Components

Add new components in `src/components/`. Use `"use client"` directive for interactive components that need browser APIs or React hooks.

## Development Tips

- **Fast Refresh** is enabled by default — edits to components are reflected instantly without losing state.
- **Turbopack** is used in dev mode for faster bundling.
- Use `make lint` to check for code issues.
- Use `make build` to create a production-optimized build.
- Server Components (default) run on the server — add `"use client"` only when you need interactivity.
