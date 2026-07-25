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

  const busmList: any[] = (activeOrgKpi.busms || []).filter((b: any) => b.name && !b.name.toLowerCase().includes('unknown'));
  const allAsmList: any[] = (activeOrgKpi.asms || []).filter((a: any) => a.name && !a.name.toLowerCase().includes('unknown') && a.busm && !a.busm.toLowerCase().includes('unknown'));
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
              <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', width: '22%' }}>BUSM Name</th>
                <th style={{ padding: '10px 10px', textAlign: 'right' }}>TAT % (Rank)</th>
                <th style={{ padding: '10px 10px', textAlign: 'right' }}>CPC ₹ (Rank)</th>
                <th style={{ padding: '10px 10px', textAlign: 'right' }}>S@H Adherence % (Rank)</th>
                <th style={{ padding: '10px 10px', textAlign: 'right' }}>NPS % (Rank)</th>
                <th style={{ padding: '10px 10px', textAlign: 'right' }}>Diagnostics Acc. (Rank)</th>
                <th style={{ padding: '10px 10px', textAlign: 'right' }}>CAG Scorecard (Rank)</th>
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
                    <td style={{ padding: '10px 10px', textAlign: 'right' }}>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{r.tat}%</span>
                      {r.ranks?.tat && (
                        <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 5px', borderRadius: '4px', marginLeft: '6px' }}>
                          #{r.ranks.tat}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 10px', textAlign: 'right' }}>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>₹{r.cpc}</span>
                      {r.ranks?.cpc && (
                        <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 5px', borderRadius: '4px', marginLeft: '6px' }}>
                          #{r.ranks.cpc}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 10px', textAlign: 'right' }}>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{r.sah}%</span>
                      {r.ranks?.sah && (
                        <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 5px', borderRadius: '4px', marginLeft: '6px' }}>
                          #{r.ranks.sah}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 10px', textAlign: 'right' }}>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{r.nps}%</span>
                      {r.ranks?.nps && (
                        <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 5px', borderRadius: '4px', marginLeft: '6px' }}>
                          #{r.ranks.nps}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 10px', textAlign: 'right' }}>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{r.diag}%</span>
                      {r.ranks?.diag && (
                        <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 5px', borderRadius: '4px', marginLeft: '6px' }}>
                          #{r.ranks.diag}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 10px', textAlign: 'right' }}>
                      <span style={{ fontWeight: 800, color: '#0f172a' }}>{r.cag}%</span>
                      {r.ranks?.cag && (
                        <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd', padding: '1px 6px', borderRadius: '4px', marginLeft: '6px' }}>
                          #{r.ranks.cag}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {/* National % / Total Summary Row */}
              <tr style={{ borderTop: '2.5px solid #0f172a', background: '#f8fafc', fontWeight: 800 }}>
                <td style={{ padding: '12px', color: '#0f172a', borderRight: '1px solid #e2e8f0', background: '#f1f5f9', fontWeight: 800 }}>
                  {nationalSummary.name || 'National %'}
                </td>
                <td style={{ padding: '12px 10px', textAlign: 'right', color: '#0f172a', fontWeight: 800 }}>{nationalSummary.tat ?? 85.0}%</td>
                <td style={{ padding: '12px 10px', textAlign: 'right', color: '#0f172a', fontWeight: 800 }}>₹{nationalSummary.cpc ?? 620}</td>
                <td style={{ padding: '12px 10px', textAlign: 'right', color: '#0f172a', fontWeight: 800 }}>{nationalSummary.sah ?? 90.5}%</td>
                <td style={{ padding: '12px 10px', textAlign: 'right', color: '#0f172a', fontWeight: 800 }}>{nationalSummary.nps ?? 83.4}%</td>
                <td style={{ padding: '12px 10px', textAlign: 'right', color: '#0f172a', fontWeight: 800 }}>{nationalSummary.diag ?? 96.2}%</td>
                <td style={{ padding: '12px 10px', textAlign: 'right', color: '#0f172a', fontWeight: 800 }}>{nationalSummary.cag ?? 97.5}%</td>
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
              <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', borderRight: '1px solid #e2e8f0', width: '16%' }}>ASM Name</th>
                <th style={{ padding: '10px 10px', textAlign: 'left', borderRight: '1px solid #e2e8f0', width: '14%' }}>BUSM</th>
                <th style={{ padding: '10px 10px', textAlign: 'right' }}>TAT % (Rank)</th>
                <th style={{ padding: '10px 10px', textAlign: 'right' }}>CPC ₹ (Rank)</th>
                <th style={{ padding: '10px 10px', textAlign: 'right' }}>S@H Adherence % (Rank)</th>
                <th style={{ padding: '10px 10px', textAlign: 'right' }}>NPS % (Rank)</th>
                <th style={{ padding: '10px 10px', textAlign: 'right' }}>Diagnostics Acc. (Rank)</th>
                <th style={{ padding: '10px 10px', textAlign: 'right' }}>CAG Scorecard (Rank)</th>
              </tr>
            </thead>
            <tbody>
              {filteredAsmList.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                    No ASMs found for selected filter.
                  </td>
                </tr>
              ) : (
                filteredAsmList.map((r: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#1e293b' }}>{r.name}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'left', color: '#64748b', borderRight: '1px solid #f1f5f9' }}>{r.busm}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{r.tat}%</span>
                      {r.ranks?.tat && (
                        <span style={{ fontSize: '10px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 4px', borderRadius: '4px', marginLeft: '4px' }}>
                          #{r.ranks.tat}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>₹{r.cpc}</span>
                      {r.ranks?.cpc && (
                        <span style={{ fontSize: '10px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 4px', borderRadius: '4px', marginLeft: '4px' }}>
                          #{r.ranks.cpc}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{r.sah}%</span>
                      {r.ranks?.sah && (
                        <span style={{ fontSize: '10px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 4px', borderRadius: '4px', marginLeft: '4px' }}>
                          #{r.ranks.sah}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{r.nps}%</span>
                      {r.ranks?.nps && (
                        <span style={{ fontSize: '10px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 4px', borderRadius: '4px', marginLeft: '4px' }}>
                          #{r.ranks.nps}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{r.diag}%</span>
                      {r.ranks?.diag && (
                        <span style={{ fontSize: '10px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 4px', borderRadius: '4px', marginLeft: '4px' }}>
                          #{r.ranks.diag}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{r.cag}%</span>
                      {r.ranks?.cag && (
                        <span style={{ fontSize: '10px', fontWeight: 800, background: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd', padding: '1px 4px', borderRadius: '4px', marginLeft: '4px' }}>
                          #{r.ranks.cag}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}

              {/* Total Summary Row for ASMs */}
              <tr style={{ borderTop: '2.5px solid #0f172a', background: '#f8fafc', fontWeight: 800 }}>
                <td style={{ padding: '10px 12px', color: '#0f172a', background: '#f1f5f9', fontWeight: 800 }}>Total / Average</td>
                <td style={{ padding: '10px 10px', color: '#64748b', borderRight: '1px solid #e2e8f0' }}>{selectedBusmRow || 'All Regions'}</td>
                <td style={{ padding: '10px 8px', textAlign: 'right', color: '#0f172a', fontWeight: 800 }}>{asmAvgTat}%</td>
                <td style={{ padding: '10px 8px', textAlign: 'right', color: '#0f172a', fontWeight: 800 }}>₹{asmAvgCpc}</td>
                <td style={{ padding: '10px 8px', textAlign: 'right', color: '#0f172a', fontWeight: 800 }}>{asmAvgSah}%</td>
                <td style={{ padding: '10px 8px', textAlign: 'right', color: '#0f172a', fontWeight: 800 }}>{asmAvgNps}%</td>
                <td style={{ padding: '10px 8px', textAlign: 'right', color: '#0f172a', fontWeight: 800 }}>{asmAvgDiag}%</td>
                <td style={{ padding: '10px 8px', textAlign: 'right', color: '#0f172a', fontWeight: 800 }}>{asmAvgCag}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: SERVE@HOME (S@H) APPOINTMENT METRICS (BY APPOINTMENT DATE) */}
      <div style={{ marginTop: '36px' }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="bar" style={{ background: '#2563eb' }}></div>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              Service at Home (S@H) Operational Benchmarks
            </span>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#2563eb', marginTop: '2px', marginLeft: '12px' }}>
            By Appointment Date
          </div>
        </div>

        {/* TABLE 3: BUSM APPOINTMENT METRICS TABLE */}
        <div className="card-mock" style={{ padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                BUSM Appointment Performance Matrix
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Service at Home appointment metrics by Business Unit Manager (BUSM)
              </span>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', lineHeight: '1.3' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', borderRight: '1px solid #e2e8f0', width: '18%' }}>BUSM Name</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>Total Appointments</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#d97706' }}>Cancellation %</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#475569' }}>Reschedule %</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#16a34a' }}>Same Day Attend %</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#dc2626' }}>Same Day Attend with Cancellation %</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#2563eb' }}>Pending to Attend %</th>
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
                      }}
                    >
                      <td style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 800, color: isSelected ? '#1d4ed8' : '#1e293b', borderRight: '1px solid #f1f5f9' }}>
                        {r.name} {isSelected && '✓'}
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, borderRight: '1px solid #f1f5f9' }}>
                        {(r.wo || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#d97706' }}>{r.cancelPct ?? 30.7}%</td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 600 }}>{r.reschedulePct ?? 10.0}%</td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>{r.sameDayAttendPct ?? 31.4}%</td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>{r.sameDayAttendCancelPct ?? 12.3}%</td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>{r.pendingToAttendPct ?? 5.5}%</td>
                    </tr>
                  );
                })}

                {/* National Total Summary Row */}
                <tr style={{ borderTop: '2.5px solid #0f172a', background: '#f8fafc', fontWeight: 800 }}>
                  <td style={{ padding: '12px', color: '#0f172a', borderRight: '1px solid #e2e8f0', background: '#f1f5f9', fontWeight: 800 }}>
                    {nationalSummary.name || 'National %'}
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', color: '#0f172a', borderRight: '1px solid #e2e8f0', fontWeight: 800 }}>
                    {(nationalSummary.wo || 16030).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', color: '#d97706', fontWeight: 800 }}>30.7%</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', color: '#0f172a', fontWeight: 800 }}>10.0%</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', color: '#16a34a', fontWeight: 800 }}>31.4%</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', color: '#dc2626', fontWeight: 800 }}>12.3%</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', color: '#2563eb', fontWeight: 800 }}>5.5%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* TABLE 4: ASM APPOINTMENT METRICS TABLE */}
        <div className="card-mock" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Supervisor (ASM) Appointment Performance Matrix
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
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', borderRight: '1px solid #e2e8f0', width: '16%' }}>ASM Name</th>
                  <th style={{ padding: '10px 10px', textAlign: 'left', borderRight: '1px solid #e2e8f0', width: '14%' }}>BUSM</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>Total Appointments</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#d97706' }}>Cancellation %</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#475569' }}>Reschedule %</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#16a34a' }}>Same Day Attend %</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#dc2626' }}>Same Day Attend with Cancellation %</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#2563eb' }}>Pending to Attend %</th>
                </tr>
              </thead>
              <tbody>
                {filteredAsmList.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                      No ASMs found for selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredAsmList.map((r: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#1e293b' }}>{r.name}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'left', color: '#64748b', borderRight: '1px solid #f1f5f9' }}>{r.busm}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, borderRight: '1px solid #f1f5f9' }}>
                        {(r.wo || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#d97706' }}>{r.cancelPct ?? 30.7}%</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>{r.reschedulePct ?? 10.0}%</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>{r.sameDayAttendPct ?? 31.4}%</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>{r.sameDayAttendCancelPct ?? 12.3}%</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>{r.pendingToAttendPct ?? 5.5}%</td>
                    </tr>
                  ))
                )}

                {/* Total Summary Row for ASMs */}
                <tr style={{ borderTop: '2.5px solid #0f172a', background: '#f8fafc', fontWeight: 800 }}>
                  <td style={{ padding: '10px 12px', color: '#0f172a', background: '#f1f5f9', fontWeight: 800 }}>Total / Average</td>
                  <td style={{ padding: '10px 10px', color: '#64748b', borderRight: '1px solid #e2e8f0' }}>{selectedBusmRow || 'All Regions'}</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', color: '#0f172a', borderRight: '1px solid #e2e8f0', fontWeight: 800 }}>
                    {asmTotalWo.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', color: '#d97706', fontWeight: 800 }}>30.7%</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', color: '#0f172a', fontWeight: 800 }}>10.0%</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', color: '#16a34a', fontWeight: 800 }}>31.4%</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', color: '#dc2626', fontWeight: 800 }}>12.3%</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', color: '#2563eb', fontWeight: 800 }}>5.5%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
