# Plant registration and contract flow verification

## Implemented

- `/panel/plant`: create/edit owned branches and plants against existing APIs; review state/reason, Persian digit normalization, uncertainty handling, explicit paging, responsive forms.
- `/admin/reviews`: enabled branch, plant and signed-contract queues. Staff-only backend permissions remain authoritative. Decisions use a native confirmation dialog; rejection requires a reason.
- Contract signing/review: reproduced PostgreSQL `FOR UPDATE cannot be applied to the nullable side of an outer join`; fixed with explicit branch → plant → contract locking, limiting nullable relation joins to reads.
- Signed-contract responses use recorded signing snapshots for seller/site information instead of current profile/site values.
- `/auth/me/`: an account without customer account type no longer reports a complete identity. No personal information was fabricated or changed for the live account.

## Verification

- Five Django API integration tests passed on PostgreSQL 16 in an isolated temporary Docker project: registration → staff approval → draft → signature → approval/rejection; ownership and staff permissions; replay protection; private evidence deletion protection; signed snapshot stability; incomplete identity; rejected-site correction/resubmission.
- The original signing SQL failure and identity/snapshot regressions were observed before their fixes.
- Nine existing contract-model tests passed.
- Existing contracts browser scenarios passed, including error states, private upload, keyboard navigation, lifecycle display and theme checks.
- `frontend/scripts/plants-browser-check.mjs` passed: separate simulated user/staff browser sessions, Persian inputs, pending eligibility gate, approvals, one draft creation, truthful unavailable-signing state, and 375/430/768/1280/1440 layouts. Browser writes were intercepted, not sent to live records.
- Frontend TypeScript, ESLint and production build passed. Targeted backend Ruff checks and formatting passed.
- Temporary PostgreSQL/Redis verification containers and their volumes were removed. Main services were found stopped during verification and were not restarted.

## Remaining product prerequisites

1. The current former-staff account has no customer account type/profile. Actual customer identity must be supplied through an approved onboarding/admin process; changing `is_staff` does not create it. Existing profile API does not expose a full customer-onboarding flow.
2. Staff review needs a separate staff account; the requested account remains a regular user.
3. No authoritative versioned contract document/hash endpoint exists. Frontend final signing remains disabled; backend signing was exercised with clearly test-only document metadata in an isolated test database.
4. No new policy for concurrent contracts, expiry or contractual periods was invented.

To repeat the browser test using the available external Playwright runtime:

```sh
CONTRACT_PLAYWRIGHT_MODULE=/absolute/path/to/playwright node frontend/scripts/plants-browser-check.mjs
```

Native backend regression command (with PostgreSQL reachable):

```sh
python manage.py test apps.contracts.tests.test_lifecycle_api --noinput
```
