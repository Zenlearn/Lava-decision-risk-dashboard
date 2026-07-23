import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, 
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

  const prevTatDist = prevKPI?.tatDistribution || [];

  return (
    <div className="view-mock on">

      {/* Month Dropdown Selector on left-hand side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Select Month:
        </label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{
            background: '#ffffff',
            border: '2px solid #2563eb',
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
      </div>

      {/* Headline exposure box */}
      <div className="headline">
        <div className="hl-main">
          <div className="hl-label">Estimated monthly leakage exposure</div>
          <div className="hl-value">{fmtINR(activeLeakCur)}</div>
          {prevKPI ? (
            <div className={`hl-delta ${activeLeakDelta < 0 ? 'up' : 'down'}`}>
              {activeLeakDelta < 0 ? '↓ ' : '↑ '}{fmtINR(Math.abs(activeLeakDelta))} vs {prevKPI.month}
            </div>
          ) : (
            <div className="hl-delta flat">• Baseline Month</div>
          )}
          <div className="hl-context">
            Actual part value exposure (Total Part Value + component values logged in Master Data Excel) for all anomalous work orders on <b>{currentKPI?.month || selectedMonth}</b>. Annualised run-rate &asymp; <b>{fmtINR(activeAnnualLeakRunRate)}</b>.
          </div>
        </div>
        <div className="hl-side">
          <div className="hl-srow"><span className="k">First-time fix rate</span><span className="v">{fmtPct(currentKPI?.ftfr || 0)}</span></div>
          <div className="hl-srow"><span className="k">Customer satisfaction</span><span className="v">{fmtPct(currentKPI?.csat || 0)}</span></div>
          <div className="hl-srow"><span className="k">Mean time to repair</span><span className="v">{(currentKPI?.mttr || 0).toFixed(2)} days</span></div>
          <div className="hl-srow"><span className="k">Work orders, {currentKPI?.month || selectedMonth}</span><span className="v">{(currentKPI?.wo || 0).toLocaleString('en-IN')}</span></div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="kpi-strip">
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
            target: data?.kpi?.targets?.mttr || 2.0, 
            delta: prevKPI ? Math.round((currentKPI.mttr - prevKPI.mttr) * 100) / 100 : null, 
            higherBetter: false, 
            format: (v: number) => `${v.toFixed(2)} d`, 
            driver: 'Faster doorstep turnaround lowers this' 
          },
          { 
            label: 'Diagnostic accuracy', 
            value: currentKPI?.diag || 0, 
            target: data?.kpi?.targets?.diag || 98, 
            delta: prevKPI ? Math.round((currentKPI.diag - prevKPI.diag) * 10) / 10 : null, 
            higherBetter: true, 
            driver: 'Fewer hardware-software mismatches lift this' 
          },
        ].map((k, i) => {
          const met = k.higherBetter ? k.value >= k.target : k.value <= k.target;
          const barColor = met ? '#1F9E6B' : (Math.abs(k.value - k.target) / k.target < 0.1 ? '#D98A1F' : '#C0392B');
          const fillWidth = k.higherBetter ? Math.max(8, Math.min(100, (k.value / k.target) * 100)) : Math.max(8, Math.min(100, (k.target / k.value) * 100));

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

      {/* Leakage Exposure Deep Dive Table */}
      <div className="panel" style={{ marginTop: '20px', marginBottom: '24px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
              Estimated Monthly Leakage Exposure Deep Dive ({currentKPI?.month || selectedMonth})
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Component-level line items summing to total headline leakage of {fmtINR(activeLeakCur)}
            </span>
          </div>
          <span style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 800 }}>
            Total Leakage: {fmtINR(activeLeakCur)}
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#f8fafc' }}>
                <th style={{ padding: '10px 12px' }}>Line Item / Component</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Quantity (Units / Visits)</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Total Exposure Cost</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>% Share of Total</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>MoM Trend</th>
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
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1e293b' }}>{item.label}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: '#475569' }}>
                      {(item.quantity || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                      {fmtINR(item.cost || 0)}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: '#64748b' }}>
                      {pctShare}%
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>
                      {prevKPI ? (
                        <span style={{
                          color: costDiff > 0 ? '#dc2626' : costDiff < 0 ? '#16a34a' : '#64748b',
                          background: costDiff > 0 ? '#fef2f2' : costDiff < 0 ? '#f0fdf4' : '#f8fafc',
                          padding: '2px 8px', borderRadius: '4px', fontSize: '11px'
                        }}>
                          {costDiff > 0 ? `↑ +${fmtINR(costDiff)}` : costDiff < 0 ? `↓ -${fmtINR(Math.abs(costDiff))}` : '• Stable'}
                        </span>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '11px' }}>• Baseline</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mean Time to Repair (MTTR) Deep Dive Section */}
      <div className="panel" style={{ marginTop: '20px', marginBottom: '24px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
              Mean Time to Repair (MTTR) Deep Dive ({currentKPI?.month || selectedMonth})
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Frequency breakdown of work orders by turnaround time (TAT) for {currentKPI?.month || selectedMonth}
            </span>
          </div>
          <span style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 800 }}>
            Average MTTR: {(currentKPI?.mttr || 0).toFixed(2)} Days
          </span>
        </div>

        {/* Grid split: Frequency Bar Chart + Summary Table */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
          {/* Frequency Bar Chart */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', height: '260px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Turnaround Speed Frequency Distribution (Work Orders)
            </div>
            {isMounted && (
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={currentTatDist} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="label" tickLine={false} style={{ fontSize: '11px', fontWeight: 600 }} />
                  <YAxis tickLine={false} style={{ fontSize: '11px' }} />
                  <Tooltip formatter={(val: any) => [`${val.toLocaleString('en-IN')} work orders`, 'Quantity']} />
                  <Bar dataKey="quantity" name="Work Orders" radius={[6, 6, 0, 0]}>
                    {currentTatDist.map((entry: any, index: number) => {
                      const colors = ['#10b981', '#f59e0b', '#ef4444'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Breakdown Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#f8fafc' }}>
                  <th style={{ padding: '10px 12px' }}>Turnaround Bracket</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Work Orders</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>% of Total</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>MoM Trend</th>
                </tr>
              </thead>
              <tbody>
                {currentTatDist.map((item: any, idx: number) => {
                  const prevItem = prevTatDist.find((pb: any) => pb.key === item.key);
                  const prevQty = prevItem?.quantity || 0;
                  const qtyDiff = prevKPI ? (item.quantity - prevQty) : 0;
                  const badgeColor = item.key === '1d' ? '#10b981' : item.key === '3d' ? '#f59e0b' : '#ef4444';

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: badgeColor, flexShrink: 0 }}></span>
                        {item.label}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>
                        {item.quantity.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: '#64748b' }}>
                        {item.pct}%
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700 }}>
                        {prevKPI ? (
                          <span style={{
                            color: qtyDiff < 0 ? '#16a34a' : qtyDiff > 0 ? '#dc2626' : '#64748b',
                            background: qtyDiff < 0 ? '#f0fdf4' : qtyDiff > 0 ? '#fef2f2' : '#f8fafc',
                            padding: '2px 8px', borderRadius: '4px', fontSize: '11px'
                          }}>
                            {qtyDiff > 0 ? `↑ +${qtyDiff.toLocaleString()}` : qtyDiff < 0 ? `↓ -${Math.abs(qtyDiff).toLocaleString()}` : '• Stable'}
                          </span>
                        ) : (
                          <span style={{ color: '#64748b', fontSize: '11px' }}>• Baseline</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {/* Total Work Orders Summary Row */}
                {(() => {
                  const totalCurrentWo = currentTatDist.reduce((sum: number, i: any) => sum + (i.quantity || 0), 0);
                  const totalPrevWo = prevTatDist.reduce((sum: number, i: any) => sum + (i.quantity || 0), 0);
                  const totalWoDiff = prevKPI ? (totalCurrentWo - totalPrevWo) : 0;

                  return (
                    <tr style={{ borderTop: '2px solid #0f172a', background: '#f8fafc', fontWeight: 800 }}>
                      <td style={{ padding: '12px', color: '#0f172a' }}>
                        Total Work Orders
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#0f172a', fontSize: '14px' }}>
                        {totalCurrentWo.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#0f172a', fontSize: '14px' }}>
                        100.0%
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700 }}>
                        {prevKPI ? (
                          <span style={{
                            color: totalWoDiff > 0 ? '#dc2626' : totalWoDiff < 0 ? '#16a34a' : '#64748b',
                            background: totalWoDiff > 0 ? '#fef2f2' : totalWoDiff < 0 ? '#f0fdf4' : '#f8fafc',
                            padding: '2px 8px', borderRadius: '4px', fontSize: '11px'
                          }}>
                            {totalWoDiff > 0 ? `↑ +${totalWoDiff.toLocaleString()}` : totalWoDiff < 0 ? `↓ -${Math.abs(totalWoDiff).toLocaleString()}` : '• Stable'}
                          </span>
                        ) : (
                          <span style={{ color: '#64748b', fontSize: '11px' }}>• Baseline</span>
                        )}
                      </td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Split row: trend lines + what changed */}
      <div className="exec-grid">
        <div className="panel">
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

        <div className="panel">
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

      <div className="panel" style={{ borderLeft: '4px solid var(--cobalt)' }}>
        <div className="panel-h">Suggested monthly operational review cycle</div>
        <p className="exec-foot" style={{ border: 'none', padding: 0 }}>
          This view refreshes when new monthly spreadsheets are uploaded. The intended review pattern:
          <b> 1) Scan</b> the org indicators and monthly exposures above for trends. <b>2) Drill down</b> in the Score Card tab to identify ASM/ASP outliers. 
          <b> 3) Coach</b> - open the Coaching Card to pull targeted conversation talk tracks for 1:1 sessions. <b>4) Act</b> - nominate chronic poor performers for technical training. 
          <b> 5) Re-measure</b> next month to verify if score profiles show performance improvement.
        </p>
      </div>

      {/* How each KPI is calculated Section */}
      <div className="panel" style={{ marginTop: '20px', marginBottom: '22px' }}>
        <div className="panel-h" style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>How each KPI is calculated</div>
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

      {/* Executive Footnote */}
      <div className="exec-foot" style={{ marginTop: '16px', padding: '12px 16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '11.5px', color: '#64748b', lineHeight: '1.6' }}>
        {DASHBOARD_DEFINITIONS.executiveFootnote}
      </div>
    </div>
  );
}
