.PHONY: help build test dev clean lint format run check

# Default target
.DEFAULT_GOAL := help

# Rust configuration
CARGO := cargo
BINARY := rust-skeleton

# Colors for output
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

##@ General

help: ## Display this help message
	@echo "$(CYAN)Rust Skeleton - Available targets:$(NC)"
	@awk 'BEGIN {FS = ":.*##"; printf "\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(CYAN)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Development

dev: ## Run development server with auto-rebuild (port 8080)
	@echo "$(GREEN)Starting Rust development server...$(NC)"
	RUST_LOG=info $(CARGO) run

build: ## Compile the application in release mode
	@echo "$(GREEN)Building Rust application...$(NC)"
	$(CARGO) build --release
	@echo "$(GREEN)✓ Build complete! Binary: target/release/$(BINARY)$(NC)"

test: ## Run tests
	@echo "$(GREEN)Running Rust tests...$(NC)"
	$(CARGO) test
	@echo "$(GREEN)✓ Tests complete$(NC)"

run: build ## Build and run the release binary
	@echo "$(GREEN)Running Rust application...$(NC)"
	RUST_LOG=info ./target/release/$(BINARY)

##@ Utilities

check: ## Run cargo check (fast compile check without producing binary)
	@echo "$(GREEN)Checking Rust code...$(NC)"
	$(CARGO) check
	@echo "$(GREEN)✓ Check passed$(NC)"

clean: ## Remove build artifacts
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	$(CARGO) clean
	@echo "$(GREEN)✓ Clean complete$(NC)"

lint: ## Run Clippy linter for static analysis
	@echo "$(GREEN)Running Clippy...$(NC)"
	$(CARGO) clippy -- -D warnings
	@echo "$(GREEN)✓ Clippy passed$(NC)"

format: ## Format Rust source code
	@echo "$(GREEN)Formatting Rust code...$(NC)"
	$(CARGO) fmt
	@echo "$(GREEN)✓ Formatting complete$(NC)"

format-check: ## Check formatting without modifying files
	@echo "$(GREEN)Checking Rust formatting...$(NC)"
	$(CARGO) fmt -- --check
	@echo "$(GREEN)✓ Formatting check passed$(NC)"
