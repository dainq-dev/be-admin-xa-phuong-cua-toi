.PHONY: help install dev build clean test docker-up docker-down prisma-migrate prisma-studio prisma-seed

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

## help: Show this help message
help:
	@echo "$(BLUE)Phường Xã Của Tôi - Monorepo Commands$(NC)"
	@echo ""
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/^## /  /' | column -t -s ':'
	@echo ""

## install: Install all dependencies
install:
	@echo "$(BLUE)Installing dependencies...$(NC)"
	bun install
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

## dev: Start all services in development mode
dev:
	@echo "$(BLUE)Starting development servers...$(NC)"
	bun run dev

## dev-backend: Start backend only
dev-backend:
	@echo "$(BLUE)Starting backend server...$(NC)"
	bun run dev:backend

## dev-admin: Start admin frontend only
dev-admin:
	@echo "$(BLUE)Starting admin frontend...$(NC)"
	bun run dev:admin

## build: Build all packages
build:
	@echo "$(BLUE)Building all packages...$(NC)"
	bun run build
	@echo "$(GREEN)✓ Build complete$(NC)"

## clean: Clean all build artifacts and dependencies
clean:
	@echo "$(YELLOW)Cleaning...$(NC)"
	bun run clean
	@echo "$(GREEN)✓ Clean complete$(NC)"

## test: Run all tests
test:
	@echo "$(BLUE)Running tests...$(NC)"
	bun test

## test-backend: Run backend tests
test-backend:
	@echo "$(BLUE)Running backend tests...$(NC)"
	bun run test:backend

## lint: Lint all packages
lint:
	@echo "$(BLUE)Linting...$(NC)"
	bun run lint

## format: Format all code
format:
	@echo "$(BLUE)Formatting code...$(NC)"
	bun run format
	@echo "$(GREEN)✓ Code formatted$(NC)"

## type-check: Type check all packages
type-check:
	@echo "$(BLUE)Type checking...$(NC)"
	bun run type-check

## docker-up: Start Docker services (PostgreSQL, Redis)
docker-up:
	@echo "$(BLUE)Starting Docker services...$(NC)"
	docker compose up -d
	@echo "$(GREEN)✓ Docker services started$(NC)"

## docker-down: Stop Docker services
docker-down:
	@echo "$(YELLOW)Stopping Docker services...$(NC)"
	docker compose down
	@echo "$(GREEN)✓ Docker services stopped$(NC)"

## docker-logs: View Docker logs
docker-logs:
	docker compose logs -f

## prisma-generate: Generate Prisma client
prisma-generate:
	@echo "$(BLUE)Generating Prisma client...$(NC)"
	bun run prisma:generate
	@echo "$(GREEN)✓ Prisma client generated$(NC)"

## prisma-migrate: Run Prisma migrations
prisma-migrate:
	@echo "$(BLUE)Running Prisma migrations...$(NC)"
	bun run prisma:migrate
	@echo "$(GREEN)✓ Migrations complete$(NC)"

## prisma-studio: Open Prisma Studio
prisma-studio:
	@echo "$(BLUE)Opening Prisma Studio...$(NC)"
	bun run prisma:studio

## prisma-seed: Seed database
prisma-seed:
	@echo "$(BLUE)Seeding database...$(NC)"
	bun run prisma:seed
	@echo "$(GREEN)✓ Database seeded$(NC)"

## setup: Initial setup (install + docker + migrate + seed)
setup: install docker-up
	@echo "$(BLUE)Waiting for database to be ready...$(NC)"
	@sleep 5
	@$(MAKE) prisma-generate
	@$(MAKE) prisma-migrate
	@$(MAKE) prisma-seed
	@echo "$(GREEN)✓ Setup complete! Run 'make dev' to start$(NC)"

## db-reset: Reset database (WARNING: deletes all data)
db-reset:
	@echo "$(RED)⚠️  This will delete all data. Continue? [y/N] $(NC)" && read ans && [ $${ans:-N} = y ]
	cd packages/backend && bunx prisma migrate reset --force
	@echo "$(GREEN)✓ Database reset$(NC)"
