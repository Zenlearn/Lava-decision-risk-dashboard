import { describe, it, expect, vi } from 'vitest';
import { requireAnyLavaRole } from '../rbac.middleware';

describe('requireAnyLavaRole — real enforcement', () => {
  it('denies an ASP requesting an executive-only route', () => {
    const mw = requireAnyLavaRole(['Admin', 'MD', 'ServiceHead', 'RegionalHead', 'BUSM', 'ASM']);
    const req: any = { user: { id: 'u1', lava_role: 'ASP', email: 'x@lava.zenlearn.ai', is_admin: false, is_super_admin: false } };
    const res: any = { status: vi.fn(() => res), json: vi.fn(() => res) };
    const next = vi.fn();
    mw(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('denies a regular ZenLearn user with no lava_role', () => {
    const mw = requireAnyLavaRole(['BUSM', 'ASM']);
    const req: any = { user: { id: 'u2', email: 'learner@zenlearn.ai', is_admin: false, is_super_admin: false } };
    const res: any = { status: vi.fn(() => res), json: vi.fn(() => res) };
    const next = vi.fn();
    mw(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('allows a BUSM into a BUSM+ASM route', () => {
    const mw = requireAnyLavaRole(['BUSM', 'ASM']);
    const req: any = { user: { id: 'u3', lava_role: 'BUSM', email: 'b@lava.zenlearn.ai', is_admin: false, is_super_admin: false } };
    const res: any = { status: vi.fn(() => res), json: vi.fn(() => res) };
    const next = vi.fn();
    mw(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('always allows a super-admin regardless of the role list', () => {
    const mw = requireAnyLavaRole(['BUSM']);
    const req: any = { user: { id: 'u4', is_super_admin: true, email: 'admin@zenlearn.ai', is_admin: false } };
    const res: any = { status: vi.fn(() => res), json: vi.fn(() => res) };
    const next = vi.fn();
    mw(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
