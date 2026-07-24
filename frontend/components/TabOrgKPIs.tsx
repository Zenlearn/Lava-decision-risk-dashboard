import React, { useState } from 'react';

interface TabOrgKPIsProps {
  data: any;
  fmtINR: (v: number) => string;
  fmtPct: (v: number) => string;
}

export default function TabOrgKPIs({ data, fmtINR, fmtPct }: TabOrgKPIsProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('Jun');
  const [selectedBusmRow, setSelectedBusmRow] = useState<string | null>(null);

  const activeOrgKpi = data?.orgKpis?.by_month?.[selectedMonth] || data?.orgKpis?.all || { busms: [], asms: [], national: {} };

  const busmList: any[] = activeOrgKpi.busms || [];
  const allAsmList: any[] = activeOrgKpi.asms || [];
  const nationalSummary: any = activeOrgKpi.national || {};

  // Filter ASMs by clicked BUSM row (or show all if no row is clicked)
  const filteredAsmList = selectedBusmRow
    ? allAsmList.filter((a) => a.busm === selectedBusmRow)
    : allAsmList;

  // Calculate summary totals for filtered ASMs
  const asmTotalWo = filteredAsmList.reduce((sum, a) => sum + (a.wo || 0), 0);
  const asmAvgTat = filteredAsmList.length > 0 ? Math.round((filteredAsmList.reduce((sum, a) => sum + (a.tat || 0), 0) / filteredAsmList.length) * 10) / 10 : 0;
  const asmAvgCpc = filteredAsmList.length > 0 ? Math.round(filteredAsmList.reduce((sum, a) => sum + (a.cpc || 0), 0) / filteredAsmList.length) : 0;
  const asmAvgSah = filteredAsmList.length > 0 ? Math.round((filteredAsmList.reduce((sum, a) => sum + (a.sah || 0), 0) / filteredAsmList.length) * 10) / 10 : 0;
  const asmAvgNps = filteredAsmList.length > 0 ? Math.round((filteredAsmList.reduce((sum, a) => sum + (a.nps || 0), 0) / filteredAsmList.length) * 10) / 10 : 0;
  const asmAvgDiag = filteredAsmList.length > 0 ? Math.round((filteredAsmList.reduce((sum, a) => sum + (a.diag || 0), 0) / filteredAsmList.length) * 10) / 10 : 0;
  const asmAvgCag = filteredAsmList.length > 0 ? Math.round((filteredAsmList.reduce((sum, a) => sum + (a.cag || 0), 0) / filteredAsmList.length) * 10) / 10 : 0;

  return (
    <div className="view-mock on" style={{ paddingBottom: '40px' }}>
      
      {/* SECTION HEADER & MONTH SELECTOR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="bar" style={{ background: '#E50046' }}></div>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
            Organization KPIs &amp; Regional Performance Scorecards
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
            Select Month:
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1.5px solid #E50046',
              background: '#ffffff',
              color: '#0f172a',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <option value="Jun">June 2026</option>
            <option value="May">May 2026</option>
            <option value="Apr">April 2026</option>
          </select>
        </div>
      </div>

      {/* TABLE 1: BUSM PERFORMANCE & RANKING MATRIX */}
      <div className="card-mock" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              BUSM Performance &amp; Parameter Ranking Matrix
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Click any BUSM row to drill down into corresponding Area Manager (ASM) performance metrics below
            </span>
          </div>
          {selectedBusmRow && (
            <button
              onClick={() => setSelectedBusmRow(null)}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              Clear Filter ({selectedBusmRow})
            </button>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', lineHeight: '1.3' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th rowSpan={2} style={{ padding: '10px 12px', textAlign: 'left', borderRight: '1px solid #e2e8f0', width: '15%' }}>
                  BUSM Name
                </th>
                <th colSpan={6} style={{ padding: '6px 8px', textAlign: 'center', borderRight: '1px solid #e2e8f0', background: '#f1f5f9', color: '#0f172a', fontWeight: 800 }}>
                  Performance Metrics
                </th>
                <th colSpan={6} style={{ padding: '6px 8px', textAlign: 'center', background: '#eff6ff', color: '#1d4ed8', fontWeight: 800 }}>
                  Parameter Ranks
                </th>
              </tr>
              <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                <th style={{ padding: '8px', textAlign: 'right' }}>TAT %</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>CPC (₹)</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>S@H Adherence</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>NPS %</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Diagnostics Acc.</th>
                <th style={{ padding: '8px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>CAG Scorecard</th>

                <th style={{ padding: '8px', textAlign: 'center', background: '#eff6ff', color: '#1d4ed8' }}>TAT</th>
                <th style={{ padding: '8px', textAlign: 'center', background: '#eff6ff', color: '#1d4ed8' }}>CPC</th>
                <th style={{ padding: '8px', textAlign: 'center', background: '#eff6ff', color: '#1d4ed8' }}>S@H</th>
                <th style={{ padding: '8px', textAlign: 'center', background: '#eff6ff', color: '#1d4ed8' }}>NPS</th>
                <th style={{ padding: '8px', textAlign: 'center', background: '#eff6ff', color: '#1d4ed8' }}>Diag</th>
                <th style={{ padding: '8px', textAlign: 'center', background: '#eff6ff', color: '#1d4ed8' }}>CAG</th>
              </tr>
            </thead>
            <tbody>
              {busmList.map((r: any, i: number) => {
                const isSelected = selectedBusmRow === r.name;
                return (
                  <tr
                    key={i}
                    onClick={() => setSelectedBusmRow(isSelected ? null : r.name)}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: isSelected ? '#eff6ff' : i % 2 === 0 ? '#ffffff' : '#f8fafc',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 800, color: isSelected ? '#1d4ed8' : '#1e293b', borderRight: '1px solid #f1f5f9' }}>
                      {r.name} {isSelected && '✓'}
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>{r.tat}%</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>₹{r.cpc}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>{r.sah}%</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>{r.nps}%</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>{r.diag}%</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700, color: '#0f172a', borderRight: '1px solid #f1f5f9' }}>{r.cag}%</td>

                    <td style={{ padding: '10px 8px', textAlign: 'center', background: '#f8fafc', fontWeight: 700, color: '#2563eb' }}>{r.ranks?.tat}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center', background: '#f8fafc', fontWeight: 700, color: '#2563eb' }}>{r.ranks?.cpc}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center', background: '#f8fafc', fontWeight: 700, color: '#2563eb' }}>{r.ranks?.sah}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center', background: '#f8fafc', fontWeight: 700, color: '#2563eb' }}>{r.ranks?.nps}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center', background: '#f8fafc', fontWeight: 700, color: '#2563eb' }}>{r.ranks?.diag}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center', background: '#eff6ff', fontWeight: 800, color: '#1d4ed8' }}>{r.ranks?.cag}</td>
                  </tr>
                );
              })}

              {/* National % / Total Summary Row */}
              <tr style={{ borderTop: '2.5px solid #0f172a', background: '#f8fafc', fontWeight: 800 }}>
                <td style={{ padding: '12px', color: '#0f172a', borderRight: '1px solid #e2e8f0' }}>
                  {nationalSummary.name || 'National %'}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'right', color: '#0f172a' }}>{nationalSummary.tat ?? 85.0}%</td>
                <td style={{ padding: '12px 8px', textAlign: 'right', color: '#0f172a' }}>₹{nationalSummary.cpc ?? 620}</td>
                <td style={{ padding: '12px 8px', textAlign: 'right', color: '#0f172a' }}>{nationalSummary.sah ?? 90.5}%</td>
                <td style={{ padding: '12px 8px', textAlign: 'right', color: '#0f172a' }}>{nationalSummary.nps ?? 83.4}%</td>
                <td style={{ padding: '12px 8px', textAlign: 'right', color: '#0f172a' }}>{nationalSummary.diag ?? 96.2}%</td>
                <td style={{ padding: '12px 8px', textAlign: 'right', color: '#0f172a', borderRight: '1px solid #e2e8f0' }}>{nationalSummary.cag ?? 97.5}%</td>
                <td colSpan={6} style={{ padding: '12px 8px', textAlign: 'center', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                  National Benchmark Total
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* TABLE 2: ASM BREAKDOWN MATRIX */}
      <div className="card-mock" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Supervisor (ASM) Performance &amp; Parameter Ranking Matrix
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {selectedBusmRow ? `Showing Area Managers (ASMs) under ${selectedBusmRow}` : 'Showing all Area Managers (ASMs) across the organization'}
            </span>
          </div>
          <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
            Count: {filteredAsmList.length} ASMs
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', lineHeight: '1.3' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th rowSpan={2} style={{ padding: '10px 12px', textAlign: 'left', borderRight: '1px solid #e2e8f0', width: '15%' }}>
                  ASM Name
                </th>
                <th rowSpan={2} style={{ padding: '10px 10px', textAlign: 'left', borderRight: '1px solid #e2e8f0', width: '12%' }}>
                  BUSM
                </th>
                <th colSpan={6} style={{ padding: '6px 8px', textAlign: 'center', borderRight: '1px solid #e2e8f0', background: '#f1f5f9', color: '#0f172a', fontWeight: 800 }}>
                  Performance Metrics
                </th>
                <th colSpan={6} style={{ padding: '6px 8px', textAlign: 'center', background: '#eff6ff', color: '#1d4ed8', fontWeight: 800 }}>
                  Parameter Ranks
                </th>
              </tr>
              <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                <th style={{ padding: '8px', textAlign: 'right' }}>TAT %</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>CPC (₹)</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>S@H Adherence</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>NPS %</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Diagnostics Acc.</th>
                <th style={{ padding: '8px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>CAG Scorecard</th>

                <th style={{ padding: '8px', textAlign: 'center', background: '#eff6ff', color: '#1d4ed8' }}>TAT</th>
                <th style={{ padding: '8px', textAlign: 'center', background: '#eff6ff', color: '#1d4ed8' }}>CPC</th>
                <th style={{ padding: '8px', textAlign: 'center', background: '#eff6ff', color: '#1d4ed8' }}>S@H</th>
                <th style={{ padding: '8px', textAlign: 'center', background: '#eff6ff', color: '#1d4ed8' }}>NPS</th>
                <th style={{ padding: '8px', textAlign: 'center', background: '#eff6ff', color: '#1d4ed8' }}>Diag</th>
                <th style={{ padding: '8px', textAlign: 'center', background: '#eff6ff', color: '#1d4ed8' }}>CAG</th>
              </tr>
            </thead>
            <tbody>
              {filteredAsmList.length === 0 ? (
                <tr>
                  <td colSpan={14} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                    No ASMs found for selected filter.
                  </td>
                </tr>
              ) : (
                filteredAsmList.map((r: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#1e293b' }}>{r.name}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'left', color: '#64748b', borderRight: '1px solid #f1f5f9' }}>{r.busm}</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>{r.tat}%</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>₹{r.cpc}</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>{r.sah}%</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>{r.nps}%</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>{r.diag}%</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700, color: '#0f172a', borderRight: '1px solid #f1f5f9' }}>{r.cag}%</td>

                    <td style={{ padding: '8px', textAlign: 'center', background: '#f8fafc', fontWeight: 700, color: '#2563eb' }}>{r.ranks?.tat}</td>
                    <td style={{ padding: '8px', textAlign: 'center', background: '#f8fafc', fontWeight: 700, color: '#2563eb' }}>{r.ranks?.cpc}</td>
                    <td style={{ padding: '8px', textAlign: 'center', background: '#f8fafc', fontWeight: 700, color: '#2563eb' }}>{r.ranks?.sah}</td>
                    <td style={{ padding: '8px', textAlign: 'center', background: '#f8fafc', fontWeight: 700, color: '#2563eb' }}>{r.ranks?.nps}</td>
                    <td style={{ padding: '8px', textAlign: 'center', background: '#f8fafc', fontWeight: 700, color: '#2563eb' }}>{r.ranks?.diag}</td>
                    <td style={{ padding: '8px', textAlign: 'center', background: '#eff6ff', fontWeight: 800, color: '#1d4ed8' }}>{r.ranks?.cag}</td>
                  </tr>
                ))
              )}

              {/* Total Summary Row for ASMs */}
              <tr style={{ borderTop: '2.5px solid #0f172a', background: '#f8fafc', fontWeight: 800 }}>
                <td style={{ padding: '10px 12px', color: '#0f172a' }}>Total / Average</td>
                <td style={{ padding: '10px 10px', color: '#64748b', borderRight: '1px solid #e2e8f0' }}>{selectedBusmRow || 'All Regions'}</td>
                <td style={{ padding: '10px 8px', textAlign: 'right', color: '#0f172a' }}>{asmAvgTat}%</td>
                <td style={{ padding: '10px 8px', textAlign: 'right', color: '#0f172a' }}>₹{asmAvgCpc}</td>
                <td style={{ padding: '10px 8px', textAlign: 'right', color: '#0f172a' }}>{asmAvgSah}%</td>
                <td style={{ padding: '10px 8px', textAlign: 'right', color: '#0f172a' }}>{asmAvgNps}%</td>
                <td style={{ padding: '10px 8px', textAlign: 'right', color: '#0f172a' }}>{asmAvgDiag}%</td>
                <td style={{ padding: '10px 8px', textAlign: 'right', color: '#0f172a', borderRight: '1px solid #e2e8f0' }}>{asmAvgCag}%</td>
                <td colSpan={6} style={{ padding: '10px 8px', textAlign: 'center', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                  Regional Summary Total
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
