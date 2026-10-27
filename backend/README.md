# Backend Base

A clean, reusable Django project base. Clone it, rename it, and start building.

## Stack

- **Django 5.2** + **Django REST Framework** (JWT auth + blacklist/denylist, OpenAPI docs)
- **Django Channels** WebSockets (`apps.realtime`, optional / removable)
- **PostgreSQL** / **Redis** (cache + Celery + domain client + channel layer) / **Celery**
- **CORS**, optional **Sentry**, **S3/MinIO** media storage in production
- Domain Redis facade in `apps.core.redis` (KV, hash, streams, locks)
- **uv** for dependency management
- **Ruff** + **pre-commit** for code quality
- **pytest** + **factory_boy** for testing
- **Docker** + **docker-compose** for local development and deployment

## Project layout

```
config/             # Django project (settings split into base/dev/prod)
apps/
  core/             # Shared models, pagination, exceptions, health, Redis facade
  accounts/         # Phone-based registration/login by OTP, profiles, JWT
  files/            # Owned uploads and private/public access
  plants/           # Household branches and solar plants
  realtime/         # WebSockets (Channels) — delete if unused
  catalog/          # Equipment CRUD + public catalog and installation cost estimate
  contracts/        # Draft creation, seller signature, company review and lifecycle history
```

## Getting started

### With Docker (recommended)

```bash
cp .env.example .env
docker compose up --build
docker compose exec web python manage.py migrate
```

Postgres and Redis are **not** published on the host by default. To reach them
from the host (psql, redis-cli):

```bash
docker compose -f docker-compose.yml -f docker-compose.local-ports.yml up
```

### Locally

Requires [uv](https://docs.astral.sh/uv/) and a running PostgreSQL + Redis
(you can start just those with
`docker compose -f docker-compose.yml -f docker-compose.local-ports.yml up db redis`).

```bash
cp .env.example .env
make install      # uv sync
make migrate
make run          # or: make run-asgi  (Daphne, HTTP + WebSockets)
```

In development, newly generated login and registration OTPs also appear in the
web server terminal, for example `OTP purpose=login phone=09123456789 code=123456 ttl=120s`.
This log is written during the API request, before Celery delivery. Set
`OTP_LOG_CODES=False` in `.env` to disable it; this request log is disabled when
`DEBUG=False`. A `200` response does not always generate a new code: login for
an unknown account and requests during the resend cooldown return without one.
These skipped requests log `OTP not generated` with the reason in development.

Install git hooks once:

```bash
uv run pre-commit install
```

## Key URLs

| URL | Description |
|---|---|
| `/api/docs/` | Swagger UI (open in development; **staff-only** when `DEBUG=False`) |
| `/api/schema/` | OpenAPI schema (same permission rules) |
| `/api/v1/auth/register/` | Start registration and send SMS OTP |
| `/api/v1/auth/register/verify/` | Verify registration OTP, create account and obtain JWT pair |
| `/api/v1/auth/otp/request/` | Request login OTP |
| `/api/v1/auth/otp/verify/` | Verify login OTP and obtain JWT pair |
| `/api/v1/auth/token/refresh/` | Refresh access token |
| `/api/v1/auth/token/verify/` | Check token format and expiry |
| `/api/v1/auth/logout/` | Blacklist refresh; denylist access if `Authorization` sent |
| `/api/v1/auth/me/` | Current user profile |
| `/api/v1/files/` | Owned file upload and list |
| `/api/v1/branches/` | Owned household branches |
| `/api/v1/plants/` | Owned solar plants |
| `/api/v1/contracts/` | Create a draft electricity purchase contract or list your contracts |
| `/api/v1/contracts/<uuid>/` | Read one of your contracts and its draft terms |
| `/api/v1/contracts/<uuid>/sign/` | Record accepted terms and private signature evidence |
| `/api/v1/staff/contracts/` | List signed contracts waiting for company review (staff) |
| `/api/v1/staff/contracts/<uuid>/review/` | Approve or reject a signed contract (staff) |
| `/api/v1/staff/branches/` | Staff queue of branches pending review |
| `/api/v1/staff/plants/` | Staff queue of plants pending review |
| `/health/live/` | Liveness (always 200) |
| `/health/ready/` | Readiness (DB + Redis; optional `X-Health-Token`) |
| `/health/` | Alias of readiness |
| `/admin/` | Django admin |
| `ws://host/ws/notifications/` | User notification WebSocket (auth via subprotocol/header) |
| `/api/v1/catalog/equipment/` | Public active equipment list; staff can create and list inactive items |
| `/api/v1/catalog/equipment/<uuid>/` | Public active equipment detail; staff can edit, activate/deactivate and delete |
| `/api/v1/catalog/equipment/estimate/?capacity_kwp=2.5` | Public numeric cost estimate and breakdown |
| `/api/v1/catalog/plans/` | Public active sell plans; staff create/list inactive plans |
| `/api/v1/catalog/plans/<uuid>/` | Public active plan detail; staff update/deactivate/soft-delete |

Branches and plants submitted by users always start as `pending`. Their `status`
cannot be set through user write requests. Staff reviews them through the queues
above and `POST /api/v1/staff/branches/<uuid>/review/` or
`POST /api/v1/staff/plants/<uuid>/review/` with
`{"decision":"approved"}` or `{"decision":"rejected","reason":"..."}`.
Rejection requires a reason. A plant can only be approved after its branch is
approved. Editing branch or plant details sends the item back to `pending` review;
editing a branch also returns its plants to pending review.

Create a draft with `POST /api/v1/contracts/` and JSON fields `plant_uuid` and
`plan_uuid`. Both the plant and its branch must have `status=active`, and the
plan must be active. The response includes the seller's identity profile, plant
and meter details (including the meter address), and numeric plan-term snapshots.
Contracts and their details are owner-scoped. Plan terms stay unchanged if staff
later edits the selected plan.

Before signing, upload the frontend-collected signature image through
`/api/v1/files/` as a private file with `purpose=contract`. Then submit
`accepted_terms=true`, the displayed `terms_version`, the client-generated
`terms_sha256`, and `signature_file_uuid` to the sign endpoint. Signing records
a snapshot of seller identity, plant, meter address and commercial terms, and
changes the status to `pending`. Company approval changes the status to
`active`; rejection requires a reason, closes that signed version as
`cancelled`, and is visible in contract history. Signature evidence cannot be
soft-deleted after it has been attached. The backend stores the submitted digest
but does not render or cryptographically verify the frontend document.

`GET /api/v1/auth/me/` also returns `identity_profile` and
`identity_profile_completion` for contract-form prefill. The completion object
lists required identity fields that are absent; it does not mean the identity
was externally verified. `PATCH /api/v1/auth/me/` can change first and last name,
and synchronizes those values to the linked individual or legal representative
profile. Phone and identity numbers remain read-only. Use the approved branch
address as the contract address; there is no separate residential address.

## Equipment catalog

Staff (`is_staff=True`) manage equipment through the catalog API or Django admin.
Public list/detail calls only return active items. The list supports filters such as
`category=panel` and `show_in_price_list=true`, plus search and ordering. Prices
are integer **toman**; capacity and unit counts are numeric. `per_unit` items
must specify a positive `units_per_kwp`. `power_watts` and `brand` are optional.

The estimate considers the first active panel and first active inverter, ordered
by creation time then database id, plus every active item in other categories.
For `per_kwp`, cost is capacity multiplied by unit price and rounded up to whole
toman. For `per_unit`, quantity is `ceil(capacity_kwp × units_per_kwp)`. `fixed`
items count once. Each breakdown line includes quantity and cost. An empty
catalog returns an empty breakdown and a zero total; add equipment before using
the estimate in customer flows.

## Electricity sell plans

Plans belong to `apps.catalog`. Each has a unique name, short description,
`commitment_kwh` (kWh), `rate_toman_per_kwh` (toman/IRT per kWh), savings copy,
`benefits` (an array of non-empty strings), recommended/active flags and display order.
Commitments and rates are positive decimals with up to three decimal places;
the API returns JSON numbers. Empty benefits lists are allowed. Names remain
reserved after soft deletion.

`GET /api/v1/catalog/plans/` lists active plans, sorted by `sort_order`, then
`created_at` and id. Staff see all non-deleted plans, including inactive ones.
Filters: `is_active` and `is_recommended`. Ordering: `sort_order`, `created_at`,
`name` (prefix with `-` to reverse). POST/PUT/PATCH/DELETE require `is_staff=True`.
For example, PATCH with `{"is_active": false}` deactivates a plan; DELETE soft-deletes it.
Plans are also manageable in Django admin.

The seed migration creates **پایه**, **استاندارد** and **ویژه** if missing by name.
All commercial numbers/copy in `apps/catalog/seed_data.py` are **PLACEHOLDER** values.
The seeded plans are **inactive** until product/frontend supplies real values and
staff replaces the placeholders and activates them. Only استاندارد is seeded as
recommended. Re-running the seed preserves existing rows, staff edits and soft deletions.
Its reverse is intentionally a no-op to preserve customized rows. Keep the seed
constants stable after deployment; use a new migration for later seed changes.

`snapshot_plan_terms(plan)` in `apps.catalog.services.plans` returns independent
scalar terms (including exact Decimal values). The `apps.contracts` model
persists a copy of the plan name, commitment and rate. Use
`select_plan_for_contract(contract=contract, plan=plan)` from
`apps.contracts.services.plans` to attach an active plan to a saved draft. The service
locks both rows, re-checks availability/status and saves terms in one transaction.
Later plan edits or soft deletion leave the contract's stored terms unchanged.
The FK uses PROTECT to retain provenance and block hard deletion of referenced plans.

Apply the new catalog and contracts migrations with `make migrate` before use.

## WebSockets (`apps.realtime`)

Enabled when `USE_WEBSOCKETS=True` (default). Channel layer uses Redis DB 3
(`REDIS_CHANNELS_URL`).

**Never put the JWT in the URL** (it leaks via logs and history). Use a
subprotocol in browsers, or an `Authorization` header from non-browser clients:

```javascript
const accessJwt = "<access_jwt>";
const ws = new WebSocket("ws://localhost:8000/ws/notifications/", ["bearer", accessJwt]);
ws.onmessage = (e) => console.log(JSON.parse(e.data));
ws.onopen = () => ws.send(JSON.stringify({ type: "ping", data: {} }));
```

In production use `wss://`. Connections are capped per user
(`WS_MAX_CONNECTIONS_PER_USER`, default 5) and messages are size-limited
(`WS_MAX_MESSAGE_BYTES`, default 64 KiB).

**Publish from a view or Celery task:**

```python
from apps.realtime.publish import publish_to_user

publish_to_user(request.user.pk, "order.created", {"id": "42"})
```

Envelope on the wire: `{"type": "<event>", "data": {...}}`.

### Removing WebSockets from a derived project

1. Delete the `apps/realtime/` package.
2. Remove `daphne`, `channels`, and `apps.realtime` from `INSTALLED_APPS`
   (or set `USE_WEBSOCKETS=False` and drop those conditional entries).
3. Simplify [`config/asgi.py`](config/asgi.py) to plain `get_asgi_application()`,
   or keep the flag at `False`.
4. Remove `channels`, `channels-redis`, and `daphne` from `pyproject.toml`.
5. Switch Docker/Makefile back to gunicorn/`runserver` if you no longer need ASGI.

## Domain Redis (`apps.core.redis`)

Use this for app logic (OTP, streams, locks). Do **not** replace Django cache or Celery with it.

```python
from apps.core.redis import get_redis, build_key

r = get_redis()
r.set(build_key("accounts", "otp", phone), code, ttl=120)

streams = get_redis("streams")
streams.xadd("orders", {"id": "..."})
```

Connections: `default` → `REDIS_URL` (DB 1), `streams` → `REDIS_STREAMS_URL` (DB 2),
channels → `REDIS_CHANNELS_URL` (DB 3). Celery stays on DB 0.

## Everyday commands

```bash
make run             # dev server (Channels-aware)
make run-asgi        # Daphne ASGI (HTTP + WebSockets)
make test            # pytest with coverage
make lint            # ruff check + format check
make format          # auto-fix style
make makemigrations
make migrate
make worker          # celery worker
```

## Security

Checklist before production:

- Use `DJANGO_SETTINGS_MODULE=config.settings.production` and a strong unique
  `DJANGO_SECRET_KEY` (never the development default).
- Set `DJANGO_ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, and
  `DJANGO_CSRF_TRUSTED_ORIGINS` to real origins only.
- Terminate TLS at the reverse proxy; keep `SECURE_SSL_REDIRECT` / HSTS on.
- Do not publish Postgres/Redis to the internet. Prefer
  `docker-compose.prod.yml` (requires `POSTGRES_PASSWORD` and `REDIS_PASSWORD`).
- Set `HEALTH_CHECK_TOKEN` if readiness probes are reachable publicly; send
  header `X-Health-Token`.
- API docs (`/api/docs/`, `/api/schema/`) require a staff user when `DEBUG=False`.
- Protect `/admin/` (VPN / IP allowlist / strong passwords; consider 2FA at the
  identity layer).
- Customer login uses a phone OTP; use `wss://` for WebSockets and the
  `bearer` subprotocol (no JWT in query strings).
- Logout sends the refresh body **and** `Authorization: Bearer <access>` so the
  access token is denylisted immediately. `token_version` supports revoking
  all outstanding sessions.
- Never log Authorization headers or JWTs (a log filter redacts common patterns).

Rate limits (defaults, overridable via env): registration `5/min`, OTP requests
`10/min`, OTP verification `30/min`, token refresh `30/min`, file upload `30/min`.

## Conventions

- New apps live in `apps/` and are named `apps.<name>` in `INSTALLED_APPS`.
- Concrete models inherit from `apps.core.models.BaseModel`
  (timestamps + public UUID + soft delete) instead of `models.Model`.
  Use `Model.all_objects` to include soft-deleted rows; `instance.restore()`
  / `hard_delete()` when needed.
- All configuration comes from environment variables — see `.env.example`.
  No secrets in code, ever.
- API endpoints are versioned under `/api/v1/`.
- Errors follow a single envelope: `{"error": {"code": ..., "detail": ...}}`.
- Set `SENTRY_DSN` to enable error tracking; leave empty to disable.
- Set `AWS_STORAGE_BUCKET_NAME` in production to store media on S3/MinIO.
- Set `CORS_ALLOWED_ORIGINS` in production to your frontend origin(s).
- Prefer `get_redis()` / `build_key()` for Redis domain work; leave
  `django.core.cache` for HTTP caching and Celery for background jobs.
- Reuse permissions from `apps.core.permissions`
  (`IsOwner`, `IsOwnerOrReadOnly`, `IsOwnerOrStaff`, `IsStaff`, `IsAdmin`).
  Set `owner_field` on the view when the FK is not named `user`.

## Reusing this base for a new project

1. Clone and re-init git history.
2. Update `name`/`description` in `pyproject.toml` and titles in
  `SPECTACULAR_SETTINGS`.
3. Copy `.env.example` to `.env` and set real values.
4. Add your first app under `apps/` and include its URLs in
  `config/urls.py` under `api_v1_patterns`.
5. Drop `apps.realtime` if the project does not need WebSockets (see checklist above).
