# Lava Decision Risk — Quick Start

> See `ARCHITECTURE.md` for the full design doc. This file is the developer quick-start.

## Status

| Phase | Scope | Status |
|-------|-------|--------|
| **0** | Skeleton: Postgres+Redis, Prisma schema, `/health`, auth middleware, Next.js shell | ✅ Complete |
| 1 | Import pipeline + rule engine | ⏳ Not started |
| 2 | Dashboards (Executive/Regional/Dealer/Technician) | ⏳ Not started |
| 3 | Full RBAC enforcement, audit logging, training hooks | ⏳ Not started |
| 4 | BullMQ background jobs at scale | ⏳ Not started |

---

## Prerequisites

- Node.js ≥ 18
- Docker Desktop (for Postgres + Redis)
- A `.env` file in `backend/` — copy from `.env.example` and fill in `JWT_SECRET` + `DATABASE_URL`

```bash
cp backend/.env.example backend/.env
# Edit backend/.env — set JWT_SECRET to the same value as PathwaysBackend
```

---

## Backend

```bash
cd backend

# 1. Start Postgres + Redis
docker-compose up -d

# 2. Install dependencies (first time only)
npm install

# 3. Generate Prisma client
npm run db:generate

# 4. Push schema to DB (creates tables)
npm run db:push

# 5. Start dev server (port 3010)
npm run dev
```

### Verify Phase 0

```bash
# Type-check (should produce no output)
npm run type-check

# Health check (DB + Redis must be running)
curl http://localhost:3010/api/v1/health
# → { "status": "ok", "services": { "database": "ok", "redis": "ok" } }

# Protected route without token (should return 401)
curl http://localhost:3010/api/v1/dashboard/executive
# → { "message": "Authentication token missing" }

# Protected route with a valid ZenLearn JWT
curl -H "Authorization: Bearer <token>" http://localhost:3010/api/v1/dashboard/executive
# → { "message": "Executive dashboard not yet implemented (Phase 2)" }
```

---

## Frontend

```bash
cd frontend

# 1. Install dependencies (first time only)
npm install

# 2. Start dev server (port 3011)
npm run dev
```

- Visit `http://localhost:3011` → redirected to `/signin` (cookie gate working)
- Visit `http://localhost:3011/signin` → Phase 0 placeholder page

---

## Ports

| Service | Port |
|---------|------|
| Backend API | 3010 |
| Frontend (dev) | 3011 |
| Postgres | 5432 |
| Redis | 6379 |

Chosen to avoid collision with PathwaysBackend (3001) and Micro (3000).

---

## Key files

| File | Purpose |
|------|---------|
| `backend/prisma/schema.prisma` | Full data model |
| `backend/src/configs/jwt.config.ts` | JWT verify (shared secret with PathwaysBackend) |
| `backend/src/middlewares/auth.middleware.ts` | JWT auth middleware |
| `backend/src/middlewares/rbac.middleware.ts` | Lava role RBAC (Phase 3 will add hierarchy) |
| `backend/src/routes/health.routes.ts` | `/api/v1/health` — Phase 0 verification |
| `frontend/middleware.ts` | Next.js cookie-gate (same pattern as Micro) |
| `ARCHITECTURE.md` | Full design doc + decisions log |

---

## Data file / scoring notes

The current `app.py` prototype uses these column names:
`Month`, `IMEI`, `Customer Contact Number1`, `Final NPS Rating`, `BUSM Name`, `ASM Name`, `ASP Name`, `Workorder`, `Customer City`, `Symptom Desc`

**These will change.** The schema is designed for this:
- `WorkOrder.rawData` is a `Json` field — stores the full original row.
- Column mapping lives in Phase 1's `importService`, not in the schema.
- Scoring rules live in `backend/src/rules/` (Phase 1) — not hardcoded anywhere in Phase 0.

When column names and scoring logic change, only the Phase 1 service layer needs updating.
