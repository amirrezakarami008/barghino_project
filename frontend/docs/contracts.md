# User contracts: integration and remaining backend requirements

Implemented 2026-10-28. Backend code was inspected and left unchanged.

## Real routes and behavior

- `/panel/contracts`: authenticated owner-scoped list; real page-number pagination; search and status filter explicitly apply to the current page only. `page`, `q`, `status` survive in the URL through the Next-compatible History API.
- `/panel/contracts/new`: branch registration/selection → plant registration/selection → company approval gate → plan → draft review. Branch/plant creation and correction live exclusively here, using the existing registration forms. Selected UUIDs persist in the URL and resolve through owner-scoped detail reads on reload. No POST on mount or step changes. Only the final action creates a draft; the returned UUID becomes the detail route. Both plant and associated branch must have `status=active`.
- `/panel/contracts/[uuid]`: durable draft detail, recorded plan terms, seller/plant/branch data, company review note/time and typed lifecycle timeline. `draft`, `pending`, `active`, `cancelled`, `expired` and unknown statuses are handled. Signed history snapshots take precedence over live data. Incomplete/missing snapshots are explicitly labeled, not represented as signed content.

The workspace's existing RequireSession, /me hydration, JWT refresh and shell remain authoritative. New page content uses Suspense without disabling instant validation. There is no extra /me request from this feature.

## Verified API contract

| Request | Contract |
| --- | --- |
| GET `/api/v1/contracts/?page=N&page_size=12` | Owner-scoped `count,next,previous,results`; no declared contract filters or search fields |
| POST `/api/v1/contracts/` | JSON `{plant_uuid,plan_uuid}`; 201 ContractSerializer; copies plan terms into draft |
| GET `/api/v1/contracts/{uuid}/` | Owner-scoped detail; nested `history[]`; related `seller_identity`, plant and branch fields are live |
| POST `/api/v1/contracts/{uuid}/sign/` | Requires accepted_terms=true, terms_version (nonblank, max64), terms_sha256 (64 hex), private signature_file_uuid; draft→pending. **Not called by this implementation until a trustworthy document source exists.** |
| GET `/api/v1/plants/?page=N&page_size=12` | Owned plants including branch_uuid and status |
| GET `/api/v1/branches/{uuid}/` | Owned associated branch; resolved once per distinct branch on the selected plant page |
| GET `/api/v1/catalog/plans/?is_active=true&page=N&page_size=12` | Public active plans; explicit active filter also handles staff callers |
| POST `/api/v1/files/` | FormData file + purpose=contract + visibility=private; no manual Content-Type header |
| GET `/api/v1/files/{uuid}/content/` | Existing authenticated content route, fetched with Authorization; shown via revocable blob URL, never a JWT query parameter or raw storage URL |

Global pagination defaults to 20, supports page_size, maximum100 (`apps/core/pagination.py`). This feature requests12. Permission/validation responses use `{error:{code,detail}}`. UI messages are localized instead of exposing raw technical errors. No arbitrary backend pagination URL is followed: navigation constructs the known endpoint with page numbers.

Decimal strings remain strings and are grouped/localized for display without financial arithmetic or rounding. The backend serializers currently return numeric decimals (`coerce_to_string=False`); any numeric precision lost during backend JSON serialization cannot be reconstructed by a client.

## Evidence preparation and the intentional signing gate

`ContractSignSerializer` and `README.md` say the frontend supplies a hash, but **there is no approved legal template, versioned text, canonical-rendering specification or document endpoint in the inspected repository**. Existing response version/hash fields are records of earlier client input, not an authoritative source for a new signature. A commercial snapshot is not the complete legal document.

Consequently:

- The final acceptance checkbox is unchecked and disabled, with an explanation. Final signing/submission is disabled. No invented hash/version/template, fake sign request or success state exists.
- Users can optionally prepare a signature with Pointer Events (mouse/touch/pen) or keyboard-accessible image upload. Vector points/bitmap survive resizing; DPR-aware redraw preserves proportions. Pointer movement does not update React form state.
- Image evidence can independently be saved through the real private upload API. The UI explicitly distinguishes this from signing or submitting a contract. A fresh contract read checks it remains draft before upload.
- PNG/JPEG/WebP up to15MiB follow the source defaults and sign-service MIME restrictions. Uploaded images are decoded and blank images rejected; a drawn signature needs meaningful movement. Typed names are not treated as signatures.
- The returned file UUID stays in local state across detail refreshes. It is not uploaded again when already saved; it is not deleted. Changing the image intentionally starts new evidence. There is no signing-retry flow to exercise while the document gate remains closed.
- Leaving with unsaved evidence uses beforeunload and confirmation for ordinary same-origin link clicks. The existing product has no universal router blocker; browser history traversal cannot be reliably canceled by this implementation. Evidence is not silently persisted as sensitive data in localStorage. Uploaded evidence selection is session-local, and this is explained in the UI.
- Private preview object URLs are revoked on replacement/unmount. No permanent public link is created.

### Exact dependency for enabling final sign

Backend/product must provide an immutable approved document for each draft (or a documented, approved deterministic client template), the exact document bytes/text, authoritative version and SHA-256 specification, and binding between that document and the contract/snapshot. A **proposed**, currently nonexistent endpoint could be `GET /contracts/{uuid}/document/`; it must not be assumed available. Final sign must validate the accepted document binding server-side and reject stale versions. Merely filling existing terms_version/terms_sha256 columns is insufficient.

## Other source limitations

1. `sign_contract` uses `select_for_update()` with `select_related` through nullable plant/plan/profile relationships. `review_contract` joins nullable plant. This is a PostgreSQL nullable-side locking risk inferred from the source, **not a database failure reproduced by these frontend tests**. Backend maintainers should scope locks to the intended rows or lock joined records separately within the transaction.
2. Draft creation has no idempotency key or server uniqueness rule preventing simultaneous/duplicate drafts for the same plant. A synchronous client ref and disabled pending action prevent same-view double submission only. On ambiguous network/5xx/invalid success response, the client re-reads the first contract page, offers similar records for inspection, and disables blind re-submission. Similar records are not proof that this request succeeded. Backend idempotency is still required.
3. No endpoint is exposed for updating a draft's selected plan, downloading the actual contract PDF, renewal or cancellation. These controls are not fabricated. Closed/rejected versions offer a new-draft path.
4. Signed seller/plant/branch snapshots exist in `history.details.contract_snapshot`; serializer top-level related fields remain live. The UI distinguishes these. The backend stores but does not independently verify the client digest.
5. /me exposes identity completion and PATCH for names, but current profile UI is a viewer; identity numbers are read-only. The feature lists real missing fields, links to the profile/support, and does not collect identity numbers again. The My Plant route is a read-only inventory; registration and correction are now available exclusively in the contract intake flow.
6. File limits can be overridden in backend settings without a capability endpoint. Client uses inspected defaults; stricter server rejections remain authoritative.

## Verification

- `pnpm exec tsc --noEmit`
- `pnpm lint`
- `pnpm build`
- `pnpm test:contracts`:9 targeted model tests, transpiled by the existing TypeScript dev dependency; no test package added.
- `scripts/contracts-browser-check.mjs`: isolated Chromium contexts and network-boundary fixtures. All writes are intercepted; no real contracts, signatures or files are created.

Run the browser script with an existing Playwright installation:

```sh
CONTRACT_PLAYWRIGHT_MODULE=/absolute/path/to/node_modules/playwright \
CONTRACT_AXE_SCRIPT=/absolute/path/to/axe-core/axe.min.js \
CONTRACT_BASE_URL=http://localhost:3000 \
node scripts/contracts-browser-check.mjs
```

Optional CONTRACT_CHROME selects Chrome; CONTRACT_SCREENSHOTS chooses the image directory; CONTRACT_SCENARIO narrows scenario names for diagnosis. The host's preinstalled Playwright and the repository's existing transitive axe-core were used, without adding production dependencies.

Coverage includes no/unapproved plant, branch eligibility, valid draft and duplicate-click guard, reload continuation, actual missing identity fields, server validation, ambiguous mutation reconciliation, blank evidence, multipart private upload and deliberate retry, no duplicate file after success, server status changing before upload, snapshots/rejection history, all lifecycle states,401/403/404/503, URL filters/pagination, persistent shell, keyboard/drawer focus, uploaded image alternative, resize, both themes and375/430/768/1280/1440 layouts. Axe runs on list, review and signature surfaces in both themes. This is not a full assistive-technology certification or an end-to-end backend/database test. Signing success/failure after upload is intentionally not simulated because no trustworthy document source exists.

## Contract-owned registration refinement

`contract-site-stage.tsx` hosts existing PlantRegistrationForm and real POST/PATCH `/branches/` and `/plants/` integration. A new branch or plant is immediately retained by its returned UUID; there is no duplicate creation on step navigation or reload. Pending and rejected items remain selectable for review/correction, while continuing to the plan requires both statuses to be active and the plant to reference the chosen branch. Approval is refreshed manually or when returning to a visible page; no synthetic approval or polling. Changing approved branch/plant details returns affected records to pending according to backend rules.

`/panel/plant` only displays registered plants, their status, address, capacity and review note. It provides refresh/pagination and a contracts link when empty; no add, edit or registration form. Existing admin review functionality was preserved. Browser regression covers contract-owned registration, reload while pending, company approvals and continuation, single POST per item, and read-only plant inventory at375/430/768/1280/1440px.
