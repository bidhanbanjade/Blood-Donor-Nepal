PROJECT_ROOT := .
BACKEND_DIR := backend
FRONTEND_DIR := frontend
DB_CONTAINER := blood-nepal-postgres
DB_IMAGE := postgres:16
DB_PORT := 5432
DB_PASSWORD := postgres123
DB_NAME := blood_donation_nepal
DB_USER := postgres

.PHONY: help install db-up db-init bootstrap-admin seed setup backend frontend dev check

help:
	@echo Available targets:
	@echo   make install          - Install backend and frontend dependencies
	@echo   make db-up            - Start PostgreSQL Docker container (or create if missing)
	@echo   make db-init          - Apply SQL migrations (001 and 002)
	@echo   make bootstrap-admin  - Create or update admin user
	@echo   make seed             - Seed demo data
	@echo   make setup            - Full one-time setup (install + db + migrations + admin + seed)
	@echo   make backend          - Run backend dev server
	@echo   make frontend         - Run frontend dev server
	@echo   make dev              - Start backend and frontend in new terminal windows
	@echo   make check            - Run backend tests and frontend build

install:
	npm --prefix $(BACKEND_DIR) install
	npm --prefix $(FRONTEND_DIR) install

db-up:
	@docker inspect $(DB_CONTAINER) >NUL 2>&1 && (docker start $(DB_CONTAINER) >NUL && echo Started existing DB container: $(DB_CONTAINER)) || (docker run -d --name $(DB_CONTAINER) -e POSTGRES_PASSWORD=$(DB_PASSWORD) -e POSTGRES_DB=$(DB_NAME) -p $(DB_PORT):5432 $(DB_IMAGE) >NUL && echo Created DB container: $(DB_CONTAINER))

db-init:
	docker exec -i $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) < database/migrations/001_initial_schema.sql
	docker exec -i $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) < database/migrations/002_donation_feedback.sql

bootstrap-admin:
	npm --prefix $(BACKEND_DIR) run bootstrap:admin -- --email admin@example.com --password Password123 --name "Platform Admin"

seed:
	npm --prefix $(BACKEND_DIR) run seed

setup: install db-up db-init bootstrap-admin seed

backend:
	npm --prefix $(BACKEND_DIR) run dev

frontend:
	npm --prefix $(FRONTEND_DIR) run dev

dev:
	@echo Starting backend and frontend in separate terminal windows...
	@start "BIDHAN Backend" cmd /k "npm --prefix $(BACKEND_DIR) run dev"
	@start "BIDHAN Frontend" cmd /k "npm --prefix $(FRONTEND_DIR) run dev"

check:
	npm --prefix $(BACKEND_DIR) test -- --runInBand
	npm --prefix $(FRONTEND_DIR) run build
