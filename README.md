# AI-Assisted Coding Workshop (Fork)

> **This is a forked version** of the original [AI-Assisted Coding Workshop](https://github.com/cse-cst/ai-workshop) repository maintained by CSE-CST.

This repository is a workspace for practicing AI-assisted software development with GitHub Copilot. It is organized to help workshop participants explore requirements, start from templates when needed, inspect reference implementations, and build a working delivery workflow around prompting, implementation, testing, and review.

## What's Different in This Fork

This fork adds the **[Easy Tools Suite](examples/easy-tools-suite/)** — a full-stack productivity web app with 10 tools, built and maintained **entirely through GitHub Copilot Agent Mode** (no manual coding). It serves as a practical demonstration of AI-driven development efficiency on a real codebase.

### Added by this fork:
- [`examples/easy-tools-suite/`](examples/easy-tools-suite/) — 10-in-1 productivity app (Flask + SQLite + vanilla JS)
- 55+ REST API endpoints, 16 database tables, ~5,000 lines of code
- In-app architecture documentation with Mermaid diagrams
- Dashboard, command palette, guided tour, global search
- Full [ARCHITECTURE.md](examples/easy-tools-suite/ARCHITECTURE.md) and [USER_STORY_COVERAGE.md](examples/easy-tools-suite/USER_STORY_COVERAGE.md) documentation

### Quick Launch — Easy Tools Suite

```bash
cd examples/easy-tools-suite

# Option A: Docker
docker compose up --build

# Option B: Local Python
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Open **http://localhost:5005** in your browser.

See the full [Easy Tools Suite README](examples/easy-tools-suite/README.md) for details.

## Repository Guide

| Area | Purpose |
| --- | --- |
| [requirements](requirements/README.md) | Project briefs and acceptance criteria used to choose and scope a workshop exercise. |
| [skeletons](skeletons/README.md) | Starter templates in a range of languages and frameworks to help participants get moving quickly. |
| [examples](examples/) | Reference implementations that can be studied while learning how to work with AI-assisted coding tools. |

## Workshop Goals

- Explore how GitHub Copilot fits into day-to-day software development.
- Build iteratively with AI assistance while keeping engineering judgment in the loop.
- Test, review, and refine generated code instead of treating it as final by default.
- Practice better prompting, context sharing, and task decomposition.
- Use AI tools across the full workflow, from exploration through implementation and verification.

## GitHub Copilot Documentation

Use the links below as a practical table of contents for learning GitHub Copilot during the workshop.

### Start Here

- [GitHub Copilot documentation](https://docs.github.com/en/copilot)
- [What is GitHub Copilot?](https://docs.github.com/en/copilot/get-started/what-is-github-copilot)
- [Quickstart for GitHub Copilot](https://docs.github.com/en/copilot/get-started/quickstart)
- [GitHub Copilot features](https://docs.github.com/en/copilot/get-started/features)
- [Best practices for using GitHub Copilot](https://docs.github.com/en/copilot/get-started/best-practices)

### Core Concepts

- [Concepts for GitHub Copilot](https://docs.github.com/en/copilot/concepts)
- [Completions for GitHub Copilot](https://docs.github.com/en/copilot/concepts/completions)
- [About GitHub Copilot Chat](https://docs.github.com/en/copilot/concepts/chat)
- [Concepts for prompting GitHub Copilot](https://docs.github.com/en/copilot/concepts/prompting)
- [Concepts for providing context to GitHub Copilot](https://docs.github.com/en/copilot/concepts/context)

### Everyday Usage

- [How-tos for GitHub Copilot](https://docs.github.com/en/copilot/how-tos)
- [Setting up GitHub Copilot](https://docs.github.com/en/copilot/how-tos/set-up)
- [Get suggestions from GitHub Copilot](https://docs.github.com/en/copilot/how-tos/get-code-suggestions)
- [GitHub Copilot Chat](https://docs.github.com/en/copilot/how-tos/chat-with-copilot)
- [Use GitHub Copilot for common tasks](https://docs.github.com/en/copilot/how-tos/use-copilot-for-common-tasks)

### Better Context And Guidance

- [Provide context to GitHub Copilot](https://docs.github.com/en/copilot/how-tos/provide-context)
- [Configure custom instructions for GitHub Copilot](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions)
- [About Model Context Protocol (MCP)](https://docs.github.com/en/copilot/concepts/context/mcp)
- [About GitHub Copilot Spaces](https://docs.github.com/en/copilot/concepts/context/spaces)

### Agents, Review, And Advanced Workflows

- [Use GitHub Copilot agents](https://docs.github.com/en/copilot/how-tos/use-copilot-agents)
- [GitHub Copilot coding agent](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent)
- [Code review](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/request-a-code-review)
- [Concepts for GitHub Copilot agents](https://docs.github.com/en/copilot/concepts/agents)
- [About agentic memory for GitHub Copilot](https://docs.github.com/en/copilot/concepts/agents/copilot-memory)

### CLI, Models, And Tooling

- [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli)
- [GitHub Copilot SDK](https://docs.github.com/en/copilot/how-tos/copilot-sdk)
- [AI models for GitHub Copilot](https://docs.github.com/en/copilot/how-tos/use-ai-models)
- [Choosing the right AI tool for your task](https://docs.github.com/en/copilot/concepts/tools/ai-tools)
- [About Copilot integrations](https://docs.github.com/en/copilot/concepts/tools/about-copilot-integrations)

### Troubleshooting And Administration

- [Troubleshoot GitHub Copilot](https://docs.github.com/en/copilot/how-tos/troubleshoot-copilot)
- [Manage your GitHub Copilot account](https://docs.github.com/en/copilot/how-tos/manage-your-account)
- [Administer GitHub Copilot for your team](https://docs.github.com/en/copilot/how-tos/administer-copilot)
- [GitHub Copilot billing](https://docs.github.com/en/copilot/concepts/billing)
- [Network settings for GitHub Copilot](https://docs.github.com/en/copilot/concepts/network-settings)
