import { describe, it, expect, vi } from 'vitest';

describe('authMiddleware — lava_scope', () => {
  it('populates req.user.lava_scope from the token payload', async () => {
    // We import dynamically so the mock is set up first.
    const { JWTConfig } = await import('../../configs/jwt.config');
    vi.spyOn(JWTConfig, 'validate').mockReturnValue({
      id: 'u1',
      lava_role: 'ASM',
      lava_scope: { asmName: 'Ramesh K', busmName: 'Sukhbir Singh' },
    } as any);

    const { AuthMiddleware } = await import('../auth.middleware');
    const req: any = { cookies: { token: 'fake-token' }, headers: {} };
    const res: any = { status: vi.fn(() => res), json: vi.fn(() => res) };
    const next = vi.fn();

    await AuthMiddleware.authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.lava_scope).toEqual({ asmName: 'Ramesh K', busmName: 'Sukhbir Singh' });
  });
});
