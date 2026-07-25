import React, { useState } from 'react';

interface TabOrgKPIsProps {
  data: any;
  fmtINR: (v: number) => string;
  fmtPct: (v: number) => string;
}

export default function TabOrgKPIs({ data, fmtINR, fmtPct }: TabOrgKPIsProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('Jun');
  const [selectedBusmRow, setSelectedBusmRow] = useState<string | null>(null);

  const activeOrgKpi = data?.orgKpis?.by_month?.[selectedMonth] || data?.orgKpis?.all || { busms: [], asms: [], national: {} };

  const busmList: any[] = (activeOrgKpi.busms || []).filter((b: any) => b.name && !b.name.toLowerCase().includes('unknown'));
  const allAsmList: any[] = (activeOrgKpi.asms || []).filter((a: any) => a.name && !a.name.toLowerCase().includes('unknown') && a.busm && !a.busm.toLowerCase().includes('unknown'));
  const nationalSummary: any = activeOrgKpi.national || {};

  // Filter ASMs by clicked BUSM row (or show all if no row is clicked)
  const filteredAsmList = selectedBusmRow
    ? allAsmList.filter((a) => a.busm === selectedBusmRow)
    : allAsmList;

  // Calculate summary totals for filtered ASMs
  const asmTotalWo = filteredAsmList.reduce((sum, a) => sum + (a.wo || 0), 0);
  const asmAvgTat = filteredAsmList.length > 0 ? Math.round((filteredAsmList.reduce((sum, a) => sum + (a.tat || 0), 0) / filteredAsmList.length) * 10) / 10 : 0;
  const asmAvgCpc = filteredAsmList.length > 0 ? Math.round(filteredAsmList.reduce((sum, a) => sum + (a.cpc || 0), 0) / filteredAsmList.length) : 0;
  const asmAvgSah = filteredAsmList.length > 0 ? Math.round((filteredAsmList.reduce((sum, a) => sum + (a.sah || 0), 0) / filteredAsmList.length) * 10) / 10 : 0;
  const asmAvgNps = filteredAsmList.length > 0 ? Math.round((filteredAsmList.reduce((sum, a) => sum + (a.nps || 0), 0) / filteredAsmList.length) * 10) / 10 : 0;
  const asmAvgDiag = filteredAsmList.length > 0 ? Math.round((filteredAsmList.reduce((sum, a) => sum + (a.diag || 0), 0) / filteredAsmList.length) * 10) / 10 : 0;
  const asmAvgCag = filteredAsmList.length > 0 ? Math.round((filteredAsmList.reduce((sum, a) => sum + (a.cag || 0), 0) / filteredAsmList.length) * 10) / 10 : 0;

  // NPS static datasets from Jun26 NPS Data.xlsx
  const busmNpsData = [
    { name: 'Jitesh S Rath', total: 2336, d: '12.7%', p: '17.6%', pr: '69.7%', nps: '57.0%', rank: 5 },
    { name: 'Rajesh Limbachia', total: 2154, d: '10.2%', p: '13.9%', pr: '75.9%', nps: '65.8%', rank: 2 },
    { name: 'Shivaprasad P U', total: 2521, d: '8.3%', p: '17.2%', pr: '74.6%', nps: '66.3%', rank: 1 },
    { name: 'Sukhbir Singh', total: 3093, d: '10.1%', p: '17.3%', pr: '72.6%', nps: '62.5%', rank: 3 },
    { name: 'Tamilselvan Subramanian', total: 2047, d: '9.0%', p: '20.6%', pr: '70.4%', nps: '61.4%', rank: 4 },
  ];

  const asmNpsData = [
    { name: 'Abhishek Kumar', busm: 'Shivaprasad P U', total: 402, d: '10.8%', p: '11.7%', pr: '77.5%', nps: '66.7%', rank: 12 },
    { name: 'Alpesh Rabari', busm: 'Rajesh Limbachia', total: 481, d: '8.8%', p: '14.9%', pr: '76.4%', nps: '67.6%', rank: 11 },
    { name: 'AniketKumar Pandey', busm: 'Jitesh S Rath', total: 177, d: '17.3%', p: '9.9%', pr: '72.8%', nps: '55.6%', rank: 31 },
    { name: 'Anisur Rehman Mullick', busm: 'Jitesh S Rath', total: 662, d: '14.6%', p: '13.2%', pr: '72.1%', nps: '57.5%', rank: 29 },
    { name: 'Arjun Singh', busm: 'Tamilselvan Subramanian', total: 244, d: '4.8%', p: '12.0%', pr: '83.1%', nps: '78.3%', rank: 3 },
    { name: 'Arun Bhatia', busm: 'Sukhbir Singh', total: 612, d: '12.0%', p: '15.9%', pr: '72.1%', nps: '60.1%', rank: 27 },
    { name: 'Ashwani kumar', busm: 'Rajesh Limbachia', total: 436, d: '13.1%', p: '14.4%', pr: '72.5%', nps: '59.5%', rank: 28 },
    { name: 'Awadhesh Kumar Singh', busm: 'Jitesh S Rath', total: 300, d: '15.7%', p: '13.9%', pr: '70.4%', nps: '54.6%', rank: 32 },
    { name: 'D C Manikantha', busm: 'Shivaprasad P U', total: 634, d: '6.1%', p: '12.1%', pr: '81.8%', nps: '75.8%', rank: 4 },
    { name: 'Deepan S', busm: 'Tamilselvan Subramanian', total: 289, d: '10.1%', p: '15.1%', pr: '74.8%', nps: '64.7%', rank: 17 },
    { name: 'Dnyaneshwar R Shelar', busm: 'Shivaprasad P U', total: 373, d: '10.4%', p: '16.7%', pr: '72.9%', nps: '62.5%', rank: 23 },
    { name: 'Firoj Alam', busm: 'Jitesh S Rath', total: 492, d: '6.5%', p: '13.7%', pr: '79.7%', nps: '73.2%', rank: 7 },
    { name: 'Gajender Chandel', busm: 'Sukhbir Singh', total: 221, d: '10.1%', p: '11.4%', pr: '78.5%', nps: '68.4%', rank: 9 },
    { name: 'Gulam Moula Laskar', busm: 'Jitesh S Rath', total: 326, d: '7.5%', p: '15.1%', pr: '77.4%', nps: '69.8%', rank: 8 },
    { name: 'Hem Chandra Joshi', busm: 'Sukhbir Singh', total: 398, d: '6.3%', p: '11.9%', pr: '81.8%', nps: '75.5%', rank: 5 },
    { name: 'K.Venkateswarlu', busm: 'Tamilselvan Subramanian', total: 169, d: '9.6%', p: '17.0%', pr: '73.4%', nps: '63.8%', rank: 20 },
    { name: 'Kamal kant', busm: 'Sukhbir Singh', total: 330, d: '12.6%', p: '14.2%', pr: '73.2%', nps: '60.6%', rank: 25 },
    { name: 'Koshi Jain', busm: 'Rajesh Limbachia', total: 419, d: '12.5%', p: '11.8%', pr: '75.7%', nps: '63.2%', rank: 22 },
    { name: 'Madhukesh Sharma', busm: 'Sukhbir Singh', total: 499, d: '11.7%', p: '12.2%', pr: '76.1%', nps: '64.4%', rank: 19 },
    { name: 'Md Tanweer Alam', busm: 'Jitesh S Rath', total: 342, d: '16.7%', p: '16.7%', pr: '66.7%', nps: '50.0%', rank: 33 },
    { name: 'Mohd. Shadan Aaqil', busm: 'Sukhbir Singh', total: 231, d: '8.2%', p: '22.4%', pr: '69.4%', nps: '61.2%', rank: 24 },
    { name: 'Nafis Ahmed', busm: 'Sukhbir Singh', total: 366, d: '12.9%', p: '10.9%', pr: '76.2%', nps: '63.4%', rank: 21 },
    { name: 'Prasanta Barik', busm: 'Tamilselvan Subramanian', total: 363, d: '11.5%', p: '8.6%', pr: '79.9%', nps: '68.3%', rank: 10 },
    { name: 'Prashanth Kumar', busm: 'Tamilselvan Subramanian', total: 238, d: '6.8%', p: '20.4%', pr: '72.8%', nps: '66.0%', rank: 14 },
    { name: 'Praveendas K', busm: 'Tamilselvan Subramanian', total: 272, d: '12.7%', p: '18.6%', pr: '68.6%', nps: '55.9%', rank: 30 },
    { name: 'Pushpendra Singh', busm: 'Rajesh Limbachia', total: 435, d: '7.0%', p: '7.0%', pr: '86.0%', nps: '79.1%', rank: 2 },
    { name: 'Rahul Kumar', busm: 'Jitesh S Rath', total: 214, d: '15.1%', p: '23.3%', pr: '61.6%', nps: '46.5%', rank: 34 },
    { name: 'Raja R', busm: 'Tamilselvan Subramanian', total: 140, d: '8.5%', p: '22.5%', pr: '69.0%', nps: '60.6%', rank: 26 },
    { name: 'Sathish Kumar B', busm: 'Tamilselvan Subramanian', total: 332, d: '11.3%', p: '12.8%', pr: '75.9%', nps: '64.7%', rank: 18 },
    { name: 'Sathya S', busm: 'Shivaprasad P U', total: 232, d: '12.8%', p: '9.3%', pr: '77.9%', nps: '65.1%', rank: 16 },
    { name: 'Shyam Sunder Dixit', busm: 'Sukhbir Singh', total: 322, d: '12.7%', p: '8.8%', pr: '78.4%', nps: '65.7%', rank: 15 },
    { name: 'Soukeen Khan', busm: 'Rajesh Limbachia', total: 320, d: '7.8%', p: '1.6%', pr: '90.7%', nps: '82.9%', rank: 1 },
    { name: 'Sushil R. Turkar', busm: 'Shivaprasad P U', total: 547, d: '4.9%', p: '16.0%', pr: '79.1%', nps: '74.2%', rank: 6 },
    { name: 'Vikram Singh Rajput', busm: 'Shivaprasad P U', total: 333, d: '9.8%', p: '14.3%', pr: '75.9%', nps: '66.1%', rank: 13 },
  ];

  const topAspNpsData = [
    { code: 'ASP-1102652', name: 'CELL CARE SERVICES', asm: 'Abhishek Kumar', busm: 'Shivaprasad P U', total: 27, rr: '55.6%', d: '6.7%', p: '26.7%', pr: '66.7%', nps: '60.0%' },
    { code: 'ASP-1102700', name: 'SAI SHOPEE', asm: 'Sushil R. Turkar', busm: 'Shivaprasad P U', total: 38, rr: '50.0%', d: '5.3%', p: '10.5%', pr: '84.2%', nps: '78.9%' },
    { code: 'ASP-1103754', name: 'EXCELLENT SERVICES', asm: 'Abhishek Kumar', busm: 'Shivaprasad P U', total: 28, rr: '35.7%', d: '0.0%', p: '20.0%', pr: '80.0%', nps: '80.0%' },
    { code: 'ASP-1102679', name: 'DRISHTI TECHNOLOGY', asm: 'Alpesh Rabari', busm: 'Rajesh Limbachia', total: 44, rr: '63.6%', d: '9.1%', p: '18.2%', pr: '72.7%', nps: '63.6%' },
    { code: 'ASP-1103613', name: 'SMART SOLUTION', asm: 'Anisur Rehman Mullick', busm: 'Jitesh S Rath', total: 82, rr: '48.8%', d: '15.0%', p: '17.5%', pr: '67.5%', nps: '52.5%' },
    { code: 'ASP-1103679', name: 'M/S NEW NOVELTY', asm: 'Firoj Alam', busm: 'Jitesh S Rath', total: 64, rr: '56.3%', d: '8.3%', p: '13.9%', pr: '77.8%', nps: '69.4%' },
    { code: 'ASP-1102761', name: 'TECH SOLUTION', asm: 'Gajender Chandel', busm: 'Sukhbir Singh', total: 42, rr: '52.4%', d: '9.1%', p: '13.6%', pr: '77.3%', nps: '68.2%' },
    { code: 'ASP-1102682', name: 'RAINBOW COMMUNICATION', asm: 'Hem Chandra Joshi', busm: 'Sukhbir Singh', total: 58, rr: '60.3%', d: '5.7%', p: '11.4%', pr: '82.9%', nps: '77.1%' },
    { code: 'ASP-1101746', name: 'ABHISHEK SALES', asm: 'Nafis Ahmed', busm: 'Sukhbir Singh', total: 94, rr: '46.8%', d: '11.4%', p: '9.1%', pr: '79.5%', nps: '68.2%' },
    { code: 'ASP-1102180', name: 'Q COM', asm: 'Pushpendra Singh', busm: 'Rajesh Limbachia', total: 76, rr: '55.3%', d: '7.1%', p: '7.1%', pr: '85.7%', nps: '78.6%' },
  ];

  const dsatBusmData = [
    { name: 'Sukhbir Singh', delay: 34, repair: 45, aspBehav: 5, replace: 9, cost: 4, deny: 1, total: 121 },
    { name: 'Jitesh S Rath', delay: 30, repair: 19, aspBehav: 11, replace: 1, cost: 4, deny: 0, total: 78 },
    { name: 'Rajesh Limbachia', delay: 26, repair: 15, aspBehav: 11, replace: 4, cost: 2, deny: 5, total: 61 },
    { name: 'Tamilselvan Subramanian', delay: 19, repair: 8, aspBehav: 3, replace: 3, cost: 5, deny: 1, total: 46 },
    { name: 'Shivaprasad P U', delay: 22, repair: 8, aspBehav: 8, replace: 3, cost: 1, deny: 1, total: 44 },
  ];

  const deviceCategoryNps = [
    { cat: 'Feature Phone', surveys: 5350, d: '10.7%', p: '11.1%', pr: '78.2%', nps: '67.5%' },
    { cat: 'Smart Phone', surveys: 6801, d: '10.3%', p: '21.2%', pr: '68.5%', nps: '58.2%' },
    { cat: 'Overall Combined', surveys: 12151, d: '10.5%', p: '13.6%', pr: '75.9%', nps: '65.4%' },
  ];

  const fpBusmData = [
    { name: 'Jitesh S Rath', total: 1240, d: '11.4%', p: '14.1%', pr: '74.5%', nps: '63.1%' },
    { name: 'Rajesh Limbachia', total: 714, d: '14.5%', p: '7.6%', pr: '77.9%', nps: '63.4%' },
    { name: 'Shivaprasad P U', total: 1360, d: '6.5%', p: '11.8%', pr: '81.7%', nps: '75.2%' },
    { name: 'Sukhbir Singh', total: 857, d: '8.0%', p: '8.0%', pr: '83.9%', nps: '75.9%' },
    { name: 'Tamilselvan Subramanian', total: 1179, d: '13.3%', p: '11.2%', pr: '75.5%', nps: '62.1%' },
  ];

  const spBusmData = [
    { name: 'Jitesh S Rath', total: 1096, d: '14.1%', p: '21.5%', pr: '64.4%', nps: '50.3%' },
    { name: 'Rajesh Limbachia', total: 1440, d: '8.1%', p: '17.0%', pr: '74.9%', nps: '66.8%' },
    { name: 'Shivaprasad P U', total: 1161, d: '10.3%', p: '23.5%', pr: '66.2%', nps: '55.9%' },
    { name: 'Sukhbir Singh', total: 2236, d: '10.9%', p: '20.8%', pr: '68.3%', nps: '57.4%' },
    { name: 'Tamilselvan Subramanian', total: 868, d: '3.1%', p: '33.4%', pr: '63.5%', nps: '60.4%' },
  ];

  return (
    <div className="view-mock on" style={{ paddingBottom: '60px' }}>
      
      {/* SECTION HEADER & MONTH SELECTOR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="bar" style={{ background: '#E50046' }}></div>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
            Organization KPIs &amp; Regional Performance Scorecards
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
            Select Month:
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1.5px solid #E50046',
              background: '#ffffff',
              color: '#0f172a',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <option value="Jun">June 2026</option>
            <option value="May">May 2026</option>
            <option value="Apr">April 2026</option>
          </select>
        </div>
      </div>

      {/* QUICK JUMP PILLS NAVIGATION BAR */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { label: 'Overall', target: 'sec-overall' },
          { label: 'Service at Home', target: 'sec-sah' },
          { label: 'NPS', target: 'sec-nps' },
          { label: 'TAT', target: 'sec-tat' },
        ].map((pill) => (
          <button
            key={pill.target}
            onClick={() => {
              const el = document.getElementById(pill.target);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              padding: '6px 18px',
              borderRadius: '20px',
              border: '1.5px solid #cbd5e1',
              background: '#ffffff',
              color: '#0f172a',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#E50046';
              e.currentTarget.style.color = '#E50046';
              e.currentTarget.style.background = '#fff5f7';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.color = '#0f172a';
              e.currentTarget.style.background = '#ffffff';
            }}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* SECTION 1: OVERALL REGIONAL PERFORMANCE SCORECARDS */}
      <div id="sec-overall" style={{ marginBottom: '36px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="bar" style={{ background: '#0f172a' }}></div>
          <span style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
            1. Overall Regional Performance Scorecards
          </span>
        </div>

        {/* TABLE 1: BUSM PERFORMANCE & RANKING MATRIX */}
        <div className="card-mock" style={{ padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                BUSM Performance &amp; Parameter Ranking Matrix
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Click any BUSM row to drill down into corresponding Area Manager (ASM) performance metrics below
              </span>
            </div>
            {selectedBusmRow && (
              <button
                onClick={() => setSelectedBusmRow(null)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                Clear Filter ({selectedBusmRow})
              </button>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', lineHeight: '1.3' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', width: '22%' }}>BUSM Name</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>TAT % (Rank)</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>CPC ₹ (Rank)</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>S@H Adherence % (Rank)</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>NPS % (Rank)</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>Diagnostics Acc. (Rank)</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>CAG Scorecard (Rank)</th>
                </tr>
              </thead>
              <tbody>
                {busmList.map((r: any, i: number) => {
                  const isSelected = selectedBusmRow === r.name;
                  return (
                    <tr
                      key={i}
                      onClick={() => setSelectedBusmRow(isSelected ? null : r.name)}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: isSelected ? '#eff6ff' : i % 2 === 0 ? '#ffffff' : '#f8fafc',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 800, color: isSelected ? '#1d4ed8' : '#1e293b', borderRight: '1px solid #f1f5f9' }}>
                        {r.name} {isSelected && '✓'}
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'right' }}>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{r.tat}%</span>
                        {r.ranks?.tat && (
                          <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 5px', borderRadius: '4px', marginLeft: '6px' }}>
                            #{r.ranks.tat}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'right' }}>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>₹{r.cpc}</span>
                        {r.ranks?.cpc && (
                          <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 5px', borderRadius: '4px', marginLeft: '6px' }}>
                            #{r.ranks.cpc}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'right' }}>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{r.sah}%</span>
                        {r.ranks?.sah && (
                          <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 5px', borderRadius: '4px', marginLeft: '6px' }}>
                            #{r.ranks.sah}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'right' }}>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{r.nps}%</span>
                        {r.ranks?.nps && (
                          <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 5px', borderRadius: '4px', marginLeft: '6px' }}>
                            #{r.ranks.nps}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'right' }}>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{r.diag}%</span>
                        {r.ranks?.diag && (
                          <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 5px', borderRadius: '4px', marginLeft: '6px' }}>
                            #{r.ranks.diag}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'right' }}>
                        <span style={{ fontWeight: 800, color: '#0f172a' }}>{r.cag}%</span>
                        {r.ranks?.cag && (
                          <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd', padding: '1px 6px', borderRadius: '4px', marginLeft: '6px' }}>
                            #{r.ranks.cag}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {/* National % / Total Summary Row */}
                <tr style={{ borderTop: '2.5px solid #0f172a', background: '#f8fafc', fontWeight: 800 }}>
                  <td style={{ padding: '12px', color: '#0f172a', borderRight: '1px solid #e2e8f0', background: '#f1f5f9', fontWeight: 800 }}>
                    {nationalSummary.name || 'National %'}
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', color: '#0f172a', fontWeight: 800 }}>{nationalSummary.tat ?? 85.0}%</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', color: '#0f172a', fontWeight: 800 }}>₹{nationalSummary.cpc ?? 620}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', color: '#0f172a', fontWeight: 800 }}>{nationalSummary.sah ?? 90.5}%</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', color: '#0f172a', fontWeight: 800 }}>{nationalSummary.nps ?? 83.4}%</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', color: '#0f172a', fontWeight: 800 }}>{nationalSummary.diag ?? 96.2}%</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', color: '#0f172a', fontWeight: 800 }}>{nationalSummary.cag ?? 97.5}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* TABLE 2: ASM BREAKDOWN MATRIX */}
        <div className="card-mock" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Supervisor (ASM) Performance &amp; Parameter Ranking Matrix
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                {selectedBusmRow ? `Showing Area Managers (ASMs) under ${selectedBusmRow}` : 'Showing all Area Managers (ASMs) across the organization'}
              </span>
            </div>
            <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
              Count: {filteredAsmList.length} ASMs
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', lineHeight: '1.3' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', borderRight: '1px solid #e2e8f0', width: '16%' }}>ASM Name</th>
                  <th style={{ padding: '10px 10px', textAlign: 'left', borderRight: '1px solid #e2e8f0', width: '14%' }}>BUSM</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>TAT % (Rank)</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>CPC ₹ (Rank)</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>S@H Adherence % (Rank)</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>NPS % (Rank)</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>Diagnostics Acc. (Rank)</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>CAG Scorecard (Rank)</th>
                </tr>
              </thead>
              <tbody>
                {filteredAsmList.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                      No ASMs found for selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredAsmList.map((r: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#1e293b' }}>{r.name}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'left', color: '#64748b', borderRight: '1px solid #f1f5f9' }}>{r.busm}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{r.tat}%</span>
                        {r.ranks?.tat && (
                          <span style={{ fontSize: '10px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 4px', borderRadius: '4px', marginLeft: '4px' }}>
                            #{r.ranks.tat}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>₹{r.cpc}</span>
                        {r.ranks?.cpc && (
                          <span style={{ fontSize: '10px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 4px', borderRadius: '4px', marginLeft: '4px' }}>
                            #{r.ranks.cpc}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{r.sah}%</span>
                        {r.ranks?.sah && (
                          <span style={{ fontSize: '10px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 4px', borderRadius: '4px', marginLeft: '4px' }}>
                            #{r.ranks.sah}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{r.nps}%</span>
                        {r.ranks?.nps && (
                          <span style={{ fontSize: '10px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 4px', borderRadius: '4px', marginLeft: '4px' }}>
                            #{r.ranks.nps}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{r.diag}%</span>
                        {r.ranks?.diag && (
                          <span style={{ fontSize: '10px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 4px', borderRadius: '4px', marginLeft: '4px' }}>
                            #{r.ranks.diag}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{r.cag}%</span>
                        {r.ranks?.cag && (
                          <span style={{ fontSize: '10px', fontWeight: 800, background: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd', padding: '1px 4px', borderRadius: '4px', marginLeft: '4px' }}>
                            #{r.ranks.cag}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}

                {/* Total Summary Row for ASMs */}
                <tr style={{ borderTop: '2.5px solid #0f172a', background: '#f8fafc', fontWeight: 800 }}>
                  <td style={{ padding: '10px 12px', color: '#0f172a', background: '#f1f5f9', fontWeight: 800 }}>Total / Average</td>
                  <td style={{ padding: '10px 10px', color: '#64748b', borderRight: '1px solid #e2e8f0' }}>{selectedBusmRow || 'All Regions'}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', color: '#0f172a', fontWeight: 800 }}>{asmAvgTat}%</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', color: '#0f172a', fontWeight: 800 }}>₹{asmAvgCpc}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', color: '#0f172a', fontWeight: 800 }}>{asmAvgSah}%</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', color: '#0f172a', fontWeight: 800 }}>{asmAvgNps}%</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', color: '#0f172a', fontWeight: 800 }}>{asmAvgDiag}%</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', color: '#0f172a', fontWeight: 800 }}>{asmAvgCag}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 2: SERVE@HOME (S@H) APPOINTMENT METRICS (BY APPOINTMENT DATE) */}
      <div id="sec-sah" style={{ marginBottom: '36px' }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="bar" style={{ background: '#2563eb' }}></div>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              2. Service at Home (S@H) Operational Benchmarks
            </span>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#2563eb', marginTop: '2px', marginLeft: '12px' }}>
            By Appointment Date
          </div>
        </div>

        {/* TABLE 3: BUSM APPOINTMENT METRICS TABLE */}
        <div className="card-mock" style={{ padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                BUSM Appointment Performance Matrix
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Service at Home appointment metrics by Business Unit Manager (BUSM)
              </span>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', lineHeight: '1.3' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', borderRight: '1px solid #e2e8f0', width: '18%' }}>BUSM Name</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>Total Appointments</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>Cancellation %</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>Reschedule %</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>Same Day Attend %</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>Same Day Attend with Cancellation %</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>Pending to Attend %</th>
                </tr>
              </thead>
              <tbody>
                {busmList.map((r: any, i: number) => {
                  const isSelected = selectedBusmRow === r.name;
                  return (
                    <tr
                      key={i}
                      onClick={() => setSelectedBusmRow(isSelected ? null : r.name)}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: isSelected ? '#eff6ff' : i % 2 === 0 ? '#ffffff' : '#f8fafc',
                        cursor: 'pointer',
                      }}
                    >
                      <td style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 800, color: isSelected ? '#1d4ed8' : '#1e293b', borderRight: '1px solid #f1f5f9' }}>
                        {r.name} {isSelected && '✓'}
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, borderRight: '1px solid #f1f5f9' }}>
                        {(r.wo || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#d97706' }}>{r.cancelPct ?? 30.7}%</td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 600 }}>{r.reschedulePct ?? 10.0}%</td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>{r.sameDayAttendPct ?? 31.4}%</td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>{r.sameDayAttendCancelPct ?? 12.3}%</td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>{r.pendingToAttendPct ?? 5.5}%</td>
                    </tr>
                  );
                })}

                {/* National Total Summary Row */}
                <tr style={{ borderTop: '2.5px solid #0f172a', background: '#f8fafc', fontWeight: 800 }}>
                  <td style={{ padding: '12px', color: '#0f172a', borderRight: '1px solid #e2e8f0', background: '#f1f5f9', fontWeight: 800 }}>
                    {nationalSummary.name || 'National %'}
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', color: '#0f172a', borderRight: '1px solid #e2e8f0', fontWeight: 800 }}>
                    {(nationalSummary.wo || 16030).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', color: '#d97706', fontWeight: 800 }}>30.7%</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', color: '#0f172a', fontWeight: 800 }}>10.0%</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', color: '#16a34a', fontWeight: 800 }}>31.4%</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', color: '#dc2626', fontWeight: 800 }}>12.3%</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', color: '#2563eb', fontWeight: 800 }}>5.5%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* TABLE 4: ASM APPOINTMENT METRICS TABLE */}
        <div className="card-mock" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Supervisor (ASM) Appointment Performance Matrix
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                {selectedBusmRow ? `Showing Area Managers (ASMs) under ${selectedBusmRow}` : 'Showing all Area Managers (ASMs) across the organization'}
              </span>
            </div>
            <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
              Count: {filteredAsmList.length} ASMs
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', lineHeight: '1.3' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', borderRight: '1px solid #e2e8f0', width: '16%' }}>ASM Name</th>
                  <th style={{ padding: '10px 10px', textAlign: 'left', borderRight: '1px solid #e2e8f0', width: '14%' }}>BUSM</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>Total Appointments</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>Cancellation %</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>Reschedule %</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>Same Day Attend %</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>Same Day Attend with Cancellation %</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>Pending to Attend %</th>
                </tr>
              </thead>
              <tbody>
                {filteredAsmList.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                      No ASMs found for selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredAsmList.map((r: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#1e293b' }}>{r.name}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'left', color: '#64748b', borderRight: '1px solid #f1f5f9' }}>{r.busm}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, borderRight: '1px solid #f1f5f9' }}>
                        {(r.wo || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#d97706' }}>{r.cancelPct ?? 30.7}%</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>{r.reschedulePct ?? 10.0}%</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>{r.sameDayAttendPct ?? 31.4}%</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>{r.sameDayAttendCancelPct ?? 12.3}%</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>{r.pendingToAttendPct ?? 5.5}%</td>
                    </tr>
                  ))
                )}

                {/* Total Summary Row for ASMs */}
                <tr style={{ borderTop: '2.5px solid #0f172a', background: '#f8fafc', fontWeight: 800 }}>
                  <td style={{ padding: '10px 12px', color: '#0f172a', background: '#f1f5f9', fontWeight: 800 }}>Total / Average</td>
                  <td style={{ padding: '10px 10px', color: '#64748b', borderRight: '1px solid #e2e8f0' }}>{selectedBusmRow || 'All Regions'}</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', color: '#0f172a', borderRight: '1px solid #e2e8f0', fontWeight: 800 }}>
                    {asmTotalWo.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', color: '#d97706', fontWeight: 800 }}>30.7%</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', color: '#0f172a', fontWeight: 800 }}>10.0%</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', color: '#16a34a', fontWeight: 800 }}>31.4%</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', color: '#dc2626', fontWeight: 800 }}>12.3%</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', color: '#2563eb', fontWeight: 800 }}>5.5%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 3: NPS DASHBOARD (8 TABLES FROM EXCEL) */}
      <div id="sec-nps" style={{ marginBottom: '36px' }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="bar" style={{ background: '#7c3aed' }}></div>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              3. NPS Performance &amp; Customer Satisfaction Dashboard
            </span>
          </div>
          <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px', marginLeft: '12px' }}>
            Complete 8-Table Net Promoter Score (NPS) analysis from Master NPS Dataset (June 2026)
          </div>
        </div>

        {/* NPS TABLE 1: BUSM LEVEL NPS BREAKDOWN */}
        <div className="card-mock" style={{ padding: '20px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
            Table 1: BUSM Wise NPS Performance Breakdown
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>BUSM Name</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>Total Surveys</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#dc2626' }}>Detractor %</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#d97706' }}>Passive %</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#16a34a' }}>Promoter %</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#2563eb' }}>NPS %</th>
                  <th style={{ padding: '10px 10px', textAlign: 'center' }}>NPS Rank</th>
                </tr>
              </thead>
              <tbody>
                {busmNpsData.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '9px 12px', fontWeight: 700, color: '#1e293b' }}>{r.name}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 600 }}>{r.total.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', color: '#dc2626', fontWeight: 700 }}>{r.d}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', color: '#d97706', fontWeight: 600 }}>{r.p}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', color: '#16a34a', fontWeight: 700 }}>{r.pr}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', color: '#2563eb', fontWeight: 800 }}>{r.nps}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 7px', borderRadius: '4px' }}>
                        #{r.rank}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2.5px solid #0f172a', background: '#f8fafc', fontWeight: 800 }}>
                  <td style={{ padding: '10px 12px', color: '#0f172a', background: '#f1f5f9' }}>National % / Total</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', color: '#0f172a' }}>12,151</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', color: '#dc2626' }}>10.5%</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', color: '#0f172a' }}>13.6%</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', color: '#16a34a' }}>75.9%</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', color: '#2563eb' }}>65.4%</td>
                  <td style={{ padding: '10px 10px', textAlign: 'center', color: '#64748b', fontSize: '11px' }}>-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* NPS TABLE 2: ASM LEVEL NPS BREAKDOWN */}
        <div className="card-mock" style={{ padding: '20px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
            Table 2: Supervisor (ASM) Wise NPS Performance Breakdown
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>ASM Name</th>
                  <th style={{ padding: '10px 10px', textAlign: 'left' }}>BUSM</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>Surveys</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#dc2626' }}>Detractor %</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#d97706' }}>Passive %</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#16a34a' }}>Promoter %</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#2563eb' }}>NPS %</th>
                  <th style={{ padding: '10px 10px', textAlign: 'center' }}>Rank</th>
                </tr>
              </thead>
              <tbody>
                {asmNpsData.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#1e293b' }}>{r.name}</td>
                    <td style={{ padding: '8px 10px', color: '#64748b' }}>{r.busm}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>{r.total.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: '#dc2626', fontWeight: 700 }}>{r.d}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: '#d97706' }}>{r.p}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: '#16a34a', fontWeight: 700 }}>{r.pr}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: '#2563eb', fontWeight: 800 }}>{r.nps}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 5px', borderRadius: '4px' }}>
                        #{r.rank}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* NPS TABLE 3: ASP CENTER WISE NPS BREAKDOWN */}
        <div className="card-mock" style={{ padding: '20px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
            Table 3: Top ASP Center Wise NPS Performance Breakdown
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 10px', textAlign: 'left', fontFamily: 'monospace' }}>ASP Code</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>ASP Name</th>
                  <th style={{ padding: '10px 10px', textAlign: 'left' }}>Supervisor (ASM)</th>
                  <th style={{ padding: '10px 10px', textAlign: 'left' }}>BUSM</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>Surveys</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>Response Rate %</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#dc2626' }}>Detractor %</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#d97706' }}>Passive %</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#16a34a' }}>Promoter %</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#2563eb' }}>NPS %</th>
                </tr>
              </thead>
              <tbody>
                {topAspNpsData.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: '#64748b' }}>{r.code}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#1e293b' }}>{r.name}</td>
                    <td style={{ padding: '8px 10px', color: '#64748b' }}>{r.asm}</td>
                    <td style={{ padding: '8px 10px', color: '#64748b' }}>{r.busm}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>{r.total}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>{r.rr}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: '#dc2626', fontWeight: 700 }}>{r.d}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: '#d97706' }}>{r.p}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: '#16a34a', fontWeight: 700 }}>{r.pr}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: '#2563eb', fontWeight: 800 }}>{r.nps}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* NPS TABLES 4 & 5: DETRACTOR (DSAT) REASONS BREAKDOWN */}
        <div className="card-mock" style={{ padding: '20px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
            Table 4 &amp; 5: Detractor (DSAT) Root Cause Reasons Matrix by BUSM
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>BUSM Name</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#d97706' }}>Delay in Service</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#dc2626' }}>Repair Quality</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>ASP Behaviour</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>Replacement / Product Quality Issue</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>High Repair Cost</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>Deny in Service</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 800 }}>Total DSAT</th>
                </tr>
              </thead>
              <tbody>
                {dsatBusmData.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '9px 12px', fontWeight: 700, color: '#1e293b' }}>{r.name}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 700, color: '#d97706' }}>{r.delay}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>{r.repair}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 600 }}>{r.aspBehav}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 600 }}>{r.replace}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 600 }}>{r.cost}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 600 }}>{r.deny}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>{r.total}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2.5px solid #0f172a', background: '#f8fafc', fontWeight: 800 }}>
                  <td style={{ padding: '10px 12px', color: '#0f172a', background: '#f1f5f9' }}>Grand Total</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', color: '#d97706' }}>131</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', color: '#dc2626' }}>95</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', color: '#0f172a' }}>38</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', color: '#0f172a' }}>20</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', color: '#0f172a' }}>16</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', color: '#0f172a' }}>10</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', color: '#0f172a' }}>350</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* NPS TABLE 6: OVERALL DEVICE CATEGORY NPS COMPARISON */}
        <div className="card-mock" style={{ padding: '20px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
            Table 6: Overall Device Category NPS Comparison (Feature Phone vs Smart Phone)
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Device Category</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>Total Surveys</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#dc2626' }}>Detractor %</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#d97706' }}>Passive %</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#16a34a' }}>Promoter %</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#2563eb' }}>NPS %</th>
                </tr>
              </thead>
              <tbody>
                {deviceCategoryNps.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', fontWeight: i === 2 ? 800 : 500 }}>
                    <td style={{ padding: '9px 12px', fontWeight: 700, color: '#1e293b' }}>{r.cat}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 600 }}>{r.surveys.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', color: '#dc2626', fontWeight: 700 }}>{r.d}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', color: '#d97706' }}>{r.p}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', color: '#16a34a', fontWeight: 700 }}>{r.pr}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', color: '#2563eb', fontWeight: 800 }}>{r.nps}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* NPS TABLE 7 & 8: FEATURE PHONE vs SMART PHONE BREAKDOWN BY BUSM */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          
          {/* Table 7: Feature Phone NPS Performance Breakdown */}
          <div className="card-mock" style={{ padding: '20px', margin: 0 }}>
            <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
              Table 7: Feature Phone NPS Performance Breakdown by BUSM
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left' }}>BUSM Name</th>
                    <th style={{ padding: '8px 8px', textAlign: 'right' }}>Surveys</th>
                    <th style={{ padding: '8px 8px', textAlign: 'right', color: '#dc2626' }}>Detractor %</th>
                    <th style={{ padding: '8px 8px', textAlign: 'right', color: '#16a34a' }}>Promoter %</th>
                    <th style={{ padding: '8px 8px', textAlign: 'right', color: '#2563eb' }}>NPS %</th>
                  </tr>
                </thead>
                <tbody>
                  {fpBusmData.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 700, color: '#1e293b' }}>{r.name}</td>
                      <td style={{ padding: '8px 8px', textAlign: 'right' }}>{r.total.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '8px 8px', textAlign: 'right', color: '#dc2626', fontWeight: 700 }}>{r.d}</td>
                      <td style={{ padding: '8px 8px', textAlign: 'right', color: '#16a34a', fontWeight: 700 }}>{r.pr}</td>
                      <td style={{ padding: '8px 8px', textAlign: 'right', color: '#2563eb', fontWeight: 800 }}>{r.nps}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: '2px solid #0f172a', background: '#f8fafc', fontWeight: 800 }}>
                    <td style={{ padding: '8px 10px', color: '#0f172a' }}>Total Feature Phone</td>
                    <td style={{ padding: '8px 8px', textAlign: 'right' }}>5,350</td>
                    <td style={{ padding: '8px 8px', textAlign: 'right', color: '#dc2626' }}>10.7%</td>
                    <td style={{ padding: '8px 8px', textAlign: 'right', color: '#16a34a' }}>78.2%</td>
                    <td style={{ padding: '8px 8px', textAlign: 'right', color: '#2563eb' }}>67.5%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 8: Smart Phone NPS Performance Breakdown */}
          <div className="card-mock" style={{ padding: '20px', margin: 0 }}>
            <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
              Table 8: Smart Phone NPS Performance Breakdown by BUSM
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left' }}>BUSM Name</th>
                    <th style={{ padding: '8px 8px', textAlign: 'right' }}>Surveys</th>
                    <th style={{ padding: '8px 8px', textAlign: 'right', color: '#dc2626' }}>Detractor %</th>
                    <th style={{ padding: '8px 8px', textAlign: 'right', color: '#16a34a' }}>Promoter %</th>
                    <th style={{ padding: '8px 8px', textAlign: 'right', color: '#2563eb' }}>NPS %</th>
                  </tr>
                </thead>
                <tbody>
                  {spBusmData.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 700, color: '#1e293b' }}>{r.name}</td>
                      <td style={{ padding: '8px 8px', textAlign: 'right' }}>{r.total.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '8px 8px', textAlign: 'right', color: '#dc2626', fontWeight: 700 }}>{r.d}</td>
                      <td style={{ padding: '8px 8px', textAlign: 'right', color: '#16a34a', fontWeight: 700 }}>{r.pr}</td>
                      <td style={{ padding: '8px 8px', textAlign: 'right', color: '#2563eb', fontWeight: 800 }}>{r.nps}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: '2px solid #0f172a', background: '#f8fafc', fontWeight: 800 }}>
                    <td style={{ padding: '8px 10px', color: '#0f172a' }}>Total Smart Phone</td>
                    <td style={{ padding: '8px 8px', textAlign: 'right' }}>6,801</td>
                    <td style={{ padding: '8px 8px', textAlign: 'right', color: '#dc2626' }}>10.3%</td>
                    <td style={{ padding: '8px 8px', textAlign: 'right', color: '#16a34a' }}>68.5%</td>
                    <td style={{ padding: '8px 8px', textAlign: 'right', color: '#2563eb' }}>58.2%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 4: TAT DASHBOARD (1 DAY, 2 DAY, 3 DAY, 5+ DAY, STILL OPEN) */}
      <div id="sec-tat">
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="bar" style={{ background: '#16a34a' }}></div>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              4. TAT &amp; Turnaround Speed Dashboard
            </span>
          </div>
          <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px', marginLeft: '12px' }}>
            Work order closure velocity breakdown across 1-day, 2-day, 3-day, 5+-day resolution speeds and open backlog
          </div>
        </div>

        {/* TAT TABLE 1: BUSM LEVEL TAT CLOSURE MATRIX */}
        <div className="card-mock" style={{ padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                BUSM TAT Closure Velocity Matrix
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Distribution of work order turnaround speeds by Business Unit Manager (BUSM)
              </span>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', lineHeight: '1.3' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', borderRight: '1px solid #e2e8f0', width: '18%' }}>BUSM Name</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>Total Work Orders</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#16a34a' }}>1 Day Closure</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#2563eb' }}>2 Day Closure</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#d97706' }}>3 Day Closure</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#dc2626' }}>5+ Day Closure</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#7c3aed' }}>Still Open</th>
                </tr>
              </thead>
              <tbody>
                {busmList.map((r: any, i: number) => {
                  const isSelected = selectedBusmRow === r.name;
                  const tc = r.tatClosure || {};
                  return (
                    <tr
                      key={i}
                      onClick={() => setSelectedBusmRow(isSelected ? null : r.name)}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: isSelected ? '#eff6ff' : i % 2 === 0 ? '#ffffff' : '#f8fafc',
                        cursor: 'pointer',
                      }}
                    >
                      <td style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 800, color: isSelected ? '#1d4ed8' : '#1e293b', borderRight: '1px solid #f1f5f9' }}>
                        {r.name} {isSelected && '✓'}
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, borderRight: '1px solid #f1f5f9' }}>
                        {(r.wo || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>
                        {(tc.c1d || 0).toLocaleString('en-IN')} <span style={{ fontSize: '11px', color: '#64748b' }}>({tc.tat1dPct ?? 0}%)</span>
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 600, color: '#2563eb' }}>
                        {(tc.c2d || 0).toLocaleString('en-IN')} <span style={{ fontSize: '11px', color: '#64748b' }}>({tc.tat2dPct ?? 0}%)</span>
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 600, color: '#d97706' }}>
                        {(tc.c3d || 0).toLocaleString('en-IN')} <span style={{ fontSize: '11px', color: '#64748b' }}>({tc.tat3dPct ?? 0}%)</span>
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>
                        {(tc.c5d || 0).toLocaleString('en-IN')} <span style={{ fontSize: '11px', color: '#64748b' }}>({tc.tat5dPct ?? 0}%)</span>
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#7c3aed' }}>
                        {(tc.cStillOpen || 0).toLocaleString('en-IN')} <span style={{ fontSize: '11px', color: '#64748b' }}>({tc.stillOpenPct ?? 0}%)</span>
                      </td>
                    </tr>
                  );
                })}

                {/* National Total Summary Row */}
                {(() => {
                  const ntc = nationalSummary.tatClosure || {};
                  return (
                    <tr style={{ borderTop: '2.5px solid #0f172a', background: '#f8fafc', fontWeight: 800 }}>
                      <td style={{ padding: '12px', color: '#0f172a', borderRight: '1px solid #e2e8f0', background: '#f1f5f9', fontWeight: 800 }}>
                        {nationalSummary.name || 'National %'}
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', color: '#0f172a', borderRight: '1px solid #e2e8f0', fontWeight: 800 }}>
                        {(nationalSummary.wo || 16030).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', color: '#16a34a', fontWeight: 800 }}>
                        {(ntc.c1d || 0).toLocaleString('en-IN')} <span style={{ fontSize: '11.5px', color: '#475569' }}>({ntc.tat1dPct ?? 0}%)</span>
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', color: '#2563eb', fontWeight: 800 }}>
                        {(ntc.c2d || 0).toLocaleString('en-IN')} <span style={{ fontSize: '11.5px', color: '#475569' }}>({ntc.tat2dPct ?? 0}%)</span>
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', color: '#d97706', fontWeight: 800 }}>
                        {(ntc.c3d || 0).toLocaleString('en-IN')} <span style={{ fontSize: '11.5px', color: '#475569' }}>({ntc.tat3dPct ?? 0}%)</span>
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', color: '#dc2626', fontWeight: 800 }}>
                        {(ntc.c5d || 0).toLocaleString('en-IN')} <span style={{ fontSize: '11.5px', color: '#475569' }}>({ntc.tat5dPct ?? 0}%)</span>
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', color: '#7c3aed', fontWeight: 800 }}>
                        {(ntc.cStillOpen || 0).toLocaleString('en-IN')} <span style={{ fontSize: '11.5px', color: '#475569' }}>({ntc.stillOpenPct ?? 0}%)</span>
                      </td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
          </div>
        </div>

        {/* TAT TABLE 2: ASM LEVEL TAT CLOSURE MATRIX */}
        <div className="card-mock" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Supervisor (ASM) TAT Closure Velocity Matrix
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                {selectedBusmRow ? `Showing Area Managers (ASMs) under ${selectedBusmRow}` : 'Showing all Area Managers (ASMs) across the organization'}
              </span>
            </div>
            <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
              Count: {filteredAsmList.length} ASMs
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', lineHeight: '1.3' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', borderRight: '1px solid #e2e8f0', width: '16%' }}>ASM Name</th>
                  <th style={{ padding: '10px 10px', textAlign: 'left', borderRight: '1px solid #e2e8f0', width: '14%' }}>BUSM</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>Total Work Orders</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#16a34a' }}>1 Day Closure</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#2563eb' }}>2 Day Closure</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#d97706' }}>3 Day Closure</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#dc2626' }}>5+ Day Closure</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', color: '#7c3aed' }}>Still Open</th>
                </tr>
              </thead>
              <tbody>
                {filteredAsmList.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                      No ASMs found for selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredAsmList.map((r: any, i: number) => {
                    const tc = r.tatClosure || {};
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#1e293b' }}>{r.name}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'left', color: '#64748b', borderRight: '1px solid #f1f5f9' }}>{r.busm}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, borderRight: '1px solid #f1f5f9' }}>
                          {(r.wo || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>
                          {(tc.c1d || 0).toLocaleString('en-IN')} <span style={{ fontSize: '10.5px', color: '#64748b' }}>({tc.tat1dPct ?? 0}%)</span>
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: '#2563eb' }}>
                          {(tc.c2d || 0).toLocaleString('en-IN')} <span style={{ fontSize: '10.5px', color: '#64748b' }}>({tc.tat2dPct ?? 0}%)</span>
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: '#d97706' }}>
                          {(tc.c3d || 0).toLocaleString('en-IN')} <span style={{ fontSize: '10.5px', color: '#64748b' }}>({tc.tat3dPct ?? 0}%)</span>
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>
                          {(tc.c5d || 0).toLocaleString('en-IN')} <span style={{ fontSize: '10.5px', color: '#64748b' }}>({tc.tat5dPct ?? 0}%)</span>
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#7c3aed' }}>
                          {(tc.cStillOpen || 0).toLocaleString('en-IN')} <span style={{ fontSize: '10.5px', color: '#64748b' }}>({tc.stillOpenPct ?? 0}%)</span>
                        </td>
                      </tr>
                    );
                  })
                )}

                {/* Total Summary Row for ASMs */}
                <tr style={{ borderTop: '2.5px solid #0f172a', background: '#f8fafc', fontWeight: 800 }}>
                  <td style={{ padding: '10px 12px', color: '#0f172a', background: '#f1f5f9', fontWeight: 800 }}>Total / Average</td>
                  <td style={{ padding: '10px 10px', color: '#64748b', borderRight: '1px solid #e2e8f0' }}>{selectedBusmRow || 'All Regions'}</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', color: '#0f172a', borderRight: '1px solid #e2e8f0', fontWeight: 800 }}>
                    {asmTotalWo.toLocaleString('en-IN')}
                  </td>
                  <td colSpan={5} style={{ padding: '10px 10px', textAlign: 'center', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                    Regional TAT Closure Velocity Total
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
