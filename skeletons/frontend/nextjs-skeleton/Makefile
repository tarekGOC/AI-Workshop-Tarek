.PHONY: help build test dev clean install lint format run

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
	@echo "$(CYAN)Next.js Skeleton - Available targets:$(NC)"
	@awk 'BEGIN {FS = ":.*##"; printf "\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(CYAN)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Development

dev: install ## Run development server with Fast Refresh (port 3000)
	@echo "$(GREEN)Starting Next.js development server...$(NC)"
	npm run dev

build: install lint ## Build production bundle
	@echo "$(GREEN)Building Next.js application...$(NC)"
	npm run build
	@echo "$(GREEN)✓ Build complete! Output in .next/$(NC)"

run: build ## Build and start production server
	@echo "$(GREEN)Starting Next.js production server...$(NC)"
	npm run start

test: install ## Run tests (note: no test framework configured yet)
	@echo "$(YELLOW)⚠ No test framework configured for this project$(NC)"
	@echo "$(YELLOW)To add tests, consider installing Jest or Vitest:$(NC)"
	@echo "  npm install -D vitest @testing-library/react @testing-library/jest-dom"
	@exit 1

lint: install ## Run ESLint and TypeScript type checking
	@echo "$(GREEN)Running Next.js lint...$(NC)"
	npm run lint

##@ Utilities

install: node_modules ## Install dependencies

node_modules: package.json package-lock.json
	@echo "$(GREEN)Installing npm dependencies...$(NC)"
	npm install
	@touch node_modules

clean: ## Remove build artifacts and dependencies
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	rm -rf .next node_modules out
	@echo "$(GREEN)✓ Clean complete$(NC)"
