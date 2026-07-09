import React from 'react';

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
  return (
    <div className="view-mock on">
      <div className="sec-title">
        <div className="bar"></div>
        <span>Doorstep Board Repair Integrity Panel</span>
      </div>

      <div className="grid-mock k4">
        <div className="card-mock kpi-mock warnC">
          <div className="big">{(data.home?.board_at_home ?? 0).toLocaleString()}</div>
          <div className="sub">board replacements logged at home ({data.home?.pct_of_home}% of home visits)</div>
        </div>
        <div className="card-mock kpi-mock warnC">
          <div className="big">{(data.home?.pcba_at_home ?? 0).toLocaleString()}</div>
          <div className="sub">of which motherboard swaps (PCBA)</div>
        </div>
        <div className="card-mock kpi-mock warnC">
          <div className="big">{(data.home?.lcd_at_home ?? 0).toLocaleString()}</div>
          <div className="sub">of which display screens (LCD)</div>
        </div>
        <div className="card-mock kpi-mock warnC">
          <div className="big">{fmtINR(data.home?.pcba_at_home * costs.pcba + data.home?.lcd_at_home * costs.lcd)}</div>
          <div className="sub">assumed doorstep board swap exposure</div>
        </div>
      </div>

      <div className="grid-mock k2" style={{ marginTop: '16px' }}>
        <div className="card-mock">
          <h3>Top ASPs with Doorstep Board-level Swaps</h3>
          <table>
            <thead>
              <tr><th>ASP Name</th><th>Supervisor (ASM)</th><th>Doorstep Board Swaps Count</th></tr>
            </thead>
            <tbody>
              {data.home?.top_asps.map((r: any, i: number) => (
                <tr key={i}>
                  <td><b>{r.asp}</b></td>
                  <td>{r.asm}</td>
                  <td style={{ color: 'var(--bad)', fontWeight: 700 }}>{r.n}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="note-mock">
            Pull files for these outlying service centers from the Evidence Logs first. Verify motherboard/display billings against parts-return batches.
          </div>
        </div>

        <div className="card-mock">
          <h3>Insights: Affected Model Series and Action Codes</h3>
          <p className="note-mock">Concentration by device model</p>
          <table style={{ marginBottom: '16px' }}>
            <thead>
              <tr><th>Device Model</th><th>Incident Count</th></tr>
            </thead>
            <tbody>
              {data.home?.top_models.map((r: any, i: number) => (
                <tr key={i}><td>{r.model}</td><td>{r.n}</td></tr>
              ))}
            </tbody>
          </table>

          <p className="note-mock">Concentration by action codes</p>
          <table>
            <thead>
              <tr><th>Action Recorded</th><th>Incident Count</th></tr>
            </thead>
            <tbody>
              {data.home?.top_actions.map((r: any, i: number) => (
                <tr key={i}><td>{r.action}</td><td>{r.n}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Structured verify workflow alerts */}
      <div className="card-mock" style={{ marginTop: '16px', borderLeft: '4px solid var(--cobalt)' }}>
        <h3>Recommended audit check guidelines for doorstep board billing</h3>
        <ol style={{ marginLeft: '18px', fontSize: '13px', lineHeight: '1.9', color: 'var(--muted)', marginTop: '8px' }}>
          <li>Export high-outlier doorstep workorders from the Evidence tab (filter flag: "Board repair at home").</li>
          <li>Cross check these against the defective-part returns tracker to check if defective motherboards/displays were physically returned.</li>
          <li>Verify ASP inventory registers to check if they stock board components locally. If no local stock exists, doorstep swap was not physically possible.</li>
          <li>Verify root cause. If software upgrades could resolve the symptom, check if the technician billed high-value boards on hit-and-trial diagnosis.</li>
        </ol>
      </div>
    </div>
  );
}
