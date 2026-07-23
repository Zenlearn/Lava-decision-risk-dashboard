import React, { useState, useEffect } from 'react';

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
  const allMonthNames = monthsList.map((m: any) => m.month);

  // Month selectors state for the 3 columns (Col1: latest, Col2: -1 month, Col3: -2 months)
  const [col1Month, setCol1Month] = useState<string>('');
  const [col2Month, setCol2Month] = useState<string>('');
  const [col3Month, setCol3Month] = useState<string>('');

  useEffect(() => {
    if (monthsList.length > 0) {
      const latestIdx = monthsList.length - 1;
      if (!col1Month) setCol1Month(monthsList[latestIdx]?.month || 'Jun');
      if (!col2Month) setCol2Month(monthsList[Math.max(0, latestIdx - 1)]?.month || 'May');
      if (!col3Month) setCol3Month(monthsList[Math.max(0, latestIdx - 2)]?.month || 'Apr');
    }
  }, [monthsList]);

  const col1Data = monthsList.find((m: any) => m.month === col1Month) || monthsList[monthsList.length - 1];
  const col2Data = monthsList.find((m: any) => m.month === col2Month) || monthsList[Math.max(0, monthsList.length - 2)];
  const col3Data = monthsList.find((m: any) => m.month === col3Month) || monthsList[Math.max(0, monthsList.length - 3)];

  const activeCols = [
    { month: col1Month || col1Data?.month || 'Jun', data: col1Data, setMonth: setCol1Month },
    { month: col2Month || col2Data?.month || 'May', data: col2Data, setMonth: setCol2Month },
    { month: col3Month || col3Data?.month || 'Apr', data: col3Data, setMonth: setCol3Month },
  ];

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

  // Compute grand totals across the 3 selected columns
  let grandTotalQty = 0;
  let grandTotalCost = 0;

  activeCols.forEach((col) => {
    const m = col.data;
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
        
        {/* MULTI-MONTH EXPOSURE SUMMARY TABLE */}
        <div className="card-mock">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                Multi-Month Exposure Summary
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Itemized quantities (Units / Visits) and leakage exposure costs across selected months
              </span>
            </div>
            <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
              Selected: {[col1Month, col2Month, col3Month].filter(Boolean).join(', ')}
            </span>
          </div>

          {/* Multi-Month Matrix Table */}
          <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th rowSpan={2} style={{ padding: '12px', textAlign: 'left', borderRight: '1px solid #e2e8f0', whiteSpace: 'nowrap', width: '1%' }}>Item Type / Component</th>
                  {activeCols.map((col, idx) => (
                    <th key={`col-hdr-${idx}`} colSpan={2} style={{ padding: '6px 8px', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Month:</span>
                        <select
                          value={col.month}
                          onChange={(e) => col.setMonth(e.target.value)}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#0f172a',
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          {allMonthNames.map((mName) => (
                            <option key={mName} value={mName}>{mName}</option>
                          ))}
                        </select>
                      </div>
                    </th>
                  ))}
                  <th colSpan={2} style={{ padding: '8px', textAlign: 'center', background: '#eff6ff', color: '#1d4ed8' }}>
                    3-Month Total
                  </th>
                </tr>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f1f5f9', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                  {activeCols.map((col, idx) => (
                    <React.Fragment key={`sub-hdr-${idx}`}>
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
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1e293b', borderRight: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                        {itemDef.label}
                      </td>
                      {activeCols.map((col, idx) => {
                        const m = col.data;
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
                          <React.Fragment key={`${itemDef.key}-col-${idx}`}>
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
                  <td style={{ padding: '12px', color: '#0f172a', borderRight: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                    Total Monthly Leakage Exposure
                  </td>
                  {activeCols.map((col, idx) => {
                    const m = col.data;
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
                      <React.Fragment key={`tot-col-${idx}`}>
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
              <span style={{ fontWeight: 700, fontSize: '15px' }}>Estimated Annual Leakage Exposure</span>
              <span className="v" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--bad)' }}>{fmtINR(annualLeakRunRate)}</span>
            </div>
          </div>

          <div className="note-mock" style={{ borderTop: '1px solid var(--line)', paddingTop: '10px', marginTop: '16px' }}>
            Breakdown includes quantities and actual component values calculated across selected months. Run-rate calculations align dynamically.
          </div>
        </div>

      </div>
    </div>
  );
}
