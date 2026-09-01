import { describe, it, expect } from 'vitest';
import { deriveScopeFilter, isAdminTier, canAccessRegion, canAccessTechnician } from '../scope';

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

describe('canAccessRegion', () => {
  it('admin tier can access any region', () => {
    const u: any = { lava_role: 'MD' };
    expect(canAccessRegion(u, 'Sukhbir Singh')).toBe(true);
  });

  it('BUSM can access their own region', () => {
    const u: any = { lava_role: 'BUSM', lava_scope: { busmName: 'Sukhbir Singh' } };
    expect(canAccessRegion(u, 'Sukhbir Singh')).toBe(true);
  });

  it('BUSM cannot access a different region', () => {
    const u: any = { lava_role: 'BUSM', lava_scope: { busmName: 'Sukhbir Singh' } };
    expect(canAccessRegion(u, 'Rajesh Limbachia')).toBe(false);
  });

  it('ASM cannot access any region view (wider than their mapped ASPs)', () => {
    const u: any = { lava_role: 'ASM', lava_scope: { busmName: 'Sukhbir Singh', asmName: 'Ramesh K' } };
    expect(canAccessRegion(u, 'Sukhbir Singh')).toBe(false);
  });

  it('ASP cannot access any region view', () => {
    const u: any = { lava_role: 'ASP', lava_scope: { busmName: 'B', asmName: 'A', aspName: 'X' } };
    expect(canAccessRegion(u, 'B')).toBe(false);
  });
});

describe('canAccessTechnician', () => {
  const location = { busmName: 'Sukhbir Singh', asmName: 'Ramesh K', aspName: 'SHAHID COMMUNICATION' };

  it('admin tier can access any technician', () => {
    const u: any = { lava_role: 'MD' };
    expect(canAccessTechnician(u, location)).toBe(true);
  });

  it('BUSM can access a technician in their own region', () => {
    const u: any = { lava_role: 'BUSM', lava_scope: { busmName: 'Sukhbir Singh' } };
    expect(canAccessTechnician(u, location)).toBe(true);
  });

  it('BUSM cannot access a technician in a different region', () => {
    const u: any = { lava_role: 'BUSM', lava_scope: { busmName: 'Rajesh Limbachia' } };
    expect(canAccessTechnician(u, location)).toBe(false);
  });

  it('ASM can access a technician under their own dealer', () => {
    const u: any = { lava_role: 'ASM', lava_scope: { busmName: 'Sukhbir Singh', asmName: 'Ramesh K' } };
    expect(canAccessTechnician(u, location)).toBe(true);
  });

  it('ASM cannot access a technician under a different ASM (a different ASP not mapped to them)', () => {
    const u: any = { lava_role: 'ASM', lava_scope: { busmName: 'Sukhbir Singh', asmName: 'Other ASM' } };
    expect(canAccessTechnician(u, location)).toBe(false);
  });

  it('ASP can access a technician at their own service centre', () => {
    const u: any = { lava_role: 'ASP', lava_scope: { busmName: 'B', asmName: 'A', aspName: 'SHAHID COMMUNICATION' } };
    expect(canAccessTechnician(u, location)).toBe(true);
  });

  it('ASP cannot access a technician at a different service centre', () => {
    const u: any = { lava_role: 'ASP', lava_scope: { busmName: 'B', asmName: 'A', aspName: 'Other ASP' } };
    expect(canAccessTechnician(u, location)).toBe(false);
  });

  it('unknown/unscoped role is denied', () => {
    const u: any = { lava_role: 'UnknownRole' };
    expect(canAccessTechnician(u, location)).toBe(false);
  });
});
