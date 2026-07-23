import React from 'react';
import { DASHBOARD_DEFINITIONS } from '../constants/definitions';

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
  kpiMonths?: any[];
  leakCur: number;
  annualLeakRunRate: number;
  fmtINR: (v: number) => string;
}

export default function TabPartCosts({
  costs,
  handleCostChange,
  latestKPI,
  kpiMonths = [],
  leakCur,
  annualLeakRunRate,
  fmtINR
}: TabPartCostsProps) {
  // If kpiMonths is available, use all trailing months, else fallback to latestKPI
  const monthsList = (kpiMonths && kpiMonths.length > 0) ? kpiMonths : [latestKPI].filter(Boolean);

  const itemDefinitions = [
    { key: 'pcba', label: 'Motherboard (PCBA)' },
    { key: 'lcd', label: 'Display Screen (LCD)' },
    { key: 'battery', label: 'Battery Unit' },
    { key: 'camera', label: 'Camera Module' },
    { key: 'speaker', label: 'Speaker / Audio Assembly' },
    { key: 'charger', label: 'Charger / Power Adapter' },
    { key: 'others', label: 'Other Components & Accessories' },
    { key: 'travel', label: 'Technician Home Travel Fee' },
  ];

  // Compute grand totals across all months
  let grandTotalQty = 0;
  let grandTotalCost = 0;

  monthsList.forEach((m: any) => {
    if (m?.breakdown) {
      m.breakdown.forEach((b: any) => {
        grandTotalQty += b.quantity || 0;
        grandTotalCost += b.cost || 0;
      });
    } else {
      const pcbaQty = m?._leakparts?.pcba || 0;
      const lcdQty = m?._leakparts?.lcd || 0;
      const travelQty = m?._leaktravel || 0;
      grandTotalQty += (pcbaQty + lcdQty + travelQty);
      grandTotalCost += (pcbaQty * costs.pcba + lcdQty * costs.lcd + travelQty * costs.travel);
    }
  });

  return (
    <div className="view-mock on" style={{ padding: '0 0 40px 0', marginTop: '-16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Notice Disclaimer Box */}
        <div className="pwarn" style={{ margin: 0 }}>
          {DASHBOARD_DEFINITIONS.costMaster.disclaimer}
        </div>
        
        {/* 1. TRAILING MULTI-MONTH EXPOSURE SUMMARY TABLE (MOVED TO TOP) */}
        <div className="card-mock">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                Active & Trailing Multi-Month Exposure Summary
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Itemized quantities (Units / Visits) and leakage exposure costs across trailing months
              </span>
            </div>
            <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
              Months: {monthsList.map((m: any) => m.month).join(', ')}
            </span>
          </div>

          {/* Trailing 3-Month Matrix Table */}
          <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th rowSpan={2} style={{ padding: '12px', textAlign: 'left', borderRight: '1px solid #e2e8f0', minWidth: '220px' }}>Item Type / Component</th>
                  {monthsList.map((m: any) => (
                    <th key={m.month} colSpan={2} style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                      {m.month}
                    </th>
                  ))}
                  <th colSpan={2} style={{ padding: '8px', textAlign: 'center', background: '#eff6ff', color: '#1d4ed8' }}>
                    3-Month Total
                  </th>
                </tr>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f1f5f9', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                  {monthsList.map((m: any) => (
                    <React.Fragment key={`sub-${m.month}`}>
                      <th style={{ padding: '6px 8px', textAlign: 'center' }}>Qty</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>Cost (₹)</th>
                    </React.Fragment>
                  ))}
                  <th style={{ padding: '6px 8px', textAlign: 'center', background: '#eff6ff' }}>Qty</th>
                  <th style={{ padding: '6px 8px', textAlign: 'right', background: '#eff6ff' }}>Cost (₹)</th>
                </tr>
              </thead>
              <tbody>
                {itemDefinitions.map((itemDef) => {
                  let rowTotalQty = 0;
                  let rowTotalCost = 0;

                  return (
                    <tr key={itemDef.key} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1e293b', borderRight: '1px solid #f1f5f9' }}>
                        {itemDef.label}
                      </td>
                      {monthsList.map((m: any) => {
                        let q = 0;
                        let c = 0;
                        if (m?.breakdown) {
                          const found = m.breakdown.find((b: any) => b.key === itemDef.key || b.label === itemDef.label);
                          if (found) {
                            q = found.quantity || 0;
                            c = found.cost || 0;
                          }
                        } else {
                          if (itemDef.key === 'pcba') { q = m?._leakparts?.pcba || 0; c = q * costs.pcba; }
                          else if (itemDef.key === 'lcd') { q = m?._leakparts?.lcd || 0; c = q * costs.lcd; }
                          else if (itemDef.key === 'travel') { q = m?._leaktravel || 0; c = q * costs.travel; }
                        }
                        rowTotalQty += q;
                        rowTotalCost += c;

                        return (
                          <React.Fragment key={`${itemDef.key}-${m.month}`}>
                            <td style={{ padding: '10px 8px', textAlign: 'center', color: '#475569', fontWeight: 500 }}>
                              {q ? q.toLocaleString('en-IN') : 0}
                            </td>
                            <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600, color: '#0f172a', borderRight: '1px solid #f1f5f9' }}>
                              {fmtINR(c)}
                            </td>
                          </React.Fragment>
                        );
                      })}
                      <td style={{ padding: '10px 8px', textAlign: 'center', background: '#f8fafc', fontWeight: 700, color: '#1e293b' }}>
                        {rowTotalQty.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', background: '#f8fafc', fontWeight: 800, color: '#0f172a' }}>
                        {fmtINR(rowTotalCost)}
                      </td>
                    </tr>
                  );
                })}

                {/* Total Monthly Leakage Exposure Row */}
                <tr style={{ borderTop: '2px solid #0f172a', background: '#f8fafc', fontWeight: 800 }}>
                  <td style={{ padding: '12px', color: '#0f172a', borderRight: '1px solid #e2e8f0' }}>
                    Total Monthly Leakage Exposure
                  </td>
                  {monthsList.map((m: any) => {
                    let mQty = 0;
                    let mCost = 0;
                    if (m?.breakdown) {
                      mQty = m.breakdown.reduce((sum: number, b: any) => sum + (b.quantity || 0), 0);
                      mCost = m.leak || m.breakdown.reduce((sum: number, b: any) => sum + (b.cost || 0), 0);
                    } else {
                      const pcbaQty = m?._leakparts?.pcba || 0;
                      const lcdQty = m?._leakparts?.lcd || 0;
                      const travelQty = m?._leaktravel || 0;
                      mQty = pcbaQty + lcdQty + travelQty;
                      mCost = pcbaQty * costs.pcba + lcdQty * costs.lcd + travelQty * costs.travel;
                    }

                    return (
                      <React.Fragment key={`tot-${m.month}`}>
                        <td style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--bad)', fontSize: '13px' }}>
                          {mQty.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'right', color: 'var(--bad)', fontSize: '14px', borderRight: '1px solid #e2e8f0' }}>
                          {fmtINR(mCost)}
                        </td>
                      </React.Fragment>
                    );
                  })}
                  <td style={{ padding: '12px 8px', textAlign: 'center', background: '#eff6ff', color: 'var(--bad)', fontSize: '14px' }}>
                    {grandTotalQty.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', background: '#eff6ff', color: 'var(--bad)', fontSize: '15px' }}>
                    {fmtINR(grandTotalCost)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="expo-row">
              <span style={{ fontWeight: 700, fontSize: '15px' }}>Latest Month Leakage Exposure ({latestKPI?.month || 'Jun'})</span>
              <span className="v" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--bad)' }}>{fmtINR(leakCur)}</span>
            </div>
            <div className="expo-row">
              <span style={{ fontWeight: 700, fontSize: '15px' }}>Estimated Annual Leakage Exposure</span>
              <span className="v" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--bad)' }}>{fmtINR(annualLeakRunRate)}</span>
            </div>
          </div>

          <div className="note-mock" style={{ borderTop: '1px solid var(--line)', paddingTop: '10px', marginTop: '16px' }}>
            Breakdown includes quantities and actual component values calculated across trailing months. Run-rate calculations align dynamically.
          </div>
        </div>

        {/* 2. PLACEHOLDER UNIT COST MASTER */}
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
          <div className="note-mock" style={{ borderTop: '1px solid var(--line)', paddingTop: '12px', marginTop: '16px', fontSize: '11.5px', color: '#64748b' }}>
            {DASHBOARD_DEFINITIONS.costMaster.exposureLogic}
          </div>
        </div>

      </div>
    </div>
  );
}
