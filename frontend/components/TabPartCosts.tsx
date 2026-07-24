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

  // Month selectors state for the 3 columns in upper table
  const [col1Month, setCol1Month] = useState<string>('');
  const [col2Month, setCol2Month] = useState<string>('');
  const [col3Month, setCol3Month] = useState<string>('');

  // Month selector state for lower "Part Consumption Value" table
  const [partConsMonth, setPartConsMonth] = useState<string>('');

  useEffect(() => {
    if (monthsList.length > 0) {
      const latestIdx = monthsList.length - 1;
      if (!col1Month) setCol1Month(monthsList[latestIdx]?.month || 'Jun');
      if (!col2Month) setCol2Month(monthsList[Math.max(0, latestIdx - 1)]?.month || 'May');
      if (!col3Month) setCol3Month(monthsList[Math.max(0, latestIdx - 2)]?.month || 'Apr');
      if (!partConsMonth) setPartConsMonth(monthsList[latestIdx]?.month || 'Jun');
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

  const selectedConsData = monthsList.find((m: any) => m.month === partConsMonth) || monthsList[monthsList.length - 1];

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

  // Benchmark handset price (ASP) lookup per model
  const getDeviceASP = (modelName: string): number => {
    const name = modelName.toLowerCase();
    if (name.includes('agni 3')) return 20999;
    if (name.includes('agni 2') || name.includes('agni 5g')) return 19999;
    if (name.includes('storm')) return 13499;
    if (name.includes('blaze pro') || name.includes('blaze 2 5g')) return 12499;
    if (name.includes('blaze 5g')) return 11999;
    if (name.includes('blaze')) return 10999;
    if (name.includes('yuva 3') || name.includes('yuva 2 pro') || name.includes('yuva 5g')) return 8999;
    if (name.includes('yuva')) return 7999;
    if (name.includes('o2') || name.includes('o1')) return 7999;
    if (name.includes('hero') || name.includes('captain')) return 1499;
    return 9999; // Standard Lava smartphone benchmark ASP
  };

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

  // Calculate model-level consumption for the selected lower table month
  const modelList: any[] = selectedConsData?.modelConsumption || [
    { model: 'Agni 2 5G', count: 185, totalPartCost: 333000, avgPartCost: 1800 },
    { model: 'Blaze Pro 5G', count: 240, totalPartCost: 288000, avgPartCost: 1200 },
    { model: 'Yuva 2 Pro', count: 310, totalPartCost: 186000, avgPartCost: 600 },
    { model: 'Storm 5G', count: 140, totalPartCost: 168000, avgPartCost: 1200 },
    { model: 'Lava O2', count: 210, totalPartCost: 126000, avgPartCost: 600 },
  ];

  let consTotalQty = 0;
  let consTotalPartCost = 0;
  let consTotalWeightedDeviceCost = 0;

  modelList.forEach((m) => {
    const asp = getDeviceASP(m.model);
    consTotalQty += m.count || 1;
    consTotalPartCost += m.totalPartCost || 0;
    consTotalWeightedDeviceCost += asp * (m.count || 1);
  });

  const consOverallAvgPartCost = consTotalQty > 0 ? Math.round(consTotalPartCost / consTotalQty) : 0;
  const consOverallAvgDeviceCost = consTotalQty > 0 ? Math.round(consTotalWeightedDeviceCost / consTotalQty) : 0;
  const consOverallPct = consOverallAvgDeviceCost > 0 ? ((consOverallAvgPartCost / consOverallAvgDeviceCost) * 100).toFixed(1) : '0.0';

  return (
    <div className="view-mock on" style={{ padding: '0 0 40px 0', marginTop: '-16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* 1. MULTI-MONTH EXPOSURE SUMMARY TABLE */}
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
                        <td style={{ padding: '12px 8px', textAlign: 'center', color: '#0f172a', fontSize: '13px' }}>
                          {mQty.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'right', color: '#0f172a', fontSize: '14px', borderRight: '1px solid #e2e8f0' }}>
                          {fmtINR(mCost)}
                        </td>
                      </React.Fragment>
                    );
                  })}
                  <td style={{ padding: '12px 8px', textAlign: 'center', background: '#f8fafc', color: '#0f172a', fontSize: '14px' }}>
                    {grandTotalQty.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', background: '#f8fafc', color: '#0f172a', fontSize: '15px' }}>
                    {fmtINR(grandTotalCost)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="expo-row">
              <span style={{ fontWeight: 700, fontSize: '15px' }}>Estimated Annual Leakage Exposure</span>
              <span className="v" style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{fmtINR(annualLeakRunRate)}</span>
            </div>
          </div>

          <div className="note-mock" style={{ borderTop: '1px solid var(--line)', paddingTop: '10px', marginTop: '16px' }}>
            Breakdown includes quantities and actual component values calculated across selected months. Run-rate calculations align dynamically.
          </div>
        </div>

        {/* 2. NEW TABLE: PART CONSUMPTION VALUE */}
        <div className="card-mock">
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
              Part Consumption Value
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Model-level breakdown of total part replacement costs vs handset retail prices (ASP)
            </span>

            {/* Month Dropdown Selector below Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                Select Month:
              </label>
              <select
                value={partConsMonth}
                onChange={(e) => setPartConsMonth(e.target.value)}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #E50046',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '13px',
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
          </div>

          {/* Model Breakdown Table */}
          <div style={{ overflowX: 'auto', maxWidth: '1050px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', width: '26%', whiteSpace: 'normal', lineHeight: '1.3' }}>
                    Phone / Device<br/>Model Name
                  </th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', width: '19%', whiteSpace: 'normal', lineHeight: '1.3' }}>
                    Monthly Total Cost<br/>of Parts Replaced (₹)
                  </th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', width: '18%', whiteSpace: 'normal', lineHeight: '1.3' }}>
                    Average Cost of<br/>Parts Replaced (₹)
                  </th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', width: '18%', whiteSpace: 'normal', lineHeight: '1.3' }}>
                    Cost of Phone /<br/>Device (ASP ₹)
                  </th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', width: '19%', whiteSpace: 'normal', lineHeight: '1.3' }}>
                    % of Avg Part Cost<br/>by Device Cost
                  </th>
                </tr>
              </thead>
              <tbody>
                {modelList.map((m: any, idx: number) => {
                  const deviceASP = getDeviceASP(m.model);
                  const pctDeviceCost = deviceASP > 0 ? ((m.avgPartCost / deviceASP) * 100).toFixed(1) : '0.0';

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: '#1e293b' }}>
                        {m.model}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                        {fmtINR(m.totalPartCost || 0)}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600, color: '#475569' }}>
                        {fmtINR(m.avgPartCost || 0)}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600, color: '#64748b' }}>
                        {fmtINR(deviceASP)}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                        {pctDeviceCost}%
                      </td>
                    </tr>
                  );
                })}

                {/* Total Summary Row */}
                <tr style={{ borderTop: '2px solid #cbd5e1', background: '#f8fafc', fontWeight: 800 }}>
                  <td style={{ padding: '12px 14px', textAlign: 'left', color: '#0f172a' }}>
                    Total / Overall Weighted Average
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', color: '#0f172a', fontSize: '15px' }}>
                    {fmtINR(consTotalPartCost)}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', color: '#0f172a' }}>
                    {fmtINR(consOverallAvgPartCost)}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', color: '#64748b' }}>
                    {fmtINR(consOverallAvgDeviceCost)}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', color: '#0f172a', fontSize: '15px' }}>
                    {consOverallPct}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
