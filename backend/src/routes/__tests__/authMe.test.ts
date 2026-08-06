/**
 * Unit test for GET /auth/me
 *
 * Tests the route handler directly (no HTTP server) following the same
 * pattern used across Lava's existing middleware tests.
 */
import { describe, it, expect, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Minimal mock for dependencies pulled in by auth.routes.ts at import time
// ---------------------------------------------------------------------------
vi.mock('../../configs/logger.config', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../helpers/env', () => ({
  getEnvVar: (key: string, fallback?: string) => fallback ?? 'http://mock:3001',
}));

vi.mock('../../configs/jwt.config', () => ({
  JWTConfig: { generateUploadToken: vi.fn(() => 'mock-upload-token') },
}));

vi.mock('../../middlewares/auth.middleware', () => ({
  AuthMiddleware: {
    authMiddleware: (_req: any, _res: any, next: any) => next(),
    isAdmin: () => (_req: any, _res: any, next: any) => next(),
  },
}));

vi.mock('../../middlewares/rbac.middleware', () => ({
  requireAnyLavaRole: () => (_req: any, _res: any, next: any) => next(),
}));

vi.mock('../import.routes', () => ({
  importAllowedRoles: ['Admin'],
  default: { use: vi.fn(), get: vi.fn(), post: vi.fn() },
}));

// ---------------------------------------------------------------------------
// Helper: build the minimal req/res/next triple the /me handler needs
// ---------------------------------------------------------------------------
function makeContext(user: Record<string, any>) {
  const req: any = { user };
  const captured: { status?: number; body?: any } = {};
  const res: any = {
    success: (payload: any) => {
      captured.status = 200;
      captured.body = payload;
    },
    status: vi.fn(() => res),
    json: vi.fn((body: any) => {
      captured.body = body;
    }),
  };
  const next = vi.fn();
  return { req, res, next, captured };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('GET /auth/me — route handler', () => {
  it('returns lava_role and lava_scope from req.user', async () => {
    // Import after mocks are set up so the module uses them
    const authRouterModule = await import('../auth.routes');
    const router = authRouterModule.default;

    // Find the /me GET handler registered on the router
    const meLayer = (router as any).stack?.find(
      (layer: any) =>
        layer.route?.path === '/me' && layer.route?.methods?.get === true
    );
    expect(meLayer, '/me GET route must be registered on authRouter').toBeTruthy();

    // The last handler in the stack is the business-logic handler (after authMiddleware)
    const handlers: Function[] = meLayer.route.stack.map((s: any) => s.handle);
    const handler = handlers[handlers.length - 1]!;

    const testUser = {
      id: 'u1',
      email: 'asm@lava.zenlearn.ai',
      name: 'Ramesh K',
      lava_role: 'ASM',
      lava_scope: { asmName: 'Ramesh K', busmName: 'Sukhbir Singh' },
      is_admin: false,
      is_super_admin: false,
    };

    const { req, res, next, captured } = makeContext(testUser);
    handler(req, res, next);

    expect(captured.status).toBe(200);
    expect(captured.body.result.lava_role).toBe('ASM');
    expect(captured.body.result.lava_scope).toEqual({
      asmName: 'Ramesh K',
      busmName: 'Sukhbir Singh',
    });
    expect(captured.body.result.id).toBe('u1');
    expect(captured.body.result.email).toBe('asm@lava.zenlearn.ai');
  });

  it('exposes is_admin and is_super_admin in the response', async () => {
    const authRouterModule = await import('../auth.routes');
    const router = authRouterModule.default;

    const meLayer = (router as any).stack?.find(
      (layer: any) =>
        layer.route?.path === '/me' && layer.route?.methods?.get === true
    );
    const handlers: Function[] = meLayer.route.stack.map((s: any) => s.handle);
    const handler = handlers[handlers.length - 1]!;

    const testUser = {
      id: 'u2',
      email: 'admin@zenlearn.ai',
      name: 'Admin User',
      lava_role: 'Admin',
      lava_scope: null,
      is_admin: true,
      is_super_admin: false,
    };

    const { req, res, captured } = makeContext(testUser);
    handler(req, res, vi.fn());

    expect(captured.body.result.is_admin).toBe(true);
    expect(captured.body.result.lava_role).toBe('Admin');
  });
});
