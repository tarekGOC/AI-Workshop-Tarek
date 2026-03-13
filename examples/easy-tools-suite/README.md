# 🧰 Easy Tools Suite

A full-stack productivity web app bundling **10 everyday tools** into a single, unified interface — built with Flask, SQLite, and vanilla JavaScript.

> **Part of a forked version** of the [AI Workshop](https://github.com/sdoakey/ai-workshop) repository. Built and maintained **100% with AI assistance** using GitHub Copilot (Agent Mode, Claude Sonnet 4.6) to demonstrate AI-driven development efficiency on an existing codebase.

---

## 🖥️ Live Preview

![Easy Tools Suite](https://img.shields.io/badge/Flask-3.1.0-blue) ![Python](https://img.shields.io/badge/Python-3.12-green) ![SQLite](https://img.shields.io/badge/SQLite-WAL-orange) ![Docker](https://img.shields.io/badge/Docker-Ready-blue)

---

## 🛠️ The 10 Tools

| # | Tool | Description |
|---|------|-------------|
| 1 | **Todo List** | Create, edit, complete, delete, search, filter, and paginate tasks |
| 2 | **Temperature Converter** | Convert between Celsius, Fahrenheit, and Kelvin with history |
| 3 | **Password Strength Checker** | Real-time scoring, criteria checks, and recommendations |
| 4 | **Expense Tracker** | Track spending by category, monthly summaries, CSV export |
| 5 | **Quote of the Day** | Daily quotes with favorites, search, and date browsing |
| 6 | **Contact Book** | Full CRUD contacts with groups, search, and import/export |
| 7 | **Markdown Notes** | Rich editor with live preview, tags, and pinning |
| 8 | **Habit Tracker** | Daily habit tracking with streaks and calendar view |
| 9 | **Unit Converter** | Length, weight, volume, speed, and data unit conversions |
| 10 | **Flashcard Study** | Spaced-repetition study with decks, ratings, and progress |

---

## ✨ Extra Features

- **Dashboard** — Overview cards with stats across all tools
- **Command Palette** — `Ctrl+K` to quickly jump to any tool or action
- **Guided Tour** — Interactive walkthrough of all 10 tools
- **Global Search** — Search across todos, notes, contacts, and more
- **Templates** — Pre-filled sample data to get started instantly
- **In-App Architecture Docs** — Full technical documentation rendered inside the app
- **Dark Glassmorphism UI** — Polished dark theme with indigo accents

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Flask 3.1.0 (Python 3.12) |
| **Database** | SQLite with WAL mode, 16 tables |
| **Frontend** | Vanilla JavaScript SPA (~1,845 lines) |
| **Styling** | Custom CSS (~1,300 lines), glassmorphism dark theme |
| **Fonts** | Space Grotesk, JetBrains Mono (Google Fonts) |
| **Containerization** | Docker (python:3.12-slim) |

---

## 🚀 Getting Started

### Option 1: Docker (Recommended)

```bash
docker compose up --build
```

The app will be available at **http://localhost:5005**

### Option 2: Local Python

```bash
# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the app
python app.py
```

The app will be available at **http://localhost:5005**

### Option 3: Make

```bash
make build   # Build Docker image
make run     # Start the app
make stop    # Stop the app
make clean   # Remove containers and volumes
```

---

## 📁 Project Structure

```
easy-tools-suite/
├── app.py                  # Flask backend — all routes, DB, business logic (~1,850 lines)
├── ARCHITECTURE.md         # Full technical architecture deep-dive (1,067 lines)
├── USER_STORY_COVERAGE.md  # Maps each tool to its user stories and APIs
├── requirements.txt        # Python dependencies
├── Dockerfile              # Docker container definition
├── docker-compose.yml      # Docker Compose config with named volume
├── Makefile                # Build/run/stop shortcuts
├── templates/
│   └── index.html          # SPA shell — sidebar nav, mount points, modals
├── static/
│   ├── js/
│   │   └── app.js          # Full SPA frontend (~1,845 lines)
│   └── css/
│       └── style.css       # Design system (~1,300 lines)
└── instance/
    └── toolsuite.db        # SQLite database (auto-created at runtime)
```

---

## 📊 By the Numbers

- **55+ REST API endpoints**
- **16 database tables**
- **10 productivity tools**
- **~5,000 lines of code** across backend, frontend, and styles
- **1,067 lines** of architecture documentation
- **13-step guided tour**

---

## 🤖 AI-Driven Development

This project was maintained and extended **entirely through GitHub Copilot Agent Mode** in a single session. Tasks completed by AI:

- Git setup, `.gitignore`, commits, and pushes
- Architecture documentation generation (1,067 lines with Mermaid diagrams)
- New feature: in-app architecture page with TOC and scroll spy
- Bug fixes: JS crashes, CSS overflow, stale UI state
- Full audit of all 10 tools with targeted fixes
- Guided tour expansion to cover all tools

**No code was written manually.** Every change — from reading files to editing code to running terminal commands — was executed by Copilot through natural language prompts.

---

## 📝 Documentation

- [**ARCHITECTURE.md**](ARCHITECTURE.md) — Full technical deep-dive: stack diagrams, database ER diagram, API surface, request lifecycle, security model, deployment guide
- [**USER_STORY_COVERAGE.md**](USER_STORY_COVERAGE.md) — Maps each of the 10 tools to their implemented user stories and API endpoints

---

## 📜 License

This project was created as part of an AI Workshop demonstrating AI-assisted development workflows.
