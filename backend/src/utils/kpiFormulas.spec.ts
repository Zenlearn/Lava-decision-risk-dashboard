import { computeScorecardMetrics } from './kpiFormulas';

describe('KPI Formulas (Sacrosanct Logic)', () => {
  it('should correctly compute CPC using the exact agreed formula', () => {
    // CPC = (Total Parts Cost + Replacement Handset Cost) / Total WOs
    const mockRows = [
      { cpcPartVal: 1000, isReplacement: false, handsetVal: 15000 }, // Repair WO (adds 1000 to part val)
      { cpcPartVal: 0, isReplacement: true, handsetVal: 15000 },     // Replacement WO (adds 15000 to repl val)
      { cpcPartVal: 0, isReplacement: false, handsetVal: 15000 }      // Software WO (no parts, handsetVal should be ignored)
    ];

    const metrics = computeScorecardMetrics(mockRows);

    // Total Parts Cost = 1000
    // Total Repl Handset Cost = 15000
    // Total WOs with parts/repl = 2
    // Expected CPC = (1000 + 15000) / 2 = 16000 / 2 = 8000
    expect(metrics.cpc).toBe(8000);
  });

  it('should correctly compute TAT %', () => {
    // TAT % = (WOs closed in <= 1 day) / (WOs with valid TAT) * 100
    const mockRows = [
      { tat: 0 },
      { tat: 1 },
      { tat: 2 },
      { tat: null } // should be ignored from denominator
    ];

    const metrics = computeScorecardMetrics(mockRows);
    
    // 2 rows <= 1 day out of 3 valid TAT rows = 66.66% => rounded to 66.7
    expect(metrics.tatPct).toBe(66.7);
  });

  it('should correctly compute S@H %', () => {
    const mockRows = [
      { isHome: true, tat: 1 },
      { isHome: true, tat: 3 },
      { isHome: true, tat: 5 },
      { isHome: false, tat: 1 } // Ignored
    ];

    const metrics = computeScorecardMetrics(mockRows);

    // 2 home rows <= 3 days out of 3 total home rows = 66.66% => rounded to 66.7
    expect(metrics.sahPct).toBe(66.7);
  });

  it('should correctly compute CAG %', () => {
    const mockRows = [
      { processScore: 100, skillScore: 100, auditScore: 100 },
      { processScore: 85, skillScore: 100, auditScore: 65 }
    ];

    const metrics = computeScorecardMetrics(mockRows);

    // Row 1 Avg: 100
    // Row 2 Avg: 83.33
    // The code does: avgProcess = 92.5, avgSkill = 100, avgAudit = 82.5
    // CAG = (92.5 + 100 + 82.5) / 3 = 91.66 => rounded to 91.7
    expect(metrics.cagPct).toBe(91.7);
  });
});
