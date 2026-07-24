import React, { useState } from 'react';

interface TabInsightsProps {
  data: any;
  costs: {
    pcba: number;
    lcd: number;
    battery: number;
    camera: number;
    speaker: number;
    charger: number;
    travel: number;
  };
  fmtINR: (v: number) => string;
}

export default function TabInsights({ data, costs, fmtINR }: TabInsightsProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedModelMonth, setSelectedModelMonth] = useState<string>('all');
  const [selectedBusm, setSelectedBusm] = useState<string>('all');
  const [selectedAsm, setSelectedAsm] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'swapsCount' | 'sameDayPct' | 'sameDayToCallsPct' | 'sameDayCount' | 'totalCalls'>('swapsCount');

  const activeHome = selectedMonth === 'all'
    ? data.home
    : (data.home?.by_month?.[selectedMonth] || data.home);

  const activeModelHome = selectedModelMonth === 'all'
    ? data.home
    : (data.home?.by_month?.[selectedModelMonth] || data.home);

  const allAspsList: any[] = activeHome?.top_asps || [];
  const uniqueBusms = Array.from(new Set(allAspsList.map((r) => r.busm))).filter(Boolean).sort();
  const uniqueAsms = Array.from(new Set(allAspsList.map((r) => r.asm))).filter(Boolean).sort();

  // Handle BUSM Change (Cascading filter rule)
  const handleBusmChange = (newBusm: string) => {
    setSelectedBusm(newBusm);
    if (newBusm !== 'all') {
      const validAsms = Array.from(
        new Set(allAspsList.filter((r) => r.busm === newBusm).map((r) => r.asm))
      );
      if (!validAsms.includes(selectedAsm)) {
        setSelectedAsm('all');
      }
    }
  };

  // Available ASMs belong strictly to selectedBusm
  const availableAsms = Array.from(
    new Set(
      allAspsList
        .filter((r) => selectedBusm === 'all' || r.busm === selectedBusm)
        .map((r) => r.asm)
    )
  ).filter(Boolean).sort();

  // Filter ASPs based on BUSM & ASM
  let filteredAsps = allAspsList.filter((r) => {
    if (selectedBusm !== 'all' && r.busm !== selectedBusm) return false;
    if (selectedAsm !== 'all' && r.asm !== selectedAsm) return false;
    return true;
  });

  // Sort ASPs
  filteredAsps.sort((a, b) => {
    if (sortBy === 'sameDayPct') return (b.sameDayPct || 0) - (a.sameDayPct || 0);
    if (sortBy === 'sameDayToCallsPct') return (b.sameDayToCallsPct || 0) - (a.sameDayToCallsPct || 0);
    if (sortBy === 'sameDayCount') return (b.sameDayCount || 0) - (a.sameDayCount || 0);
    if (sortBy === 'totalCalls') return (b.totalCalls || 0) - (a.totalCalls || 0);
    return (b.n || 0) - (a.n || 0);
  });

  // Build BUSM & ASM Summary List (Table 1 Above)
  const busmAsmMap = new Map<string, {
    busm: string;
    asm: string;
    totalCalls: number;
    n: number;
    sameDayCount: number;
    sameDayPct: number;
    sameDayToCallsPct: number;
  }>();

  filteredAsps.forEach((r) => {
    const key = `${r.busm || 'Unknown'}___${r.asm || 'Unknown'}`;
    const existing = busmAsmMap.get(key) || {
      busm: r.busm || 'Unknown',
      asm: r.asm || 'Unknown',
      totalCalls: 0,
      n: 0,
      sameDayCount: 0,
      sameDayPct: 0,
      sameDayToCallsPct: 0,
    };
    existing.totalCalls += (r.totalCalls || 0);
    existing.n += (r.n || 0);
    existing.sameDayCount += (r.sameDayCount || 0);
    busmAsmMap.set(key, existing);
  });

  const busmAsmSummaryList = Array.from(busmAsmMap.values()).map((row) => {
    const sameDayPct = row.n > 0 ? Number(((row.sameDayCount / row.n) * 100).toFixed(1)) : 0;
    const sameDayToCallsPct = row.totalCalls > 0 ? Number(((row.sameDayCount / row.totalCalls) * 100).toFixed(1)) : 0;
    return { ...row, sameDayPct, sameDayToCallsPct };
  });

  busmAsmSummaryList.sort((a, b) => {
    if (sortBy === 'sameDayPct') return (b.sameDayPct || 0) - (a.sameDayPct || 0);
    if (sortBy === 'sameDayToCallsPct') return (b.sameDayToCallsPct || 0) - (a.sameDayToCallsPct || 0);
    if (sortBy === 'sameDayCount') return (b.sameDayCount || 0) - (a.sameDayCount || 0);
    if (sortBy === 'totalCalls') return (b.totalCalls || 0) - (a.totalCalls || 0);
    return (b.n || 0) - (a.n || 0);
  });

  return (
    <div className="view-mock on" style={{ paddingBottom: '40px' }}>
      
      {/* 1. DOORSTEP BOARD REPAIR INTEGRITY PANEL */}
      <div className="sec-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="bar"></div>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
            Doorstep Board Repair Integrity Panel
          </span>
        </div>
      </div>

      <div className="grid-mock k4">
        <div className="card-mock kpi-mock" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="big" style={{ color: '#0f172a', fontWeight: 800 }}>{(activeHome?.board_at_home ?? 0).toLocaleString()}</div>
          <div className="sub">board replacements logged at home ({activeHome?.pct_of_home}% of home visits)</div>
        </div>
        <div className="card-mock kpi-mock" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="big" style={{ color: '#0f172a', fontWeight: 800 }}>{(activeHome?.pcba_at_home ?? 0).toLocaleString()}</div>
          <div className="sub">of which motherboard swaps (PCBA)</div>
        </div>
        <div className="card-mock kpi-mock" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="big" style={{ color: '#0f172a', fontWeight: 800 }}>{(activeHome?.lcd_at_home ?? 0).toLocaleString()}</div>
          <div className="sub">of which display screens (LCD)</div>
        </div>
        <div className="card-mock kpi-mock" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="big" style={{ color: '#0f172a', fontWeight: 800 }}>{fmtINR((activeHome?.pcba_at_home || 0) * costs.pcba + (activeHome?.lcd_at_home || 0) * costs.lcd)}</div>
          <div className="sub">assumed doorstep board swap exposure</div>
        </div>
      </div>

      {/* SHARED CONTROLS BAR (MONTH, BUSM, ASM, SORT BY) */}
      <div className="card-mock" style={{ marginTop: '20px', padding: '14px 18px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
            Regional &amp; Hierarchical Filters
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Month:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="all">All Months (Apr – Jun 2026)</option>
                <option value="Apr">April 2026</option>
                <option value="May">May 2026</option>
                <option value="Jun">June 2026</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>BUSM:</span>
              <select
                value={selectedBusm}
                onChange={(e) => handleBusmChange(e.target.value)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="all">All BUSMs</option>
                {uniqueBusms.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>ASM:</span>
              <select
                value={selectedAsm}
                onChange={(e) => setSelectedAsm(e.target.value)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="all">All ASMs {selectedBusm !== 'all' ? `(in ${selectedBusm})` : ''}</option>
                {availableAsms.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Sort By:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1.5px solid #2563eb',
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="swapsCount">Highest Total Swaps</option>
                <option value="sameDayPct">Highest % Same-Day / Total Swaps</option>
                <option value="sameDayToCallsPct">Highest % Same-Day / Total Calls</option>
                <option value="sameDayCount">Highest Same-Day Count</option>
                <option value="totalCalls">Highest Total Calls</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE 1: SUMMARY BY BUSM AND ASM (NEW TABLE ABOVE ASP TABLE) */}
      <div className="card-mock" style={{ marginTop: '16px', padding: '16px' }}>
        <div style={{ marginBottom: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
          <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Summary of Doorstep Board Swaps by BUSM &amp; Supervisor (ASM)
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', lineHeight: '1.3' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                <th style={{ padding: '8px 8px', textAlign: 'left', whiteSpace: 'nowrap' }}>BUSM</th>
                <th style={{ padding: '8px 8px', textAlign: 'left', whiteSpace: 'nowrap' }}>Supervisor (ASM)</th>
                <th style={{ padding: '8px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>Total Calls</th>
                <th style={{ padding: '8px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>Total Board Swaps</th>
                <th style={{ padding: '8px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>Same-Day Swaps</th>
                <th style={{ padding: '8px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>% Same-Day / Swaps</th>
                <th style={{ padding: '8px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>% Same-Day / Total Calls</th>
              </tr>
            </thead>
            <tbody>
              {busmAsmSummaryList.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
                    No summary data found for selected filters.
                  </td>
                </tr>
              ) : (
                busmAsmSummaryList.map((r: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '7px 8px', textAlign: 'left', fontWeight: 600, color: '#1e293b' }}>{r.busm}</td>
                    <td style={{ padding: '7px 8px', textAlign: 'left', color: '#475569' }}>{r.asm}</td>
                    <td style={{ padding: '7px 8px', textAlign: 'right', fontWeight: 600, color: '#475569' }}>
                      {(r.totalCalls || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '7px 8px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                      {(r.n || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '7px 8px', textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>
                      {(r.sameDayCount || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '7px 8px', textAlign: 'right', fontWeight: 800 }}>
                      <span style={{
                        padding: '2px 5px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        background: (r.sameDayPct || 0) > 30 ? '#fef2f2' : '#f0fdf4',
                        color: (r.sameDayPct || 0) > 30 ? '#dc2626' : '#16a34a',
                        border: `1px solid ${(r.sameDayPct || 0) > 30 ? '#fecaca' : '#bbf7d0'}`,
                      }}>
                        {(r.sameDayPct ?? 0).toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ padding: '7px 8px', textAlign: 'right', fontWeight: 800 }}>
                      <span style={{
                        padding: '2px 5px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        background: (r.sameDayToCallsPct || 0) > 15 ? '#fff7ed' : '#f8fafc',
                        color: (r.sameDayToCallsPct || 0) > 15 ? '#c2410c' : '#0f172a',
                        border: `1px solid ${(r.sameDayToCallsPct || 0) > 15 ? '#ffedd5' : '#e2e8f0'}`,
                      }}>
                        {(r.sameDayToCallsPct ?? 0).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TABLE 2: TOP ASPS WITH DOORSTEP BOARD-LEVEL SWAPS */}
      <div className="card-mock" style={{ marginTop: '16px', padding: '16px' }}>
        <div style={{ marginBottom: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
          <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Top ASPs with Doorstep Board-level Swaps
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', lineHeight: '1.3' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                <th style={{ padding: '8px 8px', textAlign: 'left', whiteSpace: 'nowrap' }}>ASP Code</th>
                <th style={{ padding: '8px 8px', textAlign: 'left', whiteSpace: 'nowrap' }}>ASP Name</th>
                <th style={{ padding: '8px 8px', textAlign: 'left', whiteSpace: 'nowrap' }}>Supervisor (ASM)</th>
                <th style={{ padding: '8px 8px', textAlign: 'left', whiteSpace: 'nowrap' }}>BUSM</th>
                <th style={{ padding: '8px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>Total Calls</th>
                <th style={{ padding: '8px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>Total Board Swaps</th>
                <th style={{ padding: '8px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>Same-Day Swaps</th>
                <th style={{ padding: '8px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>% Same-Day / Swaps</th>
                <th style={{ padding: '8px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>% Same-Day / Total Calls</th>
              </tr>
            </thead>
            <tbody>
              {filteredAsps.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
                    No ASPs found matching selected filters.
                  </td>
                </tr>
              ) : (
                filteredAsps.map((r: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '7px 8px', textAlign: 'left', fontWeight: 600, color: '#475569', fontFamily: 'monospace' }}>{r.code || '-'}</td>
                    <td style={{ padding: '7px 8px', textAlign: 'left', fontWeight: 600, color: '#1e293b' }}>{r.asp}</td>
                    <td style={{ padding: '7px 8px', textAlign: 'left', color: '#475569' }}>{r.asm || '-'}</td>
                    <td style={{ padding: '7px 8px', textAlign: 'left', color: '#475569' }}>{r.busm || '-'}</td>
                    <td style={{ padding: '7px 8px', textAlign: 'right', fontWeight: 600, color: '#475569' }}>
                      {(r.totalCalls || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '7px 8px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                      {(r.n || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '7px 8px', textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>
                      {(r.sameDayCount || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '7px 8px', textAlign: 'right', fontWeight: 800 }}>
                      <span style={{
                        padding: '2px 5px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        background: (r.sameDayPct || 0) > 30 ? '#fef2f2' : '#f0fdf4',
                        color: (r.sameDayPct || 0) > 30 ? '#dc2626' : '#16a34a',
                        border: `1px solid ${(r.sameDayPct || 0) > 30 ? '#fecaca' : '#bbf7d0'}`,
                      }}>
                        {(r.sameDayPct ?? 0).toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ padding: '7px 8px', textAlign: 'right', fontWeight: 800 }}>
                      <span style={{
                        padding: '2px 5px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        background: (r.sameDayToCallsPct || 0) > 15 ? '#fff7ed' : '#f8fafc',
                        color: (r.sameDayToCallsPct || 0) > 15 ? '#c2410c' : '#0f172a',
                        border: `1px solid ${(r.sameDayToCallsPct || 0) > 15 ? '#ffedd5' : '#e2e8f0'}`,
                      }}>
                        {(r.sameDayToCallsPct ?? 0).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="note-mock" style={{ marginTop: '10px', fontSize: '11.5px', color: '#64748b' }}>
          Pull files for these outlying service centers from the Evidence Logs first. Verify motherboard/display billings against parts-return batches. Same-Day Doorstep Swaps represent jobs where Creation Date and Delivery Date are identical.
        </div>
      </div>

      {/* TABLE 2: INSIGHTS: AFFECTED MODEL SERIES AND ACTION CODES (MOVED BELOW TABLE 1) */}
      <div className="card-mock" style={{ marginTop: '20px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Insights: Affected Model Series and Action Codes
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Month:</span>
            <select
              value={selectedModelMonth}
              onChange={(e) => setSelectedModelMonth(e.target.value)}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="all">All Months (Apr – Jun 2026)</option>
              <option value="Apr">April 2026</option>
              <option value="May">May 2026</option>
              <option value="Jun">June 2026</option>
            </select>
          </div>
        </div>

        <div className="grid-mock k2" style={{ gap: '24px' }}>
          <div>
            <p className="note-mock" style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
              Concentration by device model
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Device Model</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Incident Count</th>
                </tr>
              </thead>
              <tbody>
                {(activeModelHome?.top_models || []).map((r: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#1e293b' }}>{r.model}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                      {(r.n || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <p className="note-mock" style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
              Concentration by action codes
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Action Recorded</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Incident Count</th>
                </tr>
              </thead>
              <tbody>
                {(activeModelHome?.top_actions || []).map((r: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#1e293b' }}>{r.action}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                      {(r.n || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recommended audit check guidelines for doorstep board billing */}
      <div className="card-mock" style={{ marginTop: '16px', borderLeft: '4px solid var(--cobalt)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Recommended audit check guidelines for doorstep board billing</h3>
        <ol style={{ marginLeft: '18px', fontSize: '13px', lineHeight: '1.9', color: '#475569', marginTop: '8px' }}>
          <li>Export high-outlier doorstep workorders from the Evidence tab (filter flag: "Board repair at home").</li>
          <li>Cross check these against the defective-part returns tracker to check if defective motherboards/displays were physically returned.</li>
          <li>Verify ASP inventory registers to check if they stock board components locally. If no local stock exists, doorstep swap was not physically possible.</li>
          <li>Verify root cause. If software upgrades could resolve the symptom, check if the technician billed high-value boards on hit-and-trial diagnosis.</li>
        </ol>
      </div>

      {/* 2. BROAD SECTION: SERVE@HOME (S@H) PROCESS EFFICIENCY & OPERATIONAL BENCHMARKS */}
      <div style={{ marginTop: '32px' }}>
        <div className="sec-title">
          <div className="bar" style={{ background: '#E50046' }}></div>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
            Serve@Home (S@H) Process Efficiency &amp; Operational Benchmarks
          </span>
        </div>

        {/* Overview Scope Banner */}
        <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '18px 22px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>
              Dataset Operational Scope: 16,030 Appointments Analyzed (Apr – Jun 2026)
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              Process metrics calculated across 532 Authorized Service Providers (ASPs), 36 Area Managers (ASMs), and 5 Business Unit Managers (BUSMs)
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '7px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 700 }}>
              Fulfillment: 68.7%
            </span>
            <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '7px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 700 }}>
              Avg TAT: 5.04 Days
            </span>
          </div>
        </div>

        {/* ROW 1: 3 TABLES (Dimensions 1, 2, 3) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>

          {/* Dimension 1: Service Fulfillment & Capacity Efficiency */}
          <div className="card-mock" style={{ margin: 0, padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <span style={{ background: '#dbeafe', color: '#1d4ed8', width: '26px', height: '26px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800 }}>1</span>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Service Fulfillment &amp; Capacity</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>Total Appointments Received</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>16,030</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>Appointment Fulfillment Rate</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#16a34a' }}>68.7% <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>(11,010 closed)</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>Appointment Cancellation Rate</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>30.7% <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>(4,926 rejected)</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>Work Order Conversion Velocity</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#2563eb' }}>99.2%</span>
              </div>
            </div>
          </div>

          {/* Dimension 2: Turnaround Time (TAT) & SLA Velocity */}
          <div className="card-mock" style={{ margin: 0, padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <span style={{ background: '#fef3c7', color: '#d97706', width: '26px', height: '26px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800 }}>2</span>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Turnaround Speed &amp; SLA Velocity</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>End-to-End Mean TAT</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>5.04 Days <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>(Median: 4.05d)</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>Same-Day (24h) Resolution Rate</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#16a34a' }}>31.4% <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>(3,462 orders)</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>3-Day SLA Adherence Rate</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#2563eb' }}>49.8% <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>(5,483 orders)</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>Pickup &amp; Delivery Dispatch Speed</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#475569' }}>1.4 Hours <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>(Avg transit)</span></span>
              </div>
            </div>
          </div>

          {/* Dimension 3: Logistics & Field Technician Productivity */}
          <div className="card-mock" style={{ margin: 0, padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <span style={{ background: '#dcfce7', color: '#15803d', width: '26px', height: '26px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800 }}>3</span>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Field Logistics &amp; Technician Productivity</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>GPS Geo-Tagging Compliance Rate</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#16a34a' }}>68.7% <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>(11,015 visits)</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>Mean Technician Travel Distance</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>39.15 KM <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>(Median: 7.0 km)</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>Technician Productivity Index</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#2563eb' }}>19.6 Orders / Tech / Mo</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>Active Field Technicians</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#475569' }}>560 Technicians</span>
              </div>
            </div>
          </div>

        </div>

        {/* ROW 2: 2 TABLES (Dimensions 4, 5) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>

          {/* Dimension 4: Technical Resolution & Repair Quality */}
          <div className="card-mock" style={{ margin: 0, padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <span style={{ background: '#f3e8ff', color: '#7e22ce', width: '26px', height: '26px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800 }}>4</span>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Technical Resolution &amp; Repair Quality</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>Appointment Reschedule Rate</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#d97706' }}>10.0% <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>(1,605 cases)</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>Component Replacement Share</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>33.3% <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>(3,674 parts)</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>Soft Repair Rate (Software/NFF)</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#16a34a' }}>14.2% <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>(2,128 updates)</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>Unrepaired Return Rate</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#475569' }}>11.0% <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>(1,760 cases)</span></span>
              </div>
            </div>
          </div>

          {/* Dimension 5: Cancellation & Customer Friction Analysis */}
          <div className="card-mock" style={{ margin: 0, padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <span style={{ background: '#ffe4e6', color: '#e11d48', width: '26px', height: '26px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800 }}>5</span>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Cancellation &amp; Customer Friction</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>Customer Unreachable Share</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>76.4% <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>(3,763 of cancels)</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>Out-of-Warranty Price Refusal</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#d97706' }}>4.8% <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>(236 cancels)</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>Self-Resolved Issue Prior to Visit</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#16a34a' }}>3.2% <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>(157 cancels)</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>Model Intake Information Error</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#475569' }}>1.8% <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>(89 cancels)</span></span>
              </div>
            </div>
          </div>

        </div>

        {/* 4-Tier Hierarchical Rollup Framework Table */}
        <div className="card-mock" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
            4-Tier Hierarchical Aggregation Framework (ASP &rarr; ASM &rarr; BUSM &rarr; Organization)
          </h3>
          <span style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '16px' }}>
            Mathematical roll-up rules ensuring seamless alignment from individual service centers to corporate targets
          </span>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '12.5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Hierarchy Level</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Entity Scope</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Entity Count</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Primary Measurable Efficiency Metrics</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#2563eb' }}>Level 1: ASP</td>
                  <td style={{ padding: '12px 16px', textAlign: 'left', color: '#1e293b', fontWeight: 500 }}>Authorized Service Provider (Center)</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>532 ASPs</td>
                  <td style={{ padding: '12px 16px', textAlign: 'left', color: '#334155' }}>Fulfillment %, Mean TAT, GPS Tagging %, Reschedule %, Travel Distance (KM)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#7e22ce' }}>Level 2: ASM</td>
                  <td style={{ padding: '12px 16px', textAlign: 'left', color: '#1e293b', fontWeight: 500 }}>Area Service Manager (Territory Supervisor)</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>36 ASMs</td>
                  <td style={{ padding: '12px 16px', textAlign: 'left', color: '#334155' }}>Territory Fulfillment %, SLA Adherence %, Outlier ASP Count, Supervisor Scorecard</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#d97706' }}>Level 3: BUSM</td>
                  <td style={{ padding: '12px 16px', textAlign: 'left', color: '#1e293b', fontWeight: 500 }}>Business Unit Service Manager (Zonal Lead)</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>5 BUSMs</td>
                  <td style={{ padding: '12px 16px', textAlign: 'left', color: '#334155' }}>Zonal Fulfillment %, Regional Quality Score, Macro SLA Variance, Zonal Resource Allocation</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                  <td style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 800, color: '#0f172a' }}>Level 4: Org Whole</td>
                  <td style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#0f172a' }}>National Corporate Benchmark</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>1 National Org</td>
                  <td style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#0f172a' }}>68.7% Fulfillment, 5.04d Mean TAT, 68.7% GPS Compliance, 10.0% Reschedule Rate</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
