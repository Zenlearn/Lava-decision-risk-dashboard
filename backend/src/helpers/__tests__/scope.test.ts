import { describe, it, expect } from 'vitest';
import { deriveScopeFilter, isAdminTier } from '../scope';

describe('isAdminTier', () => {
  it('returns true for is_super_admin', () => {
    expect(isAdminTier({ is_super_admin: true } as any)).toBe(true);
  });
  it('returns true for is_admin', () => {
    expect(isAdminTier({ is_admin: true } as any)).toBe(true);
  });
  it('returns true for MD lava_role', () => {
    expect(isAdminTier({ lava_role: 'MD' } as any)).toBe(true);
  });
  it('returns false for BUSM', () => {
    expect(isAdminTier({ lava_role: 'BUSM' } as any)).toBe(false);
  });
  it('returns false for null/undefined', () => {
    expect(isAdminTier(undefined)).toBe(false);
  });
});

describe('deriveScopeFilter', () => {
  const requested = { busmName: 'Someone Else', asmName: 'Another ASM' };

  it('super-admin honours the requested filter verbatim', () => {
    const u: any = { is_super_admin: true };
    expect(deriveScopeFilter(u, requested)).toEqual({ busmName: 'Someone Else', asmName: 'Another ASM' });
  });

  it('MD honours the requested filter verbatim', () => {
    const u: any = { lava_role: 'MD' };
    expect(deriveScopeFilter(u, requested)).toEqual({ busmName: 'Someone Else', asmName: 'Another ASM' });
  });

  it('BUSM is forced to their own busmName; asmName comes from request', () => {
    const u: any = { lava_role: 'BUSM', lava_scope: { busmName: 'Sukhbir Singh' } };
    expect(deriveScopeFilter(u, { busmName: 'Hacker', asmName: 'Ramesh K' }))
      .toEqual({ busmName: 'Sukhbir Singh', asmName: 'Ramesh K' });
  });

  it('BUSM with no asmName in request gets All', () => {
    const u: any = { lava_role: 'BUSM', lava_scope: { busmName: 'Sukhbir Singh' } };
    expect(deriveScopeFilter(u, { busmName: 'Hacker' }))
      .toEqual({ busmName: 'Sukhbir Singh', asmName: 'All' });
  });

  it('ASM is forced to their own busmName AND asmName regardless of request', () => {
    const u: any = { lava_role: 'ASM', lava_scope: { busmName: 'Sukhbir Singh', asmName: 'Ramesh K' } };
    expect(deriveScopeFilter(u, requested))
      .toEqual({ busmName: 'Sukhbir Singh', asmName: 'Ramesh K' });
  });

  it('ASP includes aspName in scope', () => {
    const u: any = { lava_role: 'ASP', lava_scope: { busmName: 'B', asmName: 'A', aspName: 'SHAHID COMMUNICATION' } };
    expect(deriveScopeFilter(u, requested))
      .toEqual({ busmName: 'B', asmName: 'A', aspName: 'SHAHID COMMUNICATION' });
  });

  it('unknown/unscoped role returns __none__ to prevent data leakage', () => {
    const u: any = { lava_role: 'UnknownRole' };
    const result = deriveScopeFilter(u, requested);
    expect(result.busmName).toBe('__none__');
  });
});
