# Lava Frontend — Deployment (Vercel)

The frontend has exactly one environment-variable dependency: `LAVA_API_URL`,
used server-side in `next.config.ts`'s rewrite (`/api/v1/:path* →
${LAVA_API_URL}/api/v1/:path*`). Every backend call the UI makes goes through
this one rewrite — there is nothing else to configure.

Because the rewrite runs on Vercel's own Next.js server (not in the browser),
the browser only ever talks to the frontend's own origin. The backend's
`Set-Cookie` (HttpOnly auth cookie) relays through the proxy transparently —
no CORS or cross-domain cookie handling needed. Same pattern already proven
by PathwaysFrontend's and Micro's `/api/*` rewrites to PathwaysBackend.

## 1. Create the Vercel project

1. Vercel dashboard → **Add New → Project** → import
   `Zenlearn/Lava-decision-risk-dashboard` from GitHub.
2. **Root Directory**: set to `frontend` (this is a monorepo-style layout —
   backend and frontend are sibling folders in one repo, so Vercel needs to
   know which subfolder is the actual Next.js app).
3. Framework preset: Next.js (auto-detected once Root Directory is set).
4. Build command / output: leave as Next.js defaults (`next build`).

## 2. Environment variable

In the Vercel project's **Settings → Environment Variables**, add:

```
LAVA_API_URL = https://lava-api.zenlearn.ai
```

Set this for Production (and Preview, if preview deploys should also talk to
the same backend — there's no staging backend yet, so Preview will hit the
same production API unless/until a separate staging Lava backend exists).

This must be set **before** the first real deploy that needs to reach the
backend — `next.config.ts` falls back to `http://localhost:3010` otherwise,
which won't resolve from Vercel's servers.

## 3. Custom domain

The backend's `ALLOWED_ORIGINS` is scaffolded expecting `lava.zenlearn.ai`
as the frontend's real domain (not a raw `*.vercel.app` URL). In Vercel:

1. **Settings → Domains** → add `lava.zenlearn.ai`.
2. Add the CNAME/A record Vercel gives you at your DNS provider.
3. Once verified, this becomes the production URL Vercel serves the app on.

If you deploy before the domain is ready and get a temporary `*.vercel.app`
URL instead, add that to the backend's `ALLOWED_ORIGINS` too (comma-
separated) so login/API calls aren't blocked by CORS in the meantime — then
remove it once the real domain is live, to keep the allowlist tight.

## 4. Verify after deploy

1. Visit `https://lava.zenlearn.ai` (or the Vercel preview URL) — the sign-in
   page should load.
2. Sign in — confirm the session cookie is set (DevTools → Application →
   Cookies → should show an HttpOnly `token` cookie on the frontend's own
   domain, not the backend's).
3. Load the dashboard — confirm `/api/v1/dashboard/full-data` returns data
   (Network tab), proving the rewrite to the OCI-hosted backend is working.

## Dependency on backend deployment

This deploy is independent of the backend's Docker/OCI setup and can happen
in either order, but the dashboard won't show real data until:
- The backend is deployed and reachable at the `LAVA_API_URL` above
  (see `../backend/DEPLOYMENT.md`), and
- At least the Master Data file has been imported through the new admin
  upload panel in PathwaysFrontend (`/lava/upload`).
