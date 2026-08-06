# Lava RBAC Data-Scoping + Embedded Training Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give BUSM/ASM/ASP + HQ users role-scoped access to the Lava dashboard (each sees only their own hierarchy) and bring ZenLearn-authored training into Lava as a first-class section with weekly auto-assignment and completion tracking — all behind a single ZenLearn login.

**Architecture:** ZenLearn PathwaysBackend stays the single identity provider and LMS engine. It already signs the shared-secret JWT that Lava verifies; this plan adds a `lava_role` + `lava_scope` claim to that JWT, then makes Lava's dashboard **derive its data filter from the scope claim server-side** (never from client input) so no user can see another's numbers. Training content is authored in ZenLearn's existing CMS; a weekly cron auto-assigns the week's programme per cohort, and Lava surfaces completion as a scoped dashboard column plus a Training section — Lava never renders ZenLearn's own UI, it calls ZenLearn APIs over the internal Docker network.

**Tech Stack:** Lava — Express + TypeScript + Prisma (PostgreSQL) + Vitest; Next.js (App Router) frontend on Vercel. ZenLearn PathwaysBackend — Express + TypeScript + Prisma (MongoDB) + node-cron + Vitest.

## Global Constraints

- **Never edit files on the servers** (`api-m.zenlearn.ai`, `lava-api.zenlearn.ai`). All changes land in the local Git repos; Rohit pulls and builds.
- **No `console.*`** in any `.ts` file — use the Winston logger (`logger.config.ts`) in each repo.
- **`getEnvVar('X')`** for every env var read — never `process.env.X!`.
- **Zod `.strict()`** on every new POST/PUT/PATCH body schema — never `.passthrough()`.
- **Per-route rate limiters** on any new public endpoint that hits the DB or an upstream service.
- **JWT signing stays HS256 with the shared `JWT_SECRET`** for this plan (RS256/JWKS is a documented follow-on, out of scope). Both backends already read the same `JWT_SECRET` via `getEnvVar`.
- **Scope is authority, query is hint:** for any non-admin role, the effective data filter is derived from `req.user.lava_scope` on the server. Client-supplied `busmName`/`asmName` query params are ignored for non-admins (IDOR prevention).
- **TDD:** every task writes a failing test first, then the minimal code, then commits. Run `npx tsc --noEmit` in the touched backend before each commit.
- Lava roles (existing enum, `backend/src/middlewares/rbac.middleware.ts`): `Admin | MD | ServiceHead | RegionalHead | BUSM | ASM | Dealer | ASP | Trainer`.

---

## File Structure

**ZenLearn PathwaysBackend (`PathwaysBackend/backend/`)**
- `prisma/schema.prisma` — add `lava_role`, `lava_scope` to `model User`; add `LavaAssignmentRule` model.
- `src/configs/jwt.config.ts` — include `lava_role` + `lava_scope` in the signed payload.
- `src/scripts/provisionLavaUsers.ts` — **new** — bulk-create net-new BUSM/ASM/ASP users from a hierarchy JSON.
- `src/jobs/scheduler.ts` — add the weekly Monday auto-assign cron (reads from `LavaAssignmentRule` table, not hardcoded config).
- `src/controllers/lavaTraining.controller.ts` — **new** — training-status API (scoped by hierarchy), assignment-rules CRUD API, and admin manual-assign endpoint.
- `src/routes/lavaTraining.routes.ts` — **new** — mounts all `/lava-training/*` endpoints.

**Lava backend (`Lava-decision-risk-dashboard/backend/`)**
- `src/types/express.d.ts` — add `lava_scope` to `LavaAuthenticatedUser`.
- `src/middlewares/auth.middleware.ts` — read `lava_scope` off the JWT payload onto `req.user`.
- `src/helpers/scope.ts` — **new** — `deriveScopeFilter(user)` → the authoritative `{ busmName, asmName }`.
- `src/middlewares/rbac.middleware.ts` — replace the pass-through with real role checks.
- `src/controllers/dashboard.controller.ts` — apply the derived scope filter + namespace the cache key by scope.
- `src/routes/dashboard.routes.ts` — re-enable the Dealer/ASP dealer route behind an ownership check.
- `src/routes/auth.routes.ts` — add `GET /me` returning the caller's role + scope for the frontend.
- `src/services/lavaTraining.service.ts` — **new** — proxy + roll up ZenLearn training-status by scope.
- `src/routes/dashboard.routes.ts` — mount `GET /training-status`.

**Lava frontend (`Lava-decision-risk-dashboard/frontend/`)**
- `app/page.tsx` — fetch `/api/v1/auth/me`, gate tabs/rows by role.
- `components/Sidebar.tsx` — add 2 training nav items (`training`, `training-rules`); hide items out of role scope.
- `components/TabTraining.tsx` — **new** — Tab 1: compliance view (per-user assigned/completed/%).
- `components/TabTrainingRules.tsx` — **new** — Tab 2: admin-only assignment rules CRUD + manual-assign form.
- `components/TabOrgKPIs.tsx` — add a Training Compliance column sourced from `/training-status`.

---

## Phasing (each phase is independently shippable)

| Phase | Tasks | Ships |
|-------|-------|-------|
| 1 — JWT scope claim + provisioning | 1–3 | ZenLearn tokens carry role+scope; net-new users exist |
| 2 — Server-side scoping + real RBAC | 4–8 | Dashboard shows each user only their hierarchy |
| 3 — Training loop | 9–13 | Weekly auto-assign + Training section + compliance column |

Phase 1 must merge before Phase 2 (scoping reads the claim). Phase 3 depends on Phase 1's provisioning but is otherwise independent of Phase 2.

---

## Phase 1 — JWT scope claim + user provisioning (ZenLearn)

### Task 1: Add `lava_role` + `lava_scope` to the ZenLearn User model

**Files:**
- Modify: `PathwaysBackend/backend/prisma/schema.prisma` (`model User`, ~line 268–326)

**Interfaces:**
- Produces: `User.lava_role: String?`, `User.lava_scope: Json?` — read by Task 2 (JWT) and Task 3 (provisioning). `lava_scope` shape: `{ busmName?: string, asmName?: string, serviceCentreId?: string, aspName?: string }`.

- [ ] **Step 1: Add the two fields**

In `model User`, after the existing `role String?` line (~line 300), add:

```prisma
  lava_role                 String?
  lava_scope                Json?
```

- [ ] **Step 2: Add an index for lookup by lava_role**

In the `@@index` block at the end of `model User` (~line 322–325), add:

```prisma
  @@index([lava_role])
```

- [ ] **Step 3: Push the schema to Mongo**

Run: `cd PathwaysBackend/backend && npx prisma generate && npx prisma db push`
Expected: `Your database is now in sync with your Prisma schema.` and a regenerated client with `lava_role`/`lava_scope` on the `User` type.

- [ ] **Step 4: Commit**

```bash
git add PathwaysBackend/backend/prisma/schema.prisma
git commit -m "feat(zenlearn): add lava_role + lava_scope to User for Lava RBAC

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Include `lava_role` + `lava_scope` in every signed JWT

**Files:**
- Modify: `PathwaysBackend/backend/src/configs/jwt.config.ts:33-44` (`JWTConfig.generate`)
- Test: `PathwaysBackend/backend/src/configs/__tests__/jwt.config.test.ts`

**Interfaces:**
- Consumes: `User.lava_role`, `User.lava_scope` (Task 1).
- Produces: JWTs whose payload includes `lava_role` and `lava_scope`. Every sign-in / refresh path calls `generate()` (auth.controller.ts:331,442,521), so this one change covers all of them. Lava's `auth.middleware.ts` (Task 4) reads these claims.

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import JWT from 'jsonwebtoken';
import { JWTConfig } from '../jwt.config';

vi.mock('../../helpers/env', () => ({ getEnvVar: () => 'test-secret' }));

describe('JWTConfig.generate — lava claims', () => {
  it('includes lava_role and lava_scope in the payload', () => {
    const user: any = {
      id: 'u1', is_admin: false, is_super_admin: false,
      is_department_manager: false, organization_id: 'o1',
      lava_role: 'ASM', lava_scope: { asmName: 'Ramesh K' },
    };
    const token = JWTConfig.generate(user, '7d');
    const decoded = JWT.verify(token, 'test-secret') as any;
    expect(decoded.lava_role).toBe('ASM');
    expect(decoded.lava_scope).toEqual({ asmName: 'Ramesh K' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd PathwaysBackend/backend && npx vitest run src/configs/__tests__/jwt.config.test.ts`
Expected: FAIL — `decoded.lava_role` is `undefined`.

- [ ] **Step 3: Add the claims to the payload**

In `JWTConfig.generate`, extend the `payload` object:

```typescript
    const payload = {
      id: user.id,
      role,
      is_admin: user.is_admin,
      is_super_admin: user.is_super_admin,
      is_department_manager: user.is_department_manager,
      organization_id: user.organization_id,
      lava_role: (user as any).lava_role ?? undefined,
      lava_scope: (user as any).lava_scope ?? undefined,
    };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd PathwaysBackend/backend && npx vitest run src/configs/__tests__/jwt.config.test.ts && npx tsc --noEmit`
Expected: PASS, no type errors.

- [ ] **Step 5: Commit**

```bash
git add PathwaysBackend/backend/src/configs/jwt.config.ts PathwaysBackend/backend/src/configs/__tests__/jwt.config.test.ts
git commit -m "feat(zenlearn): carry lava_role + lava_scope in signed JWT

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Bulk-provision net-new BUSM/ASM/ASP users

**Files:**
- Create: `PathwaysBackend/backend/src/scripts/provisionLavaUsers.ts`
- Create (input, git-ignored): `PathwaysBackend/backend/lava-hierarchy.json`
- Test: `PathwaysBackend/backend/src/scripts/__tests__/provisionLavaUsers.test.ts`

**Interfaces:**
- Consumes: `User.lava_role`, `User.lava_scope` (Task 1). The hierarchy JSON is exported from Lava (see Step 1) so names match the dashboard exactly.
- Produces: ZenLearn `User` rows, one per BUSM/ASM/ASP, each with `email`, a random `hashed_password`, `role: 'user'`, `lava_role`, and `lava_scope`. Idempotent by email (upsert). Emits a CSV of `email,tempPassword` for first-login distribution.

- [ ] **Step 1: Produce the hierarchy input from Lava**

The exact BUSM→ASM→ASP tree already exists in Lava's dashboard payload (`getFullDashboardData().hier`). Export it once:

```bash
cd Lava-decision-risk-dashboard && docker compose exec lava-api node -e "
  require('ts-node/register');
  const { getFullDashboardData } = require('./src/services/dashboard.service');
  getFullDashboardData().then(d => { console.log(JSON.stringify(d.hier)); process.exit(0); });
" > ../PathwaysBackend/backend/lava-hierarchy.json
```

`hier` shape: `{ [busmName]: { [asmName]: string[] /* aspNames */ } }`. Add `lava-hierarchy.json` to `PathwaysBackend/backend/.gitignore`.

- [ ] **Step 2: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { buildLavaUserRows } from '../provisionLavaUsers';

describe('buildLavaUserRows', () => {
  const hier = { 'Sukhbir Singh': { 'Ramesh K': ['SHAHID COMMUNICATION'] } };

  it('creates one row per BUSM, ASM, and ASP with correct role + scope', () => {
    const rows = buildLavaUserRows(hier, 'lava.local');
    const busm = rows.find(r => r.lava_role === 'BUSM');
    const asm = rows.find(r => r.lava_role === 'ASM');
    const asp = rows.find(r => r.lava_role === 'ASP');
    expect(busm?.lava_scope).toEqual({ busmName: 'Sukhbir Singh' });
    expect(asm?.lava_scope).toEqual({ busmName: 'Sukhbir Singh', asmName: 'Ramesh K' });
    expect(asp?.lava_scope).toEqual({ busmName: 'Sukhbir Singh', asmName: 'Ramesh K', aspName: 'SHAHID COMMUNICATION' });
    expect(rows).toHaveLength(3);
  });

  it('generates deterministic, unique emails on the given domain', () => {
    const rows = buildLavaUserRows(hier, 'lava.local');
    const emails = rows.map(r => r.email);
    expect(new Set(emails).size).toBe(emails.length);
    expect(emails.every(e => e.endsWith('@lava.local'))).toBe(true);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd PathwaysBackend/backend && npx vitest run src/scripts/__tests__/provisionLavaUsers.test.ts`
Expected: FAIL — `buildLavaUserRows` not exported.

- [ ] **Step 4: Implement the builder + runner**

```typescript
import fs from 'fs';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '../configs/prisma.config';
import logger from '../configs/logger.config';

export type Hier = Record<string, Record<string, string[]>>;

export interface LavaUserRow {
  email: string;
  first_name: string;
  last_name: string;
  lava_role: 'BUSM' | 'ASM' | 'ASP';
  lava_scope: Record<string, string>;
  tempPassword: string;
}

/** Slugify a display name into an email local-part; suffix keeps collisions apart. */
function emailFor(name: string, role: string, domain: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '');
  return `${slug}.${role.toLowerCase()}@${domain}`;
}

export function buildLavaUserRows(hier: Hier, domain: string): LavaUserRow[] {
  const rows: LavaUserRow[] = [];
  const seen = new Set<string>();

  const push = (name: string, role: LavaUserRow['lava_role'], scope: Record<string, string>) => {
    const email = emailFor(name, role, domain);
    if (seen.has(email)) return;
    seen.add(email);
    const [first, ...rest] = name.split(/\s+/);
    rows.push({
      email,
      first_name: first ?? name,
      last_name: rest.join(' ') || role,
      lava_role: role,
      lava_scope: scope,
      tempPassword: crypto.randomBytes(9).toString('base64url'),
    });
  };

  for (const busmName of Object.keys(hier)) {
    push(busmName, 'BUSM', { busmName });
    for (const asmName of Object.keys(hier[busmName] ?? {})) {
      push(asmName, 'ASM', { busmName, asmName });
      for (const aspName of hier[busmName]?.[asmName] ?? []) {
        push(aspName, 'ASP', { busmName, asmName, aspName });
      }
    }
  }
  return rows;
}

async function main() {
  const domain = process.argv[2] || 'lava.zenlearn.ai';
  const hier: Hier = JSON.parse(fs.readFileSync('lava-hierarchy.json', 'utf8'));
  const rows = buildLavaUserRows(hier, domain);

  const csvLines: string[] = ['email,tempPassword,lava_role'];
  for (const r of rows) {
    const hashed_password = await bcrypt.hash(r.tempPassword, 10);
    await prisma.user.upsert({
      where: { email: r.email },
      update: { lava_role: r.lava_role, lava_scope: r.lava_scope },
      create: {
        email: r.email,
        first_name: r.first_name,
        last_name: r.last_name,
        hashed_password,
        role: 'user',
        lava_role: r.lava_role,
        lava_scope: r.lava_scope,
        email_verified: true,
      },
    });
    csvLines.push(`${r.email},${r.tempPassword},${r.lava_role}`);
  }
  fs.writeFileSync('lava-user-credentials.csv', csvLines.join('\n'));
  logger.info(`Provisioned ${rows.length} Lava users; credentials written to lava-user-credentials.csv`);
}

// Only run when invoked directly, not when imported by tests.
if (require.main === module) {
  main().catch((e) => { logger.error('provisionLavaUsers failed', { error: e }); process.exit(1); })
        .finally(() => process.exit());
}
```

Add `lava-user-credentials.csv` to `.gitignore` (contains temp passwords — distribute out-of-band, never commit).

- [ ] **Step 5: Run test to verify it passes**

Run: `cd PathwaysBackend/backend && npx vitest run src/scripts/__tests__/provisionLavaUsers.test.ts && npx tsc --noEmit`
Expected: PASS, no type errors. (Do NOT run the live `main()` yet — that writes to Mongo; Rohit runs it against the real DB when ready.)

- [ ] **Step 6: Commit**

```bash
git add PathwaysBackend/backend/src/scripts/provisionLavaUsers.ts PathwaysBackend/backend/src/scripts/__tests__/provisionLavaUsers.test.ts PathwaysBackend/backend/.gitignore
git commit -m "feat(zenlearn): bulk provisioning script for net-new Lava BUSM/ASM/ASP users

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Phase 2 — Server-side data scoping + real RBAC (Lava)

### Task 4: Read `lava_scope` off the JWT onto `req.user`

**Files:**
- Modify: `Lava-decision-risk-dashboard/backend/src/types/express.d.ts` (`interface LavaAuthenticatedUser`, ~line 16–33)
- Modify: `Lava-decision-risk-dashboard/backend/src/middlewares/auth.middleware.ts:61-73`
- Test: `Lava-decision-risk-dashboard/backend/src/middlewares/__tests__/auth.middleware.test.ts`

**Interfaces:**
- Consumes: JWT payload with `lava_scope` (Task 2).
- Produces: `req.user.lava_scope?: { busmName?: string; asmName?: string; serviceCentreId?: string; aspName?: string }` — read by Tasks 5–7.

- [ ] **Step 1: Add the type**

In `express.d.ts`, inside `interface LavaAuthenticatedUser`, after `lava_role?: string;`:

```typescript
	lava_scope?: {
		busmName?: string;
		asmName?: string;
		serviceCentreId?: string;
		aspName?: string;
	};
```

- [ ] **Step 2: Write the failing test**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { AuthMiddleware } from '../auth.middleware';
import { JWTConfig } from '../../configs/jwt.config';

describe('authMiddleware — lava_scope', () => {
  it('populates req.user.lava_scope from the token payload', async () => {
    vi.spyOn(JWTConfig, 'validate').mockReturnValue({
      id: 'u1', lava_role: 'ASM', lava_scope: { asmName: 'Ramesh K', busmName: 'Sukhbir Singh' },
    } as any);
    const req: any = { cookies: { token: 'x' }, headers: {} };
    const res: any = { status: () => res, json: () => res };
    const next = vi.fn();
    await AuthMiddleware.authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.lava_scope).toEqual({ asmName: 'Ramesh K', busmName: 'Sukhbir Singh' });
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd Lava-decision-risk-dashboard/backend && npx vitest run src/middlewares/__tests__/auth.middleware.test.ts`
Expected: FAIL — `req.user.lava_scope` is `undefined`.

- [ ] **Step 4: Read the claim in the middleware**

In `auth.middleware.ts`, inside the `req.user = { ... }` assignment, after the `lava_role` line:

```typescript
				lava_scope: payload['lava_scope'] as {
					busmName?: string; asmName?: string; serviceCentreId?: string; aspName?: string;
				} | undefined,
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd Lava-decision-risk-dashboard/backend && npx vitest run src/middlewares/__tests__/auth.middleware.test.ts && npx tsc --noEmit`
Expected: PASS, no type errors.

- [ ] **Step 6: Commit**

```bash
git add Lava-decision-risk-dashboard/backend/src/types/express.d.ts Lava-decision-risk-dashboard/backend/src/middlewares/auth.middleware.ts Lava-decision-risk-dashboard/backend/src/middlewares/__tests__/auth.middleware.test.ts
git commit -m "feat(lava): read lava_scope claim onto req.user

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: `deriveScopeFilter` — the authoritative data filter

**Files:**
- Create: `Lava-decision-risk-dashboard/backend/src/helpers/scope.ts`
- Test: `Lava-decision-risk-dashboard/backend/src/helpers/__tests__/scope.test.ts`

**Interfaces:**
- Consumes: `req.user` (`LavaAuthenticatedUser`).
- Produces: `deriveScopeFilter(user, requested): { busmName: string; asmName: string; aspName?: string }`. This is the single point of truth for "what data may this caller see." Admin-tier roles honour the `requested` filter; scoped roles ignore it and return their own scope. Consumed by Tasks 6 and 7.

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { deriveScopeFilter, isAdminTier } from '../scope';

describe('deriveScopeFilter', () => {
  const requested = { busmName: 'Someone Else', asmName: 'Another ASM' };

  it('admin/super-admin honours the requested filter', () => {
    const u: any = { is_super_admin: true };
    expect(deriveScopeFilter(u, requested)).toEqual({ busmName: 'Someone Else', asmName: 'Another ASM' });
  });

  it('BUSM is forced to their own busmName, asmName free within it', () => {
    const u: any = { lava_role: 'BUSM', lava_scope: { busmName: 'Sukhbir Singh' } };
    expect(deriveScopeFilter(u, { busmName: 'Hacker', asmName: 'Ramesh K' }))
      .toEqual({ busmName: 'Sukhbir Singh', asmName: 'Ramesh K' });
  });

  it('ASM is forced to their own busmName AND asmName regardless of request', () => {
    const u: any = { lava_role: 'ASM', lava_scope: { busmName: 'Sukhbir Singh', asmName: 'Ramesh K' } };
    expect(deriveScopeFilter(u, requested))
      .toEqual({ busmName: 'Sukhbir Singh', asmName: 'Ramesh K' });
  });

  it('ASP is forced to their own aspName', () => {
    const u: any = { lava_role: 'ASP', lava_scope: { busmName: 'B', asmName: 'A', aspName: 'SHAHID COMMUNICATION' } };
    expect(deriveScopeFilter(u, requested))
      .toEqual({ busmName: 'B', asmName: 'A', aspName: 'SHAHID COMMUNICATION' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Lava-decision-risk-dashboard/backend && npx vitest run src/helpers/__tests__/scope.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```typescript
import type { Request } from 'express';

type ReqUser = Request['user'];

export interface ScopeFilter {
  busmName: string;
  asmName: string;
  aspName?: string;
}

/** HQ tiers see everything; the row-click filter they pass is honoured verbatim. */
export function isAdminTier(user: ReqUser): boolean {
  if (!user) return false;
  if (user.is_super_admin || user.is_admin || user.is_department_manager) return true;
  return ['Admin', 'MD', 'ServiceHead', 'RegionalHead'].includes(user.lava_role ?? '');
}

/**
 * The ONE place that decides which slice of the org a caller may read.
 * Admin tiers honour `requested`. Scoped roles ignore `requested` entirely and
 * return their own scope — this is what prevents a BUSM/ASM/ASP from reading
 * another's numbers by tampering with the query string (IDOR).
 */
export function deriveScopeFilter(
  user: ReqUser,
  requested: { busmName?: string; asmName?: string },
): ScopeFilter {
  if (isAdminTier(user)) {
    return { busmName: requested.busmName || 'All', asmName: requested.asmName || 'All' };
  }
  const scope = user?.lava_scope ?? {};
  const role = user?.lava_role;

  if (role === 'BUSM' && scope.busmName) {
    // Locked to their BUSM; may drill into any ASM under it via the request.
    return { busmName: scope.busmName, asmName: requested.asmName || 'All' };
  }
  if (role === 'ASM' && scope.asmName) {
    return { busmName: scope.busmName || 'All', asmName: scope.asmName };
  }
  if ((role === 'ASP' || role === 'Dealer') && scope.aspName) {
    return { busmName: scope.busmName || 'All', asmName: scope.asmName || 'All', aspName: scope.aspName };
  }
  // Unknown/unscoped role → most restrictive: nothing.
  return { busmName: '__none__', asmName: '__none__' };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Lava-decision-risk-dashboard/backend && npx vitest run src/helpers/__tests__/scope.test.ts && npx tsc --noEmit`
Expected: PASS, no type errors.

- [ ] **Step 5: Commit**

```bash
git add Lava-decision-risk-dashboard/backend/src/helpers/scope.ts Lava-decision-risk-dashboard/backend/src/helpers/__tests__/scope.test.ts
git commit -m "feat(lava): deriveScopeFilter — server-authoritative data scope (IDOR guard)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: Apply the scope filter in dashboard controllers + namespace the cache

**Files:**
- Modify: `Lava-decision-risk-dashboard/backend/src/controllers/dashboard.controller.ts` (`getExecutiveDashboardHandler` ~14–63, `getFullDashboardDataHandler` ~122–169)
- Test: `Lava-decision-risk-dashboard/backend/src/controllers/__tests__/dashboard.controller.scope.test.ts`

**Interfaces:**
- Consumes: `deriveScopeFilter` (Task 5). The dashboard service already accepts `{ busmName, asmName }` (see `getExecutiveDashboard`/`getFullDashboardData` signatures) — no service change needed.
- Produces: responses filtered to the caller's scope; cache keys namespaced by the effective scope so a BUSM's cached payload can never be served to another user.

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect, vi } from 'vitest';
import * as svc from '../../services/dashboard.service';
import * as cache from '../../services/cache.service';
import { getFullDashboardDataHandler } from '../dashboard.controller';

describe('getFullDashboardDataHandler — scoping', () => {
  it('ignores a tampered query param for an ASM and uses their scope', async () => {
    vi.spyOn(cache, 'getCachedDashboard').mockResolvedValue(null);
    vi.spyOn(cache, 'setCachedDashboard').mockResolvedValue(undefined as any);
    const spy = vi.spyOn(svc, 'getFullDashboardData').mockResolvedValue({ summary: { importId: 'i' } } as any);

    const req: any = {
      query: { busmName: 'Someone Else', asmName: 'Another ASM' },
      user: { lava_role: 'ASM', lava_scope: { busmName: 'Sukhbir Singh', asmName: 'Ramesh K' } },
    };
    const res: any = { success: vi.fn(), error: vi.fn() };
    await getFullDashboardDataHandler(req, res);

    expect(spy).toHaveBeenCalledWith({ busmName: 'Sukhbir Singh', asmName: 'Ramesh K' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Lava-decision-risk-dashboard/backend && npx vitest run src/controllers/__tests__/dashboard.controller.scope.test.ts`
Expected: FAIL — handler currently passes `'Someone Else'` from the query straight through.

- [ ] **Step 3: Wire the scope filter into both handlers**

At the top of `dashboard.controller.ts`, add:

```typescript
import { deriveScopeFilter } from '../helpers/scope';
```

In `getFullDashboardDataHandler`, replace the first two lines of the function body:

```typescript
  const requested = {
    busmName: (req.query.busmName as string) || 'All',
    asmName: (req.query.asmName as string) || 'All',
  };
  const scoped = deriveScopeFilter(req.user, requested);
  const busmName = scoped.busmName;
  const asmName = scoped.asmName;
```

Leave the existing `cacheKey`, service call `getFullDashboardData({ busmName, asmName })`, and response code unchanged — they now operate on the scoped values, and the cache key already interpolates `busmName`/`asmName` so it is namespaced automatically. Apply the identical replacement in `getExecutiveDashboardHandler`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Lava-decision-risk-dashboard/backend && npx vitest run src/controllers/__tests__/dashboard.controller.scope.test.ts && npx tsc --noEmit`
Expected: PASS, no type errors.

- [ ] **Step 5: Commit**

```bash
git add Lava-decision-risk-dashboard/backend/src/controllers/dashboard.controller.ts Lava-decision-risk-dashboard/backend/src/controllers/__tests__/dashboard.controller.scope.test.ts
git commit -m "feat(lava): scope executive + full-data dashboards to caller's hierarchy

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7: Real RBAC + re-enable the Dealer/ASP route behind an ownership check

**Files:**
- Modify: `Lava-decision-risk-dashboard/backend/src/middlewares/rbac.middleware.ts:34-106`
- Modify: `Lava-decision-risk-dashboard/backend/src/routes/dashboard.routes.ts:54-58`
- Modify: `Lava-decision-risk-dashboard/backend/src/controllers/dashboard.controller.ts` (`getDealerDashboardHandler` ~70–115)
- Test: `Lava-decision-risk-dashboard/backend/src/middlewares/__tests__/rbac.middleware.test.ts`

**Interfaces:**
- Consumes: `req.user.lava_role`, `req.user.lava_scope`, `isAdminTier` (Task 5).
- Produces: `requireAnyLavaRole` that actually denies out-of-set roles (the current version passes any authenticated user via the `Boolean(req.user?.id)` catch-all). The dealer route verifies `req.user.lava_scope.aspName === :aspName` for scoped roles.

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { requireAnyLavaRole } from '../rbac.middleware';

describe('requireAnyLavaRole — real enforcement', () => {
  it('denies an authenticated ASP requesting an executive-only route', () => {
    const mw = requireAnyLavaRole(['Admin', 'MD', 'ServiceHead', 'RegionalHead', 'BUSM', 'ASM']);
    const req: any = { user: { id: 'u1', lava_role: 'ASP', email: 'x@lava.zenlearn.ai' } };
    const res: any = { status: vi.fn(() => res), json: vi.fn(() => res) };
    const next = vi.fn();
    mw(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('allows a BUSM into an executive route', () => {
    const mw = requireAnyLavaRole(['BUSM', 'ASM']);
    const req: any = { user: { id: 'u2', lava_role: 'BUSM', email: 'b@lava.zenlearn.ai' } };
    const res: any = { status: vi.fn(() => res), json: vi.fn(() => res) };
    const next = vi.fn();
    mw(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Lava-decision-risk-dashboard/backend && npx vitest run src/middlewares/__tests__/rbac.middleware.test.ts`
Expected: FAIL on the first case — the ASP is currently allowed by the `Boolean(req.user?.id)` catch-all and the `@lava.zenlearn.ai` email bypass.

- [ ] **Step 3: Rewrite the two guards to enforce roles**

Replace the bodies of `requireLavaRole` and `requireAnyLavaRole` so the decision is role-based only. Import the admin-tier check:

```typescript
import { isAdminTier } from '../helpers/scope';
```

`requireAnyLavaRole`:

```typescript
export const requireAnyLavaRole = (roles: LavaRole[]): RequestHandler => {
	return (req, res, next) => {
		const user = req.user;
		const userRole = user?.lava_role as LavaRole | undefined;

		if (isAdminTier(user) || (userRole && roles.includes(userRole))) {
			next();
			return;
		}
		logger.warn('RBAC denied', {
			userId: user?.id, requiredRoles: roles, actualRole: userRole,
		});
		res.status(403).json({ message: 'Forbidden: insufficient role' });
	};
};
```

Apply the same shape to `requireLavaRole` (single role → `userRole === role`). Remove the email-domain bypass and the `Boolean(req.user?.id)` / `generalRole` catch-alls entirely — they defeat scoping.

- [ ] **Step 4: Re-enable the Dealer/ASP dealer route with an ownership check**

In `dashboard.routes.ts`, change the `/dealer/:aspName` route to also admit `Dealer`/`ASP`:

```typescript
dashboardRouter.get(
  '/dealer/:aspName',
  requireAnyLavaRole([...executiveRoles, 'Dealer', 'ASP']),
  asyncHandler(getDealerDashboardHandler)
);
```

In `getDealerDashboardHandler` (dashboard.controller.ts), immediately after `const aspName = aspNameRaw;`, add the ownership guard:

```typescript
  // Scoped ASP/Dealer accounts may only read their OWN service centre.
  const u = req.user;
  const scopedToOwnAsp = u?.lava_role === 'ASP' || u?.lava_role === 'Dealer';
  const { isAdminTier } = await import('../helpers/scope');
  if (scopedToOwnAsp && !isAdminTier(u) && u?.lava_scope?.aspName !== aspName) {
    res.error({ code: 403, message: 'Forbidden: you may only view your own service centre.' });
    return;
  }
```

BUSM/ASM reaching this route stay bounded because their dashboards are scoped in Task 6; the dealer route is a detail view an admin or the ASP themselves opens.

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd Lava-decision-risk-dashboard/backend && npx vitest run src/middlewares/__tests__/rbac.middleware.test.ts && npx tsc --noEmit`
Expected: PASS, no type errors.

- [ ] **Step 6: Commit**

```bash
git add Lava-decision-risk-dashboard/backend/src/middlewares/rbac.middleware.ts Lava-decision-risk-dashboard/backend/src/routes/dashboard.routes.ts Lava-decision-risk-dashboard/backend/src/controllers/dashboard.controller.ts Lava-decision-risk-dashboard/backend/src/middlewares/__tests__/rbac.middleware.test.ts
git commit -m "feat(lava): enforce RBAC roles; re-enable dealer route with ASP ownership check

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 8: `GET /auth/me` + frontend role gating

**Files:**
- Modify: `Lava-decision-risk-dashboard/backend/src/routes/auth.routes.ts` (add `/me`)
- Modify: `Lava-decision-risk-dashboard/frontend/app/page.tsx` (fetch `/me`, gate tabs)
- Modify: `Lava-decision-risk-dashboard/frontend/components/Sidebar.tsx` (hide out-of-scope items)
- Test: `Lava-decision-risk-dashboard/backend/src/routes/__tests__/authMe.test.ts`

**Interfaces:**
- Consumes: `req.user` (role + scope).
- Produces: `GET /api/v1/auth/me` → `{ id, name, email, lava_role, lava_scope, is_admin, is_super_admin }`. The frontend reads `lava_role` to decide which sidebar items and which scorecard rows to render.

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import authRouter from '../auth.routes';
import { AuthMiddleware } from '../../middlewares/auth.middleware';

describe('GET /me', () => {
  it('returns the caller role + scope', async () => {
    vi.spyOn(AuthMiddleware, 'authMiddleware').mockImplementation((req: any, _res, next) => {
      req.user = { id: 'u1', email: 'a@b.c', name: 'A', lava_role: 'ASM', lava_scope: { asmName: 'Ramesh K' } };
      next();
    });
    const app = express();
    app.use('/auth', authRouter);
    const r = await request(app).get('/auth/me');
    expect(r.status).toBe(200);
    expect(r.body.result.lava_role).toBe('ASM');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Lava-decision-risk-dashboard/backend && npx vitest run src/routes/__tests__/authMe.test.ts`
Expected: FAIL — 404, route not defined.

- [ ] **Step 3: Add the `/me` route**

In `auth.routes.ts`, before `export default authRouter;`:

```typescript
authRouter.get('/me', AuthMiddleware.authMiddleware, (req: Request, res: Response): void => {
	const u = req.user!;
	res.success({
		message: 'Current user',
		result: {
			id: u.id, name: u.name, email: u.email,
			lava_role: u.lava_role, lava_scope: u.lava_scope,
			is_admin: u.is_admin, is_super_admin: u.is_super_admin,
		},
	});
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Lava-decision-risk-dashboard/backend && npx vitest run src/routes/__tests__/authMe.test.ts && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 5: Gate the frontend by role**

In `app/page.tsx`, add role state and fetch it alongside the dashboard payload:

```typescript
  const [role, setRole] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetch('/api/v1/auth/me')
      .then((r) => r.json())
      .then((d) => setRole(d?.result?.lava_role))
      .catch(() => setRole(undefined));
  }, []);
```

Pass `role` to `<Sidebar role={role} .../>`. In `components/Sidebar.tsx`, filter the nav array so scoped roles don't see org-wide-only tabs (Executive KPIs, Part Exposure stay admin/BUSM+; Org KPIs, Score Card, Coaching, Training visible to all). Add to the nav item type `roles?: string[]` and filter:

```typescript
  const ADMIN_TIERS = ['Admin', 'MD', 'ServiceHead', 'RegionalHead'];
  const visibleItems = navItems.filter((it) =>
    !it.roles || !role || ADMIN_TIERS.includes(role) || it.roles.includes(role)
  );
```

Tag `exec` and `cost` items with `roles: [...ADMIN_TIERS, 'BUSM']`. Because the backend already scopes every payload (Task 6), hiding tabs is a UX nicety, not the security boundary — the server is the boundary.

- [ ] **Step 6: Commit**

```bash
git add Lava-decision-risk-dashboard/backend/src/routes/auth.routes.ts Lava-decision-risk-dashboard/backend/src/routes/__tests__/authMe.test.ts Lava-decision-risk-dashboard/frontend/app/page.tsx Lava-decision-risk-dashboard/frontend/components/Sidebar.tsx
git commit -m "feat(lava): /auth/me endpoint + role-gated sidebar

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Phase 3 — Training loop (ZenLearn assign + Lava surface)

### Task 9: `LavaAssignmentRule` model + CRUD API in ZenLearn

**Files:**
- Modify: `PathwaysBackend/backend/prisma/schema.prisma` (add `LavaAssignmentRule` model)
- Create: `PathwaysBackend/backend/src/controllers/lavaTraining.controller.ts` (rules CRUD + manual-assign handlers)
- Create: `PathwaysBackend/backend/src/routes/lavaTraining.routes.ts`
- Modify: `PathwaysBackend/backend/index.ts` (mount router)
- Test: `PathwaysBackend/backend/src/controllers/__tests__/lavaTraining.rules.test.ts`

**Interfaces:**
- Produces:
  - `LavaAssignmentRule` Prisma model with fields: `id`, `lava_role`, `programme_id`, `programme_title`, `is_active`, `created_by` (User id), `created_at`.
  - `GET /lava-training/rules` → `{ rules: LavaAssignmentRule[] }` — list active rules.
  - `POST /lava-training/rules` body `{ lava_role, programme_id, programme_title }` → created rule.
  - `DELETE /lava-training/rules/:id` → 204.
  - `POST /lava-training/assign` body `{ user_id, programme_id, duration_days? }` → admin manual-assign (creates `UserProgramAssignment`).
  Consumed by Task 10 (cron reads rules from DB), Task 11 (training-status), and Task 12 (Lava proxies these endpoints).

- [ ] **Step 1: Add the Prisma model**

In `schema.prisma`, after the `UserProgramAssignment` model, add:

```prisma
model LavaAssignmentRule {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  lava_role       String
  programme_id    String
  programme_title String
  is_active       Boolean  @default(true)
  created_by      String   @db.ObjectId
  created_at      DateTime @default(now())

  @@index([lava_role])
  @@index([is_active])
}
```

Run: `cd PathwaysBackend/backend && npx prisma generate && npx prisma db push`
Expected: `Your database is now in sync with your Prisma schema.`

- [ ] **Step 2: Write the failing test**

```typescript
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../configs/prisma.config', () => ({
  default: {
    lavaAssignmentRule: {
      findMany: vi.fn().mockResolvedValue([
        { id: 'r1', lava_role: 'ASM', programme_id: 'p1', programme_title: 'ASM Basics', is_active: true },
      ]),
      create: vi.fn().mockResolvedValue({ id: 'r2', lava_role: 'ASP', programme_id: 'p2', programme_title: 'ASP IMEI', is_active: true }),
      delete: vi.fn().mockResolvedValue({ id: 'r1' }),
    },
    userProgramAssignment: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 'a1' }),
    },
  },
}));

import { listRulesHandler, createRuleHandler, deleteRuleHandler, manualAssignHandler } from '../lavaTraining.controller';

describe('lavaTraining rule handlers', () => {
  it('listRulesHandler returns active rules', async () => {
    const req: any = {};
    const res: any = { status: vi.fn(() => res), json: vi.fn(() => res) };
    await listRulesHandler(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ rules: expect.any(Array) }));
  });

  it('createRuleHandler creates a rule and returns it', async () => {
    const req: any = { body: { lava_role: 'ASP', programme_id: 'p2', programme_title: 'ASP IMEI' }, user: { id: 'u1' } };
    const res: any = { status: vi.fn(() => res), json: vi.fn(() => res) };
    await createRuleHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('manualAssignHandler creates a UserProgramAssignment', async () => {
    const req: any = { body: { user_id: 'u2', programme_id: 'p1' }, user: { id: 'u1' } };
    const res: any = { status: vi.fn(() => res), json: vi.fn(() => res) };
    await manualAssignHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd PathwaysBackend/backend && npx vitest run src/controllers/__tests__/lavaTraining.rules.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 4: Implement the controller**

```typescript
import { Request, Response } from 'express';
import prisma from '../configs/prisma.config';
import logger from '../configs/logger.config';

export async function listRulesHandler(req: Request, res: Response): Promise<void> {
  const rules = await prisma.lavaAssignmentRule.findMany({ where: { is_active: true }, orderBy: { created_at: 'desc' } });
  res.json({ rules });
}

export async function createRuleHandler(req: Request, res: Response): Promise<void> {
  const { lava_role, programme_id, programme_title } = req.body as { lava_role: string; programme_id: string; programme_title: string };
  const rule = await prisma.lavaAssignmentRule.create({
    data: { lava_role, programme_id, programme_title, is_active: true, created_by: req.user!.id },
  });
  logger.info('LavaAssignmentRule created', { id: rule.id, lava_role, programme_id });
  res.status(201).json({ rule });
}

export async function deleteRuleHandler(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  await prisma.lavaAssignmentRule.delete({ where: { id } });
  logger.info('LavaAssignmentRule deleted', { id });
  res.status(204).send();
}

const LAVA_SYSTEM_ASSIGNER = '000000000000000000000000';

export async function manualAssignHandler(req: Request, res: Response): Promise<void> {
  const { user_id, programme_id, duration_days = 7 } = req.body as { user_id: string; programme_id: string; duration_days?: number };
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + duration_days);
  const existing = await prisma.userProgramAssignment.findFirst({
    where: { user_id, programme_id, status: 'active', start_date: { gte: start } },
  });
  if (existing) { res.status(409).json({ message: 'Active assignment already exists for this user + programme this week.' }); return; }
  const assignment = await prisma.userProgramAssignment.create({
    data: { user_id, programme_id, assigned_by: req.user?.id ?? LAVA_SYSTEM_ASSIGNER, start_date: start, end_date: end, is_mandatory: true, status: 'active' },
  });
  logger.info('Manual Lava assignment created', { id: assignment.id, user_id, programme_id });
  res.status(201).json({ assignment });
}
```

- [ ] **Step 5: Add the route file**

Create `lavaTraining.routes.ts`:

```typescript
import { Router } from 'express';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { AuthMiddleware as AdminCheck } from '../middlewares/auth.middleware';
import { listRulesHandler, createRuleHandler, deleteRuleHandler, manualAssignHandler } from '../controllers/lavaTraining.controller';

const lavaTrainingRouter = Router();

// Internal read — called by the weekly cron and Lava backend
lavaTrainingRouter.get('/rules', listRulesHandler);

// Admin-only mutations (Lava admin UI calls these via its backend proxy)
lavaTrainingRouter.post('/rules', AuthMiddleware.authMiddleware, AuthMiddleware.isAdmin(), createRuleHandler);
lavaTrainingRouter.delete('/rules/:id', AuthMiddleware.authMiddleware, AuthMiddleware.isAdmin(), deleteRuleHandler);
lavaTrainingRouter.post('/assign', AuthMiddleware.authMiddleware, AuthMiddleware.isAdmin(), manualAssignHandler);

export default lavaTrainingRouter;
```

Mount in `index.ts` alongside other routers:

```typescript
import lavaTrainingRouter from './src/routes/lavaTraining.routes';
app.use('/lava-training', lavaTrainingRouter);
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd PathwaysBackend/backend && npx vitest run src/controllers/__tests__/lavaTraining.rules.test.ts && npx tsc --noEmit`
Expected: PASS, no type errors.

- [ ] **Step 7: Commit**

```bash
git add PathwaysBackend/backend/prisma/schema.prisma PathwaysBackend/backend/src/controllers/lavaTraining.controller.ts PathwaysBackend/backend/src/routes/lavaTraining.routes.ts PathwaysBackend/backend/index.ts PathwaysBackend/backend/src/controllers/__tests__/lavaTraining.rules.test.ts
git commit -m "feat(zenlearn): LavaAssignmentRule model + rules CRUD + manual-assign API

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 10: Weekly auto-assign cron (reads from `LavaAssignmentRule` DB)

**Files:**
- Modify: `PathwaysBackend/backend/src/jobs/scheduler.ts` (add a new `cron.schedule` block)
- Test: `PathwaysBackend/backend/src/jobs/__tests__/lavaAssign.test.ts`

**Interfaces:**
- Consumes: `LavaAssignmentRule` (Task 9, `prisma.lavaAssignmentRule.findMany`); `User.lava_role` (Task 1); `UserProgramAssignment` (existing model).
- Produces: one `UserProgramAssignment` per Lava user whose role matches an active rule (idempotent — skip if active assignment for same programme already exists this week). Exported as `assignWeeklyLavaProgrammes()` for unit testing.

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../configs/prisma.config', () => ({
  default: {
    lavaAssignmentRule: {
      findMany: vi.fn().mockResolvedValue([
        { id: 'r1', lava_role: 'ASM', programme_id: 'prog-asm-1', programme_title: 'ASM Basics', is_active: true },
      ]),
    },
    user: { findMany: vi.fn().mockResolvedValue([
      { id: 'u1', lava_role: 'ASM' },
    ]) },
    userProgramAssignment: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 'a1' }),
    },
  },
}));

import prisma from '../../configs/prisma.config';
import { assignWeeklyLavaProgrammes } from '../scheduler';

describe('assignWeeklyLavaProgrammes', () => {
  it('creates a mandatory 7-day assignment matching rule role to user role', async () => {
    const n = await assignWeeklyLavaProgrammes();
    expect(n).toBe(1);
    expect((prisma as any).userProgramAssignment.create).toHaveBeenCalledOnce();
    const arg = (prisma as any).userProgramAssignment.create.mock.calls[0][0].data;
    expect(arg.programme_id).toBe('prog-asm-1');
    expect(arg.is_mandatory).toBe(true);
  });

  it('skips users whose role has no active rule', async () => {
    (prisma as any).lavaAssignmentRule.findMany.mockResolvedValueOnce([]);
    const n = await assignWeeklyLavaProgrammes();
    expect(n).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd PathwaysBackend/backend && npx vitest run src/jobs/__tests__/lavaAssign.test.ts`
Expected: FAIL — `assignWeeklyLavaProgrammes` not exported.

- [ ] **Step 3: Implement the function + register the cron**

Add the exported function (above `scheduleReminders`) to `scheduler.ts`:

```typescript
const LAVA_SYSTEM_ASSIGNER = '000000000000000000000000';

/**
 * Reads active LavaAssignmentRules from the DB and assigns the programme to
 * every Lava user whose role matches. Idempotent per (user, programme, week).
 */
export async function assignWeeklyLavaProgrammes(): Promise<number> {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 7);

  const rules = await prisma.lavaAssignmentRule.findMany({ where: { is_active: true } });
  if (rules.length === 0) return 0;

  const roleSet = [...new Set(rules.map((r: any) => r.lava_role))];
  const lavaUsers = await prisma.user.findMany({
    where: { lava_role: { in: roleSet } },
    select: { id: true, lava_role: true },
  });

  let created = 0;
  for (const u of lavaUsers) {
    const matchingRules = rules.filter((r: any) => r.lava_role === u.lava_role);
    for (const rule of matchingRules) {
      const existing = await prisma.userProgramAssignment.findFirst({
        where: { user_id: u.id, programme_id: rule.programme_id, status: 'active', start_date: { gte: start } },
      });
      if (existing) continue;
      await prisma.userProgramAssignment.create({
        data: {
          user_id: u.id,
          programme_id: rule.programme_id,
          assigned_by: LAVA_SYSTEM_ASSIGNER,
          start_date: start,
          end_date: end,
          is_mandatory: true,
          status: 'active',
        },
      });
      created += 1;
    }
  }
  logger.info(`[CRON] Lava weekly assign: created ${created} assignments`);
  return created;
}
```

Inside `scheduleReminders()`, register the cron (Monday 08:00 IST = 02:30 UTC):

```typescript
  cron.schedule('30 2 * * 1', async () => {
    logger.debug('[CRON] Running weekly Lava programme auto-assign');
    await assignWeeklyLavaProgrammes();
  });
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd PathwaysBackend/backend && npx vitest run src/jobs/__tests__/lavaAssign.test.ts && npx tsc --noEmit`
Expected: PASS, no type errors.

- [ ] **Step 5: Commit**

```bash
git add PathwaysBackend/backend/src/jobs/scheduler.ts PathwaysBackend/backend/src/jobs/__tests__/lavaAssign.test.ts
git commit -m "feat(zenlearn): weekly Monday cron auto-assigns Lava programmes from DB rules

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 11: Training-status API (add to existing ZenLearn lavaTraining controller)

**Files:**
- Modify: `PathwaysBackend/backend/src/controllers/lavaTraining.controller.ts` (add `computeTrainingStatus` + `getTrainingStatusHandler`)
- Modify: `PathwaysBackend/backend/src/routes/lavaTraining.routes.ts` (add `GET /status` route)
- Test: `PathwaysBackend/backend/src/controllers/__tests__/lavaTraining.status.test.ts`

**Interfaces:**
- Consumes: `User.lava_role`, `User.lava_scope` (Task 1); `UserProgramAssignment` (assigned); `ProgrammeCompletion` (completed).
- Produces: `GET /lava-training/status?busmName=&asmName=` → `{ result: { rows: Array<{ name, lava_role, assigned, completed, completionPct }> } }`. Called server-to-server by Lava's backend proxy (Task 12).

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../configs/prisma.config', () => ({
  default: {
    user: { findMany: vi.fn().mockResolvedValue([
      { id: 'u1', first_name: 'Ramesh', last_name: 'K', lava_role: 'ASP',
        lava_scope: { busmName: 'Sukhbir Singh', asmName: 'Ramesh K', aspName: 'SHAHID COMMUNICATION' } },
    ]) },
    userProgramAssignment: { count: vi.fn().mockResolvedValue(4) },
    programmeCompletion: { count: vi.fn().mockResolvedValue(3) },
  },
}));

import { computeTrainingStatus } from '../lavaTraining.controller';

describe('computeTrainingStatus', () => {
  it('rolls up completion pct per user within scope', async () => {
    const rows = await computeTrainingStatus({ busmName: 'Sukhbir Singh', asmName: 'All' });
    expect(rows[0]).toMatchObject({ assigned: 4, completed: 3, completionPct: 75 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd PathwaysBackend/backend && npx vitest run src/controllers/__tests__/lavaTraining.status.test.ts`
Expected: FAIL — `computeTrainingStatus` not exported.

- [ ] **Step 3: Add to the existing controller file**

Append to `lavaTraining.controller.ts` (after the existing exports from Task 9):

```typescript
export interface TrainingStatusRow {
  name: string; lava_role: string; assigned: number; completed: number; completionPct: number;
}

export async function computeTrainingStatus(
  scope: { busmName: string; asmName: string },
): Promise<TrainingStatusRow[]> {
  const where: any = { lava_role: { in: ['BUSM', 'ASM', 'ASP'] } };
  if (scope.busmName && scope.busmName !== 'All') {
    where['lava_scope'] = { path: ['busmName'], equals: scope.busmName };
  }
  if (scope.asmName && scope.asmName !== 'All') {
    where['lava_scope'] = { path: ['asmName'], equals: scope.asmName };
  }
  const users = await prisma.user.findMany({
    where,
    select: { id: true, first_name: true, last_name: true, lava_role: true },
  });
  const rows: TrainingStatusRow[] = [];
  for (const u of users) {
    const assigned = await prisma.userProgramAssignment.count({ where: { user_id: u.id } });
    const completed = await prisma.programmeCompletion.count({ where: { user_id: u.id } });
    rows.push({
      name: `${u.first_name} ${u.last_name}`.trim(),
      lava_role: u.lava_role ?? '',
      assigned,
      completed,
      completionPct: assigned > 0 ? Math.round((Math.min(completed, assigned) / assigned) * 100) : 0,
    });
  }
  return rows;
}

export async function getTrainingStatusHandler(req: Request, res: Response): Promise<void> {
  try {
    const busmName = (req.query.busmName as string) || 'All';
    const asmName = (req.query.asmName as string) || 'All';
    const rows = await computeTrainingStatus({ busmName, asmName });
    res.status(200).json({ result: { rows } });
  } catch (error) {
    logger.error('getTrainingStatusHandler failed', { error });
    res.status(500).json({ message: 'Failed to compute training status' });
  }
}
```

Add to `lavaTraining.routes.ts`:

```typescript
import { getTrainingStatusHandler } from '../controllers/lavaTraining.controller';
// ...
lavaTrainingRouter.get('/status', getTrainingStatusHandler);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd PathwaysBackend/backend && npx vitest run src/controllers/__tests__/lavaTraining.status.test.ts && npx tsc --noEmit`
Expected: PASS, no type errors.

- [ ] **Step 5: Commit**

```bash
git add PathwaysBackend/backend/src/controllers/lavaTraining.controller.ts PathwaysBackend/backend/src/routes/lavaTraining.routes.ts PathwaysBackend/backend/src/controllers/__tests__/lavaTraining.status.test.ts
git commit -m "feat(zenlearn): scoped Lava training-status API

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 12: Lava training proxy service (status + rules CRUD + manual-assign)

**Files:**
- Create: `Lava-decision-risk-dashboard/backend/src/services/lavaTraining.service.ts`
- Modify: `Lava-decision-risk-dashboard/backend/src/controllers/dashboard.controller.ts` (add 4 handlers)
- Modify: `Lava-decision-risk-dashboard/backend/src/routes/dashboard.routes.ts` (mount training routes)
- Test: `Lava-decision-risk-dashboard/backend/src/services/__tests__/lavaTraining.service.test.ts`

**Interfaces:**
- Consumes: ZenLearn `/lava-training/*` endpoints (Tasks 9, 11) via `PATHWAYS_BACKEND_URL`; `deriveScopeFilter` (Task 5).
- Produces (all under `/api/v1/dashboard/`):
  - `GET /training-status` — scoped completion rows
  - `GET /training-rules` — all active rules (admin-only)
  - `POST /training-rules` body `{ lava_role, programme_id, programme_title }` (admin-only, forwards to ZenLearn with the caller's auth token)
  - `DELETE /training-rules/:id` (admin-only)
  - `POST /training-assign` body `{ user_id, programme_id, duration_days? }` (admin-only)

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { fetchTrainingStatus, fetchTrainingRules } from '../lavaTraining.service';

describe('lavaTraining.service', () => {
  it('fetchTrainingStatus forwards scoped busm/asm to ZenLearn', async () => {
    const g = vi.spyOn(global, 'fetch' as any).mockResolvedValue({
      ok: true, json: async () => ({ result: { rows: [{ name: 'X', completionPct: 50 }] } }),
    } as any);
    const rows = await fetchTrainingStatus({ busmName: 'Sukhbir Singh', asmName: 'Ramesh K' });
    expect(rows[0].completionPct).toBe(50);
    const calledUrl = g.mock.calls[0][0] as string;
    expect(calledUrl).toContain('busmName=Sukhbir');
  });

  it('fetchTrainingRules returns the rules array', async () => {
    vi.spyOn(global, 'fetch' as any).mockResolvedValue({
      ok: true, json: async () => ({ rules: [{ id: 'r1', lava_role: 'ASM' }] }),
    } as any);
    const rules = await fetchTrainingRules();
    expect(rules[0].id).toBe('r1');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Lava-decision-risk-dashboard/backend && npx vitest run src/services/__tests__/lavaTraining.service.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the service**

```typescript
import { getEnvVar } from '../helpers/env';
import logger from '../configs/logger.config';

const ZL = () => getEnvVar('PATHWAYS_BACKEND_URL');

async function zlFetch(path: string, opts?: RequestInit) {
  const r = await fetch(`${ZL()}${path}`, opts);
  if (!r.ok) { logger.warn('ZenLearn upstream non-OK', { path, status: r.status }); return null; }
  return r.json() as Promise<any>;
}

export interface TrainingStatusRow { name: string; lava_role: string; assigned: number; completed: number; completionPct: number; }
export interface TrainingRule { id: string; lava_role: string; programme_id: string; programme_title: string; is_active: boolean; }

export async function fetchTrainingStatus(scope: { busmName: string; asmName: string }): Promise<TrainingStatusRow[]> {
  const qs = `?busmName=${encodeURIComponent(scope.busmName)}&asmName=${encodeURIComponent(scope.asmName)}`;
  const data = await zlFetch(`/lava-training/status${qs}`);
  return (data?.result?.rows ?? []) as TrainingStatusRow[];
}

export async function fetchTrainingRules(): Promise<TrainingRule[]> {
  const data = await zlFetch('/lava-training/rules');
  return (data?.rules ?? []) as TrainingRule[];
}

export async function createTrainingRule(body: { lava_role: string; programme_id: string; programme_title: string }, adminToken: string): Promise<TrainingRule | null> {
  const data = await zlFetch('/lava-training/rules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify(body),
  });
  return data?.rule ?? null;
}

export async function deleteTrainingRule(id: string, adminToken: string): Promise<boolean> {
  const r = await fetch(`${ZL()}/lava-training/rules/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  return r.ok;
}

export async function manualAssignTraining(body: { user_id: string; programme_id: string; duration_days?: number }, adminToken: string): Promise<boolean> {
  const r = await fetch(`${ZL()}/lava-training/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify(body),
  });
  return r.ok;
}
```

- [ ] **Step 4: Add handlers in dashboard.controller.ts**

```typescript
import { fetchTrainingStatus, fetchTrainingRules, createTrainingRule, deleteTrainingRule, manualAssignTraining } from '../services/lavaTraining.service';

export async function getTrainingStatusHandler(req: Request, res: Response): Promise<void> {
  const scoped = deriveScopeFilter(req.user, {
    busmName: (req.query.busmName as string) || 'All',
    asmName: (req.query.asmName as string) || 'All',
  });
  const rows = await fetchTrainingStatus({ busmName: scoped.busmName, asmName: scoped.asmName });
  res.success({ code: 200, message: 'Training status', result: { rows } });
}

export async function getTrainingRulesHandler(_req: Request, res: Response): Promise<void> {
  const rules = await fetchTrainingRules();
  res.success({ code: 200, message: 'Assignment rules', result: { rules } });
}

export async function createTrainingRuleHandler(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.token ?? req.headers.authorization?.replace('Bearer ', '') ?? '';
  const rule = await createTrainingRule(req.body, token);
  if (!rule) { res.status(502).json({ message: 'Failed to create rule in ZenLearn' }); return; }
  res.success({ code: 201, message: 'Rule created', result: { rule } });
}

export async function deleteTrainingRuleHandler(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.token ?? req.headers.authorization?.replace('Bearer ', '') ?? '';
  const ok = await deleteTrainingRule(req.params.id as string, token);
  if (!ok) { res.status(502).json({ message: 'Failed to delete rule in ZenLearn' }); return; }
  res.status(204).send();
}

export async function manualAssignHandler(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.token ?? req.headers.authorization?.replace('Bearer ', '') ?? '';
  const ok = await manualAssignTraining(req.body, token);
  if (!ok) { res.status(502).json({ message: 'Failed to create assignment in ZenLearn' }); return; }
  res.success({ code: 201, message: 'Assignment created' });
}
```

- [ ] **Step 5: Mount routes in dashboard.routes.ts**

```typescript
// Training — all authenticated roles can read status
dashboardRouter.get('/training-status', requireAnyLavaRole([...executiveRoles, 'Dealer', 'ASP', 'Trainer']), asyncHandler(getTrainingStatusHandler));
// Training rules + manual assign — admin-tier only
dashboardRouter.get('/training-rules', requireAnyLavaRole(['Admin', 'MD', 'ServiceHead']), asyncHandler(getTrainingRulesHandler));
dashboardRouter.post('/training-rules', requireAnyLavaRole(['Admin', 'MD', 'ServiceHead']), asyncHandler(createTrainingRuleHandler));
dashboardRouter.delete('/training-rules/:id', requireAnyLavaRole(['Admin', 'MD', 'ServiceHead']), asyncHandler(deleteTrainingRuleHandler));
dashboardRouter.post('/training-assign', requireAnyLavaRole(['Admin', 'MD', 'ServiceHead']), asyncHandler(manualAssignHandler));
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd Lava-decision-risk-dashboard/backend && npx vitest run src/services/__tests__/lavaTraining.service.test.ts && npx tsc --noEmit`
Expected: PASS, no type errors.

- [ ] **Step 7: Commit**

```bash
git add Lava-decision-risk-dashboard/backend/src/services/lavaTraining.service.ts Lava-decision-risk-dashboard/backend/src/controllers/dashboard.controller.ts Lava-decision-risk-dashboard/backend/src/routes/dashboard.routes.ts Lava-decision-risk-dashboard/backend/src/services/__tests__/lavaTraining.service.test.ts
git commit -m "feat(lava): training proxy — status + rules CRUD + manual-assign endpoints

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 13: Lava frontend — 2 Training LHS tabs + compliance column

**Files:**
- Create: `Lava-decision-risk-dashboard/frontend/components/TabTraining.tsx` (Tab 1: compliance view)
- Create: `Lava-decision-risk-dashboard/frontend/components/TabTrainingRules.tsx` (Tab 2: admin rule management + manual assign)
- Modify: `Lava-decision-risk-dashboard/frontend/components/Sidebar.tsx` (add 2 nav items)
- Modify: `Lava-decision-risk-dashboard/frontend/app/page.tsx` (render both tabs by `activeTab`)
- Modify: `Lava-decision-risk-dashboard/frontend/components/TabOrgKPIs.tsx` (Training Compliance column)

**Interfaces:**
- Consumes: `GET /api/v1/dashboard/training-status`, `GET/POST/DELETE /api/v1/dashboard/training-rules`, `POST /api/v1/dashboard/training-assign` (Task 12). `role` prop from `page.tsx` (Task 8).
- Produces: two LHS tabs visible to all authenticated users (Tab 1 scoped by role; Tab 2 visible only to admin-tier roles); a TRAINING % column in the Org KPIs table.

- [ ] **Step 1: Create TabTraining.tsx (compliance view)**

```tsx
'use client';
import React, { useEffect, useState } from 'react';

interface TrainingRow { name: string; lava_role: string; assigned: number; completed: number; completionPct: number; }

export default function TabTraining() {
  const [rows, setRows] = useState<TrainingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/dashboard/training-status')
      .then((r) => r.json())
      .then((d) => setRows(d?.result?.rows ?? []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Loading training status…</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 8 }}>Training Compliance</h2>
      <p style={{ marginBottom: 16, opacity: 0.7 }}>Weekly programmes are auto-assigned by role. Completion updates as learners finish modules in ZenLearn.</p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #eee' }}>
            <th style={{ textAlign: 'left', padding: '8px 4px' }}>Name</th>
            <th style={{ padding: '8px 4px' }}>Role</th>
            <th style={{ padding: '8px 4px' }}>Assigned</th>
            <th style={{ padding: '8px 4px' }}>Completed</th>
            <th style={{ padding: '8px 4px' }}>Completion %</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.name}-${r.lava_role}`} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '8px 4px' }}>{r.name}</td>
              <td style={{ textAlign: 'center', padding: '8px 4px' }}>{r.lava_role}</td>
              <td style={{ textAlign: 'center', padding: '8px 4px' }}>{r.assigned}</td>
              <td style={{ textAlign: 'center', padding: '8px 4px' }}>{r.completed}</td>
              <td style={{ textAlign: 'center', padding: '8px 4px', fontWeight: 600,
                color: r.completionPct >= 80 ? '#16a34a' : r.completionPct >= 50 ? '#ca8a04' : '#dc2626' }}>
                {r.completionPct}%
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, opacity: 0.5 }}>
              No training assigned yet. Add assignment rules in the Training Rules tab.
            </td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Create TabTrainingRules.tsx (admin — rule management + manual assign)**

```tsx
'use client';
import React, { useEffect, useState } from 'react';

interface Rule { id: string; lava_role: string; programme_id: string; programme_title: string; }

const LAVA_ROLES = ['BUSM', 'ASM', 'ASP'];

export default function TabTrainingRules() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRole, setNewRole] = useState('ASM');
  const [newProgId, setNewProgId] = useState('');
  const [newProgTitle, setNewProgTitle] = useState('');
  const [assignUserId, setAssignUserId] = useState('');
  const [assignProgId, setAssignProgId] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const loadRules = () =>
    fetch('/api/v1/dashboard/training-rules')
      .then((r) => r.json())
      .then((d) => setRules(d?.result?.rules ?? []))
      .catch(() => setRules([]))
      .finally(() => setLoading(false));

  useEffect(() => { loadRules(); }, []);

  const addRule = async () => {
    if (!newProgId.trim() || !newProgTitle.trim()) { setMsg('Programme ID and title are required.'); return; }
    setBusy(true);
    try {
      const r = await fetch('/api/v1/dashboard/training-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lava_role: newRole, programme_id: newProgId.trim(), programme_title: newProgTitle.trim() }),
      });
      if (!r.ok) throw new Error(await r.text());
      setNewProgId(''); setNewProgTitle(''); setMsg('Rule added.');
      await loadRules();
    } catch (e: any) { setMsg(`Error: ${e.message}`); } finally { setBusy(false); }
  };

  const deleteRule = async (id: string) => {
    if (!confirm('Delete this rule? Users will no longer be auto-assigned this programme.')) return;
    setBusy(true);
    try {
      await fetch(`/api/v1/dashboard/training-rules/${id}`, { method: 'DELETE' });
      setMsg('Rule deleted.'); await loadRules();
    } catch { setMsg('Delete failed.'); } finally { setBusy(false); }
  };

  const manualAssign = async () => {
    if (!assignUserId.trim() || !assignProgId.trim()) { setMsg('User ID and Programme ID are required.'); return; }
    setBusy(true);
    try {
      const r = await fetch('/api/v1/dashboard/training-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: assignUserId.trim(), programme_id: assignProgId.trim() }),
      });
      if (r.status === 409) { setMsg('User already has an active assignment for this programme this week.'); return; }
      if (!r.ok) throw new Error(await r.text());
      setAssignUserId(''); setAssignProgId(''); setMsg('Assignment created.');
    } catch (e: any) { setMsg(`Error: ${e.message}`); } finally { setBusy(false); }
  };

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>Training Assignment Rules</h2>
      <p style={{ marginBottom: 16, opacity: 0.7 }}>Active rules are used by the weekly Monday cron to auto-assign programmes by role. Add a rule per role per programme you want assigned.</p>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #eee' }}>
            <th style={{ textAlign: 'left', padding: '8px 4px' }}>Role</th>
            <th style={{ textAlign: 'left', padding: '8px 4px' }}>Programme</th>
            <th style={{ textAlign: 'left', padding: '8px 4px' }}>Programme ID</th>
            <th style={{ padding: '8px 4px' }}></th>
          </tr>
        </thead>
        <tbody>
          {rules.map((r) => (
            <tr key={r.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '8px 4px', fontWeight: 600 }}>{r.lava_role}</td>
              <td style={{ padding: '8px 4px' }}>{r.programme_title}</td>
              <td style={{ padding: '8px 4px', fontFamily: 'monospace', fontSize: 12, opacity: 0.7 }}>{r.programme_id}</td>
              <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                <button onClick={() => deleteRule(r.id)} disabled={busy} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
          ))}
          {rules.length === 0 && (
            <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24, opacity: 0.5 }}>No rules yet.</td></tr>
          )}
        </tbody>
      </table>

      <h3 style={{ marginBottom: 12 }}>Add Rule</h3>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
        <select value={newRole} onChange={(e) => setNewRole(e.target.value)} style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid #ccc' }}>
          {LAVA_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <input placeholder="Programme ID (from ZenLearn CMS)" value={newProgId} onChange={(e) => setNewProgId(e.target.value)} style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid #ccc', width: 280 }} />
        <input placeholder="Programme title (display name)" value={newProgTitle} onChange={(e) => setNewProgTitle(e.target.value)} style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid #ccc', width: 220 }} />
        <button onClick={addRule} disabled={busy} style={{ padding: '6px 16px', borderRadius: 4, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer' }}>Add Rule</button>
      </div>

      <h3 style={{ marginBottom: 12 }}>Manual Assign</h3>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <input placeholder="ZenLearn User ID" value={assignUserId} onChange={(e) => setAssignUserId(e.target.value)} style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid #ccc', width: 220 }} />
        <input placeholder="Programme ID" value={assignProgId} onChange={(e) => setAssignProgId(e.target.value)} style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid #ccc', width: 220 }} />
        <button onClick={manualAssign} disabled={busy} style={{ padding: '6px 16px', borderRadius: 4, background: '#16a34a', color: '#fff', border: 'none', cursor: 'pointer' }}>Assign Now</button>
      </div>

      {msg && <p style={{ marginTop: 16, color: msg.startsWith('Error') ? '#dc2626' : '#16a34a' }}>{msg}</p>}
    </div>
  );
}
```

- [ ] **Step 3: Wire sidebar nav items**

In `Sidebar.tsx`, add after the `coach` nav item:

```typescript
    { id: 'training', label: 'Training', icon: BookOpen },
    { id: 'training-rules', label: 'Training Rules', icon: Settings, roles: ['Admin', 'MD', 'ServiceHead'] },
```

The `roles` guard in the sidebar filter (Task 8) hides `training-rules` for non-admin tiers. `BookOpen` and `Settings` must be imported from `lucide-react`.

- [ ] **Step 4: Render both tabs in page.tsx**

```tsx
import TabTraining from '../components/TabTraining';
import TabTrainingRules from '../components/TabTrainingRules';
// ... in the tab switch/render:
{activeTab === 'training' && <TabTraining />}
{activeTab === 'training-rules' && <TabTrainingRules />}
```

- [ ] **Step 5: Add Training Compliance column to TabOrgKPIs**

In `TabOrgKPIs.tsx`:

```tsx
  const [trainingByName, setTrainingByName] = useState<Map<string, number>>(new Map());
  useEffect(() => {
    fetch('/api/v1/dashboard/training-status')
      .then((r) => r.json())
      .then((d) => {
        const m = new Map<string, number>();
        (d?.result?.rows ?? []).forEach((row: any) =>
          m.set(row.name.trim().toLowerCase(), row.completionPct));
        setTrainingByName(m);
      })
      .catch(() => setTrainingByName(new Map()));
  }, []);
```

Add `TRAINING %` as a header column in the BUSM/ASM matrix. Per row: `trainingByName.get(row.name.trim().toLowerCase()) ?? '—'` — append `%` when a number. Use `—` when absent (never a fabricated value).

- [ ] **Step 6: Verify in the browser**

Start the frontend dev server, sign in as an ASM test account. Confirm: (a) "Training" LHS tab lists only that ASM's actors; (b) "Training Rules" LHS tab is absent for ASM; (c) sign in as Admin → "Training Rules" tab visible, add a rule → it appears in the table; (d) Org KPIs scorecard shows TRAINING % column with `—` for unmapped names. Take a screenshot.

- [ ] **Step 7: Commit**

```bash
git add Lava-decision-risk-dashboard/frontend/components/TabTraining.tsx Lava-decision-risk-dashboard/frontend/components/TabTrainingRules.tsx Lava-decision-risk-dashboard/frontend/components/Sidebar.tsx Lava-decision-risk-dashboard/frontend/app/page.tsx Lava-decision-risk-dashboard/frontend/components/TabOrgKPIs.tsx
git commit -m "feat(lava): Training tab (compliance) + Training Rules tab (admin CRUD + manual assign)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Post-implementation checklist (Rohit runs against real infra)

1. **Provision users:** export `lava-hierarchy.json` (Task 3 Step 1), run `npx ts-node --transpileOnly src/scripts/provisionLavaUsers.ts lava.zenlearn.ai` against the real Mongo, distribute `lava-user-credentials.csv` out-of-band.
2. **Author training programmes** in the ZenLearn CMS; paste their `programme_id`s into `lavaCohorts.config.ts` and redeploy PathwaysBackend.
3. **Smoke-test scoping:** log in as one BUSM, one ASM, one ASP, one HQ admin; confirm each sees only their slice and that editing the `busmName`/`asmName` query param does nothing for scoped roles.
4. **Confirm the cron** fired (check logs Monday 08:00, or invoke `assignWeeklyLavaProgrammes()` once manually) and that assignments appear in the Training tab.

## Security notes (do not skip)

- The server (Task 5–6) is the ONLY scope boundary. Frontend hiding (Task 8/13) is cosmetic.
- `GET /lava-training/status` (Task 11) is unauthenticated but reachable **only on the internal Docker network** (no public route). If PathwaysBackend ever exposes it publicly, add `AuthMiddleware` + a shared-service token first.
- Temp passwords (`lava-user-credentials.csv`) and `lava-hierarchy.json` are git-ignored — never commit them.
- RS256/JWKS migration (replacing the shared `JWT_SECRET`) remains the recommended end-state before the 650-ASP rollout, and folds in the deferred `JWT_SECRET` rotation. Out of scope here; tracked separately.
