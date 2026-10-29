# Admin plant inventory and panel availability

## UI

`/admin/plants` manages plants across users: server-side status filtering, search (name, owner phone, meter), real pagination, creation, editing, soft deletion and explicit approval/rejection. Creation selects an existing branch and derives the owner server-side. Editing can only select another branch of the same owner. New/edited plants enter pending review; there is no hidden auto-approval. Rejection requires a reason; approval requires the branch to be active. Existing `/admin/reviews` remains the combined branch/plant/contract queue.

Modal dialogs use native focus trapping, Escape, background scroll lock and focus restoration. Pending mutations block related controls. Ambiguous mutation failures block blind re-submission and offer a close-and-refresh path. All customer-facing messages are Persian; capacities preserve decimal strings.

## API

- GET `/api/v1/staff/plants/`: default `status=pending` preserves the existing review queue. `status=all` returns all live plants; also supports active/inactive/maintenance/pending, owner_uuid and search. Standard page/page_size pagination.
- POST `/api/v1/staff/plants/`: PlantWriteSerializer (`branch_uuid`, `name`, `address`, `capacity_kwp`, optional `commissioned_at`). Owner comes from the selected branch; client owner/status fields cannot assign ownership or approval.
- GET/PUT/PATCH/DELETE `/api/v1/staff/plants/{uuid}/`: staff-only inventory operations using existing domain services. Deletion is soft; changing details resets review state. Moving an existing plant to another owner's branch is rejected.
- GET `/api/v1/staff/branches/`: default pending preserved; status=all, owner_uuid and search support branch selection.
- POST `/api/v1/staff/plants/{uuid}/review/`: existing decision=approved/rejected and reason contract retained.

Every staff endpoint requires IsStaff. Existing `/plants/` and `/branches/` remain owner-scoped. No model/migration was introduced. Local Docker compose bind-mounts source; Daphne must be restarted to load changed routes (`docker compose restart web` from backend). No image rebuild is needed for these Python source-only changes.

## Locked user sections

Home, contracts, read-only My Plant and profile remain active. Production, invoices, payments, installation requests, documents, notifications, support tickets and settings are disabled with lock icons in both sidebar layouts. Their direct routes show a locked section instead of placeholder controls. The home dashboard no longer shows fabricated/unfinished metric placeholders. Notification shortcuts were removed and support links now lead to the existing public contact page.

## Verification

- Frontend TypeScript, whole-project ESLint,9 model tests and production build passed.
- Backend Ruff passed for changed files.
-10 new staff-inventory tests plus4 existing owner-permission tests passed on a disposable PostgreSQL16 database with real migrations. No application database was used. An initial SQLite migration run could not execute PostgreSQL-specific SQL; PostgreSQL was used for the definitive run.
- `scripts/admin-plants-browser-check.mjs`: isolated API fixtures cover server search/filter, one create, edit, approve, reject with mandatory reason, delete, modal Escape/focus/centering, API error/retry, both themes at375/430/768/1280/1440, eight locked routes/sidebar entries and non-admin route denial. No live data was changed by browser tests.
- Existing contracts and registration regression scripts remain available; authoring/update requests are always intercepted in browser verification.
