# Lava Decision Risk — Architecture & Handoff Doc

Status: **Phase 0 scaffolding in progress** (as of 2026-07-08).
This doc is the source of truth for anyone picking up this repo cold — it explains what this app is, why it's structured the way it is, what's built, and what isn't yet.

---

## 1. What this is

A production decision-intelligence platform for Lava's service network. It replaces a throwaway prototype:
- `app.py` (this repo, root) — a single-file Streamlit prototype. It's the reference implementation of the scoring rules — **treat it as the spec for rule logic, not as code to extend.**
- A static HTML mockup (`Lava_Decision_Risk_Dashboard.html`, held separately) — reference for the intended dashboard UX (Executive/Regional/Dealer/Technician views, coaching scripts, drill-downs).

The app ingests monthly service-center CSV/XLSX data, runs deterministic scoring rules against it, and surfaces risk dashboards + a hit-list of workorders needing audit, scoped by role (MD → Regional Head → BUSM/ASM → Dealer/ASP).

---

## 2. Relationship to the ZenLearn platform

This is **its own git repo**, living as a sibling folder to `PathwaysBackend/`, `PathwaysFrontend/`, and `Micro/` inside the `Antigravity Workspace` directory — not a fork, not a package inside another repo.

**Why a separate repo, not a monorepo package:** An earlier architecture proposal suggested a `zenlearn/apps/*, /packages/*` true monorepo with shared `@zenlearn/*` packages. Investigation of the actual codebase found that doesn't reflect reality: `PathwaysBackend`, `PathwaysFrontend`, and `Micro` are three **independent git repos** with no root `.git`, no root `package.json`, and no workspace tooling connecting them (`PathwaysBackend/pnpm-workspace.yaml` even references a `frontend` package that doesn't exist on disk — it's vestigial). Building a real shared-package monorepo would mean migrating all four apps at once — a much bigger, separate initiative than standing up Lava. So Lava follows the pattern ZenLearn *already* uses: independently deployable apps, shared conventions, shared auth — not shared workspace tooling.

**What "shared platform" means concretely here:**
| Shared how | Mechanism |
|---|---|
| Authentication | Same `JWT_SECRET` env var as PathwaysBackend. A user who logs into ZenLearn gets a JWT that Lava's backend also accepts — no separate login. |
| Logging conventions | `backend/src/configs/logger.config.ts` is copied from `PathwaysBackend/backend/src/configs/logger.config.ts` (Winston, JSON in prod / colorized in dev). Keep in sync manually if the source changes. |
| JWT verify logic | `backend/src/configs/jwt.config.ts` copied+adapted from PathwaysBackend's version (same `JWTConfig.validate` shape), but decoupled from ZenLearn's Prisma `User` type since Lava doesn't have (or need) that model. |
| RBAC pattern | Same shape as `PathwaysBackend/backend/src/middlewares/role.middleware.ts` (role-check middleware pattern), but Lava's own roles/hierarchy live in Lava's Postgres — ZenLearn's `role.middleware.ts` is hard-coupled to its Mongo `department` model and isn't portable. |
| Env var access | Same `getEnvVar()` pattern (never `process.env.X!`) — see `helpers/env.ts`. |

**Not shared (deliberately):** database (Postgres here vs. Mongo in PathwaysBackend — the data here is relational/hierarchical, a better fit for Postgres), Prisma client, workspace/build tooling, npm packages. If a third ZenLearn customer app appears later, revisit extracting `@zenlearn/logger`, `@zenlearn/auth` etc. into real shared packages under a proper workspace — not worth doing for two apps.

---

## 3. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Backend | Node.js, Express, TypeScript, Prisma | Matches PathwaysBackend exactly — one language across the whole platform, no Python/Node split to operate. |
| Database | PostgreSQL | Data model here (dealers → regions → service centers → technicians → work orders, hierarchical role-scoped reporting) is relational — a better fit than Mongo. |
| Cache/queue | Redis (optional at MVP) | Sessions + dashboard cache; background job queue (BullMQ) deferred until import volume actually needs it. |
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind | Matches PathwaysFrontend/Micro conventions. |
| Rule engine | Plain TypeScript | Scoring is deterministic (three independent penalty rules, see §5) — no ML, so no justification for a separate Python/FastAPI service. |

---

## 4. Repo structure

```
Lava-decision-risk-dashboard/
├── ARCHITECTURE.md              # this file
├── app.py                       # legacy Streamlit prototype — reference only, do not extend
├── requirements.txt              # legacy prototype deps
├── backend/                     # Node.js, Express, TypeScript, Prisma (Postgres)
│   ├── prisma/
│   │   └── schema.prisma        # datasource: postgresql
│   ├── src/
│   │   ├── configs/             # postgres.config.ts, redis.config.ts, jwt.config.ts, logger.config.ts
│   │   ├── controllers/         # import, dashboard, audit
│   │   ├── middlewares/         # auth.middleware.ts, rbac.middleware.ts
│   │   ├── routes/              # mounted under /api/v1
│   │   ├── rules/               # repeatImei.rule.ts, suspiciousPhone.rule.ts, processBreakdown.rule.ts, engine.ts
│   │   ├── schemas/              # Zod schemas, .strict()
│   │   ├── services/            # importService, scoringService, dashboardCacheService
│   │   ├── helpers/             # env.ts (getEnvVar)
│   │   └── types/
│   ├── index.ts
│   ├── docker-compose.yml       # postgres + redis, local dev
│   └── package.json
├── frontend/                     # Next.js 15 App Router, TypeScript
│   └── middleware.ts             # same cookie-gate pattern as Micro/middleware.ts
└── SECURITY.md                  # mirrors PathwaysBackend/SECURITY.md
```

---

## 5. Rule engine (the core business logic)

Ported from `app.py`, which is the authoritative spec. Each rule is independent and returns `{ score, evidence, severity, recommendation }`; the engine aggregates them per work order.

| Rule | Trigger | Penalty | Maps to |
|---|---|---|---|
| `RepeatImeiRule` | Same IMEI appears >1× in the dataset | −20 | Skill score |
| `SuspiciousPhoneRule` | Same customer phone number appears >2× | −30 | Audit score |
| `ProcessBreakdownRule` | Final NPS rating in `{No Response, 1, 2, 3}` | −15 | Process score |

All three scores start at a 100 baseline, clipped at 0. `Total_Anomalies` = count of triggered flags per record; records with ≥2 anomalies are the "hit list" surfaced for audit. **This math must stay identical to `app.py`** — stakeholders have already seen this exact scoring in the HTML dashboard mock, so silently changing the thresholds/penalties would break continuity with what's been presented.

---

## 6. Data model (Postgres, via Prisma)

Core tables (each foreign key `@@index`ed, per ZenLearn convention): `roles`, `dealers`, `regions`, `service_centers` (ASPs), `technicians`, `work_orders`, `risk_flags`, `judgement_scores` (Skill/Audit/Process), `monthly_imports`, `dashboard_cache`, `audit_logs`.

No local `users` table for MVP — user identity comes from the shared JWT (ZenLearn is the source of truth for who a user is; Lava only needs role/org claims from the token).

Deferred: `training_assignments`, `training_results` — don't model until the ZenLearn training integration is actually being built (Phase 3).

---

## 7. Import pipeline (MVP — synchronous)

```
CSV/XLSX upload → Zod validation → reject invalid rows → normalize
→ staging table → run rule engine → persist judgement_scores + risk_flags
→ refresh dashboard_cache → respond
```

Synchronous for now — the prototype already processes in-request and monthly files are small. Add a BullMQ/Redis queue only once import volume actually causes latency (Phase 4), not preemptively.

---

## 8. API (versioned from day one)

```
POST /api/v1/imports
GET  /api/v1/dashboard/executive
GET  /api/v1/dashboard/region/:id
GET  /api/v1/dashboard/dealer/:id
GET  /api/v1/dashboard/technician/:id
GET  /api/v1/audit
GET  /api/v1/health
```
Training endpoints (`/training/*`) deferred to Phase 3.

---

## 9. RBAC roles

`Admin, MD, Service Head, Regional Head, BUSM, ASM, Dealer, ASP, Trainer` — hierarchical, server-enforced (never rely on hidden frontend controls, per ZenLearn security convention in root `CLAUDE.md`).

---

## 10. Build phases

| Phase | Scope | Status |
|---|---|---|
| **0** | Repo skeleton, docker-compose (Postgres+Redis), Prisma schema (core tables), `/health` endpoint, auth middleware verifying shared `JWT_SECRET`, empty Next.js frontend shell with cookie-gate middleware | 🔨 in progress |
| **1** | Import pipeline + rule engine (TS port of `app.py`), CSV upload UI | not started |
| **2** | Dashboards (Executive/Regional/Dealer/Technician) matching the HTML prototype's views, real API + Recharts/AG Grid | not started |
| **3** | RBAC hierarchy enforcement per role, real audit logging, training-assignment hooks into ZenLearn | not started |
| **4** | BullMQ background jobs for import at scale, monitoring/alerting | not started |

**Rule for future work:** don't jump ahead of the current phase (e.g. don't build BullMQ queues or training-sync in Phase 0/1) — each phase should be fully working and verified before starting the next.

---

## 11. How to verify Phase 0 is done

- `cd backend && npx tsc --noEmit` passes.
- `docker-compose up` brings up Postgres + Redis; `npx prisma db push` succeeds against it.
- `GET /api/v1/health` returns 200.
- A JWT issued by PathwaysBackend's login (same `JWT_SECRET`) is accepted by this repo's `auth.middleware.ts` — proves the shared-auth approach actually works, not just in theory.
- `cd frontend && npm run dev` loads without errors; hitting a protected route without a `token` cookie redirects (same as `Micro/middleware.ts`).

---

## 12. Key decisions log

- **2026-07-08** — Rejected the proposed `zenlearn/apps/*, /packages/*` true monorepo migration; ZenLearn's existing apps are already separate repos, so Lava follows that same pattern instead of forcing a bigger migration. See §2.
- **2026-07-08** — Rejected FastAPI/Python for the rule engine; scoring is deterministic (see §5), so plain TypeScript keeps the whole platform single-language.
- **2026-07-08** — Postgres chosen over Mongo for this app specifically, due to the relational/hierarchical access model — this does not imply migrating other ZenLearn apps off Mongo.
