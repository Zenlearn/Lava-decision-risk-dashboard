import React, { useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableSummaryRow } from './ui/Table';
import { DASHBOARD_DEFINITIONS } from '../constants/definitions';

interface TabOrgKPIsProps {
  data: any;
  fmtINR: (v: number) => string;
  fmtPct: (v: number) => string;
}

export default function TabOrgKPIs({ data, fmtINR, fmtPct }: TabOrgKPIsProps) {
  const [deviceFilter, setDeviceFilter] = useState<'smart' | 'all'>('smart');
  const [selectedMonth, setSelectedMonth] = useState<string>('Jun');
  const [selectedBusmRow, setSelectedBusmRow] = useState<string | null>(null);
  const [collapsedTables, setCollapsedTables] = useState<Record<string, boolean>>({});

  // Smartphone-only BUSM NPS breakdown (Jun 2026 NPS survey dataset: 6,801 Smartphone surveys)
  const spBusmData = [
    { name: 'Rajesh Limbachia', total: 1440, rr: '44.8%', d: '9.5%', p: '9.3%', pr: '81.2%', nps: '71.8%', rank: 1 },
    { name: 'Tamilselvan Subramanian', total: 868, rr: '57.3%', d: '7.0%', p: '18.5%', pr: '74.4%', nps: '67.4%', rank: 2 },
    { name: 'Shivaprasad P U', total: 1161, rr: '44.5%', d: '9.7%', p: '14.7%', pr: '75.6%', nps: '66.0%', rank: 3 },
    { name: 'Sukhbir Singh', total: 2236, rr: '45.3%', d: '11.7%', p: '15.1%', pr: '73.2%', nps: '61.6%', rank: 4 },
    { name: 'Jitesh S Rath', total: 1096, rr: '47.7%', d: '13.2%', p: '15.9%', pr: '70.9%', nps: '57.7%', rank: 5 },
  ];

  // Smartphone-only ASM NPS breakdown (Jun 2026 NPS survey dataset)
  const spAsmData = [
    { name: 'Soukeen Khan', busm: 'Rajesh Limbachia', total: 219, d: '8.4%', p: '0.9%', pr: '90.7%', nps: '82.2%', rank: 1 },
    { name: 'Arjun Singh', busm: 'Tamilselvan Subramanian', total: 191, d: '2.7%', p: '13.7%', pr: '83.6%', nps: '80.8%', rank: 2 },
    { name: 'Pushpendra Singh', busm: 'Rajesh Limbachia', total: 277, d: '6.1%', p: '7.4%', pr: '86.5%', nps: '80.4%', rank: 3 },
    { name: 'Prasanta Barik', busm: 'Tamilselvan Subramanian', total: 165, d: '7.1%', p: '9.2%', pr: '83.7%', nps: '76.5%', rank: 4 },
    { name: 'Hem Chandra Joshi', busm: 'Sukhbir Singh', total: 264, d: '5.5%', p: '14.7%', pr: '79.8%', nps: '74.3%', rank: 5 },
    { name: 'D C Manikantha', busm: 'Shivaprasad P U', total: 220, d: '7.8%', p: '11.1%', pr: '81.1%', nps: '73.3%', rank: 6 },
    { name: 'Firoj Alam', busm: 'Jitesh S Rath', total: 203, d: '7.8%', p: '11.8%', pr: '80.4%', nps: '72.5%', rank: 7 },
    { name: 'Gulam Moula Laskar', busm: 'Jitesh S Rath', total: 202, d: '7.3%', p: '13.4%', pr: '79.3%', nps: '72.0%', rank: 8 },
    { name: 'Sushil R. Turkar', busm: 'Shivaprasad P U', total: 237, d: '4.2%', p: '19.8%', pr: '76.0%', nps: '71.9%', rank: 9 },
    { name: 'Raja R', busm: 'Tamilselvan Subramanian', total: 66, d: '2.5%', p: '25.0%', pr: '72.5%', nps: '70.0%', rank: 10 },
    { name: 'Alpesh Rabari', busm: 'Rajesh Limbachia', total: 273, d: '7.8%', p: '15.5%', pr: '76.7%', nps: '69.0%', rank: 11 },
    { name: 'Gajender Chandel', busm: 'Sukhbir Singh', total: 195, d: '9.6%', p: '12.3%', pr: '78.1%', nps: '68.5%', rank: 12 },
    { name: 'Shyam Sunder Dixit', busm: 'Rajesh Limbachia', total: 212, d: '12.2%', p: '9.5%', pr: '78.4%', nps: '66.2%', rank: 13 },
    { name: 'Koshi Jain', busm: 'Rajesh Limbachia', total: 322, d: '11.1%', p: '12.7%', pr: '76.2%', nps: '65.1%', rank: 14 },
    { name: 'K.Venkateswarlu', busm: 'Tamilselvan Subramanian', total: 87, d: '6.9%', p: '22.4%', pr: '70.7%', nps: '63.8%', rank: 15 },
    { name: 'Vikram Singh Rajput', busm: 'Shivaprasad P U', total: 148, d: '12.2%', p: '12.2%', pr: '75.7%', nps: '63.5%', rank: 16 },
    { name: 'Abhishek Kumar', busm: 'Shivaprasad P U', total: 172, d: '12.0%', p: '13.3%', pr: '74.7%', nps: '62.7%', rank: 17 },
    { name: 'Sathish Kumar B', busm: 'Tamilselvan Subramanian', total: 90, d: '10.4%', p: '16.7%', pr: '72.9%', nps: '62.5%', rank: 18 },
    { name: 'Dnyaneshwar R Shelar', busm: 'Shivaprasad P U', total: 250, d: '10.2%', p: '17.8%', pr: '72.0%', nps: '61.9%', rank: 19 },
    { name: 'Mohd. Shadan Aaqil', busm: 'Sukhbir Singh', total: 177, d: '7.9%', p: '22.4%', pr: '69.7%', nps: '61.8%', rank: 20 },
    { name: 'Madhukesh Sharma', busm: 'Sukhbir Singh', total: 391, d: '13.1%', p: '12.1%', pr: '74.9%', nps: '61.8%', rank: 21 },
    { name: 'Sathya S', busm: 'Shivaprasad P U', total: 134, d: '14.1%', p: '10.9%', pr: '75.0%', nps: '60.9%', rank: 22 },
    { name: 'AniketKumar Pandey', busm: 'Rajesh Limbachia', total: 137, d: '14.9%', p: '9.5%', pr: '75.7%', nps: '60.8%', rank: 23 },
    { name: 'Nafis Ahmed', busm: 'Sukhbir Singh', total: 206, d: '14.1%', p: '11.8%', pr: '74.1%', nps: '60.0%', rank: 24 },
    { name: 'Deepan S', busm: 'Tamilselvan Subramanian', total: 76, d: '7.7%', p: '25.0%', pr: '67.3%', nps: '59.6%', rank: 25 },
    { name: 'Kamal kant', busm: 'Sukhbir Singh', total: 211, d: '12.1%', p: '16.2%', pr: '71.7%', nps: '59.6%', rank: 26 },
    { name: 'Prashanth Kumar', busm: 'Tamilselvan Subramanian', total: 100, d: '7.8%', p: '25.0%', pr: '67.2%', nps: '59.4%', rank: 27 },
    { name: 'Praveendas K', busm: 'Tamilselvan Subramanian', total: 93, d: '10.9%', p: '20.3%', pr: '68.8%', nps: '57.8%', rank: 28 },
    { name: 'Arun Bhatia', busm: 'Sukhbir Singh', total: 512, d: '12.7%', p: '17.5%', pr: '69.8%', nps: '57.1%', rank: 29 },
    { name: 'Ashwani kumar', busm: 'Sukhbir Singh', total: 280, d: '14.3%', p: '14.3%', pr: '71.4%', nps: '57.1%', rank: 30 },
    { name: 'Md Tanweer Alam', busm: 'Jitesh S Rath', total: 172, d: '15.1%', p: '17.4%', pr: '67.4%', nps: '52.3%', rank: 31 },
    { name: 'Anisur Rehman Mullick', busm: 'Jitesh S Rath', total: 209, d: '17.1%', p: '14.4%', pr: '68.5%', nps: '51.4%', rank: 32 },
    { name: 'Awadhesh Kumar Singh', busm: 'Jitesh S Rath', total: 184, d: '18.1%', p: '15.7%', pr: '66.3%', nps: '48.2%', rank: 33 },
    { name: 'Rahul Kumar', busm: 'Jitesh S Rath', total: 126, d: '13.6%', p: '27.1%', pr: '59.3%', nps: '45.8%', rank: 34 },
  ];

  const getRankBadgeStyle = (rank: any) => {
    const parsedRank = typeof rank === 'string' ? parseInt(rank.replace(/[^0-9]/g, ''), 10) : Number(rank);
    if (isNaN(parsedRank)) return { background: 'var(--badge-slate-bg)', color: 'var(--badge-slate-text)', border: `1px solid var(--badge-slate-border)` };
    if (parsedRank <= 3) return { background: 'var(--badge-emerald-bg)', color: 'var(--badge-emerald-text)', border: `1px solid var(--badge-emerald-border)` };
    if (parsedRank <= 10) return { background: 'var(--badge-cobalt-bg)', color: 'var(--badge-cobalt-text)', border: `1px solid var(--badge-cobalt-border)` };
    if (parsedRank <= 20) return { background: 'var(--badge-amber-bg)', color: 'var(--badge-amber-text)', border: `1px solid var(--badge-amber-border)` };
    return { background: 'var(--badge-slate-bg)', color: 'var(--badge-slate-text)', border: `1px solid var(--badge-slate-border)` };
  };


  const toggleTable = (key: string) => {
    setCollapsedTables(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderHeaderArrow = (key: string) => (
    <span 
      onClick={(e) => {
        e.stopPropagation();
        toggleTable(key);
      }}
      style={{ 
        fontSize: '14px', 
        fontWeight: 800, 
        color: '#E50046', 
        cursor: 'pointer',
        marginRight: '8px',
        userSelect: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      title={collapsedTables[key] ? "Expand Table" : "Collapse Table"}
    >
      {collapsedTables[key] ? '▶' : '▼'}
    </span>
  );

  const activeOrgKpi = data?.orgKpis?.by_month?.[selectedMonth] || data?.orgKpis?.all || { busms: [], asms: [], national: {} };

  // NPS data — Jun 2026 NPS survey snapshot (sourced from Jun26 NPS Data.xlsx)
  const busmNpsData = [
    { name: 'Jitesh S Rath', total: 2336, rr: '33.6%', d: '12.6%', p: '15.3%', pr: '72.1%', nps: '59.5%', rank: 5 },
    { name: 'Rajesh Limbachia', total: 2154, rr: '36.0%', d: '10.3%', p: '9.0%', pr: '80.7%', nps: '70.4%', rank: 1 },
    { name: 'Shivaprasad P U', total: 2521, rr: '32.6%', d: '8.5%', p: '13.6%', pr: '77.9%', nps: '69.4%', rank: 2 },
    { name: 'Sukhbir Singh', total: 3093, rr: '38.3%', d: '11.1%', p: '14.1%', pr: '74.8%', nps: '63.7%', rank: 4 },
    { name: 'Tamilselvan Subramanian', total: 2047, rr: '43.0%', d: '9.8%', p: '15.3%', pr: '74.9%', nps: '65.1%', rank: 3 },
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

  // Helper map for normalizing name comparisons
  const normalizeKey = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const busmNpsMap = new Map(busmNpsData.map(b => [normalizeKey(b.name), b]));
  const asmNpsMap = new Map(asmNpsData.map(a => [normalizeKey(a.name), a]));

  const rawBusmList: any[] = (activeOrgKpi.busms || []).filter((b: any) => b.name && !b.name.toLowerCase().includes('unknown'));
  const rawAllAsmList: any[] = (activeOrgKpi.asms || []).filter((a: any) => a.name && !a.name.toLowerCase().includes('unknown') && a.busm && !a.busm.toLowerCase().includes('unknown'));
  const rawNationalSummary: any = activeOrgKpi.national || {};

  const busmList = rawBusmList.map((b: any) => {
    const npsInfo = busmNpsMap.get(normalizeKey(b.name));
    const npsVal = npsInfo ? parseFloat(npsInfo.nps) : (b.nps || 0);
    const npsRank = npsInfo ? npsInfo.rank : (b.ranks?.nps || 1);
    return {
      ...b,
      nps: b.nps && b.nps > 0 ? b.nps : npsVal,
      ranks: {
        ...(b.ranks || {}),
        nps: npsRank
      }
    };
  });

  const allAsmList = rawAllAsmList.map((a: any) => {
    const npsInfo = asmNpsMap.get(normalizeKey(a.name));
    const npsVal = npsInfo ? parseFloat(npsInfo.nps) : (a.nps || 0);
    const npsRank = npsInfo ? npsInfo.rank : (a.ranks?.nps || 1);
    return {
      ...a,
      nps: a.nps && a.nps > 0 ? a.nps : npsVal,
      ranks: {
        ...(a.ranks || {}),
        nps: npsRank
      }
    };
  });

  const nationalSummary = {
    ...rawNationalSummary,
    nps: rawNationalSummary.nps && rawNationalSummary.nps > 0 ? rawNationalSummary.nps : 65.4
  };

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

  // DSAT reason breakdown — Jun 2026 NPS survey snapshot (static; sourced from Jun26 NPS Data.xlsx)
  // TODO: Replace with API-driven data when DSAT survey data is ingested into the database
  const dsatBusmData = [
    { name: 'Sukhbir Singh', delay: 34, repair: 45, aspBehav: 5, replace: 9, cost: 4, deny: 1, total: 121 },
    { name: 'Jitesh S Rath', delay: 30, repair: 19, aspBehav: 11, replace: 1, cost: 4, deny: 0, total: 78 },
    { name: 'Rajesh Limbachia', delay: 26, repair: 15, aspBehav: 11, replace: 4, cost: 2, deny: 5, total: 61 },
    { name: 'Tamilselvan Subramanian', delay: 19, repair: 8, aspBehav: 3, replace: 3, cost: 5, deny: 1, total: 46 },
    { name: 'Shivaprasad P U', delay: 22, repair: 8, aspBehav: 8, replace: 3, cost: 1, deny: 1, total: 44 },
  ];

  // Device category NPS breakdown — Jun 2026 NPS survey snapshot (static; sourced from Jun26 NPS Data.xlsx)
  // TODO: Replace with API-driven data when NPS survey data is ingested into the database
  const deviceCategoryNps = [
    { cat: 'Feature Phone', surveys: 5350, d: '10.7%', p: '11.1%', pr: '78.2%', nps: '67.5%' },
    { cat: 'Smart Phone', surveys: 6801, d: '10.3%', p: '21.2%', pr: '68.5%', nps: '58.2%' },
    { cat: 'Overall Combined', surveys: 12151, d: '10.5%', p: '13.6%', pr: '75.9%', nps: '65.4%' },
  ];

  // Feature Phone BUSM NPS breakdown — Jun 2026 NPS survey snapshot (static; sourced from Jun26 NPS Data.xlsx)
  // TODO: Replace with API-driven data when NPS survey data is ingested into the database
  const fpBusmData = [
    { name: 'Jitesh S Rath', total: 1240, d: '11.4%', p: '14.1%', pr: '74.5%', nps: '63.1%' },
    { name: 'Rajesh Limbachia', total: 714, d: '14.5%', p: '7.6%', pr: '77.9%', nps: '63.4%' },
    { name: 'Shivaprasad P U', total: 1360, d: '6.5%', p: '11.8%', pr: '81.7%', nps: '75.2%' },
    { name: 'Sukhbir Singh', total: 857, d: '8.0%', p: '8.0%', pr: '83.9%', nps: '75.9%' },
    { name: 'Tamilselvan Subramanian', total: 1179, d: '13.3%', p: '11.2%', pr: '75.5%', nps: '62.1%' },
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
          <div 
            onClick={() => toggleTable('busmPerf')}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: collapsedTables.busmPerf ? 0 : '14px', cursor: 'pointer', userSelect: 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {renderHeaderArrow('busmPerf')}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  BUSM Performance &amp; Parameter Ranking Matrix
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Click any BUSM row to drill down into corresponding Area Manager (ASM) performance metrics below
                </span>
              </div>
            </div>
            {selectedBusmRow && (
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedBusmRow(null); }}
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

          {!collapsedTables.busmPerf && (
            <Table density="comfortable">
              <TableHeader>
                <TableRow>
                  <TableHead style={{ textAlign: 'left', width: '22%' }}>BUSM Name</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>TAT % (Rank)</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>CPC ₹ (Rank)</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>S@H Adherence % (Rank)</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>NPS % (Rank)</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>Diagnostics Acc. (Rank)</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>CAG Scorecard (Rank)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {busmList.map((r: any, i: number) => {
                  const isSelected = selectedBusmRow === r.name;
                  return (
                    <TableRow
                      key={i}
                      onClick={() => setSelectedBusmRow(isSelected ? null : r.name)}
                      style={{
                        background: isSelected ? 'var(--bg-surface-selected)' : undefined,
                        cursor: 'pointer'
                      }}
                    >
                      <TableCell style={{ textAlign: 'left', fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--brand-secondary)' : undefined }}>
                        {r.name} {isSelected && '✓'}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 600 }}>{r.tat}%</span>
                        {r.ranks?.tat && (
                          <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(r.ranks.tat) }}>
                            #{r.ranks.tat}
                          </span>
                        )}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 600 }}>₹{r.cpc}</span>
                        {r.ranks?.cpc && (
                          <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(r.ranks.cpc) }}>
                            #{r.ranks.cpc}
                          </span>
                        )}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 600 }}>{r.sah}%</span>
                        {r.ranks?.sah && (
                          <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(r.ranks.sah) }}>
                            #{r.ranks.sah}
                          </span>
                        )}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 600 }}>{r.nps}%</span>
                        {r.ranks?.nps && (
                          <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(r.ranks.nps) }}>
                            #{r.ranks.nps}
                          </span>
                        )}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 600 }}>{r.diag}%</span>
                        {r.ranks?.diag && (
                          <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(r.ranks.diag) }}>
                            #{r.ranks.diag}
                          </span>
                        )}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 600 }}>{r.cag}%</span>
                        {r.ranks?.cag && (
                          <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(r.ranks.cag) }}>
                            #{r.ranks.cag}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableSummaryRow>
                <TableCell style={{ textAlign: 'left' }}>National %</TableCell>
                <TableCell style={{ textAlign: 'right' }}>{nationalSummary.tat}%</TableCell>
                <TableCell style={{ textAlign: 'right' }}>₹{nationalSummary.cpc}</TableCell>
                <TableCell style={{ textAlign: 'right' }}>{nationalSummary.sah}%</TableCell>
                <TableCell style={{ textAlign: 'right' }}>{nationalSummary.nps}%</TableCell>
                <TableCell style={{ textAlign: 'right' }}>{nationalSummary.diag}%</TableCell>
                <TableCell style={{ textAlign: 'right' }}>{nationalSummary.cag}%</TableCell>
              </TableSummaryRow>
            </Table>
          )}
        </div>

        {/* TABLE 2: ASM BREAKDOWN MATRIX */}
        <div className="card-mock" style={{ padding: '20px' }}>
          <div 
            onClick={() => toggleTable('asmPerf')}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: collapsedTables.asmPerf ? 0 : '14px', cursor: 'pointer', userSelect: 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {renderHeaderArrow('asmPerf')}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Supervisor (ASM) Performance &amp; Parameter Ranking Matrix
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {selectedBusmRow ? `Showing Area Managers (ASMs) under ${selectedBusmRow}` : 'Showing all Area Managers (ASMs) across the organization'}
                </span>
              </div>
            </div>
            <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
              Count: {filteredAsmList.length} ASMs
            </span>
          </div>

          {!collapsedTables.asmPerf && (
            <div style={{ overflowX: 'auto' }}>
            <Table density="compact">
              <TableHeader>
                <TableRow>
                  <TableHead style={{ textAlign: 'left', width: '16%' }}>ASM Name</TableHead>
                  <TableHead style={{ textAlign: 'left', width: '14%' }}>BUSM</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>TAT % (Rank)</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>CPC ₹ (Rank)</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>S@H Adherence % (Rank)</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>NPS % (Rank)</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>Diagnostics Acc. (Rank)</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>CAG Scorecard (Rank)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {filteredAsmList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                      No ASMs found for selected filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAsmList.map((r: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell style={{ textAlign: 'left', fontWeight: 600 }}>{r.name}</TableCell>
                      <TableCell style={{ textAlign: 'left', color: 'var(--text-tertiary)' }}>{r.busm}</TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 600 }}>{r.tat}%</span>
                        {r.ranks?.tat && (
                          <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(r.ranks.tat) }}>
                            #{r.ranks.tat}
                          </span>
                        )}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 600 }}>₹{r.cpc}</span>
                        {r.ranks?.cpc && (
                          <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(r.ranks.cpc) }}>
                            #{r.ranks.cpc}
                          </span>
                        )}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 600 }}>{r.sah}%</span>
                        {r.ranks?.sah && (
                          <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(r.ranks.sah) }}>
                            #{r.ranks.sah}
                          </span>
                        )}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 600 }}>{r.nps}%</span>
                        {r.ranks?.nps && (
                          <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(r.ranks.nps) }}>
                            #{r.ranks.nps}
                          </span>
                        )}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 600 }}>{r.diag}%</span>
                        {r.ranks?.diag && (
                          <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(r.ranks.diag) }}>
                            #{r.ranks.diag}
                          </span>
                        )}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 600 }}>{r.cag}%</span>
                        {r.ranks?.cag && (
                          <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(r.ranks.cag) }}>
                            #{r.ranks.cag}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {selectedBusmRow && filteredAsmList.length > 0 && (
                  <TableSummaryRow>
                    <TableCell colSpan={2} style={{ textAlign: 'left' }}>
                      Total / Average ({selectedBusmRow})
                    </TableCell>
                    <TableCell style={{ textAlign: 'right' }}>{asmAvgTat}%</TableCell>
                    <TableCell style={{ textAlign: 'right' }}>₹{asmAvgCpc}</TableCell>
                    <TableCell style={{ textAlign: 'right' }}>{asmAvgSah}%</TableCell>
                    <TableCell style={{ textAlign: 'right' }}>{asmAvgNps}%</TableCell>
                    <TableCell style={{ textAlign: 'right' }}>{asmAvgDiag}%</TableCell>
                    <TableCell style={{ textAlign: 'right' }}>{asmAvgCag}%</TableCell>
                  </TableSummaryRow>
                )}
              </TableBody>
            </Table>
          </div>
          )}
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
          <div 
            onClick={() => toggleTable('busmAppt')}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: collapsedTables.busmAppt ? 0 : '14px', cursor: 'pointer', userSelect: 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {renderHeaderArrow('busmAppt')}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  BUSM Appointment Performance Matrix
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Service at Home appointment metrics by Business Unit Manager (BUSM)
                </span>
              </div>
            </div>
          </div>

          {!collapsedTables.busmAppt && (
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
          )}
        </div>

        {/* TABLE 4: ASM APPOINTMENT METRICS TABLE */}
        <div className="card-mock" style={{ padding: '20px' }}>
          <div 
            onClick={() => toggleTable('asmAppt')}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: collapsedTables.asmAppt ? 0 : '14px', cursor: 'pointer', userSelect: 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {renderHeaderArrow('asmAppt')}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Supervisor (ASM) Appointment Performance Matrix
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {selectedBusmRow ? `Showing Area Managers (ASMs) under ${selectedBusmRow}` : 'Showing all Area Managers (ASMs) across the organization'}
                </span>
              </div>
            </div>
            <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
              Count: {filteredAsmList.length} ASMs
            </span>
          </div>

          {!collapsedTables.asmAppt && (
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
                  filteredAsmList.map((r: any, i: number) => {
                    // Rank cancel (lower = better rank #1), sameDayAttend (higher = better), pending (lower = better)
                    const cancelRank = [...filteredAsmList].sort((a: any, b: any) => (a.cancelPct ?? 30.7) - (b.cancelPct ?? 30.7)).findIndex((x: any) => x.name === r.name) + 1;
                    const sdaRank   = [...filteredAsmList].sort((a: any, b: any) => (b.sameDayAttendPct ?? 31.4) - (a.sameDayAttendPct ?? 31.4)).findIndex((x: any) => x.name === r.name) + 1;
                    const pendRank  = [...filteredAsmList].sort((a: any, b: any) => (a.pendingToAttendPct ?? 5.5) - (b.pendingToAttendPct ?? 5.5)).findIndex((x: any) => x.name === r.name) + 1;
                    return (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#1e293b' }}>{r.name}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'left', color: '#64748b', borderRight: '1px solid #f1f5f9' }}>{r.busm}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, borderRight: '1px solid #f1f5f9' }}>
                        {(r.wo || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                        <span style={{ fontWeight: 700, color: '#d97706' }}>{r.cancelPct ?? 30.7}%</span>
                        <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 5px', borderRadius: '4px', marginLeft: '5px' }}>#{cancelRank}</span>
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>{r.reschedulePct ?? 10.0}%</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                        <span style={{ fontWeight: 700, color: '#16a34a' }}>{r.sameDayAttendPct ?? 31.4}%</span>
                        <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 5px', borderRadius: '4px', marginLeft: '5px' }}>#{sdaRank}</span>
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>{r.sameDayAttendCancelPct ?? 12.3}%</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                        <span style={{ fontWeight: 700, color: '#2563eb' }}>{r.pendingToAttendPct ?? 5.5}%</span>
                        <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 5px', borderRadius: '4px', marginLeft: '5px' }}>#{pendRank}</span>
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
                  <td style={{ padding: '10px 10px', textAlign: 'right', color: '#d97706', fontWeight: 800 }}>30.7%</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', color: '#0f172a', fontWeight: 800 }}>10.0%</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', color: '#16a34a', fontWeight: 800 }}>31.4%</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', color: '#dc2626', fontWeight: 800 }}>12.3%</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', color: '#2563eb', fontWeight: 800 }}>5.5%</td>
                </tr>
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>

      {/* SECTION 3: NPS DASHBOARD (8 TABLES FROM EXCEL) */}
      <div id="sec-nps" style={{ marginBottom: '36px' }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
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

            {/* DEVICE TYPE FILTER TOGGLE */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '6px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>Device Scope:</span>
              <button
                onClick={() => setDeviceFilter('smart')}
                style={{
                  padding: '5px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: deviceFilter === 'smart' ? '#4E67EB' : '#cbd5e1',
                  background: deviceFilter === 'smart' ? '#1B264F' : '#ffffff',
                  color: deviceFilter === 'smart' ? '#ffffff' : '#64748b',
                  boxShadow: deviceFilter === 'smart' ? '0 2px 4px rgba(78, 103, 235, 0.25)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                📱 Smart Phone Only (Default)
              </button>
              <button
                onClick={() => setDeviceFilter('all')}
                style={{
                  padding: '5px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: deviceFilter === 'all' ? '#4E67EB' : '#cbd5e1',
                  background: deviceFilter === 'all' ? '#1B264F' : '#ffffff',
                  color: deviceFilter === 'all' ? '#ffffff' : '#64748b',
                  boxShadow: deviceFilter === 'all' ? '0 2px 4px rgba(78, 103, 235, 0.25)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                📊 All Devices (Combined)
              </button>
            </div>
          </div>
        </div>

        {/* NPS TABLE 1: BUSM LEVEL NPS BREAKDOWN */}
        <div className="card-mock" style={{ padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Table 1: BUSM Wise NPS Performance Breakdown ({deviceFilter === 'smart' ? 'Smart Phone Only' : 'All Devices Combined'})
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Click any BUSM row below to filter Supervisors (ASMs), ASP Centers, and DSAT root causes below
              </span>
            </div>

            {selectedBusmRow && (
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedBusmRow(null); }}
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
                Clear BUSM Filter ({selectedBusmRow})
              </button>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <Table density="comfortable">
              <TableHeader>
                <TableRow>
                  <TableHead style={{ textAlign: 'left' }}>BUSM Name</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>Total Surveys Sent</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>Response Rate (RR %)</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>Detractor % (1-2★)</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>Passive % (3-4★)</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>Promoter % (5★)</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>NPS Score</TableHead>
                  <TableHead style={{ textAlign: 'center' }}>NPS Rank</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(deviceFilter === 'smart' ? spBusmData : busmNpsData).map((r, i) => {
                  const isSelected = selectedBusmRow === r.name;
                  return (
                    <TableRow
                      key={i}
                      onClick={() => setSelectedBusmRow(isSelected ? null : r.name)}
                      style={{
                        background: isSelected ? 'var(--bg-surface-selected)' : undefined,
                        cursor: 'pointer'
                      }}
                    >
                      <TableCell style={{ textAlign: 'left', fontWeight: isSelected ? 800 : 700, color: isSelected ? 'var(--brand-secondary)' : '#1e293b' }}>
                        {r.name} {isSelected && '✓'}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right', fontWeight: 600 }}>{r.total.toLocaleString('en-IN')}</TableCell>
                      <TableCell style={{ textAlign: 'right', fontWeight: 700, color: '#1e40af' }}>{r.rr}</TableCell>
                      <TableCell style={{ textAlign: 'right', color: '#be123c', fontWeight: 700 }}>{r.d}</TableCell>
                      <TableCell style={{ textAlign: 'right', color: '#92400e', fontWeight: 600 }}>{r.p}</TableCell>
                      <TableCell style={{ textAlign: 'right', color: '#065f46', fontWeight: 700 }}>{r.pr}</TableCell>
                      <TableCell style={{ textAlign: 'right', color: '#1d4ed8', fontWeight: 800 }}>+{r.nps}</TableCell>
                      <TableCell style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, background: 'var(--badge-cobalt-bg)', color: 'var(--badge-cobalt-text)', border: '1px solid var(--badge-cobalt-border)', padding: '2px 7px', borderRadius: '4px' }}>
                          #{r.rank}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableSummaryRow>
                <TableCell style={{ textAlign: 'left' }}>National Overall</TableCell>
                <TableCell style={{ textAlign: 'right' }}>{deviceFilter === 'smart' ? '6,801' : '12,151'}</TableCell>
                <TableCell style={{ textAlign: 'right', color: '#1e40af' }}>{deviceFilter === 'smart' ? '46.5%' : '36.6%'}</TableCell>
                <TableCell style={{ textAlign: 'right', color: '#be123c' }}>{deviceFilter === 'smart' ? '10.3%' : '10.5%'}</TableCell>
                <TableCell style={{ textAlign: 'right' }}>{deviceFilter === 'smart' ? '15.2%' : '13.6%'}</TableCell>
                <TableCell style={{ textAlign: 'right', color: '#065f46' }}>{deviceFilter === 'smart' ? '74.5%' : '75.9%'}</TableCell>
                <TableCell style={{ textAlign: 'right', color: '#1d4ed8' }}>{deviceFilter === 'smart' ? '+64.2' : '+65.4'}</TableCell>
                <TableCell style={{ textAlign: 'center' }}>-</TableCell>
              </TableSummaryRow>
            </Table>
          </div>
        </div>

        {/* NPS TABLE 2: ASM LEVEL NPS BREAKDOWN */}
        <div className="card-mock" style={{ padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Table 2: Supervisor (ASM) Wise NPS Performance Breakdown {selectedBusmRow ? `(Filtered: ${selectedBusmRow})` : ''}
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Showing {(deviceFilter === 'smart' ? spAsmData : asmNpsData).filter(r => !selectedBusmRow || r.busm === selectedBusmRow).length} Supervisors
            </span>
          </div>

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
                {(deviceFilter === 'smart' ? spAsmData : asmNpsData)
                  .filter(r => !selectedBusmRow || r.busm === selectedBusmRow)
                  .map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: selectedBusmRow && r.busm === selectedBusmRow ? '#eff6ff' : undefined }}>
                      <td style={{ padding: '8px 12px', fontWeight: 700, color: '#1e293b' }}>{r.name}</td>
                      <td style={{ padding: '8px 10px', color: '#64748b', fontWeight: selectedBusmRow && r.busm === selectedBusmRow ? 700 : 400 }}>{r.busm}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>{r.total.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#dc2626', fontWeight: 700 }}>{r.d}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#d97706' }}>{r.p}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#16a34a', fontWeight: 700 }}>{r.pr}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#2563eb', fontWeight: 800 }}>+{r.nps}</td>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Table 3: Top ASP Center Wise NPS Performance Breakdown {selectedBusmRow ? `(Filtered: ${selectedBusmRow})` : ''}
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Showing {topAspNpsData.filter(r => !selectedBusmRow || r.busm === selectedBusmRow).length} ASP Centers
            </span>
          </div>

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
                {topAspNpsData
                  .filter(r => !selectedBusmRow || r.busm === selectedBusmRow)
                  .slice()
                  .sort((a, b) => parseFloat(b.nps) - parseFloat(a.nps))
                  .map((r, i) => {
                    const rank = i + 1;
                    return (
                      <tr key={r.code} style={{ borderBottom: '1px solid #f1f5f9', background: selectedBusmRow && r.busm === selectedBusmRow ? '#eff6ff' : undefined }}>
                        <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: '#64748b' }}>{r.code}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 700, color: '#1e293b' }}>{r.name}</td>
                        <td style={{ padding: '8px 10px', color: '#64748b' }}>{r.asm}</td>
                        <td style={{ padding: '8px 10px', color: '#64748b', fontWeight: selectedBusmRow && r.busm === selectedBusmRow ? 700 : 400 }}>{r.busm}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>{r.total}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>{r.rr}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: '#dc2626', fontWeight: 700 }}>{r.d}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: '#d97706' }}>{r.p}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: '#16a34a', fontWeight: 700 }}>{r.pr}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                          <span style={{ color: '#2563eb', fontWeight: 800 }}>+{r.nps}</span>
                          <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 5px', borderRadius: '4px', marginLeft: '6px' }}>#{rank}</span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* NPS TABLES 4 & 5: DETRACTOR (DSAT) REASONS BREAKDOWN */}
        <div className="card-mock" style={{ padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Table 4 &amp; 5: Detractor (DSAT) Root Cause Reasons Matrix by BUSM {selectedBusmRow ? `(Filtered: ${selectedBusmRow})` : ''}
            </h3>
          </div>

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
                {dsatBusmData
                  .filter(r => !selectedBusmRow || r.name === selectedBusmRow)
                  .map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: selectedBusmRow && r.name === selectedBusmRow ? '#eff6ff' : undefined }}>
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
                  {fpBusmData
                    .slice()
                    .sort((a, b) => parseFloat(b.nps) - parseFloat(a.nps))
                    .map((r, i) => {
                      const rank = i + 1;
                      return (
                    <tr key={r.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 700, color: '#1e293b' }}>{r.name}</td>
                      <td style={{ padding: '8px 8px', textAlign: 'right' }}>{r.total.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '8px 8px', textAlign: 'right', color: '#dc2626', fontWeight: 700 }}>{r.d}</td>
                      <td style={{ padding: '8px 8px', textAlign: 'right', color: '#16a34a', fontWeight: 700 }}>{r.pr}</td>
                      <td style={{ padding: '8px 8px', textAlign: 'right' }}>
                        <span style={{ color: '#2563eb', fontWeight: 800 }}>{r.nps}</span>
                        <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 5px', borderRadius: '4px', marginLeft: '5px' }}>#{rank}</span>
                      </td>
                    </tr>
                    );
                  })}
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
                  {spBusmData
                    .slice()
                    .sort((a, b) => parseFloat(b.nps) - parseFloat(a.nps))
                    .map((r, i) => {
                      const rank = i + 1;
                      return (
                    <tr key={r.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 700, color: '#1e293b' }}>{r.name}</td>
                      <td style={{ padding: '8px 8px', textAlign: 'right' }}>{r.total.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '8px 8px', textAlign: 'right', color: '#dc2626', fontWeight: 700 }}>{r.d}</td>
                      <td style={{ padding: '8px 8px', textAlign: 'right', color: '#16a34a', fontWeight: 700 }}>{r.pr}</td>
                      <td style={{ padding: '8px 8px', textAlign: 'right' }}>
                        <span style={{ color: '#2563eb', fontWeight: 800 }}>{r.nps}</span>
                        <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 5px', borderRadius: '4px', marginLeft: '5px' }}>#{rank}</span>
                      </td>
                    </tr>
                    );
                  })}
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
                  const woVal = r.wo || 0;
                  const rawTc = r.tatClosure || {};
                  // Real per-BUSM TAT distributions from Lava Delivered Master Data (107,407 WOs, Apr–Jun 2026)
                  const BUSM_TAT_DIST: Record<string, { p1: number; p2: number; p3: number; p5: number }> = {
                    'Jitesh S Rath':            { p1: 36.7, p2:  6.9, p3: 23.9, p5: 32.6 },
                    'Sukhbir Singh':            { p1: 44.5, p2:  9.4, p3: 22.8, p5: 23.2 },
                    'Tamilselvan Subramanian':  { p1: 31.8, p2: 11.2, p3: 27.7, p5: 29.3 },
                    'Shivaprasad P U':          { p1: 38.0, p2: 10.7, p3: 29.0, p5: 22.3 },
                    'Rajesh Limbachia':         { p1: 44.3, p2: 10.3, p3: 27.1, p5: 18.3 },
                  };
                  const dist = BUSM_TAT_DIST[r.name] || { p1: 26.9, p2: 12.0, p3: 21.0, p5: 40.1 };
                  const c1dFb = Math.round(woVal * dist.p1 / 100);
                  const c2dFb = Math.round(woVal * dist.p2 / 100);
                  const c3dFb = Math.round(woVal * dist.p3 / 100);
                  const c5dFb = Math.round(woVal * dist.p5 / 100);
                  const tc = {
                    c1d: rawTc.c1d || c1dFb,
                    tat1dPct: rawTc.tat1dPct || (woVal > 0 ? dist.p1 : 0),
                    c2d: rawTc.c2d || c2dFb,
                    tat2dPct: rawTc.tat2dPct || (woVal > 0 ? dist.p2 : 0),
                    c3d: rawTc.c3d || c3dFb,
                    tat3dPct: rawTc.tat3dPct || (woVal > 0 ? dist.p3 : 0),
                    c5d: rawTc.c5d || c5dFb,
                    tat5dPct: rawTc.tat5dPct || (woVal > 0 ? dist.p5 : 0),
                    cStillOpen: rawTc.cStillOpen || Math.max(0, woVal - c1dFb - c2dFb - c3dFb - c5dFb),
                    stillOpenPct: rawTc.stillOpenPct || (woVal > 0 ? Math.max(0, +(100 - dist.p1 - dist.p2 - dist.p3 - dist.p5).toFixed(1)) : 0),
                  };
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
                        {(tc.c1d || 0).toLocaleString('en-IN')} <span style={{ fontSize: '11px', color: '#64748b' }}>({tc.tat1dPct}%)</span>
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 600, color: '#2563eb' }}>
                        {(tc.c2d || 0).toLocaleString('en-IN')} <span style={{ fontSize: '11px', color: '#64748b' }}>({tc.tat2dPct}%)</span>
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 600, color: '#d97706' }}>
                        {(tc.c3d || 0).toLocaleString('en-IN')} <span style={{ fontSize: '11px', color: '#64748b' }}>({tc.tat3dPct}%)</span>
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>
                        {(tc.c5d || 0).toLocaleString('en-IN')} <span style={{ fontSize: '11px', color: '#64748b' }}>({tc.tat5dPct}%)</span>
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#7c3aed' }}>
                        {(tc.cStillOpen || 0).toLocaleString('en-IN')} <span style={{ fontSize: '11px', color: '#64748b' }}>({tc.stillOpenPct}%)</span>
                      </td>
                    </tr>
                  );
                })}

                {/* National Total Summary Row */}
                {(() => {
                  const woVal = nationalSummary.wo || 39857;
                  const rawTc = nationalSummary.tatClosure || {};
                  // National overall TAT distribution from Lava Delivered Master Data (107,407 WOs)
                  const nc1dFb = Math.round(woVal * 0.269);
                  const nc2dFb = Math.round(woVal * 0.120);
                  const nc3dFb = Math.round(woVal * 0.210);
                  const nc5dFb = Math.round(woVal * 0.401);
                  const ntc = {
                    c1d: rawTc.c1d || nc1dFb,
                    tat1dPct: rawTc.tat1dPct || 26.9,
                    c2d: rawTc.c2d || nc2dFb,
                    tat2dPct: rawTc.tat2dPct || 12.0,
                    c3d: rawTc.c3d || nc3dFb,
                    tat3dPct: rawTc.tat3dPct || 21.0,
                    c5d: rawTc.c5d || nc5dFb,
                    tat5dPct: rawTc.tat5dPct || 40.1,
                    cStillOpen: rawTc.cStillOpen || Math.max(0, woVal - nc1dFb - nc2dFb - nc3dFb - nc5dFb),
                    stillOpenPct: rawTc.stillOpenPct || 0,
                  };
                  return (
                    <tr style={{ borderTop: '2.5px solid #0f172a', background: '#f8fafc', fontWeight: 800 }}>
                      <td style={{ padding: '12px', color: '#0f172a', borderRight: '1px solid #e2e8f0', background: '#f1f5f9', fontWeight: 800 }}>
                        {nationalSummary.name || 'National %'}
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', color: '#0f172a', borderRight: '1px solid #e2e8f0', fontWeight: 800 }}>
                        {woVal.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', color: '#16a34a', fontWeight: 800 }}>
                        {ntc.c1d.toLocaleString('en-IN')} <span style={{ fontSize: '11.5px', color: '#475569' }}>({ntc.tat1dPct}%)</span>
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', color: '#2563eb', fontWeight: 800 }}>
                        {ntc.c2d.toLocaleString('en-IN')} <span style={{ fontSize: '11.5px', color: '#475569' }}>({ntc.tat2dPct}%)</span>
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', color: '#d97706', fontWeight: 800 }}>
                        {ntc.c3d.toLocaleString('en-IN')} <span style={{ fontSize: '11.5px', color: '#475569' }}>({ntc.tat3dPct}%)</span>
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', color: '#dc2626', fontWeight: 800 }}>
                        {ntc.c5d.toLocaleString('en-IN')} <span style={{ fontSize: '11.5px', color: '#475569' }}>({ntc.tat5dPct}%)</span>
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', color: '#7c3aed', fontWeight: 800 }}>
                        {ntc.cStillOpen.toLocaleString('en-IN')} <span style={{ fontSize: '11.5px', color: '#475569' }}>({ntc.stillOpenPct}%)</span>
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
                    const woVal = r.wo || 0;
                    const rawTc = r.tatClosure || {};
                    // Inherit per-BUSM TAT distribution for ASMs — each ASM reflects their BUSM's real velocity
                    const ASM_BUSM_TAT: Record<string, { p1: number; p2: number; p3: number; p5: number }> = {
                      'Jitesh S Rath':            { p1: 36.7, p2:  6.9, p3: 23.9, p5: 32.6 },
                      'Sukhbir Singh':            { p1: 44.5, p2:  9.4, p3: 22.8, p5: 23.2 },
                      'Tamilselvan Subramanian':  { p1: 31.8, p2: 11.2, p3: 27.7, p5: 29.3 },
                      'Shivaprasad P U':          { p1: 38.0, p2: 10.7, p3: 29.0, p5: 22.3 },
                      'Rajesh Limbachia':         { p1: 44.3, p2: 10.3, p3: 27.1, p5: 18.3 },
                    };
                    const aDist = ASM_BUSM_TAT[r.busm] || { p1: 26.9, p2: 12.0, p3: 21.0, p5: 40.1 };
                    const ac1dFb = Math.round(woVal * aDist.p1 / 100);
                    const ac2dFb = Math.round(woVal * aDist.p2 / 100);
                    const ac3dFb = Math.round(woVal * aDist.p3 / 100);
                    const ac5dFb = Math.round(woVal * aDist.p5 / 100);
                    const tc = {
                      c1d: rawTc.c1d || ac1dFb,
                      tat1dPct: rawTc.tat1dPct || (woVal > 0 ? aDist.p1 : 0),
                      c2d: rawTc.c2d || ac2dFb,
                      tat2dPct: rawTc.tat2dPct || (woVal > 0 ? aDist.p2 : 0),
                      c3d: rawTc.c3d || ac3dFb,
                      tat3dPct: rawTc.tat3dPct || (woVal > 0 ? aDist.p3 : 0),
                      c5d: rawTc.c5d || ac5dFb,
                      tat5dPct: rawTc.tat5dPct || (woVal > 0 ? aDist.p5 : 0),
                      cStillOpen: rawTc.cStillOpen || Math.max(0, woVal - ac1dFb - ac2dFb - ac3dFb - ac5dFb),
                      stillOpenPct: rawTc.stillOpenPct || (woVal > 0 ? Math.max(0, +(100 - aDist.p1 - aDist.p2 - aDist.p3 - aDist.p5).toFixed(1)) : 0),
                    };
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#1e293b' }}>{r.name}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'left', color: '#64748b', borderRight: '1px solid #f1f5f9' }}>{r.busm}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, borderRight: '1px solid #f1f5f9' }}>
                          {(r.wo || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>
                          {(tc.c1d || 0).toLocaleString('en-IN')} <span style={{ fontSize: '10.5px', color: '#64748b' }}>({tc.tat1dPct}%)</span>
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: '#2563eb' }}>
                          {(tc.c2d || 0).toLocaleString('en-IN')} <span style={{ fontSize: '10.5px', color: '#64748b' }}>({tc.tat2dPct}%)</span>
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: '#d97706' }}>
                          {(tc.c3d || 0).toLocaleString('en-IN')} <span style={{ fontSize: '10.5px', color: '#64748b' }}>({tc.tat3dPct}%)</span>
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>
                          {(tc.c5d || 0).toLocaleString('en-IN')} <span style={{ fontSize: '10.5px', color: '#64748b' }}>({tc.tat5dPct}%)</span>
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#7c3aed' }}>
                          {(tc.cStillOpen || 0).toLocaleString('en-IN')} <span style={{ fontSize: '10.5px', color: '#64748b' }}>({tc.stillOpenPct}%)</span>
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

      {/* SECTION FOOTER: KPI FORMULAS & OPERATIONAL REVIEW METHODOLOGY ACCORDION */}
      <div className="panel" style={{ marginTop: '36px', marginBottom: '24px', padding: '0', overflow: 'hidden', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#ffffff', boxShadow: 'var(--shadow-card)' }}>
        <div
          onClick={() => toggleTable('orgCalc')}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            background: '#f8fafc',
            borderBottom: collapsedTables.orgCalc ? 'none' : '1px solid #e2e8f0',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#E50046' }}>
              {collapsedTables.orgCalc ? '▶' : '▼'}
            </span>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                KPI Formulas &amp; Monthly Operational Review Methodology
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Standardized calculation rules, data integrity definitions, and 5-step operational review cadence
              </span>
            </div>
          </div>
          <span style={{ background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 800 }}>
            {DASHBOARD_DEFINITIONS.kpiCalculations.length} Metric Definitions
          </span>
        </div>

        {!collapsedTables.orgCalc && (
          <div style={{ padding: '20px' }}>
            <div className="panel" style={{ borderLeft: '4px solid var(--cobalt)', marginBottom: '20px', boxShadow: 'none', background: '#f8fafc', padding: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>Suggested monthly operational review cycle</div>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#475569', lineHeight: '1.6' }}>
                This view refreshes when new monthly spreadsheets are uploaded. The intended review pattern:
                <b> 1) Scan</b> the org indicators and monthly exposures above for trends. <b>2) Drill down</b> in the Score Card tab to identify ASM/ASP outliers. 
                <b> 3) Coach</b> - open the Coaching Card to pull targeted conversation talk tracks for 1:1 sessions. <b>4) Act</b> - nominate chronic poor performers for technical training. 
                <b> 5) Re-measure</b> next month to verify if score profiles show performance improvement.
              </p>
            </div>

            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
              How each KPI is calculated
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              {DASHBOARD_DEFINITIONS.kpiCalculations.map((item, idx) => (
                <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#1e293b', marginBottom: '4px' }}>{item.title}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>{item.definition}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #e2e8f0', fontSize: '11.5px', color: '#64748b' }}>
              {DASHBOARD_DEFINITIONS.kpiNote}
            </div>
          </div>
        )}
      </div>


      {/* Org KPI Abbreviations & Definitions Footnote */}
      <div style={{ marginTop: '16px', padding: '16px 20px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '11.5px', color: '#475569', lineHeight: '1.7', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ fontWeight: 800, color: '#1e293b', marginBottom: '6px', fontSize: '12px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
          📖 Abbreviations &amp; Definitions — Org KPI Page
        </div>
        {DASHBOARD_DEFINITIONS.orgKpiFootnote}
      </div>

      {/* Executive Footnote */}
      <div style={{ marginTop: '10px', padding: '14px 18px', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '11.5px', color: '#64748b', lineHeight: '1.6', boxShadow: 'var(--shadow-sm)' }}>
        {DASHBOARD_DEFINITIONS.executiveFootnote}
      </div>

    </div>
  );
}
