.PHONY: help build test dev clean install package run

# Default target
.DEFAULT_GOAL := help

# Maven configuration
MVN := mvn
JAVA_VERSION := 21

# Colors for output
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

##@ General

help: ## Display this help message
	@echo "$(CYAN)Quarkus Skeleton - Available targets:$(NC)"
	@awk 'BEGIN {FS = ":.*##"; printf "\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(CYAN)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Development

dev: ## Run application in Quarkus dev mode with live reload (port 8080)
	@echo "$(GREEN)Starting Quarkus development server...$(NC)"
	$(MVN) quarkus:dev

build: ## Compile and package the application
	@echo "$(GREEN)Building Quarkus application...$(NC)"
	$(MVN) clean package -DskipTests
	@echo "$(GREEN)✓ Build complete! JAR in target/$(NC)"

test: ## Run unit tests with JUnit
	@echo "$(GREEN)Running Quarkus tests...$(NC)"
	$(MVN) test
	@echo "$(GREEN)✓ Tests complete$(NC)"

##@ Utilities

install: ## Download dependencies and resolve them locally
	@echo "$(GREEN)Installing Maven dependencies...$(NC)"
	$(MVN) dependency:resolve
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

clean: ## Remove build artifacts
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	$(MVN) clean
	@echo "$(GREEN)✓ Clean complete$(NC)"

package: test ## Run tests and create executable JAR
	@echo "$(GREEN)Packaging application with tests...$(NC)"
	$(MVN) clean package
	@echo "$(GREEN)✓ Package complete! JAR in target/$(NC)"

run: build ## Build and run the packaged application
	@echo "$(GREEN)Running packaged application...$(NC)"
	@java -jar target/quarkus-app/quarkus-run.jar

verify: ## Run full verification (compile, test, integration-test)
	@echo "$(GREEN)Running full Maven verification...$(NC)"
	$(MVN) verify

check-java: ## Verify Java version
	@echo "$(CYAN)Checking Java installation...$(NC)"
	@java -version
	@echo "$(YELLOW)Required: Java $(JAVA_VERSION) or higher$(NC)"
