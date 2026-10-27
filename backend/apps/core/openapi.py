"""Shared OpenAPI tags and schema helpers for drf-spectacular / Swagger UI."""

from __future__ import annotations

# Tag names must match SPECTACULAR_SETTINGS["TAGS"] and @extend_schema(tags=[...]).
TAG_AUTH = "Auth"
TAG_ACCOUNT = "Account"
TAG_FILES = "Files"
TAG_BRANCHES = "Branches"
TAG_PLANTS = "Plants"
TAG_EQUIPMENT = "Equipment"
TAG_PLANS = "Plans"
TAG_CONTRACTS = "Contracts"

OPENAPI_TAGS = [
    {
        "name": TAG_PLANS,
        "description": (
            "Electricity sell plans: public active plans and staff CRUD. "
            "Committed energy is in kWh; rates are numeric toman (IRT) per kWh. "
            "Seed plans are inactive placeholders until replaced with product values."
        ),
    },
    {
        "name": TAG_CONTRACTS,
        "description": (
            "Electricity purchase contracts. Sellers sign approved-plant drafts with private "
            "signature evidence; signed contracts enter company review. Staff approval activates "
            "the contract, while rejection closes that signed version and records a reason."
        ),
    },
    {
        "name": TAG_AUTH,
        "description": (
            "Customer authentication is **OTP-only** (no password login). "
            "Register and login both send a 6-digit SMS code, then return a JWT pair. "
            "Send `Authorization: Bearer <access>` on protected routes. "
            "Refresh rotates tokens; logout blacklists the refresh and can denylist the access."
        ),
    },
    {
        "name": TAG_ACCOUNT,
        "description": (
            "Signed-in profile (`/auth/me/`). Phone, account type, and path are read-only after "
            "registration. Editable fields are limited (e.g. first/last name)."
        ),
    },
    {
        "name": TAG_FILES,
        "description": (
            "Owned file uploads. Private files are never exposed via raw `/media/` paths; "
            "clients use the returned access URL (authenticated content endpoint locally, "
            "or a signed object-storage URL when S3/MinIO is configured). "
            "Only staff may set `visibility=public`. Soft-delete hides rows from the API."
        ),
    },
    {
        "name": TAG_BRANCHES,
        "description": (
            "Household utility branches : name, unique meter number, address, status. "
            "Users only see their own rows. A branch cannot be deleted while plants remain on it."
        ),
    },
    {
        "name": TAG_PLANTS,
        "description": (
            "Solar plants attached to an owned branch: capacity (kWp), address, status, "
            "optional commissioning date. Sell-path users register an existing plant here; "
            "install-path plants are created later from completed install requests."
        ),
    },
    {
        "name": TAG_EQUIPMENT,
        "description": (
            "Public active equipment catalog and server-side installation cost estimate. "
            "Staff can manage equipment, including inactive items. Prices are numeric toman."
        ),
    },
]

API_DESCRIPTION = """
# Bargino Backend API

Versioned under `/api/v1/`. Errors use a single envelope:

```json
{"error": {"code": "validation_error", "detail": "..."}}
```

Public resource ids are UUIDs. Money and energy are numbers.

## Auth flow

1. `POST /auth/register/` — validate payload, send OTP.
2. `POST /auth/register/verify/` — confirm OTP → account created → JWT + user.
3. `POST /auth/otp/request/` + `POST /auth/otp/verify/` — login for existing users.
4. `POST /auth/token/refresh/` — new access (and rotated refresh).
5. `POST /auth/logout/` — body `refresh`; optional `Authorization` to denylist access immediately.

## Files

Upload with `multipart/form-data`. Allowed MIME types and size caps depend on `purpose`
(e.g. `install_media` up to 25 MiB: JPEG/PNG/WebP/MP4/WebM).

## Branches & plants

1. `POST /branches/` — register a meter / household branch.
2. `POST /plants/` — attach a solar plant to an owned `branch_uuid`.

## Equipment

`GET /catalog/equipment/` lists active items for public clients. Staff can manage
items at the same endpoint. `GET /catalog/equipment/estimate/?capacity_kwp=...`
returns a numeric cost breakdown. For panels and inverters, only the first active
item (oldest creation time, then id) in each category is included.

## Sell plans

`GET /catalog/plans/` returns active electricity sell plans ordered by sort_order.
Staff may create, edit, activate, deactivate, and soft-delete plans. Rates are in
toman per kWh, commitments in kWh. Seeded plans are inactive placeholders.
Contracts copy selected terms into their own fields so later plan edits do not
change existing contract terms. `POST /contracts/` creates a draft only for an
approved plant attached to an approved branch. `POST /contracts/{uuid}/sign/`
records acceptance, a terms version and digest, and a private signature image
uploaded through `/files/` with `purpose=contract`. This moves the contract to
`pending` company review. Staff review signed contracts at
`GET /staff/contracts/` and decide at `POST /staff/contracts/{uuid}/review/`;
approval moves the contract to `active`, while rejection requires a reason and
moves that signed version to `cancelled`. Contract detail includes lifecycle
history. The terms digest is supplied by the client and stored as evidence; the
backend does not generate or cryptographically verify the rendered document.
""".strip()
