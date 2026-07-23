import React from 'react';

interface TabPartCostsProps {
  costs: {
    pcba: number;
    lcd: number;
    battery: number;
    camera: number;
    speaker: number;
    charger: number;
    travel: number;
  };
  handleCostChange: (key: any, value: number) => void;
  latestKPI: any;
  leakCur: number;
  annualLeakRunRate: number;
  fmtINR: (v: number) => string;
}

export default function TabPartCosts({
  costs,
  handleCostChange,
  latestKPI,
  leakCur,
  annualLeakRunRate,
  fmtINR
}: TabPartCostsProps) {
  // Use breakdown array from latestKPI if present, or construct fallback from latestKPI._leakparts
  const breakdownList = latestKPI?.breakdown || [
    { label: 'Motherboard (PCBA)', quantity: latestKPI?._leakparts?.pcba || 0, cost: (latestKPI?._leakparts?.pcba || 0) * costs.pcba },
    { label: 'Display Screen (LCD)', quantity: latestKPI?._leakparts?.lcd || 0, cost: (latestKPI?._leakparts?.lcd || 0) * costs.lcd },
    { label: 'Battery Unit', quantity: 0, cost: 0 },
    { label: 'Camera Module', quantity: 0, cost: 0 },
    { label: 'Speaker / Audio Assembly', quantity: 0, cost: 0 },
    { label: 'Charger / Power Adapter', quantity: 0, cost: 0 },
    { label: 'Technician Home Travel Fee', quantity: latestKPI?._leaktravel || 0, cost: (latestKPI?._leaktravel || 0) * costs.travel },
  ];

  return (
    <div className="view-mock on" style={{ padding: '0 0 40px 0', marginTop: '-16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* 1. ACTIVE EXPOSURE SUMMARY TABLE (MOVED TO TOP) */}
        <div className="card-mock">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Active exposure summary (using configured costs)</h3>
            <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
              Active Month: {latestKPI?.month || 'Jun'}
            </span>
          </div>

          {/* Quantity and Cost Breakdown Table */}
          <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '10px 12px' }}>Item Type / Component</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Quantity (Units / Visits)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Total Exposure Cost</th>
                </tr>
              </thead>
              <tbody>
                {breakdownList.map((item: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1e293b' }}>{item.label}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: '#475569' }}>
                      {item.quantity ? item.quantity.toLocaleString('en-IN') : 0}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                      {fmtINR(item.cost || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="expo-row">
              <span style={{ fontWeight: 700, fontSize: '15px' }}>Total Monthly Leakage Exposure ({latestKPI?.month || 'Jun'})</span>
              <span className="v" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--bad)' }}>{fmtINR(leakCur)}</span>
            </div>
            <div className="expo-row">
              <span style={{ fontWeight: 700, fontSize: '15px' }}>Estimated Annual Leakage Exposure</span>
              <span className="v" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--bad)' }}>{fmtINR(annualLeakRunRate)}</span>
            </div>
          </div>

          <div className="note-mock" style={{ borderTop: '1px solid var(--line)', paddingTop: '10px', marginTop: '16px' }}>
            Breakdown includes quantities and actual component values calculated from Master Data Excel for {latestKPI?.month || 'Jun'}. Run-rate calculations align dynamically.
          </div>
        </div>

        {/* 2. PLACEHOLDER UNIT COST MASTER (MOVED BELOW ACTIVE EXPOSURE SUMMARY) */}
        <div className="card-mock">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Placeholder Unit Cost Master</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {[
              { label: 'Motherboard (PCBA)', key: 'pcba', suffix: 'per component' },
              { label: 'Display Screen (LCD)', key: 'lcd', suffix: 'per component' },
              { label: 'Battery Unit', key: 'battery', suffix: 'per component' },
              { label: 'Camera Module', key: 'camera', suffix: 'per component' },
              { label: 'Speaker Assembly', key: 'speaker', suffix: 'per component' },
              { label: 'Charger Adapter', key: 'charger', suffix: 'per component' },
              { label: 'Technician Home Travel Fee', key: 'travel', suffix: 'per return visit' },
            ].map((x) => (
              <div className="expo-row" key={x.key} style={{ alignItems: 'center', background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                <div>
                  <b style={{ color: '#1e293b' }}>{x.label}</b>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block' }}>{x.suffix}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '6px', fontWeight: 700, color: '#475569' }}>₹</span>
                  <input 
                    type="number" 
                    className="cost-input-mock" 
                    value={costs[x.key as keyof typeof costs]}
                    onChange={(e) => handleCostChange(x.key as keyof typeof costs, parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
