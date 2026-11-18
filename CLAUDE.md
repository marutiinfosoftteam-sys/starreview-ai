# CLAUDE.md

StarReview AI helps Indian local businesses collect Google reviews: QR flyers, AI review drafts, reply assistant, SEO checks, business console. React 18 + Vite frontend, Express API. Not a git repo.

## Commands
- `npm install`, then `npm run dev:all` — Vite on :5173 + Express on `PORT` (default 5000; `.env.example` suggests 5050 to avoid macOS AirPlay). Vite proxies `/api` to the same `PORT`.
- `npm run dev` / `npm run server` — run each side separately.
- `npm run build` — builds to `dist/`; Express serves `dist/` if present.
- No test suite or linter is configured.

## Deploy
- Vercel: `vercel.json` rewrites `/api/*` → `api/index.js` (wraps the Express app); everything else → SPA. Disk is temporary there, so set `MONGODB_URI`.
- Firebase Hosting (`firebase.json`) serves `dist/` only — no API.
- The root `package.json` is the real one; `server/package.json` is stale (missing `mongodb`).

## Config
`.env.example` documents everything. Each feature turns on when its var is non-empty (don't put fake placeholders): `GOOGLE_PLACES_API_KEY`, `MONGODB_URI`, `VITE_FIREBASE_*` / `FIREBASE_*`, `OPENROUTER_API_KEY`, `SMTP_*` / FormSubmit, `JWT_SECRET`, `ADMIN_EMAIL`, `PUBLIC_URL`. Server-only keys must never get a `VITE_` prefix.

## Backend (`server/`)
- `server/server.js` — every route. App state is read/written whole via `readStore`/`writeStore`/`mutate`: MongoDB collection `app_store` (`_id: 'main'`) if `MONGODB_URI` is set, else local SQLite `server/data/starreview.sqlite` (`server/db/sqlite.js`, built-in `node:sqlite`, one table per collection; imports an old `store.json` once). `LOCAL_STORE=json` forces the old JSON file. `mutate` serializes writes in-process only. `auth` middleware = JWT bearer. Plans/prices are in `PLANS` (server decides prices).
- Payments are deliberately demo-only: `razorpayReady = () => false`. Keep it that way unless explicitly asked.
- `lib/placesSearch.js` (Google Places API New), `lib/osmSearch.js` (OSM fallback), `lib/openrouter.js` (AI drafts/replies), `lib/drafts.js` (template fallback when no AI key), `lib/seo.js` + `lib/siteCheck.js` (SEO audit, site crawl, PageSpeed), `db/mongodb.js` (connection + tenant helpers).
- Route groups under `/api`: `auth/*`, `business`, `places/*`, `public/*` (review funnel), `drafts`, `replies`, `seo*`, `analytics`, `feedback`, `contact`, `account/deletion-request`, `billing/*`.

## Auth
- Email/password accounts must verify their email with a 6-digit code (hashed, 10 min, 5 tries) before login works. Routes: `auth/register` → `auth/verify-email`, `auth/resend-code`, `auth/login` (403 `needsVerification` if unverified), `auth/forgot-password` → `auth/reset-password`. Codes are stored in the `authCodes` collection.
- Codes are emailed through SMTP (Gmail `marutiinfosoftteam@gmail.com` with an App Password in `SMTP_PASS`). Without SMTP, local dev prints the code in the API log; production refuses.
- Google sign-in (`auth/firebase-login`) only accepts a Firebase ID token verified with Google — never a bare email.
- Never let auth fall back to fake/local logins: `src/api.js` returns an error for `/api/auth/*` when the server is unreachable.

## Frontend (`src/`)
- `App.jsx` (~4.3k lines) — app shell with hand-rolled routing: a path→page-name map at the top, `history.pushState`, and `{page === '…' && …}` blocks. Add new pages to both maps and a render block.
- `BusinessConsole.jsx` (~6.8k lines) — signed-in dashboard (`/dashboard`, `/console`, `/admin`).
- `tools.jsx` — `ReviewFunnel` (public `/r/:slug` page), `BusinessSetup`, `ReplyAssistant`, `SeoAnalyzer`, `Dashboard`, `QrFlyer`, `funnelUrl`.
- `BusinessOnboarding.jsx` — business search/onboarding flow.
- `reviewLibrary.js` — offline review generator for the QR review page (no API): hand-written sentences per business type (matched from `category`, then name) and star rating (3/4/5), combined into thousands of variants. Add sentences there to grow it.
- Negative Reviews in the console = 1–2★ private feedback from the review page, loaded from `GET /api/business/feedback` (newest first; `PATCH`/`DELETE /api/business/feedback/:id` to archive/restore/delete). Owners cannot add feedback by hand.
- Customer reviews: when a customer taps "Copy review & post" on the QR page, `POST /api/public/reviews` saves it (no login, rate-limited, same text within 30 min counts as one with `copies`). Owners see all reviews (copied-for-Google + 1–2★ private) in Review Settings → Customer Reviews via `GET /api/business/reviews` (newest first, filters, CSV).
- `api.js` — **hybrid client**: tries the real server, and on timeout (3.5s; 10s for `/api/places/*`), network error, 5xx or HTML falls back to `localDispatch`, an in-browser mock DB in `localStorage` (`starreview_local_db_v3`).
- `DemoVideo.jsx` + `demoVideo.css` — the "virtual demo video" below the home hero (`#demo-video`): a ~40s animated walkthrough driven by a clock, with chapters, seek, play/pause and autoplay when scrolled into view. Scenes draw on a fixed canvas (960×540 landscape, 360×800 portrait ≤760px) scaled into a 16:9 / 9:20 frame. Edit `SCENES` to change timing and captions.
- `extra.css` has global mobile overrides (`* { max-width: 100vw !important }`, 15px `!important` padding on every `section`/`main`); new components may need scoped `!important` overrides.
- `flyerCanvas.js` (QR flyer canvas → PNG/PDF), `firebase.js` (Google sign-in), `company.js` (contact constants).
- CSS: `styles.css` (~11.7k lines), `console.css`, `responsive.css`, `extra.css`, then `header.css` last — the single source of truth for the site header layout (links in the bar ≥900px, drawer below; menu button at the far right). Change header layout there rather than in the older files.
- Billing tab (console) shows the same plans and prices as the public Pricing page (Starter ₹199/₹1,999, Pro ₹299/₹2,999, Multi-Business custom via WhatsApp) and reads plan status from `user.subscription`; keep the two in sync with `PLANS` in `server/server.js`.

## Gotchas
- API behavior is duplicated: when changing a server route, update the matching handler in `src/api.js` `localDispatch` too, or the two diverge. The silent fallback can make the app look working while the server is broken — check the network tab / server logs when debugging.
- `suratPlacesResolver.js` exists identically in `src/` and `server/lib/`; keep them in sync.
- Big files: search with grep and read ranges instead of whole files.
- Security rules (keep them): production refuses to start without a 32+ char `JWT_SECRET`; `auth` re-checks the user exists and that the token is newer than `passwordChangedAt`; CORS allows only the site origins in production; `trust proxy` only on Vercel or `TRUST_PROXY=1`; public endpoints use `rateLimited(...)`; `funnelContext` never falls back to another business for unknown slugs (only `demo`); site-check only fetches public IPs on ports 80/443 via a pinned DNS lookup (`server/lib/siteCheck.js`); demo checkout (`/api/billing/verify` with `mode: 'demo'`) never changes a subscription.
- Known limits: the whole store is one document, so concurrent serverless instances can overwrite each other's writes (move to per-record MongoDB updates before scaling); `askAI` only reads `OPENAI_API_KEY` (OpenRouter helpers exist but are unused).
