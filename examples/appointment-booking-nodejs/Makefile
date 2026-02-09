.PHONY: help build dev dev-down dev-api dev-frontend clean install install-api install-frontend build-frontend up down restart logs status

# Default target
.DEFAULT_GOAL := help

# Colors for output
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

##@ General

help: ## Display this help message
	@echo "$(CYAN)Appointment Booking System - Available targets:$(NC)"
	@awk 'BEGIN {FS = ":.*##"; printf "\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(CYAN)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Setup & Build (run locally, artifacts go into Docker)

install: install-api install-frontend ## Install all dependencies locally

install-api: api/node_modules ## Install API dependencies

api/node_modules: api/package.json
	@echo "$(GREEN)Installing API dependencies...$(NC)"
	cd api && npm install
	@touch api/node_modules

install-frontend: frontend/node_modules ## Install frontend dependencies

frontend/node_modules: frontend/package.json
	@echo "$(GREEN)Installing frontend dependencies...$(NC)"
	cd frontend && npm install
	@touch frontend/node_modules

build-frontend: install-frontend ## Build Angular frontend for production
	@echo "$(GREEN)Building Angular frontend...$(NC)"
	cd frontend && npx ng build --configuration=production
	@echo "$(GREEN)✓ Frontend build complete! Output in frontend/dist/$(NC)"

build: install-api build-frontend ## Build everything locally then build Docker images
	@echo "$(GREEN)Building Docker images...$(NC)"
	docker-compose build
	@echo "$(GREEN)✓ All Docker images built$(NC)"

##@ Docker Compose

up: build ## Build and start all services
	@echo "$(GREEN)Starting all services...$(NC)"
	docker-compose up -d
	@echo ""
	@echo "$(GREEN)Services starting up:$(NC)"
	@echo "  Frontend:  $(CYAN)http://localhost:4200$(NC)"
	@echo "  API:       $(CYAN)http://localhost:3000/api$(NC)"
	@echo "  Keycloak:  $(CYAN)http://localhost:8080$(NC)"
	@echo ""
	@echo "$(YELLOW)Note: Keycloak takes ~30-60 seconds on first run$(NC)"

down: ## Stop all services
	@echo "$(YELLOW)Stopping all services...$(NC)"
	docker-compose down
	@echo "$(GREEN)✓ All services stopped$(NC)"

restart: down up ## Restart all services

logs: ## Follow logs from all services
	docker-compose logs -f

logs-api: ## Follow API logs only
	docker-compose logs -f api

logs-frontend: ## Follow frontend logs only
	docker-compose logs -f frontend

status: ## Show status of all services
	@docker-compose ps

##@ Development

dev: install ## Start infra containers + run API and frontend locally with live-reload
	@echo "$(GREEN)Starting Postgres and Keycloak containers...$(NC)"
	docker-compose up -d postgres keycloak
	@echo "$(YELLOW)Waiting for Postgres to be healthy...$(NC)"
	@until docker-compose exec -T postgres pg_isready -U appuser -d appointment_booking > /dev/null 2>&1; do sleep 1; done
	@echo "$(GREEN)✓ Postgres is ready$(NC)"
	@echo ""
	@echo "$(GREEN)Starting API and Frontend with live-reload...$(NC)"
	@echo "  Frontend:  $(CYAN)http://localhost:4200$(NC)"
	@echo "  API:       $(CYAN)http://localhost:3000/api$(NC)"
	@echo "  Keycloak:  $(CYAN)http://localhost:8080$(NC)"
	@echo ""
	@echo "$(YELLOW)Note: Keycloak takes ~30-60 seconds on first run$(NC)"
	@trap 'kill 0' EXIT; \
	  (cd api && DB_HOST=localhost DB_PORT=5432 DB_NAME=appointment_booking DB_USER=appuser DB_PASSWORD=apppass123 \
	    KEYCLOAK_URL=http://localhost:8080 KEYCLOAK_PUBLIC_URL=http://localhost:8080 \
	    KEYCLOAK_REALM=appointment-booking KEYCLOAK_CLIENT_ID=appointment-app \
	    node --watch server.js) & \
	  (cd frontend && npx ng serve --host 0.0.0.0 --port 4200) & \
	  wait

dev-api: install-api ## Run API locally (requires local Postgres)
	@echo "$(GREEN)Starting API in development mode...$(NC)"
	cd api && DB_HOST=localhost DB_PORT=5432 DB_NAME=appointment_booking DB_USER=appuser DB_PASSWORD=apppass123 \
	  KEYCLOAK_URL=http://localhost:8080 KEYCLOAK_PUBLIC_URL=http://localhost:8080 \
	  KEYCLOAK_REALM=appointment-booking KEYCLOAK_CLIENT_ID=appointment-app \
	  node --watch server.js

dev-frontend: install-frontend ## Run Angular dev server locally
	@echo "$(GREEN)Starting Angular dev server...$(NC)"
	cd frontend && npx ng serve --host 0.0.0.0 --port 4200

dev-down: ## Stop infra containers (Postgres + Keycloak)
	@echo "$(YELLOW)Stopping infra containers...$(NC)"
	docker-compose stop postgres keycloak
	@echo "$(GREEN)✓ Infra containers stopped$(NC)"

##@ Utilities

clean: ## Remove build artifacts and dependencies
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	rm -rf api/node_modules frontend/node_modules frontend/dist frontend/.angular
	@echo "$(GREEN)✓ Clean complete$(NC)"

clean-all: clean down ## Clean artifacts and stop/remove containers and volumes
	@echo "$(YELLOW)Removing Docker volumes...$(NC)"
	docker-compose down -v
	@echo "$(GREEN)✓ Full cleanup complete$(NC)"

rebuild: clean build ## Clean and rebuild everything from scratch
