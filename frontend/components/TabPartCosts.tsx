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
  return (
    <div className="view-mock on">
      <div className="sec-title">
        <div className="bar"></div>
        <span>Part-Cost Assumptions Configuration</span>
      </div>

      <div className="pwarn">
        <b>Important:</b> Leakage exposures are computed using placeholder cost metrics. Customize unit values below. Edits are saved and automatically recalculate exposures across all views.
      </div>

      <div className="grid-mock k2">
        <div className="card-mock">
          <h3>Placeholder Unit Cost Master</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Motherboard (PCBA)', key: 'pcba', suffix: 'per component' },
              { label: 'Display Screen (LCD)', key: 'lcd', suffix: 'per component' },
              { label: 'Battery Unit', key: 'battery', suffix: 'per component' },
              { label: 'Camera Module', key: 'camera', suffix: 'per component' },
              { label: 'Speaker Assembly', key: 'speaker', suffix: 'per component' },
              { label: 'Charger Adapter', key: 'charger', suffix: 'per component' },
              { label: 'Technician Home Travel Fee', key: 'travel', suffix: 'per return visit' },
            ].map((x) => (
              <div className="expo-row" key={x.key} style={{ alignItems: 'center' }}>
                <div>
                  <b>{x.label}</b>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block' }}>{x.suffix}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '6px', fontWeight: 700 }}>₹</span>
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

        <div className="card-mock">
          <h3>Active exposure summary (using configured costs)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="expo-row">
              <span>Motherboard (PCBA) doorstep swaps exposure</span>
              <span className="v">{fmtINR((latestKPI._leakparts.pcba) * costs.pcba)}</span>
            </div>
            <div className="expo-row">
              <span>Display Screen (LCD) doorstep swaps exposure</span>
              <span className="v">{fmtINR((latestKPI._leakparts.lcd) * costs.lcd)}</span>
            </div>
            <div className="expo-row">
              <span>Technician repeat travel charge</span>
              <span className="v">{fmtINR(latestKPI._leaktravel * costs.travel)}</span>
            </div>
            <div className="expo-row" style={{ borderTop: '2px solid var(--line)', paddingTop: '12px' }}>
              <span style={{ fontWeight: 700 }}>Total Monthly Leakage Exposure ({latestKPI.month})</span>
              <span className="v" style={{ fontSize: '18px', color: 'var(--bad)' }}>{fmtINR(leakCur)}</span>
            </div>
            <div className="expo-row">
              <span style={{ fontWeight: 700 }}>Estimated Annual Leakage Exposure</span>
              <span className="v" style={{ fontSize: '18px', color: 'var(--bad)' }}>{fmtINR(annualLeakRunRate)}</span>
            </div>
          </div>
          <div className="note-mock" style={{ borderTop: '1px solid var(--line)', paddingTop: '10px', marginTop: '16px' }}>
            Adjust motherboard / screen unit estimates to align with official regional price decks. Run-rate calculations will align dynamically.
          </div>
        </div>
      </div>
    </div>
  );
}
