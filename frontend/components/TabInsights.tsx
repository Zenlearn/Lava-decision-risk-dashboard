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
    <div className="view-mock on" style={{ paddingBottom: '40px' }}>
      
      {/* 1. DOORSTEP BOARD REPAIR INTEGRITY PANEL */}
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
          <div className="big">{fmtINR((data.home?.pcba_at_home || 0) * costs.pcba + (data.home?.lcd_at_home || 0) * costs.lcd)}</div>
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
              {(data.home?.top_asps || []).map((r: any, i: number) => (
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
              {(data.home?.top_models || []).map((r: any, i: number) => (
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
              {(data.home?.top_actions || []).map((r: any, i: number) => (
                <tr key={i}><td>{r.action}</td><td>{r.n}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommended audit check guidelines for doorstep board billing */}
      <div className="card-mock" style={{ marginTop: '16px', borderLeft: '4px solid var(--cobalt)' }}>
        <h3>Recommended audit check guidelines for doorstep board billing</h3>
        <ol style={{ marginLeft: '18px', fontSize: '13px', lineHeight: '1.9', color: 'var(--muted)', marginTop: '8px' }}>
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

        {/* 5 Core Process Efficiency Dimensions Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '20px' }}>

          {/* Dimension 1: Service Fulfillment & Capacity Efficiency */}
          <div className="card-mock" style={{ margin: 0, padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <span style={{ background: '#dbeafe', color: '#1d4ed8', width: '26px', height: '26px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800 }}>1</span>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Service Fulfillment &amp; Capacity</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>Total Appointments Received</span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>16,030</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>Appointment Fulfillment Rate</span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#16a34a' }}>68.7% <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>(11,010 closed)</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>Appointment Cancellation Rate</span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#dc2626' }}>30.7% <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>(4,926 rejected)</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>Work Order Conversion Velocity</span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#2563eb' }}>99.2%</span>
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
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>5.04 Days <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>(Median: 4.05d)</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>Same-Day (24h) Resolution Rate</span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#16a34a' }}>31.4% <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>(3,462 orders)</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>3-Day SLA Adherence Rate</span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#2563eb' }}>49.8% <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>(5,483 orders)</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>Pickup &amp; Delivery Dispatch Speed</span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#475569' }}>1.4 Hours <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>(Avg transit)</span></span>
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
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#16a34a' }}>68.7% <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>(11,015 visits)</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>Mean Technician Travel Distance</span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>39.15 KM <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>(Median: 7.0 km)</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>Technician Productivity Index</span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#2563eb' }}>19.6 Orders / Tech / Mo</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>Active Field Technicians</span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#475569' }}>560 Technicians</span>
              </div>
            </div>
          </div>

          {/* Dimension 4: Technical Resolution & Repair Quality */}
          <div className="card-mock" style={{ margin: 0, padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <span style={{ background: '#f3e8ff', color: '#7e22ce', width: '26px', height: '26px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800 }}>4</span>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Technical Resolution &amp; Repair Quality</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>Appointment Reschedule Rate</span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#d97706' }}>10.0% <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>(1,605 cases)</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>Component Replacement Share</span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#dc2626' }}>33.3% <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>(3,674 parts)</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>Soft Repair Rate (Software/NFF)</span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#16a34a' }}>14.2% <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>(2,128 updates)</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>Unrepaired Return Rate</span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#64748b' }}>11.0% <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>(1,760 cases)</span></span>
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
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#dc2626' }}>76.4% <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>(3,763 of cancels)</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>Out-of-Warranty Price Refusal</span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#d97706' }}>4.8% <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>(236 cancels)</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>Self-Resolved Issue Prior to Visit</span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#16a34a' }}>3.2% <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>(157 cancels)</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>Model Intake Information Error</span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#64748b' }}>1.8% <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>(89 cancels)</span></span>
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
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Hierarchy Level</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Entity Scope</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Entity Count</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Primary Measurable Efficiency Metrics</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#2563eb' }}>Level 1: ASP</td>
                  <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: 500 }}>Authorized Service Provider (Center)</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>532 ASPs</td>
                  <td style={{ padding: '12px 16px', color: '#334155' }}>Fulfillment %, Mean TAT, GPS Tagging %, Reschedule %, Travel Distance (KM)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#7e22ce' }}>Level 2: ASM</td>
                  <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: 500 }}>Area Service Manager (Territory Supervisor)</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>36 ASMs</td>
                  <td style={{ padding: '12px 16px', color: '#334155' }}>Territory Fulfillment %, SLA Adherence %, Outlier ASP Count, Supervisor Scorecard</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#d97706' }}>Level 3: BUSM</td>
                  <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: 500 }}>Business Unit Service Manager (Zonal Lead)</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>5 BUSMs</td>
                  <td style={{ padding: '12px 16px', color: '#334155' }}>Zonal Fulfillment %, Regional Quality Score, Macro SLA Variance, Zonal Resource Allocation</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 800, color: '#0f172a' }}>Level 4: Org Whole</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>National Corporate Benchmark</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 800, color: '#E50046' }}>1 National Org</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>68.7% Fulfillment, 5.04d Mean TAT, 68.7% GPS Compliance, 10.0% Reschedule Rate</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
