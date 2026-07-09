import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

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
  return (
    <div className="view-mock on">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <span className="exec-sub">Reporting period: <b>{data.kpi.months.map((m: any) => m.month).join(' – ')}</b> &bull; active file: {data.summary.filename}</span>
        </div>
        <div className="exec-stamp">
          Provisional &mdash; placeholder costs used<br />Calculated live from database
        </div>
      </div>

      {/* Headline exposure box */}
      <div className="headline">
        <div className="hl-main">
          <div className="hl-label">Estimated monthly leakage exposure</div>
          <div className="hl-value">{fmtINR(leakCur)}</div>
          <div className={`hl-delta ${leakDelta < 0 ? 'up' : 'down'}`}>
            {leakDelta < 0 ? '↓ ' : '↑ '}{fmtINR(Math.abs(leakDelta))} vs {previousKPI?.month || 'prior'}
          </div>
          <div className="hl-context">
            Board-level part exposure (same-day walk-in swaps + board repairs logged at home) plus repeat home-visit travel, on <b>{latestKPI.month}</b> work orders. Annualised run-rate &asymp; <b>{fmtINR(annualLeakRunRate)}</b>. Configured using costs set in Part-Cost Assumptions.
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
    </div>
  );
}
