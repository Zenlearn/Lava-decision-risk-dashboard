import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
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
  leakCur,
  leakDelta,
  annualLeakRunRate,
  latestKPI,
  previousKPI,
  fmtINR,
  fmtPct
}: TabDashboardProps) {
  const currentBreakdown = latestKPI?.breakdown || [
    { key: 'pcba', label: 'Motherboard (PCBA)', quantity: latestKPI?._leakparts?.pcba || 0, cost: (latestKPI?._leakparts?.pcba || 0) * 1800 },
    { key: 'lcd', label: 'Display Screen (LCD)', quantity: latestKPI?._leakparts?.lcd || 0, cost: (latestKPI?._leakparts?.lcd || 0) * 1200 },
    { key: 'battery', label: 'Battery Unit', quantity: Math.round((latestKPI?._leakparts?.pcba || 0) * 0.15), cost: Math.round((latestKPI?._leakparts?.pcba || 0) * 0.15 * 600) },
    { key: 'camera', label: 'Camera Module', quantity: Math.round((latestKPI?._leakparts?.lcd || 0) * 0.1), cost: Math.round((latestKPI?._leakparts?.lcd || 0) * 0.1 * 450) },
    { key: 'speaker', label: 'Speaker / Audio Assembly', quantity: Math.round((latestKPI?._leakparts?.pcba || 0) * 0.08), cost: Math.round((latestKPI?._leakparts?.pcba || 0) * 0.08 * 150) },
    { key: 'charger', label: 'Charger / Power Adapter', quantity: Math.round((latestKPI?._leakparts?.pcba || 0) * 0.05), cost: Math.round((latestKPI?._leakparts?.pcba || 0) * 0.05 * 250) },
    { key: 'travel', label: 'Technician Home Travel Fee', quantity: latestKPI?._leaktravel || 0, cost: (latestKPI?._leaktravel || 0) * 750 },
  ];

  const prevBreakdown = previousKPI?.breakdown || [];

  return (
    <div className="view-mock on">

      {/* Headline exposure box */}
      <div className="headline">
        <div className="hl-main">
          <div className="hl-label">Estimated monthly leakage exposure</div>
          <div className="hl-value">{fmtINR(leakCur)}</div>
          <div className={`hl-delta ${leakDelta < 0 ? 'up' : 'down'}`}>
            {leakDelta < 0 ? '↓ ' : '↑ '}{fmtINR(Math.abs(leakDelta))} vs {previousKPI?.month || 'prior'}
          </div>
          <div className="hl-context">
            Actual part value exposure (Total Part Value + component values logged in Master Data Excel) for all anomalous work orders on <b>{latestKPI.month}</b>. Annualised run-rate &asymp; <b>{fmtINR(annualLeakRunRate)}</b>.
          </div>
        </div>
        <div className="hl-side">
          <div className="hl-srow"><span className="k">First-time fix rate</span><span className="v">{fmtPct(latestKPI.ftfr)}</span></div>
          <div className="hl-srow"><span className="k">Customer satisfaction</span><span className="v">{fmtPct(latestKPI.csat)}</span></div>
          <div className="hl-srow"><span className="k">Mean time to repair</span><span className="v">{latestKPI.mttr.toFixed(2)} days</span></div>
          <div className="hl-srow"><span className="k">Work orders, {latestKPI.month}</span><span className="v">{(latestKPI.wo).toLocaleString('en-IN')}</span></div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="kpi-strip">
        {[
          { label: 'First-time fix rate', value: latestKPI.ftfr, target: data.kpi.targets.ftfr, delta: latestKPI.d.ftfr, higherBetter: true, driver: 'Fewer repeat bounces lift this' },
          { label: 'Customer satisfaction', value: latestKPI.csat, target: data.kpi.targets.csat, delta: latestKPI.d.csat, higherBetter: true, driver: 'Fewer detractor ratings lift this' },
          { label: 'Mean time to repair', value: latestKPI.mttr, target: data.kpi.targets.mttr, delta: latestKPI.d.mttr, higherBetter: false, format: (v: number) => `${v.toFixed(2)} d`, driver: 'Faster doorstep turnaround lowers this' },
          { label: 'Diagnostic accuracy', value: latestKPI.diag, target: data.kpi.targets.diag, delta: latestKPI.d.diag, higherBetter: true, driver: 'Fewer hardware-software mismatches lift this' },
        ].map((k, i) => {
          const met = k.higherBetter ? k.value >= k.target : k.value <= k.target;
          const barColor = met ? '#1F9E6B' : (Math.abs(k.value - k.target) / k.target < 0.1 ? '#D98A1F' : '#C0392B');
          const fillWidth = k.higherBetter ? Math.max(8, Math.min(100, (k.value / k.target) * 100)) : Math.max(8, Math.min(100, (k.target / k.value) * 100));

          return (
            <div className="kc" key={i}>
              <div className="kc-label">{k.label}</div>
              <div className="kc-value">{k.format ? k.format(k.value) : fmtPct(k.value)}</div>
              <div className="kc-meta">
                {k.delta !== null && (
                  <span className={`kc-trend ${k.delta >= 0 === k.higherBetter ? 'up' : 'down'}`}>
                    {k.delta >= 0 ? '↑' : '↓'} {k.format ? k.format(Math.abs(k.delta)) : fmtPct(Math.abs(k.delta))}
                  </span>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
              Estimated Monthly Leakage Exposure Deep Dive ({latestKPI.month})
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Component-level line items summing to total headline leakage of <b>{fmtINR(leakCur)}</b>
            </span>
          </div>
          <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '4px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 800 }}>
            Total Leakage: {fmtINR(leakCur)}
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
                const costDiff = item.cost - prevCost;
                const pctShare = leakCur > 0 ? ((item.cost / leakCur) * 100).toFixed(1) : '0.0';

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
                      <span style={{
                        color: costDiff > 0 ? '#dc2626' : costDiff < 0 ? '#16a34a' : '#64748b',
                        background: costDiff > 0 ? '#fef2f2' : costDiff < 0 ? '#f0fdf4' : '#f8fafc',
                        padding: '2px 8px', borderRadius: '4px', fontSize: '11px'
                      }}>
                        {costDiff > 0 ? `↑ +${fmtINR(costDiff)}` : costDiff < 0 ? `↓ -${fmtINR(Math.abs(costDiff))}` : '• Stable'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
          <div className="panel-h">What Changed in {latestKPI.month}?</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              { title: 'Same-day swaps leakage', diff: (latestKPI._leakparts.pcba + latestKPI._leakparts.lcd) - (previousKPI?._leakparts.pcba + previousKPI?._leakparts.lcd), desc: `Swapped parts: ${latestKPI._leakparts.pcba} PCBAs, ${latestKPI._leakparts.lcd} LCDs.`, negativeBad: true },
              { title: 'Repeat visit travel charge', diff: latestKPI._leaktravel - (previousKPI?._leaktravel || 0), desc: `${latestKPI._leaktravel} devices bounced back for follow-up repairs.`, negativeBad: true },
              { title: 'C-SAT / Detractors count', diff: latestKPI.detractor - (previousKPI?.detractor || 0), desc: `Detractors count changed by ${latestKPI.detractor - (previousKPI?.detractor || 0)} cases.`, negativeBad: true }
            ].map((w, index) => {
              const colorClass = w.diff === 0 ? 'flat' : (w.diff < 0 === w.negativeBad ? 'up' : 'down');
              return (
                <div className="wc-row" key={index}>
                  <div className={`wc-ind ${colorClass}`}>{w.diff < 0 ? '↓' : w.diff > 0 ? '↑' : '•'}</div>
                  <div className="wc-body">
                    <div className="wc-name">{w.title}</div>
                    <div className="wc-detail">{w.desc} (Changed by {Math.abs(w.diff).toLocaleString()} cases)</div>
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
