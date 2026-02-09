# AI-Powered Development Workshop

## Overview

This repository contains everything you need for the AI-Powered Development Workshop - a hands-on learning experience focused on building production-ready applications using AI-assisted development tools like GitHub Copilot. The workshop challenges you to create complete applications from scratch while maintaining professional standards for code quality, security, and best practices.

## Repository Structure

```
ai-workshop/
├── requirements/       # Project specifications organized by difficulty
│   ├── 00 - easy/     # 5 beginner-friendly projects
│   ├── 01 - medium/   # 6 intermediate projects
│   └── 02 - hard/     # 7 advanced enterprise projects
│
├── skeletons/         # Project starter templates (optional reference)
│   ├── react-skeleton/
│   ├── angular-skeleton/
│   ├── fastapi-skeleton/
│   └── spring-boot-skeleton/
│
├── examples/          # Sample implementations and reference code
│   └── todo-app-python/
│
└── .github/           # CI/CD workflows and automation
```

### 📋 Requirements Folder

Contains detailed requirement documents for 18 different projects across three difficulty levels. Each requirement includes comprehensive user stories, acceptance criteria, system constraints, and technical specifications.

- **🟢 Easy (5 projects)**: Simple applications like Todo Lists, Temperature Converters, Password Checkers
- **🟡 Medium (6 projects)**: Multi-feature apps like Inventory Management, URL Shorteners, Booking Systems
- **🔴 Hard (7 projects)**: Enterprise applications like E-commerce Platforms, LMS, Healthcare EHR

**[View all available projects →](requirements/README.md)**

### 🏗️ Skeletons Folder

Optional project starter templates demonstrating proper structure and containerization for popular frameworks. These are reference implementations showing best practices - participants should build from scratch but can reference these for guidance on:

- Project structure and organization
- Docker and docker-compose configuration
- Environment variable setup
- Development workflow setup

**Available skeletons**: React, Angular, FastAPI, Spring Boot

### 💡 Examples Folder

Sample implementations showcasing complete applications with all workshop requirements met. Use these as references for:

- How to meet acceptance criteria
- Testing strategies and coverage
- Security implementation patterns
- Documentation standards
- Containerization approaches

### ⚙️ .github Folder

GitHub Actions workflows and automation configurations for CI/CD pipelines, automated testing, and deployment processes.

---

## Workshop Goals

- **Master AI-Assisted Development**: Effectively use GitHub Copilot and AI tools to accelerate development
- **Build Production-Ready Applications**: Create fully functional applications meeting professional standards
- **Implement Best Practices**: Apply security, testing, containerization, and deployment best practices
- **Develop From Scratch**: Build from the ground up - no templates, no shortcuts
- **Demonstrate Containerization**: Package applications as Docker containers with proper orchestration

## Pre-requisites

### Development Environment
- **Developer laptop** with WSL (Windows Subsystem for Linux) installed
- **Node.js and NPM** (for JavaScript/TypeScript projects)
- **Python 3.x** (for Python projects)
- **JDK** (Java Development Kit for Java projects)
- **Docker** and Docker Compose
- **Visual Studio Code** with recommended extensions
- **Git** - commit early and often!

### Access Requirements
- **GitHub account** with access to the cse-cst project
- **GitHub Copilot Business Seat** through cse-cst organization

## Technology Stack

You have **complete freedom** to choose your technology stack:

- **Languages**: JavaScript/TypeScript, Python, Java, Go, or any language you prefer
- **Frameworks**: React, Vue, Angular, Express, Flask, Django, Spring Boot, .NET, etc.
- **Databases**: PostgreSQL, MySQL, MongoDB, Redis, etc.
- **Additional tools**: Any libraries, frameworks, or tools that help you succeed

## Getting Started

1. **Explore the Repository**: Browse the requirements folder to see all available projects
2. **Choose Your Project**: Select one project that matches your skill level and interests
3. **Review Requirements**: Read the detailed requirement document thoroughly
4. **Reference Resources**: Check skeletons and examples for guidance on structure and best practices
5. **Set Up Environment**: Configure your development environment and tools
6. **Build with AI**: Use GitHub Copilot to accelerate development while maintaining quality
7. **Test Thoroughly**: Implement all required tests from acceptance criteria
8. **Containerize**: Package your application in Docker containers
9. **Document**: Create clear documentation for setup and usage
10. **Demo**: Present your working application

## Universal Success Criteria

Every project must meet these mandatory criteria:

### ✅ Functional Requirements
- All acceptance criteria met
- Complete end-to-end functionality
- No missing features

### ✅ Containerization
- All components packaged as Docker containers
- `docker-compose.yml` for single-command deployment
- Proper environment variables and networking

### ✅ Quality Standards
- Unit tests, integration tests per acceptance criteria
- Input validation and security (SQL injection, XSS prevention)
- Graceful error handling
- Clean, maintainable code

### ✅ Documentation
- README with setup and run instructions
- API documentation (if applicable)
- Database schema documentation (if applicable)

## Tips for Success

### Leverage AI Effectively
- Write clear, descriptive comments to guide Copilot
- Break down complex tasks into smaller, manageable pieces
- Review and understand AI-generated code
- Use Copilot for boilerplate, tests, and documentation

### Focus on Quality
- Don't skip testing - it's mandatory in acceptance criteria
- Implement security best practices from the start
- Handle errors gracefully throughout
- Write clean, maintainable code

### Containerization Best Practices
- Use multi-stage builds to minimize image size
- Set appropriate environment variables
- Use volumes for persistent data
- Document port mappings and networking

### Plan Your Work
- Start with core functionality
- Implement user stories in priority order
- Test incrementally as you build
- Allow adequate time for containerization and documentation

## Important Notes

⚠️ **Build Everything From Scratch**: No templates or starter kits allowed. This is an exercise in building complete applications with AI assistance. The skeletons folder is for reference only.

⚠️ **All Acceptance Criteria Are Mandatory**: Every checkbox in your chosen requirement must be satisfied. Don't skip security, testing, or logging requirements.

⚠️ **Containerization Is Required**: Your application must run via `docker-compose up` with no additional setup steps.

⚠️ **Test Coverage Matters**: Most projects require minimum test coverage percentages and specific test types.

---

## Support and Resources

- **[Requirements Documentation](requirements/README.md)**: Detailed specifications for all projects
- **[Skeleton Templates](skeletons/README.md)**: Reference implementations for common frameworks
- **Example Implementations**: Complete sample applications in the examples folder
- **GitHub Copilot**: Your primary development assistant
- **Peers**: Collaborate and share knowledge with other participants
- **Official Documentation**: Leverage docs for your chosen technologies

---

Good luck, and happy building! Remember, the goal is not just to complete a project, but to demonstrate mastery of AI-assisted development while maintaining professional standards.
