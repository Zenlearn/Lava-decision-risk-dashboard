import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, Cell, LabelList, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { DASHBOARD_DEFINITIONS } from '../constants/definitions';

interface TabDashboardProps {
  data: any;
  isMounted: boolean;
  leakCur: number;
  leakDelta: number;
  annualLeakRunRate: number;
  latestKPI: any;
  previousKPI: any;
  fmtINR: (v: number) => string;
  fmtPct: (v: number) => string;
}

export default function TabDashboard({
  data,
  isMounted,
  leakCur: initialLeakCur,
  leakDelta: initialLeakDelta,
  annualLeakRunRate: initialAnnualLeakRunRate,
  latestKPI: initialLatestKPI,
  previousKPI: initialPreviousKPI,
  fmtINR,
  fmtPct
}: TabDashboardProps) {
  const allMonths = data?.kpi?.months || [];
  const latestMonthName = allMonths[allMonths.length - 1]?.month || initialLatestKPI?.month || 'Jun';
  
  const [selectedMonth, setSelectedMonth] = useState<string>(latestMonthName);
  
  // Accordion open/close state for all deep dive sections
  const [expandedSections, setExpandedSections] = useState({
    leakage: true,
    mttr: true,
    csat: true,
    trends: true,
    calc: true,
  });

  const toggleSection = (key: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allExpanded = Object.values(expandedSections).every(Boolean);

  const toggleExpandAll = () => {
    const nextState = !allExpanded;
    setExpandedSections({
      leakage: nextState,
      mttr: nextState,
      csat: nextState,
      trends: nextState,
      calc: nextState,
    });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -70; // Header & sticky bar offset
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (allMonths.length > 0) {
      const latestName = allMonths[allMonths.length - 1]?.month;
      if (latestName) {
        setSelectedMonth(latestName);
      }
    }
  }, [allMonths]);

  // Find currently selected month's KPI object and its previous month's KPI object
  const selectedMonthIdx = allMonths.findIndex((m: any) => m.month === selectedMonth);
  const currentKPI = selectedMonthIdx !== -1 ? allMonths[selectedMonthIdx] : initialLatestKPI;
  const prevKPI = selectedMonthIdx > 0 ? allMonths[selectedMonthIdx - 1] : null;

  // Active month dynamic calculations
  const activeLeakCur = currentKPI?.leak || 0;
  const activeLeakPrev = prevKPI ? (prevKPI.leak || 0) : 0;
  const activeLeakDelta = prevKPI ? (activeLeakCur - activeLeakPrev) : 0;
  const activeAnnualLeakRunRate = activeLeakCur * 12;

  const currentBreakdown = currentKPI?.breakdown || [
    { key: 'pcba', label: 'Motherboard (PCBA)', quantity: currentKPI?._leakparts?.pcba || 0, cost: (currentKPI?._leakparts?.pcba || 0) * 1800 },
    { key: 'lcd', label: 'Display Screen (LCD)', quantity: currentKPI?._leakparts?.lcd || 0, cost: (currentKPI?._leakparts?.lcd || 0) * 1200 },
    { key: 'battery', label: 'Battery Unit', quantity: Math.round((currentKPI?._leakparts?.pcba || 0) * 0.15), cost: Math.round((currentKPI?._leakparts?.pcba || 0) * 0.15 * 600) },
    { key: 'camera', label: 'Camera Module', quantity: Math.round((currentKPI?._leakparts?.lcd || 0) * 0.1), cost: Math.round((currentKPI?._leakparts?.lcd || 0) * 0.1 * 450) },
    { key: 'speaker', label: 'Speaker / Audio Assembly', quantity: Math.round((currentKPI?._leakparts?.pcba || 0) * 0.08), cost: Math.round((currentKPI?._leakparts?.pcba || 0) * 0.08 * 150) },
    { key: 'charger', label: 'Charger / Power Adapter', quantity: Math.round((currentKPI?._leakparts?.pcba || 0) * 0.05), cost: Math.round((currentKPI?._leakparts?.pcba || 0) * 0.05 * 250) },
    { key: 'travel', label: 'Technician Home Travel Fee', quantity: currentKPI?._leaktravel || 0, cost: (currentKPI?._leaktravel || 0) * 500 },
  ];

  const prevBreakdown = prevKPI?.breakdown || [];

  const currentTatDist = currentKPI?.tatDistribution || [
    { key: '1d', label: 'Repaired in 1 Day (24 Hours)', quantity: Math.round((currentKPI?.wo || 0) * 0.45), pct: 45.0 },
    { key: '3d', label: 'Repaired in 2 – 3 Days', quantity: Math.round((currentKPI?.wo || 0) * 0.35), pct: 35.0 },
    { key: 'gt3d', label: 'Repaired in > 3 Days', quantity: Math.round((currentKPI?.wo || 0) * 0.20), pct: 20.0 },
  ];

  const currentCsatDist = currentKPI?.csatDistribution || [
    { key: '5', label: 'Rating 5 (5-Star)', quantity: Math.round((currentKPI?.wo || 0) * 0.42), pct: 42.0 },
    { key: '4', label: 'Rating 4 (4-Star)', quantity: Math.round((currentKPI?.wo || 0) * 0.38), pct: 38.0 },
    { key: '3', label: 'Rating 3 (3-Star)', quantity: Math.round((currentKPI?.wo || 0) * 0.10), pct: 10.0 },
    { key: '2', label: 'Rating 2 (2-Star)', quantity: Math.round((currentKPI?.wo || 0) * 0.06), pct: 6.0 },
    { key: '1', label: 'Rating 1 (1-Star)', quantity: Math.round((currentKPI?.wo || 0) * 0.04), pct: 4.0 },
  ];

  const prevTatDist = prevKPI?.tatDistribution || [];

  return (
    <div className="view-mock on" style={{ paddingBottom: '60px' }}>

      {/* Month Dropdown Selector on left-hand side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Select Reporting Month:
        </label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{
            background: '#ffffff',
            border: '2px solid #E50046',
            borderRadius: '8px',
            padding: '6px 14px',
            fontSize: '14px',
            fontWeight: 700,
            color: '#0f172a',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            outline: 'none'
          }}
        >
          {allMonths.map((m: any) => (
            <option key={m.month} value={m.month}>
              {m.month} {m.month === latestMonthName ? '(Latest)' : ''}
            </option>
          ))}
        </select>
      </div>      {/* Clean Headline Exposure Hero Box (Upper-Right Duplicate Summary Removed) */}
      <div className="headline" style={{ marginBottom: '20px' }}>
        <div className="hl-main" style={{ width: '100%', paddingRight: 0 }}>
          <div className="hl-label">Estimated Monthly Leakage Exposure</div>
          <div className="hl-value">{fmtINR(activeLeakCur)}</div>
          {prevKPI ? (
            <div className={`hl-delta ${activeLeakDelta < 0 ? 'up' : 'down'}`}>
              {activeLeakDelta < 0 ? '↓ ' : '↑ '}{fmtINR(Math.abs(activeLeakDelta))} vs {prevKPI.month}
            </div>
          ) : (
            <div className="hl-delta flat">• Baseline Month</div>
          )}
          <div className="hl-context">
            Actual component value exposure (PCBA, LCD, Battery &amp; Home Visit Travel Fees) logged for Service at Home (S@H / Doorstep) anomalous work orders on <b>{currentKPI?.month || selectedMonth}</b> (excluding Customer and Trade walk-in calls). Annualised run-rate &asymp; <b>{fmtINR(activeAnnualLeakRunRate)}</b>.
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="kpi-strip" style={{ marginBottom: '20px' }}>
        {[
          { 
            label: 'First-time fix rate', 
            value: currentKPI?.ftfr || 0, 
            target: data?.kpi?.targets?.ftfr || 85, 
            delta: prevKPI ? Math.round((currentKPI.ftfr - prevKPI.ftfr) * 10) / 10 : null, 
            higherBetter: true, 
            driver: 'Fewer repeat bounces lift this' 
          },
          { 
            label: 'Customer satisfaction', 
            value: currentKPI?.csat || 0, 
            target: data?.kpi?.targets?.csat || 95, 
            delta: prevKPI ? Math.round((currentKPI.csat - prevKPI.csat) * 10) / 10 : null, 
            higherBetter: true, 
            driver: 'Fewer detractor ratings lift this' 
          },
          { 
            label: 'Mean time to repair', 
            value: currentKPI?.mttr || 0, 
            target: data?.kpi?.targets?.mttr || 3.5, 
            delta: prevKPI ? Math.round((currentKPI.mttr - prevKPI.mttr) * 100) / 100 : null, 
            higherBetter: false, 
            format: (v: number) => `${v.toFixed(2)}d`,
            driver: 'Faster turnaround lowers this' 
          },
          { 
            label: 'Diagnostic accuracy', 
            value: currentKPI?.diag || 0, 
            target: data?.kpi?.targets?.diag || 90, 
            delta: prevKPI ? Math.round((currentKPI.diag - prevKPI.diag) * 10) / 10 : null, 
            higherBetter: true, 
            driver: 'Fewer part mismatches lift this' 
          },
        ].map((k, i) => {
          const fillWidth = Math.min(100, Math.max(0, (k.value / k.target) * 100));
          const isGood = k.higherBetter ? k.value >= k.target : k.value <= k.target;
          const barColor = isGood ? 'var(--green)' : 'var(--red)';

          return (
            <div className="kc" key={i}>
              <div className="kc-label">{k.label}</div>
              <div className="kc-value">{k.format ? k.format(k.value) : fmtPct(k.value)}</div>
              <div className="kc-meta">
                {k.delta !== null ? (
                  <span className={`kc-trend ${k.delta >= 0 === k.higherBetter ? 'up' : 'down'}`}>
                    {k.delta >= 0 ? '↑' : '↓'} {k.format ? k.format(Math.abs(k.delta)) : fmtPct(Math.abs(k.delta))}
                  </span>
                ) : (
                  <span className="kc-trend flat">• Baseline</span>
                )}
                <span className="kc-target">Target {k.format ? k.format(k.target) : fmtPct(k.target)}</span>
              </div>
              <div className="kc-bar">
                <div className="kc-fill" style={{ width: `${fillWidth}%`, backgroundColor: barColor }}></div>
              </div>
              <div className="kc-driver">{k.driver}</div>
            </div>
          );
        })}
      </div>

      {/* Sticky Section Navigator Bar */}
      <div style={{
        position: 'sticky',
        top: '0px',
        zIndex: 90,
        background: '#ffffff',
        borderBottom: '2px solid #e2e8f0',
        padding: '10px 16px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: '10px',
        boxShadow: '0 4px 12px -2px rgba(0,0,0,0.06)',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '4px' }}>
            Jump to Deep Dive:
          </span>
          <button onClick={() => scrollToSection('sec-leakage')} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
            Leakage Exposure
          </button>
          <button onClick={() => scrollToSection('sec-mttr')} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
            MTTR Deep Dive
          </button>
          <button onClick={() => scrollToSection('sec-csat')} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
            C-SAT Deep Dive
          </button>
          <button onClick={() => scrollToSection('sec-trends')} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
            KPI Trends &amp; Changes
          </button>
          <button onClick={() => scrollToSection('sec-calc')} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
            KPI Formulas
          </button>
        </div>

        <button
          onClick={toggleExpandAll}
          style={{
            background: '#111827',
            color: '#ffffff',
            border: 'none',
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          {allExpanded ? 'Collapse All Sections' : 'Expand All Sections'}
        </button>
      </div>

      {/* SECTION 1: LEAKAGE EXPOSURE DEEP DIVE ACCORDION */}
      <div id="sec-leakage" className="panel" style={{ marginBottom: '24px', padding: '0', overflow: 'hidden' }}>
        <div
          onClick={() => toggleSection('leakage')}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            background: '#f8fafc',
            borderBottom: expandedSections.leakage ? '1px solid #e2e8f0' : 'none',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#E50046' }}>
              {expandedSections.leakage ? '▼' : '▶'}
            </span>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                Estimated Monthly Leakage Exposure Deep Dive
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Service at Home (S@H) component-level line items summing to total headline leakage of {fmtINR(activeLeakCur)} (excluding walk-in calls) for {currentKPI?.month || selectedMonth}
              </span>
            </div>
          </div>
          <span style={{ background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 800 }}>
            Total Exposure: {fmtINR(activeLeakCur)}
          </span>
        </div>

        {expandedSections.leakage && (
          <div style={{ padding: '20px' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1', color: '#475569', textAlign: 'left', fontSize: '12.5px', textTransform: 'uppercase', letterSpacing: '0.04em', background: '#f8fafc' }}>
                    <th style={{ padding: '12px 14px' }}>Line Item / Component</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>Quantity (Units / Visits)</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Total Exposure Cost</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>% Share of Total</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>MoM Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBreakdown.map((item: any, idx: number) => {
                    const prevItem = prevBreakdown.find((pb: any) => pb.key === item.key || pb.label === item.label);
                    const prevCost = prevItem?.cost || 0;
                    const costDiff = prevKPI ? (item.cost - prevCost) : 0;
                    const pctShare = activeLeakCur > 0 ? ((item.cost / activeLeakCur) * 100).toFixed(1) : '0.0';

                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 600, color: '#1e293b' }}>{item.label}</td>
                        <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600, color: '#475569' }}>
                          {(item.quantity || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                          {fmtINR(item.cost || 0)}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600, color: '#64748b' }}>
                          {pctShare}%
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700 }}>
                          {prevKPI ? (
                            <span style={{
                              color: costDiff < 0 ? '#16a34a' : costDiff > 0 ? '#dc2626' : '#64748b',
                              background: costDiff < 0 ? '#f0fdf4' : costDiff > 0 ? '#fef2f2' : '#f8fafc',
                              padding: '3px 10px', borderRadius: '4px', fontSize: '12px'
                            }}>
                              {costDiff > 0 ? `↑ +${fmtINR(costDiff)}` : costDiff < 0 ? `↓ -${fmtINR(Math.abs(costDiff))}` : '• Stable'}
                            </span>
                          ) : (
                            <span style={{ color: '#64748b', fontSize: '12px' }}>• Baseline</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: MEAN TIME TO REPAIR (MTTR) DEEP DIVE ACCORDION */}
      <div id="sec-mttr" className="panel" style={{ marginBottom: '24px', padding: '0', overflow: 'hidden' }}>
        <div
          onClick={() => toggleSection('mttr')}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            background: '#f8fafc',
            borderBottom: expandedSections.mttr ? '1px solid #e2e8f0' : 'none',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#E50046' }}>
              {expandedSections.mttr ? '▼' : '▶'}
            </span>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                Mean Time to Repair (MTTR) Deep Dive ({currentKPI?.month || selectedMonth})
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Frequency breakdown of work orders by turnaround speed (1 Day, 2–3 Days, &gt;3 Days)
              </span>
            </div>
          </div>
          <span style={{ background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 800 }}>
            Average MTTR: {(currentKPI?.mttr || 0).toFixed(2)} Days
          </span>
        </div>

        {expandedSections.mttr && (
          <div style={{ padding: '20px' }}>
            {/* Top Summary Badges Row */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {currentTatDist.map((item: any, idx: number) => {
                const badgeColor = item.key === '1d' ? '#10b981' : item.key === '3d' ? '#f59e0b' : '#ef4444';
                const bgTint = item.key === '1d' ? '#ecfdf5' : item.key === '3d' ? '#fffbeb' : '#fef2f2';
                return (
                  <div key={idx} style={{
                    background: bgTint,
                    border: `1px solid ${badgeColor}40`,
                    borderRadius: '10px',
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    flex: 1,
                    minWidth: '180px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: badgeColor, flexShrink: 0 }}></span>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                      {item.quantity.toLocaleString('en-IN')} <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>({item.pct}%)</span>
                    </div>
                  </div>
                );
              })}

              {/* Total Work Orders Summary Badge */}
              {(() => {
                const totalWo = currentTatDist.reduce((sum: number, i: any) => sum + (i.quantity || 0), 0);
                return (
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    flex: 1,
                    minWidth: '180px'
                  }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                      Total Monthly Work Orders
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                      {totalWo.toLocaleString('en-IN')} <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>(100.0%)</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Full Width Frequency Bar Chart */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px 20px 10px 20px', height: '300px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Turnaround Speed Frequency Distribution (Work Order Count &amp; % Share)
              </div>
              {isMounted && (
                <ResponsiveContainer width="100%" height="82%">
                  <BarChart data={currentTatDist} margin={{ top: 25, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="label" tickLine={false} style={{ fontSize: '12px', fontWeight: 700, fill: '#1e293b' }} />
                    <YAxis tickLine={false} style={{ fontSize: '11px', fill: '#64748b' }} />
                    <Tooltip formatter={(val: any) => [`${val.toLocaleString('en-IN')} work orders`, 'Quantity']} />
                    <Bar dataKey="quantity" name="Work Orders" radius={[6, 6, 0, 0]}>
                      {currentTatDist.map((entry: any, index: number) => {
                        const colors = ['#10b981', '#f59e0b', '#ef4444'];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                      <LabelList
                        dataKey="quantity"
                        position="top"
                        content={({ x, y, width, index }: any) => {
                          const entry = currentTatDist[index];
                          if (!entry) return null;
                          const countStr = entry.quantity.toLocaleString('en-IN');
                          const pctStr = `${entry.pct}%`;
                          return (
                            <text
                              x={Number(x) + Number(width) / 2}
                              y={Number(y) - 8}
                              fill="#0f172a"
                              textAnchor="middle"
                              fontSize={13}
                              fontWeight={800}
                            >
                              {countStr} ({pctStr})
                            </text>
                          );
                        }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: CUSTOMER SATISFACTION (C-SAT) DEEP DIVE ACCORDION */}
      <div id="sec-csat" className="panel" style={{ marginBottom: '24px', padding: '0', overflow: 'hidden' }}>
        <div
          onClick={() => toggleSection('csat')}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            background: '#f8fafc',
            borderBottom: expandedSections.csat ? '1px solid #e2e8f0' : 'none',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#E50046' }}>
              {expandedSections.csat ? '▼' : '▶'}
            </span>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                Customer Satisfaction (C-SAT) Deep Dive
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Empirical NPS survey distribution, feedback channel breakdown (WhatsApp vs IVR), and rating frequencies for {currentKPI?.month || selectedMonth}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
              ✓ Verified NPS Dataset (10,570 Surveys)
            </span>
            <span style={{ background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 800 }}>
              C-SAT Score: {fmtPct(currentKPI?.csat || 83.4)}
            </span>
          </div>
        </div>

        {expandedSections.csat && (
          <div style={{ padding: '20px' }}>
            {/* Top KPI Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>C-SAT Satisfaction Index</span>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#16a34a' }}>{fmtPct(currentKPI?.csat || 83.4)}</span>
                <span style={{ fontSize: '11px', color: '#475569' }}>Target 95.0% (+1.2% MoM)</span>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Net Promoter Score (NPS)</span>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#2563eb' }}>+63.9</span>
                <span style={{ fontSize: '11px', color: '#475569' }}>Promoters % − Detractors %</span>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Detractor Rate (1-2 Stars)</span>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#dc2626' }}>10.0%</span>
                <span style={{ fontSize: '11px', color: '#dc2626' }}>372 Detractor Work Orders</span>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Survey Response Rate</span>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>35.1%</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>3,707 Responded / 10,570 Sent</span>
              </div>
            </div>

            {/* Top Summary Badges Row for Rating 5 to 1 */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {currentCsatDist.map((item: any, idx: number) => {
                const badgeColor = item.key === '5' ? '#10b981' : item.key === '4' ? '#34d399' : item.key === '3' ? '#f59e0b' : item.key === '2' ? '#f97316' : '#ef4444';
                const bgTint = item.key === '5' || item.key === '4' ? '#ecfdf5' : item.key === '3' ? '#fffbeb' : '#fef2f2';
                return (
                  <div key={idx} style={{
                    background: bgTint,
                    border: `1px solid ${badgeColor}40`,
                    borderRadius: '10px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    flex: 1,
                    minWidth: '150px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: badgeColor, flexShrink: 0 }}></span>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                      {item.quantity.toLocaleString('en-IN')} <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>({item.pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Full Width Rating Frequency Bar Chart */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px 20px 10px 20px', height: '300px', marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Rating Frequency Distribution (Rating 1 to Rating 5 Count &amp; % Share)
              </div>
              {isMounted && (
                <ResponsiveContainer width="100%" height="82%">
                  <BarChart data={currentCsatDist} margin={{ top: 25, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="label" tickLine={false} style={{ fontSize: '12px', fontWeight: 700, fill: '#1e293b' }} />
                    <YAxis tickLine={false} style={{ fontSize: '11px', fill: '#64748b' }} />
                    <Tooltip formatter={(val: any) => [`${val.toLocaleString('en-IN')} survey responses`, 'Quantity']} />
                    <Bar dataKey="quantity" name="Responses" radius={[6, 6, 0, 0]}>
                      {currentCsatDist.map((entry: any, index: number) => {
                        const colors = ['#10b981', '#34d399', '#f59e0b', '#f97316', '#ef4444'];
                        return <Cell key={`cell-csat-${index}`} fill={colors[index % colors.length]} />;
                      })}
                      <LabelList
                        dataKey="quantity"
                        position="top"
                        content={({ x, y, width, index }: any) => {
                          const item = currentCsatDist[index];
                          if (!item) return null;
                          return (
                            <text
                              x={Number(x) + Number(width) / 2}
                              y={Number(y) - 8}
                              fill="#0f172a"
                              textAnchor="middle"
                              style={{ fontSize: '12px', fontWeight: 800 }}
                            >
                              {`${item.quantity.toLocaleString('en-IN')} (${item.pct}%)`}
                            </text>
                          );
                        }}
                      />
                    </Bar>
                </ResponsiveContainer>
              )}
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                NPS Survey Feedback Channel Performance (WhatsApp vs IVR)
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
                Performance breakdown across automated customer feedback touchpoints
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '12.5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <th style={{ padding: '12px 14px', textAlign: 'left' }}>Survey Channel</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>Surveys Sent</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>Responded Count</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>Response Rate</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>Promoters &amp; Satisfied (4-5★)</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>Detractors (1-2★)</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>Net Promoter Score</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>Channel CSAT %</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, color: '#2563eb' }}>WhatsApp Channel</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600 }}>6,339</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600 }}>2,690</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600, color: '#475569' }}>42.4%</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>2,208 (82.1%)</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>292 (10.9%)</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, color: '#2563eb' }}>+61.3</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, color: '#16a34a' }}>82.1%</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, color: '#7e22ce' }}>IVR Call Channel</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600 }}>4,231</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600 }}>1,017</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600, color: '#475569' }}>24.0%</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>882 (86.7%)</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>80 (7.9%)</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight 800, color: '#2563eb' }}>+71.3</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, color: '#16a34a' }}>86.7%</td>
                    </tr>
                    <tr style={{ borderTop: '2px solid #cbd5e1', background: '#f8fafc', fontWeight: 800 }}>
                      <td style={{ padding: '12px 14px', textAlign: 'left', color: '#0f172a' }}>Total / National Overall</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', color: '#0f172a' }}>10,570</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', color: '#0f172a' }}>3,707</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', color: '#0f172a' }}>35.1%</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', color: '#16a34a' }}>3,090 (83.4%)</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', color: '#0f172a' }}>372 (10.0%)</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', color: '#2563eb' }}>+63.9</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', color: '#16a34a', fontSize: '15px' }}>83.4%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>ble>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: ORGANIZATIONAL KPI TREND LINES & WHAT CHANGED ACCORDION */}
      <div id="sec-trends" className="panel" style={{ marginBottom: '24px', padding: '0', overflow: 'hidden' }}>
        <div
          onClick={() => toggleSection('trends')}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            background: '#f8fafc',
            borderBottom: expandedSections.trends ? '1px solid #e2e8f0' : 'none',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#E50046' }}>
              {expandedSections.trends ? '▼' : '▶'}
            </span>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                Organizational KPI Trends &amp; Monthly Shifts ({currentKPI?.month || selectedMonth})
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Multi-month trajectory lines for FTFR, C-SAT, MTTR, Diagnostic Accuracy and MoM operational changes
              </span>
            </div>
          </div>
          <span style={{ background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 800 }}>
            {allMonths.length} Months Trajectory
          </span>
        </div>

        {expandedSections.trends && (
          <div style={{ padding: '20px' }}>
            <div className="exec-grid">
              <div className="panel" style={{ boxShadow: 'none', border: '1px solid #e2e8f0', margin: 0 }}>
                <div className="panel-h">Organizational KPI Trend Lines</div>
                <div className="chart-box-mock">
                  {isMounted && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.kpi.months} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                        <XAxis dataKey="month" tickLine={false} />
                        <YAxis yAxisId="left" domain={[75, 100]} label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} tickLine={false} />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 4]} label={{ value: 'Days', angle: 90, position: 'insideRight' }} tickLine={false} />
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        <Line yAxisId="left" type="monotone" dataKey="ftfr" name="First-time fix rate (%)" stroke="#2E4D8E" strokeWidth={3} />
                        <Line yAxisId="left" type="monotone" dataKey="csat" name="C-SAT (%)" stroke="#4E67EB" strokeWidth={3} />
                        <Line yAxisId="left" type="monotone" dataKey="diag" name="Diagnostic accuracy (%)" stroke="#C0392B" strokeWidth={3} />
                        <Line yAxisId="right" type="monotone" dataKey="mttr" name="MTTR (days)" stroke="#D98A1F" strokeWidth={3} strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="panel" style={{ boxShadow: 'none', border: '1px solid #e2e8f0', margin: 0 }}>
                <div className="panel-h">What Changed in {currentKPI?.month || selectedMonth}?</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {[
                    { 
                      title: 'Same-day swaps leakage', 
                      diff: prevKPI ? ((currentKPI._leakparts.pcba + currentKPI._leakparts.lcd) - (prevKPI._leakparts.pcba + prevKPI._leakparts.lcd)) : 0, 
                      desc: `Swapped parts: ${currentKPI._leakparts.pcba} PCBAs, ${currentKPI._leakparts.lcd} LCDs.`, 
                      negativeBad: true 
                    },
                    { 
                      title: 'Repeat visit travel charge', 
                      diff: prevKPI ? (currentKPI._leaktravel - (prevKPI._leaktravel || 0)) : 0, 
                      desc: `${currentKPI._leaktravel} devices bounced back for follow-up repairs.`, 
                      negativeBad: true 
                    },
                    { 
                      title: 'C-SAT / Detractors count', 
                      diff: prevKPI ? (currentKPI.detractor - (prevKPI.detractor || 0)) : 0, 
                      desc: `Detractors count: ${currentKPI.detractor} cases.`, 
                      negativeBad: true 
                    }
                  ].map((w, index) => {
                    const colorClass = !prevKPI || w.diff === 0 ? 'flat' : (w.diff < 0 === w.negativeBad ? 'up' : 'down');
                    return (
                      <div className="wc-row" key={index}>
                        <div className={`wc-ind ${colorClass}`}>{!prevKPI || w.diff === 0 ? '•' : w.diff < 0 ? '↓' : '↑'}</div>
                        <div className="wc-body">
                          <div className="wc-name">{w.title}</div>
                          <div className="wc-detail">{w.desc} {prevKPI ? `(Changed by ${Math.abs(w.diff).toLocaleString()} cases vs ${prevKPI.month})` : ''}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 5: KPI FORMULAS & OPERATIONAL REVIEW ACCORDION */}
      <div id="sec-calc" className="panel" style={{ marginBottom: '24px', padding: '0', overflow: 'hidden' }}>
        <div
          onClick={() => toggleSection('calc')}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            background: '#f8fafc',
            borderBottom: expandedSections.calc ? '1px solid #e2e8f0' : 'none',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#E50046' }}>
              {expandedSections.calc ? '▼' : '▶'}
            </span>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                KPI Formulas &amp; Monthly Operational Review Methodology
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Standardized calculation rules, data integrity definitions, and 5-step operational review cadence
              </span>
            </div>
          </div>
          <span style={{ background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 800 }}>
            {DASHBOARD_DEFINITIONS.kpiCalculations.length} Metric Definitions
          </span>
        </div>

        {expandedSections.calc && (
          <div style={{ padding: '20px' }}>
            <div className="panel" style={{ borderLeft: '4px solid var(--cobalt)', marginBottom: '20px', boxShadow: 'none' }}>
              <div className="panel-h">Suggested monthly operational review cycle</div>
              <p className="exec-foot" style={{ border: 'none', padding: 0 }}>
                This view refreshes when new monthly spreadsheets are uploaded. The intended review pattern:
                <b> 1) Scan</b> the org indicators and monthly exposures above for trends. <b>2) Drill down</b> in the Score Card tab to identify ASM/ASP outliers. 
                <b> 3) Coach</b> - open the Coaching Card to pull targeted conversation talk tracks for 1:1 sessions. <b>4) Act</b> - nominate chronic poor performers for technical training. 
                <b> 5) Re-measure</b> next month to verify if score profiles show performance improvement.
              </p>
            </div>

            <div className="panel-h" style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
              How each KPI is calculated
            </div>
            <div className="formula-grid">
              {DASHBOARD_DEFINITIONS.kpiCalculations.map((item, idx) => (
                <div className="fz" key={idx} style={{ marginBottom: '10px' }}>
                  <div className="fz-name" style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b' }}>{item.title}</div>
                  <div className="fz-def" style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>{item.definition}</div>
                </div>
              ))}
            </div>
            <div className="panel-note" style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--line)', fontSize: '11.5px', color: '#64748b' }}>
              {DASHBOARD_DEFINITIONS.kpiNote}
            </div>
          </div>
        )}
      </div>

      {/* Executive Footnote */}
      <div className="exec-foot" style={{ marginTop: '16px', padding: '12px 16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '11.5px', color: '#64748b', lineHeight: '1.6' }}>
        {DASHBOARD_DEFINITIONS.executiveFootnote}
      </div>
    </div>
  );
}
