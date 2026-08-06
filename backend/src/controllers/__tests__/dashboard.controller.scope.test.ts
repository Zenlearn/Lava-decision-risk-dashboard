import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../services/dashboard.service', () => ({
  getFullDashboardData: vi.fn().mockResolvedValue({ summary: { importId: 'i1' }, busmRows: [], asmRows: [], aspRows: [] }),
  getExecutiveDashboard: vi.fn().mockResolvedValue({ kpis: [] }),
}));
vi.mock('../../services/cache.service', () => ({
  getCachedDashboard: vi.fn().mockResolvedValue(null),
  setCachedDashboard: vi.fn().mockResolvedValue(undefined),
  getCachedExecutive: vi.fn().mockResolvedValue(null),
  setCachedExecutive: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../../controllers/audit.controller', () => ({
  createAuditLog: vi.fn().mockResolvedValue(undefined),
}));

import * as svc from '../../services/dashboard.service';
import { getFullDashboardDataHandler } from '../dashboard.controller';

describe('getFullDashboardDataHandler — scope enforcement', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('ignores a tampered query param for an ASM and uses their JWT scope', async () => {
    const spy = vi.spyOn(svc, 'getFullDashboardData');

    const req: any = {
      query: { busmName: 'Someone Else', asmName: 'Another ASM' },
      user: {
        lava_role: 'ASM',
        lava_scope: { busmName: 'Sukhbir Singh', asmName: 'Ramesh K' },
        is_admin: false,
        is_super_admin: false,
        is_department_manager: false,
      },
      cookies: {},
    };
    const res: any = { success: vi.fn(), error: vi.fn(), status: vi.fn(() => res), json: vi.fn(() => res) };

    await getFullDashboardDataHandler(req, res);

    const calledWith = spy.mock.calls[0]?.[0] as any;
    expect(calledWith.busmName).toBe('Sukhbir Singh');
    expect(calledWith.asmName).toBe('Ramesh K');
  });

  it('admin user passes their requested filter through unchanged', async () => {
    const spy = vi.spyOn(svc, 'getFullDashboardData');

    const req: any = {
      query: { busmName: 'Anyone', asmName: 'Any ASM' },
      user: {
        lava_role: 'Admin',
        is_admin: true,
        is_super_admin: false,
        is_department_manager: false,
      },
      cookies: {},
    };
    const res: any = { success: vi.fn(), error: vi.fn(), status: vi.fn(() => res), json: vi.fn(() => res) };

    await getFullDashboardDataHandler(req, res);

    const calledWith = spy.mock.calls[0]?.[0] as any;
    expect(calledWith.busmName).toBe('Anyone');
    expect(calledWith.asmName).toBe('Any ASM');
  });
});
