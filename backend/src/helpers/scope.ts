import type { Request } from 'express';

type ReqUser = Request['user'];

export interface ScopeFilter {
  busmName: string;
  asmName: string;
  aspName?: string;
}

/** HQ tiers that can see the whole org and honour the client-supplied filter. */
export function isAdminTier(user: ReqUser): boolean {
  if (!user) return false;
  if (user.is_super_admin || user.is_admin || user.is_department_manager) return true;
  const role = user.org_role ?? (user as any).lava_role ?? '';
  return ['Admin', 'MD', 'ServiceHead', 'RegionalHead'].includes(role);
}

/**
 * The ONE place that decides which slice of the org a caller may read.
 *
 * Admin tiers: honour `requested` (client filter is authoritative for them).
 * Scoped roles: ignore `requested` entirely and return their own JWT scope.
 * This prevents IDOR — a BUSM/ASM/ASP cannot read another's data by tampering
 * with query parameters.
 */
export function deriveScopeFilter(
  user: ReqUser,
  requested: { busmName?: string; asmName?: string },
): ScopeFilter {
  if (isAdminTier(user)) {
    return {
      busmName: requested.busmName || 'All',
      asmName: requested.asmName || 'All',
    };
  }

  const scope = user?.org_scope ?? (user as any)?.lava_scope ?? {};
  const role = (user?.org_role ?? (user as any)?.lava_role) as string | undefined;

  if (role === 'BUSM' && scope.busmName) {
    return {
      busmName: scope.busmName,
      asmName: requested.asmName || 'All',
    };
  }

  if (role === 'ASM' && scope.asmName) {
    return {
      busmName: scope.busmName || 'All',
      asmName: scope.asmName,
    };
  }

  if ((role === 'ASP' || role === 'Dealer') && scope.aspName) {
    return {
      busmName: scope.busmName || 'All',
      asmName: scope.asmName || 'All',
      aspName: scope.aspName,
    };
  }

  // Unknown/unscoped role → most restrictive: no data.
  return { busmName: '__none__', asmName: '__none__' };
}
