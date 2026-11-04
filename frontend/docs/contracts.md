# User contracts: integration notes

Aligned with `sell-path-plant-owner-to-contract.md` and the live backend sign serializer.

## Real routes and behavior

- `/panel/contracts`: authenticated owner-scoped list; page-number pagination; status filter applies to the current page.
- `/panel/contracts/new`: branch+plant intake → company approval gate → plan → review & create draft.
- `/panel/contracts/[uuid]`: draft detail with **client document template `v1`**, SHA-256 of the displayed text, signature pad/upload, acceptance checkbox, and `POST /contracts/{uuid}/sign/`.

## Signing (phase 5)

The frontend uses a **deterministic client template** (`CONTRACT_TERMS_VERSION = "v1"` in `contract-document.ts`):

1. Render the document from draft + identity + plan snapshots.
2. Hash the exact UTF-8 of that text → `terms_sha256`.
3. Birth certificate number is read from the user profile (not sent in the sign body).
4. Upload three private files: signature image (`purpose=contract`), national ID (`purpose=national_id`), signed PDF (`purpose=contract`).
5. Submit `accepted_terms=true`, `terms_version`, `terms_sha256`, and the three file UUIDs.

If the profile birth certificate number is empty, the API returns `400`. Date of birth is optional for signing. The certificate value is frozen into the signed history snapshot.

### Still deferred against live API gaps

`/contracts/stats/`, list `?status=&q=`, user renewal (`POST /contracts/{uuid}/renewal/`), and contract file access URLs are not called until exposed. Admin renewals are wired on `/admin/reviews?tab=renewals`.

## Profile

`PUT/PATCH /auth/me/` from `/panel/profile` updates `first_name`, `last_name`, `email`, and account-type birth fields:

- Individual: `birth_certificate_number`, `date_of_birth` (`YYYY-MM-DD`, no future dates)
- Legal: `representative_birth_certificate_number`, `representative_date_of_birth`

These appear in `identity_profile` / `seller_identity` and are **not** part of `identity_profile_completion`. National ID, account type, and path remain read-only.

## Verification

- `pnpm exec tsc --noEmit`
- `pnpm lint`
- `pnpm test:contracts`
- Optional: `scripts/contracts-browser-check.mjs` with Playwright fixtures
