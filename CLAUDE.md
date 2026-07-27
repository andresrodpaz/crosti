# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Crosti Cookies — a Next.js 16 (App Router) storefront + admin panel for an artisan cookie bakery in Barcelona. The product is Spanish-language: routes (`/galletas`, `/tienda`, `/club`), UI copy, API error messages, and many code comments are in Spanish. Keep new user-facing strings in Spanish.

## Commands

The project has both `package-lock.json` and `pnpm-lock.yaml` committed; CI uses `pnpm install --frozen-lockfile`.

```bash
pnpm dev                       # dev server on :3000
pnpm build                     # next build (output: standalone)
pnpm start                     # serve the production build

npx tsc --noEmit               # REQUIRED type check — see gotcha below
pnpm test:unit                 # jest (tests/unit/**/*.test.ts)
pnpm test:unit:watch
pnpm test:unit:coverage        # → tests/coverage/index.html
pnpm test:e2e                  # playwright (needs a server already running)
pnpm test:e2e:ui               # interactive runner
```

Single test:

```bash
npx jest tests/unit/club-loyalty.test.ts -t "nombre del test"
npx playwright test tests/e2e/club-admin.spec.ts --project=chromium -g "texto"
```

Playwright's config has **no `webServer`** — start `pnpm dev` or `pnpm build && pnpm start` yourself before running E2E. It runs serially (`workers: 1`) against `http://localhost:3000`, with `chromium` and `mobile-safari` projects. First run on a new machine needs `npx playwright install --with-deps`.

API tests are a Postman collection driven by Newman (not wired into an npm script):

```bash
newman run tests/postman/club-crosti-api.postman_collection.json \
  --env-var baseUrl=http://localhost:3000 --env-var staffPin=1234
```

Docker: `docker-compose up --build` (multi-stage Dockerfile, standalone output, health check at `/api/health`).

`pnpm lint` is defined as `eslint .` but ESLint is neither installed nor configured — it fails. Use `npx tsc --noEmit` as the real static check.

## Supabase client selection

There are four client factories and picking the wrong one is the most common source of bugs:

| Factory | Use for |
| --- | --- |
| `lib/supabase/server.ts` → `createClient()` | RSC pages and API routes that need the user's session / RLS as that user (`@supabase/ssr`, cookie-bound, `await`ed) |
| `lib/supabase/public.ts` → `createPublicClient()` | Public read-only GET routes — anon key, `persistSession: false`, no cookie work. Used deliberately for latency on hot paths (`/api/cookies`, `/api/banners`, `/api/featured-cookie`, `/api/monthly-collection`) |
| `lib/supabase/client.ts` → `createClient()` | Browser components. Singleton stashed on `globalThis`; returns `null` when `window` is undefined |
| `lib/supabase/admin.ts` → `createAdminClient()` | Service-role, bypasses RLS. Server-only, sparingly |

Established convention in the API routes: public `GET` uses `createPublicClient()`, mutating/admin handlers use the cookie-bound server client.

## Auth

Two independent auth systems:

1. **Admin / developer** — Supabase Auth + a `profiles` table whose `role` is `admin | editor | viewer | developer`. `POST /api/auth/login` signs in, then gates on role by request `type`: `"developer"` requires `developer|admin`, anything else requires `admin|editor`. `GET /api/auth/verify` re-reads the profile.
2. **Club staff** — a bcrypt-hashed PIN in `club_card_config.staff_pin`, checked by `POST /api/club/verify-pin`. When no PIN row exists it falls back to accepting `1234` for development.

Route protection lives in **`proxy.ts` at the repo root** — Next.js 16's rename of `middleware.ts`. It delegates to `updateSession()` in `lib/supabase/proxy.ts`, which **fast-paths every request that isn't `/admin/*` or `/developer/*`** and returns before instantiating Supabase. That early return is a deliberate performance fix; don't move auth work above it.

`NEXT_PUBLIC_LOYALTY_ENABLED` must be the string `"true"` or all `/club` pages `redirect("/")`.

The store has an equivalent kill switch, but it is a plain constant rather than an env var — `STORE_ENABLED` in `lib/feature-flags.ts`, currently **`false`**. While it is off, `app/tienda/layout.tsx` redirects every `/tienda/*` route to `/`, the navbar/footer/SEO entry points to the store are hidden, `/tienda*` drops out of the sitemap, and `POST /api/orders` returns 503. Nothing was deleted — flip the constant to `true` to bring the store back.

## The three surfaces

**Marketing / catalog** (`app/page.tsx`, `/galletas`, `/faq`) — sections are DB-driven, not hardcoded: `landing_config` (hero, feature blocks, and a `sections` JSONB blob that also holds social settings — see `lib/social-settings.ts`), `banners`, `monthly_collections` + `monthly_collection_items`, `featured_cookie`. Cookies carry tags via the `cookie_tags` → `tags` → `colors` chain; `/api/cookies` fetches cookies and the whole tag map in parallel and joins them in JS rather than nesting the select.

**Store** (`/tienda` → `/checkout` → `/pago` → `/confirmacion`) — cart is Zustand + `persist` in `lib/cart-store.ts` (localStorage). Pack items (`isPack` + `packCookies[]`) are always appended as distinct line items and never quantity-merged. `POST /api/orders` inserts `orders` + `order_items`, **recomputes the total server-side** and overwrites the stored total on mismatch (price-manipulation guard), rolls back the order if items fail to insert, generates a PDF invoice (`lib/invoice-generator.ts`, jspdf) uploaded to Vercel Blob, then emails customer and admin via Resend. Payment is simulated — there is no real gateway.

**Club de fidelización** (`/club`, `/club/tarjeta/[customerId]`, `/club/sello`) — stamp-card loyalty. `POST /api/club/stamps` increments `club_customers.stamp_count`, appends a `club_stamp_events` row, and deduplicates delivery-origin stamps on `external_order_id` + `platform` unless `force` is passed. A reward unlocks when the count crosses `club_card_config.stamp_total`, which triggers a Resend email from `lib/club-email-templates.ts`. `POST /api/club/redeem` subtracts `points_cost` and logs `club_redemptions`. `/club/sello` is a staff QR scanner (`html5-qrcode`) gated by the PIN above.

**Admin** (`/admin`) is one client component holding a `Section` union in state and switching between `components/admin/*` panels; `/developer` edits landing config. Nothing is server-rendered there — auth is checked client-side in `useEffect` on top of the proxy redirect.

`lib/store.ts` and `lib/cookies-store.ts` are legacy in-memory mock data from before the DB existed. Real data comes from `/api/*` — don't extend them.

## Conventions

- `@/*` maps to the repo root.
- Server-side logs are prefixed `[Message]`.
- API responses pass the DB row shape through as-is (`image_urls`, `main_image_index`, `is_visible`) — no camelCase mapping layer.
- Errors return `{ error: "mensaje en español" }` with an appropriate status.
- Public GET routes set caching by hand, e.g. `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`.
- Styling is Tailwind v4 CSS-first: **no `tailwind.config`**. Theme tokens are CSS variables in `app/globals.css` (brand: `--primary: #930021`, `--secondary: #f8e19a`, `--accent: #924c14`). shadcn/ui, `new-york` style, lives in `components/ui`.

## Database

Schema is raw SQL in `scripts/`, applied **manually** in the Supabase SQL editor — there is no migration tool or ordering guarantee. Numbered files run in order (`001_schema` → `002_rls_policies` → `003_seed_data` → `004_banners_and_boxes` → `005_monthly_cookies` → `006_featured_cookie`), plus ad-hoc `add-*.sql` / `fix_*.sql` patches and consolidated `COMPLETE_SETUP.sql` / `FULL_MIGRATION.sql` variants that overlap the numbered ones. When adding a column, add a new patch file **and** assume production may not have it yet — existing routes defensively normalize (`cookie.image_urls` array check, `main_image_index || 0`). RLS pattern: public `SELECT`, writes limited to `admin`/`developer`.

## Environment variables

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_LOYALTY_ENABLED`, `RESEND_API_KEY`, `BLOB_READ_WRITE_TOKEN`, `ADMIN_SETUP_TOKEN` (bearer token guarding the one-shot `POST /api/setup-admin`). Email and blob features degrade rather than crash when their keys are absent (`if (process.env.RESEND_API_KEY)`, `"re_mock"` fallback).

## Gotchas

- `next.config.mjs` sets `typescript.ignoreBuildErrors: true` and `images.unoptimized: true`. **A successful `pnpm build` says nothing about type correctness** — run `npx tsc --noEmit` explicitly.
- All four workflows in `.github/workflows/` are currently `workflow_dispatch`-only, and the typecheck and Jest steps inside `ci.yml` are commented out. CI will not catch a regression for you.
- The Markdown docs (root `*.md` and `docs/`) are partly stale: they reference a `users` table that was replaced by `profiles`, SQL filenames that don't exist (`001_complete_database_setup.sql`, `001_create_tables.sql`), and npm scripts that aren't defined (`test:api`, `test:coverage`). Trust the code over the docs. `docs/DEVELOPER_GUIDE.md`'s FAQ section is still useful for Supabase error triage.
- `ADMIN_GUIDE.md` and `docs/CREDENTIALS.md` contain plaintext default credentials, and they disagree with each other and with `/api/setup-admin`.
