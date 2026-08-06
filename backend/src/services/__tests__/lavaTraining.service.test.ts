import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('lavaTraining.service', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('PATHWAYS_BACKEND_URL', 'http://zenlearn-backend:3001');
  });

  it('fetchTrainingStatus forwards scoped busm/asm and returns rows', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: { rows: [{ name: 'Ramesh K', completionPct: 75 }] } }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { fetchTrainingStatus } = await import('../lavaTraining.service');
    const rows = await fetchTrainingStatus({ busmName: 'Sukhbir Singh', asmName: 'Ramesh K' });

    expect(rows[0]?.completionPct).toBe(75);
    const calledUrl = mockFetch.mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain('busmName=Sukhbir%20Singh');
    expect(calledUrl).toContain('asmName=Ramesh%20K');
  });

  it('fetchTrainingRules returns rules array', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ rules: [{ id: 'r1', lava_role: 'ASM', programme_id: 'p1', programme_title: 'ASM Basics' }] }),
    }));

    const { fetchTrainingRules } = await import('../lavaTraining.service');
    const rules = await fetchTrainingRules();
    expect(rules[0]?.id).toBe('r1');
  });

  it('fetchTrainingStatus returns [] when upstream returns non-ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    const { fetchTrainingStatus } = await import('../lavaTraining.service');
    const rows = await fetchTrainingStatus({ busmName: 'All', asmName: 'All' });
    expect(rows).toEqual([]);
  });
});
