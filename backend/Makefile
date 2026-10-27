.PHONY: install run run-asgi migrate makemigrations superuser shell test lint format up down worker

install:  ## Install all dependencies (including dev)
	uv sync

run:  ## Run development server (Channels-aware when USE_WEBSOCKETS=True)
	uv run python manage.py runserver

run-asgi:  ## Run Daphne ASGI server (HTTP + WebSockets)
	uv run daphne -b 0.0.0.0 -p 8000 config.asgi:application

migrate:  ## Apply database migrations
	uv run python manage.py migrate

makemigrations:  ## Create new migrations
	uv run python manage.py makemigrations

superuser:  ## Create a superuser
	uv run python manage.py createsuperuser

shell:  ## Open Django shell
	uv run python manage.py shell

test:  ## Run test suite with coverage
	uv run python -m pytest

lint:  ## Check code style (no changes)
	uv run ruff check .
	uv run ruff format --check .

format:  ## Auto-fix style and format code
	uv run ruff check --fix .
	uv run ruff format .

up:  ## Start full stack with docker compose
	docker compose up --build

down:  ## Stop docker compose stack
	docker compose down

worker:  ## Run celery worker locally
	uv run celery -A config worker --loglevel=info
