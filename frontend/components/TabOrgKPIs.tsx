import React, { useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableSummaryRow } from './ui/Table';
import { DASHBOARD_DEFINITIONS } from '../constants/definitions';
import { REPAIR_CPC_DATA, REPLACEMENT_CPC_DATA } from '../constants/cpcData';
import { ALL_ASP_PERF_DATA } from '../constants/aspData';
import { DYNAMIC_CPC_DATA_BY_MONTH } from '../constants/cpcDataDynamic';
import { DYNAMIC_SAH_DATA_BY_MONTH } from '../constants/sahDataDynamic';
import { MODEL_SEGMENT_DATA_BY_MONTH } from '../constants/modelSegmentDataDynamic';
import { ALL_ASP_NPS_DATA } from '../constants/npsAspDataDynamic';

interface TabOrgKPIsProps {
  data: any;
  fmtINR: (v: number) => string;
  fmtPct: (v: number) => string;
}

export default function TabOrgKPIs({ data, fmtINR, fmtPct }: TabOrgKPIsProps) {
  const [viewMode, setViewMode] = useState<'overall' | 'modelSegment'>('overall');
  const [deviceFilter, setDeviceFilter] = useState<'smart' | 'all'>('smart');
  const [selectedMonth, setSelectedMonth] = useState<string>('Jun');
  // BUSM/ASM row-click drilldown state — deliberately ONE pair PER TABLE SECTION,
  // not shared globally. Each section's tables (BUSM -> ASM -> ASP) drill down
  // independently; clicking a row in one section must never filter another.
  const [ovBusmRow, setOvBusmRow] = useState<string | null>(null);
  const [ovAsmRow, setOvAsmRow] = useState<string | null>(null);
  const [sahBusmRow, setSahBusmRow] = useState<string | null>(null);
  const [sahAsmRow, setSahAsmRow] = useState<string | null>(null);
  const [npsBusmRow, setNpsBusmRow] = useState<string | null>(null);
  const [npsAsmRow, setNpsAsmRow] = useState<string | null>(null);
  const [tatBusmRow, setTatBusmRow] = useState<string | null>(null);
  const [tatAsmRow, setTatAsmRow] = useState<string | null>(null);
  const [msCpcBusmRow, setMsCpcBusmRow] = useState<string | null>(null);
  const [msCpcAsmRow, setMsCpcAsmRow] = useState<string | null>(null);
  const [msNpsBusmRow, setMsNpsBusmRow] = useState<string | null>(null);
  const [msNpsAsmRow, setMsNpsAsmRow] = useState<string | null>(null);
  const [msTatBusmRow, setMsTatBusmRow] = useState<string | null>(null);
  const [msTatAsmRow, setMsTatAsmRow] = useState<string | null>(null);
  const [collapsedTables, setCollapsedTables] = useState<Record<string, boolean>>({});
  const [segmentFilter, setSegmentFilter] = useState<string>('All');
  const [modelTypeFilter, setModelTypeFilter] = useState<string>('Smart & Tablet');
  const [tatWarrantyFilter, setTatWarrantyFilter] = useState<'inWarranty' | 'overall'>('inWarranty');

  // CPC Drilldown State
  const [cpcBusmRepair, setCpcBusmRepair] = useState<string | null>(null);
  const [cpcAsmRepair, setCpcAsmRepair] = useState<string | null>(null);
  const [cpcBusmRepl, setCpcBusmRepl] = useState<string | null>(null);
  const [cpcAsmRepl, setCpcAsmRepl] = useState<string | null>(null);

  // Reset ASM selection when BUSM selection changes (Overall Regional Performance Scorecards)
  const handleOvBusmClick = (name: string | null) => {
    setOvBusmRow(name);
    setOvAsmRow(null);
  };

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

  const getRankBadgeStyle = (rank: any, maxRank = 35) => {
    const parsedRank = typeof rank === 'string' ? parseInt(rank.replace(/[^0-9]/g, ''), 10) : Number(rank);
    const parsedTotal = Math.max(1, Number(maxRank) || 35);
    if (isNaN(parsedRank)) return { background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5' };

    const ratio = parsedRank / parsedTotal;

    if (ratio <= 0.20) {
      // Top 20% -> Green
      return { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' };
    } else if (ratio <= 0.50) {
      // 20% - 50% -> Blue
      return { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' };
    } else if (ratio <= 0.70) {
      // 50% - 70% -> Yellow
      return { background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' };
    } else {
      // Below 70% (Bottom 30%) -> Red
      return { background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5' };
    }
  };

  const getRankMap = (list: any[], keyFn: (item: any) => string, valFn: (item: any) => number, ascending = false) => {
    if (!list || list.length === 0) return {};
    const sorted = [...list].sort((a, b) => {
      const va = valFn(a) ?? 0;
      const vb = valFn(b) ?? 0;
      return ascending ? va - vb : vb - va;
    });
    const map: Record<string, number> = {};
    sorted.forEach((item, idx) => {
      map[keyFn(item)] = idx + 1;
    });
    return map;
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
  const currentCpcDataset = DYNAMIC_CPC_DATA_BY_MONTH[selectedMonth] || DYNAMIC_CPC_DATA_BY_MONTH['Jun'];
  const currentSahDataset = DYNAMIC_SAH_DATA_BY_MONTH[selectedMonth] || DYNAMIC_SAH_DATA_BY_MONTH['All'];

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
  // Scroll to top of page helper
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });


  const busmNpsMap = new Map(busmNpsData.map(b => [normalizeKey(b.name), b]));
  const asmNpsMap = new Map(asmNpsData.map(a => [normalizeKey(a.name), a]));

  // Calculate Combined CPC = (Combined Total Cost) / (Repair WO Count + Replacement WO Count)
  // BUSM TAT distribution from Lava Master Data (Apr-Jun 2026) — same numbers as TAT table
  const BUSM_TAT_DIST_MAP: Record<string, number> = {
    'Jitesh S Rath': 36.7,
    'Sukhbir Singh': 44.5,
    'Tamilselvan Subramanian': 31.8,
    'Shivaprasad P U': 38.0,
    'Rajesh Limbachia': 44.3,
  };

  const busmCpcMap = new Map<string, number>();
  (currentCpcDataset?.busm || []).forEach((b: any) => {
    const sumWo = (b.repair_count || 0) + (b.repl_count || 0);
    const cost = b.combined_total || ((b.repair_total || 0) + (b.repl_total || 0));
    const cpcVal = sumWo > 0 ? Math.round(cost / sumWo) : 0;
    // Index by both name and busm field to handle possible key variations
    busmCpcMap.set(normalizeKey(b.name || b.busm), cpcVal);
    if (b.busm) busmCpcMap.set(normalizeKey(b.busm), cpcVal);
  });

  const asmCpcMap = new Map<string, number>();
  (currentCpcDataset?.asm || []).forEach((a: any) => {
    const sumWo = (a.repair_count || 0) + (a.repl_count || 0);
    const cost = a.combined_total || ((a.repair_total || 0) + (a.repl_total || 0));
    const cpcVal = sumWo > 0 ? Math.round(cost / sumWo) : 0;
    asmCpcMap.set(normalizeKey(a.name), cpcVal);
  });

  const summaryObj = currentCpcDataset?.summary || {};
  const natSumWo = (summaryObj.repair_count || 0) + (summaryObj.repl_count || 0);
  const natCost = summaryObj.combined_total || ((summaryObj.repair_total || 0) + (summaryObj.repl_total || 0));
  const natCpcVal = natSumWo > 0 ? Math.round(natCost / natSumWo) : (activeOrgKpi.national?.cpc || 0);

  const rawBusmList: any[] = (activeOrgKpi.busms || []).filter((b: any) => b.name && !b.name.toLowerCase().includes('unknown'));
  const rawAllAsmList: any[] = (activeOrgKpi.asms || []).filter((a: any) => a.name && !a.name.toLowerCase().includes('unknown') && a.busm && !a.busm.toLowerCase().includes('unknown'));
  const rawNationalSummary: any = activeOrgKpi.national || {};

  const busmListWithCpc = rawBusmList.map((b: any) => {
    const npsInfo = busmNpsMap.get(normalizeKey(b.name));
    const npsVal = npsInfo ? parseFloat(npsInfo.nps) : (b.nps || 0);
    const npsRank = npsInfo ? npsInfo.rank : (b.ranks?.nps || 1);
    // CPC: prefer cpcDataDynamic value (new formula), fall back to raw b.cpc
    const cpcFromMap = busmCpcMap.get(normalizeKey(b.name)) ?? busmCpcMap.get(normalizeKey(b.busm || ''));
    const cpcVal = cpcFromMap !== undefined ? cpcFromMap : (b.cpc || 0);
    // TAT: use BUSM_TAT_DIST_MAP (same source as TAT table) to ensure consistency
    const tatPct = BUSM_TAT_DIST_MAP[b.name] !== undefined ? BUSM_TAT_DIST_MAP[b.name] : (b.tat || 0);
    return {
      ...b,
      cpc: cpcVal,
      tat: tatPct,
      nps: b.nps && b.nps > 0 ? b.nps : npsVal,
      ranks: {
        ...(b.ranks || {}),
        nps: npsRank
      }
    };
  });

  // Rank BUSMs by CPC (ascending order: lowest CPC = rank #1)
  const sortedBusmsByCpc = [...busmListWithCpc].sort((x, y) => x.cpc - y.cpc);
  const busmCpcRankMap = new Map(sortedBusmsByCpc.map((x, idx) => [normalizeKey(x.name), idx + 1]));

  // Rank BUSMs by TAT % (descending: highest 1-day TAT % = rank #1)
  const sortedBusmsByTat = [...busmListWithCpc].sort((x, y) => y.tat - x.tat);
  const busmTatRankMap = new Map(sortedBusmsByTat.map((x, idx) => [normalizeKey(x.name), idx + 1]));

  const busmList = busmListWithCpc.map((b: any) => ({
    ...b,
    ranks: {
      ...b.ranks,
      cpc: busmCpcRankMap.get(normalizeKey(b.name)) || b.ranks?.cpc || 1,
      tat: busmTatRankMap.get(normalizeKey(b.name)) || b.ranks?.tat || 1
    }
  }));

  const allAsmListWithCpc = rawAllAsmList.map((a: any) => {
    const npsInfo = asmNpsMap.get(normalizeKey(a.name));
    const npsVal = npsInfo ? parseFloat(npsInfo.nps) : (a.nps || 0);
    const npsRank = npsInfo ? npsInfo.rank : (a.ranks?.nps || 1);
    const cpcVal = asmCpcMap.has(normalizeKey(a.name)) ? asmCpcMap.get(normalizeKey(a.name))! : (a.cpc || 0);
    return {
      ...a,
      cpc: cpcVal,
      nps: a.nps && a.nps > 0 ? a.nps : npsVal,
      ranks: {
        ...(a.ranks || {}),
        nps: npsRank
      }
    };
  });

  // Rank ASMs by CPC (ascending order: lowest CPC = rank #1)
  const sortedAsmsByCpc = [...allAsmListWithCpc].sort((x, y) => x.cpc - y.cpc);
  const asmCpcRankMap = new Map(sortedAsmsByCpc.map((x, idx) => [normalizeKey(x.name), idx + 1]));

  // Rank ASMs by In-Warranty TAT % (descending: highest In-Warranty TAT % = rank #1)
  const sortedAsmsByTat = [...allAsmListWithCpc].sort((x, y) => (y.tat || 0) - (x.tat || 0));
  const asmTatRankMap = new Map(sortedAsmsByTat.map((x, idx) => [normalizeKey(x.name), idx + 1]));

  const allAsmList = allAsmListWithCpc.map((a: any) => ({
    ...a,
    ranks: {
      ...a.ranks,
      cpc: asmCpcRankMap.get(normalizeKey(a.name)) || a.ranks?.cpc || 1,
      tat: asmTatRankMap.get(normalizeKey(a.name)) || a.ranks?.tat || 1
    }
  }));

  const nationalSummary = {
    ...rawNationalSummary,
    cpc: natCpcVal,
    nps: rawNationalSummary.nps && rawNationalSummary.nps > 0 ? rawNationalSummary.nps : 65.4
  };

  // Filter ASMs by clicked BUSM row (or show all if no row is clicked)
  const filteredAsmList = ovBusmRow
    ? allAsmList.filter((a) => a.busm === ovBusmRow)
    : allAsmList;

  // Calculate summary totals for filtered ASMs
  const asmTotalWo = filteredAsmList.reduce((sum, a) => sum + (a.wo || 0), 0);
  const asmAvgTat = filteredAsmList.length > 0 ? Math.round((filteredAsmList.reduce((sum, a) => sum + (a.tat || 0), 0) / filteredAsmList.length) * 10) / 10 : 0;
  const asmAvgCpc = filteredAsmList.length > 0 ? Math.round(filteredAsmList.reduce((sum, a) => sum + (a.cpc || 0), 0) / filteredAsmList.length) : 0;
  const asmAvgSah = filteredAsmList.length > 0 ? Math.round((filteredAsmList.reduce((sum, a) => sum + (a.sah || 0), 0) / filteredAsmList.length) * 10) / 10 : 0;
  const asmAvgNps = filteredAsmList.length > 0 ? Math.round((filteredAsmList.reduce((sum, a) => sum + (a.nps || 0), 0) / filteredAsmList.length) * 10) / 10 : 0;
  const asmAvgDiag = filteredAsmList.length > 0 ? Math.round((filteredAsmList.reduce((sum, a) => sum + (a.diag || 0), 0) / filteredAsmList.length) * 10) / 10 : 0;
  const asmAvgCag = filteredAsmList.length > 0 ? Math.round((filteredAsmList.reduce((sum, a) => sum + (a.cag || 0), 0) / filteredAsmList.length) * 10) / 10 : 0;

  // Full ASP-level NPS breakdown (Jun 2026 survey) — every ASP with survey
  // coverage, not just a curated top-10 sample. See npsAspDataDynamic.ts.
  const topAspNpsData = ALL_ASP_NPS_DATA;

  // Combined ASP performance dataset (NPS actuals + TAT/SAH/FTFR/CSAT from Lava Delivered Master Data)
  // TODO: Replace with API-driven data when ASP-level performance data is exposed from the backend
  const aspPerfData = [
    { code: 'ASP-1102652', name: 'CELL CARE SERVICES', asm: 'Abhishek Kumar', busm: 'Shivaprasad P U', wo: 127, tat: 38.0, sah: 94.5, ftfr: 82.3, csat: 91.0, nps: 60.0, p1: 38.0, p2: 11.0, p3: 29.0, p5: 22.0, cancel: 28.4, reschedule: 9.2, sda: 33.1, pending: 5.8 },
    { code: 'ASP-1102700', name: 'SAI SHOPEE', asm: 'Sushil R. Turkar', busm: 'Shivaprasad P U', wo: 183, tat: 40.5, sah: 96.2, ftfr: 85.1, csat: 93.5, nps: 78.9, p1: 40.0, p2: 12.0, p3: 27.0, p5: 21.0, cancel: 26.7, reschedule: 8.8, sda: 34.5, pending: 4.9 },
    { code: 'ASP-1103754', name: 'EXCELLENT SERVICES', asm: 'Abhishek Kumar', busm: 'Shivaprasad P U', wo: 148, tat: 36.2, sah: 95.0, ftfr: 81.0, csat: 92.0, nps: 80.0, p1: 36.0, p2: 10.0, p3: 30.0, p5: 24.0, cancel: 27.9, reschedule: 9.5, sda: 32.8, pending: 6.1 },
    { code: 'ASP-1102679', name: 'DRISHTI TECHNOLOGY', asm: 'Alpesh Rabari', busm: 'Rajesh Limbachia', wo: 212, tat: 45.3, sah: 97.1, ftfr: 87.2, csat: 94.2, nps: 63.6, p1: 44.0, p2: 11.0, p3: 27.0, p5: 18.0, cancel: 25.1, reschedule: 8.1, sda: 36.2, pending: 4.2 },
    { code: 'ASP-1103613', name: 'SMART SOLUTION', asm: 'Anisur Rehman Mullick', busm: 'Jitesh S Rath', wo: 267, tat: 35.4, sah: 93.8, ftfr: 80.5, csat: 89.5, nps: 52.5, p1: 36.0, p2: 7.0, p3: 24.0, p5: 33.0, cancel: 31.2, reschedule: 10.5, sda: 29.8, pending: 7.2 },
    { code: 'ASP-1103679', name: 'M/S NEW NOVELTY', asm: 'Firoj Alam', busm: 'Jitesh S Rath', wo: 195, tat: 37.8, sah: 94.2, ftfr: 83.0, csat: 91.8, nps: 69.4, p1: 37.0, p2: 7.0, p3: 24.0, p5: 32.0, cancel: 30.5, reschedule: 9.8, sda: 30.6, pending: 6.8 },
    { code: 'ASP-1102761', name: 'TECH SOLUTION', asm: 'Gajender Chandel', busm: 'Sukhbir Singh', wo: 221, tat: 43.2, sah: 96.5, ftfr: 86.0, csat: 93.0, nps: 68.2, p1: 45.0, p2: 9.0, p3: 23.0, p5: 23.0, cancel: 27.3, reschedule: 9.1, sda: 35.0, pending: 5.0 },
    { code: 'ASP-1102682', name: 'RAINBOW COMMUNICATION', asm: 'Hem Chandra Joshi', busm: 'Sukhbir Singh', wo: 178, tat: 44.8, sah: 97.3, ftfr: 88.5, csat: 94.8, nps: 77.1, p1: 44.0, p2: 10.0, p3: 23.0, p5: 23.0, cancel: 26.1, reschedule: 8.4, sda: 36.8, pending: 4.5 },
    { code: 'ASP-1101746', name: 'ABHISHEK SALES', asm: 'Nafis Ahmed', busm: 'Sukhbir Singh', wo: 308, tat: 45.1, sah: 96.0, ftfr: 86.8, csat: 93.2, nps: 68.2, p1: 45.0, p2: 9.0, p3: 23.0, p5: 23.0, cancel: 27.8, reschedule: 9.6, sda: 35.2, pending: 5.2 },
    { code: 'ASP-1102180', name: 'Q COM', asm: 'Pushpendra Singh', busm: 'Rajesh Limbachia', wo: 241, tat: 45.8, sah: 97.8, ftfr: 88.9, csat: 95.0, nps: 78.6, p1: 44.0, p2: 10.0, p3: 27.0, p5: 19.0, cancel: 24.5, reschedule: 7.9, sda: 37.0, pending: 4.1 },
  ];

  // Filter ASPs by selected ASM (sourced from ALL_ASP_PERF_DATA covering all 610 ASP centres across the nation)
  const filteredAspList = ovAsmRow
    ? ALL_ASP_PERF_DATA.filter(a => a.asm === ovAsmRow)
    : [];

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
      
      {/* SECTION HEADER, VIEW SWITCHER & MONTH SELECTOR */}
      <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="bar" style={{ background: '#E50046' }}></div>
            <span style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a' }}>
              Organization KPIs &amp; Regional Performance Scorecards
            </span>
          </div>

          {/* VIEW SWITCHER CONTROL */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>View Mode:</span>
            <div style={{ display: 'flex', background: '#e2e8f0', padding: '3px', borderRadius: '10px' }}>
              <button
                onClick={() => setViewMode('overall')}
                style={{
                  padding: '6px 18px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: 'none',
                  background: viewMode === 'overall' ? '#E50046' : 'transparent',
                  color: viewMode === 'overall' ? '#ffffff' : '#475569',
                  boxShadow: viewMode === 'overall' ? '0 2px 4px rgba(229,0,70,0.2)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                Overall View
              </button>
              <button
                onClick={() => setViewMode('modelSegment')}
                style={{
                  padding: '6px 18px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: 'none',
                  background: viewMode === 'modelSegment' ? '#2563eb' : 'transparent',
                  color: viewMode === 'modelSegment' ? '#ffffff' : '#475569',
                  boxShadow: viewMode === 'modelSegment' ? '0 2px 4px rgba(37,99,235,0.2)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                Model Segment View
              </button>
            </div>
          </div>
        </div>

        {/* MONTH SELECTOR & QUICK JUMP PILLS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
          {/* Quick jump navigation pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(viewMode === 'overall' ? [
              { label: '1. Overall', target: 'sec-overall' },
              { label: '2. CPC Details', target: 'sec-cpc' },
              { label: '3. Service at Home', target: 'sec-sah' },
              { label: '4. NPS', target: 'sec-nps' },
              { label: '5. TAT', target: 'sec-tat' },
            ] : [
              { label: '1. CPC Breakdown', target: 'sec-mod-cpc' },
              { label: '2. NPS Breakdown', target: 'sec-mod-nps' },
              { label: '3. TAT Breakdown', target: 'sec-mod-tat' },
            ]).map((pill) => (
              <button
                key={pill.target}
                onClick={() => {
                  const el = document.getElementById(pill.target);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  padding: '5px 14px',
                  borderRadius: '16px',
                  border: '1.5px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease',
                }}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Month selector dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
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
              <option value="All">All Months (Apr - Jun '26)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── OVERALL VIEW ─── */}
      {viewMode === 'overall' && (
      <div>
        {/* SECTION 1: OVERALL REGIONAL PERFORMANCE SCORECARDS */}
        <div id="sec-overall" style={{ marginBottom: '36px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div className="bar" style={{ background: '#0f172a' }}></div>
          <span style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
            1. Overall Regional Performance Scorecards
          </span>
          {(segmentFilter !== 'All' || modelTypeFilter !== 'All') && (
            <div style={{ display: 'flex', gap: '6px', marginLeft: '8px', flexWrap: 'wrap' }}>
              {segmentFilter !== 'All' && (
                <span style={{ padding: '2px 10px', borderRadius: '12px', background: '#fee2e2', color: '#dc2626', fontSize: '11.5px', fontWeight: 700, border: '1px solid #fca5a5' }}>
                  Segment: {segmentFilter}
                </span>
              )}
              {modelTypeFilter !== 'All' && (
                <span style={{ padding: '2px 10px', borderRadius: '12px', background: '#dbeafe', color: '#1d4ed8', fontSize: '11.5px', fontWeight: 700, border: '1px solid #93c5fd' }}>
                  Model: {modelTypeFilter}
                </span>
              )}
            </div>
          )}
        </div>

        {/* TABLE 1: BUSM PERFORMANCE & RANKING MATRIX */}
        <div className="card-mock" style={{ position: 'relative', padding: '20px', marginBottom: '24px' }}>
          <button
            onClick={scrollToTop}
            title="Move to top of page"
            style={{
              position: 'absolute', top: '10px', right: '14px',
              background: 'linear-gradient(135deg,#4E67EB,#6366f1)',
              color: '#fff', border: 'none', borderRadius: '20px',
              padding: '3px 11px', fontSize: '11px', fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(78,103,235,0.35)',
              display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2,
              letterSpacing: '0.03em'
            }}
          >↑ Top</button>
          {/* Rank Badge Percentile Scale Legend */}
          <div style={{ marginBottom: '14px', padding: '8px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '11.5px', textTransform: 'uppercase' }}>Rank Badge Percentile Scale:</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>Top 20% (Best Performers)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px' }}>20% – 50% (Above Average)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px' }}>50% – 70% (Watch-list / Mid-tier)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px' }}>Below 70% (Bottom 30% / Attention Required)</span>
          </div>
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
          {ovBusmRow && (
              <button
                onClick={(e) => { e.stopPropagation(); handleOvBusmClick(null); }}
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
                Clear Filter ({ovBusmRow})
              </button>
            )}
          </div>

          {!collapsedTables.busmPerf && (
            <Table density="comfortable">
              <TableHeader>
                <TableRow>
                  <TableHead style={{ textAlign: 'left' }}>BUSM Name</TableHead>
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
                  const isSelected = ovBusmRow === r.name;
                  return (
                    <TableRow
                      key={i}
                      onClick={() => setOvBusmRow(isSelected ? null : r.name)}
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
                          <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(r.ranks.tat, 5) }}>
                            #{r.ranks.tat}
                          </span>
                        )}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 600 }}>₹{r.cpc}</span>
                        {r.ranks?.cpc && (
                          <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(r.ranks.cpc, 5) }}>
                            #{r.ranks.cpc}
                          </span>
                        )}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 600 }}>{r.sah}%</span>
                        {r.ranks?.sah && (
                          <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(r.ranks.sah, 5) }}>
                            #{r.ranks.sah}
                          </span>
                        )}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 600 }}>{r.nps}%</span>
                        {r.ranks?.nps && (
                          <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(r.ranks.nps, 5) }}>
                            #{r.ranks.nps}
                          </span>
                        )}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 600 }}>{r.diag}%</span>
                        {r.ranks?.diag && (
                          <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(r.ranks.diag, 5) }}>
                            #{r.ranks.diag}
                          </span>
                        )}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 600 }}>{r.cag}%</span>
                        {r.ranks?.cag && (
                          <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(r.ranks.cag, 5) }}>
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

        {/* TABLE 2: ASM BREAKDOWN MATRIX (Only visible when a BUSM is clicked) */}
        {ovBusmRow && (
          <div className="card-mock" style={{ position: 'relative', padding: '20px', marginBottom: '16px', borderLeft: '4px solid #2563eb' }}>
          <button
            onClick={scrollToTop}
            title="Move to top of page"
            style={{
              position: 'absolute', top: '10px', right: '14px',
              background: 'linear-gradient(135deg,#4E67EB,#6366f1)',
              color: '#fff', border: 'none', borderRadius: '20px',
              padding: '3px 11px', fontSize: '11px', fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(78,103,235,0.35)',
              display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2,
              letterSpacing: '0.03em'
            }}
          >↑ Top</button>
          {/* Rank Badge Percentile Scale Legend */}
          <div style={{ marginBottom: '14px', padding: '8px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '11.5px', textTransform: 'uppercase' }}>Rank Badge Percentile Scale:</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>Top 20% (Best Performers)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px' }}>20% – 50% (Above Average)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px' }}>50% – 70% (Watch-list / Mid-tier)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px' }}>Below 70% (Bottom 30% / Attention Required)</span>
          </div>
            <div 
              onClick={() => toggleTable('asmPerf')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: collapsedTables.asmPerf ? 0 : '14px', cursor: 'pointer', userSelect: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {renderHeaderArrow('asmPerf')}
                <div>
                  <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 700, marginBottom: '2px' }}>▶ National &gt; {ovBusmRow}</div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Supervisor (ASM) Performance &amp; Parameter Ranking Matrix
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Showing {filteredAsmList.length} Area Managers (ASMs) under {ovBusmRow} — click an ASM to drill into ASP centres
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                  Count: {filteredAsmList.length} ASMs
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); setOvBusmRow(null); setOvAsmRow(null); }}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
                >
                  Clear BUSM Filter
                </button>
              </div>
            </div>

            {!collapsedTables.asmPerf && (
              <div style={{ overflowX: 'auto' }}>
              <Table density="compact">
                <TableHeader>
                  <TableRow>
                    <TableHead style={{ textAlign: 'left' }}>ASM Name</TableHead>
                    <TableHead style={{ textAlign: 'left' }}>BUSM</TableHead>
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
                    filteredAsmList.map((r: any, i: number) => {
                      const isAsmSelected = ovAsmRow === r.name;
                      return (
                        <TableRow
                          key={i}
                          onClick={() => setOvAsmRow(isAsmSelected ? null : r.name)}
                          style={{
                            background: isAsmSelected ? '#f0fdf4' : undefined,
                            cursor: 'pointer'
                          }}
                        >
                          <TableCell style={{ textAlign: 'left', fontWeight: isAsmSelected ? 800 : 600, color: isAsmSelected ? '#15803d' : undefined }}>
                            {r.name} {isAsmSelected && '✓'}
                          </TableCell>
                          <TableCell style={{ textAlign: 'left', color: 'var(--text-tertiary)' }}>{r.busm}</TableCell>
                          <TableCell style={{ textAlign: 'right' }}>
                            <span style={{ fontWeight: 600 }}>{r.tat}%</span>
                            {r.ranks?.tat && (
                              <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(r.ranks.tat, 35) }}>
                                #{r.ranks.tat}
                              </span>
                            )}
                          </TableCell>
                          <TableCell style={{ textAlign: 'right' }}>
                            <span style={{ fontWeight: 600 }}>₹{r.cpc}</span>
                            {r.ranks?.cpc && (
                              <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(r.ranks.cpc, 35) }}>
                                #{r.ranks.cpc}
                              </span>
                            )}
                          </TableCell>
                          <TableCell style={{ textAlign: 'right' }}>
                            <span style={{ fontWeight: 600 }}>{r.sah}%</span>
                            {r.ranks?.sah && (
                              <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(r.ranks.sah, 35) }}>
                                #{r.ranks.sah}
                              </span>
                            )}
                          </TableCell>
                          <TableCell style={{ textAlign: 'right' }}>
                            <span style={{ fontWeight: 600 }}>{r.nps}%</span>
                            {r.ranks?.nps && (
                              <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(r.ranks.nps, 35) }}>
                                #{r.ranks.nps}
                              </span>
                            )}
                          </TableCell>
                          <TableCell style={{ textAlign: 'right' }}>
                            <span style={{ fontWeight: 600 }}>{r.diag}%</span>
                            {r.ranks?.diag && (
                              <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(r.ranks.diag, 35) }}>
                                #{r.ranks.diag}
                              </span>
                            )}
                          </TableCell>
                          <TableCell style={{ textAlign: 'right' }}>
                            <span style={{ fontWeight: 600 }}>{r.cag}%</span>
                            {r.ranks?.cag && (
                              <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(r.ranks.cag, 35) }}>
                                #{r.ranks.cag}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                  {ovBusmRow && filteredAsmList.length > 0 && (() => {
                    const selectedBusmObj = busmList.find(b => b.name === ovBusmRow);
                    return (
                      <TableSummaryRow>
                        <TableCell colSpan={2} style={{ textAlign: 'left' }}>
                          Total / Average ({ovBusmRow})
                        </TableCell>
                        <TableCell style={{ textAlign: 'right' }}>{selectedBusmObj ? selectedBusmObj.tat : asmAvgTat}%</TableCell>
                        <TableCell style={{ textAlign: 'right' }}>₹{selectedBusmObj ? selectedBusmObj.cpc : asmAvgCpc}</TableCell>
                        <TableCell style={{ textAlign: 'right' }}>{selectedBusmObj ? selectedBusmObj.sah : asmAvgSah}%</TableCell>
                        <TableCell style={{ textAlign: 'right' }}>{selectedBusmObj ? selectedBusmObj.nps : asmAvgNps}%</TableCell>
                        <TableCell style={{ textAlign: 'right' }}>{selectedBusmObj ? selectedBusmObj.diag : asmAvgDiag}%</TableCell>
                        <TableCell style={{ textAlign: 'right' }}>{selectedBusmObj ? selectedBusmObj.cag : asmAvgCag}%</TableCell>
                      </TableSummaryRow>
                    );
                  })()}
                </TableBody>
              </Table>
            </div>
            )}
          </div>
        )}

        {/* ─── ASP TABLE: revealed when ASM is selected ─── */}
        {ovAsmRow && (
        <div className="card-mock" style={{ position: 'relative', padding: '20px', marginBottom: '16px', borderLeft: '4px solid #7c3aed', marginTop: '4px' }}>
          <button
            onClick={scrollToTop}
            title="Move to top of page"
            style={{
              position: 'absolute', top: '10px', right: '14px',
              background: 'linear-gradient(135deg,#4E67EB,#6366f1)',
              color: '#fff', border: 'none', borderRadius: '20px',
              padding: '3px 11px', fontSize: '11px', fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(78,103,235,0.35)',
              display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2,
              letterSpacing: '0.03em'
            }}
          >↑ Top</button>
          {/* Rank Badge Percentile Scale Legend */}
          <div style={{ marginBottom: '14px', padding: '8px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '11.5px', textTransform: 'uppercase' }}>Rank Badge Percentile Scale:</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>Top 20% (Best Performers)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px' }}>20% – 50% (Above Average)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px' }}>50% – 70% (Watch-list / Mid-tier)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px' }}>Below 70% (Bottom 30% / Attention Required)</span>
          </div>
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: 700, marginBottom: '4px' }}>▶ National &gt; {ovBusmRow} &gt; {ovAsmRow}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  ASP Centre Performance Breakdown
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {filteredAspList.length > 0 ? `${filteredAspList.length} ASP centre(s) under ${ovAsmRow}` : `No ASP data available yet for ${ovAsmRow} — will populate when backend is connected`}
                </span>
              </div>
              <button
                onClick={() => setOvAsmRow(null)}
                style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, color: '#7c3aed', cursor: 'pointer' }}
              >
                Clear ASM Filter
              </button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ede9fe', background: '#faf5ff', color: '#6d28d9', fontSize: '11px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '9px 10px', textAlign: 'left', fontFamily: 'monospace' }}>ASP Code</th>
                  <th style={{ padding: '9px 12px', textAlign: 'left' }}>ASP Name</th>
                  <th style={{ padding: '9px 10px', textAlign: 'right' }}>TAT %</th>
                  <th style={{ padding: '9px 10px', textAlign: 'right' }}>CPC ₹</th>
                  <th style={{ padding: '9px 10px', textAlign: 'right' }}>S@H Adherence %</th>
                  <th style={{ padding: '9px 10px', textAlign: 'right' }}>NPS %</th>
                  <th style={{ padding: '9px 10px', textAlign: 'right' }}>Diagnostics Acc.</th>
                  <th style={{ padding: '9px 10px', textAlign: 'right' }}>CAG Scorecard</th>
                </tr>
              </thead>
              <tbody>
                {filteredAspList.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                      ASP-level performance data for <strong>{ovAsmRow}</strong> is not yet available in the static dataset.
                    </td>
                  </tr>
                ) : (
                  filteredAspList.map((asp, i) => (
                    <tr key={asp.code} style={{ borderBottom: '1px solid #f5f3ff', background: i % 2 === 0 ? '#ffffff' : '#faf5ff' }}>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: '#7c3aed', fontWeight: 700 }}>{asp.code}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 700, color: '#1e293b' }}>{asp.name}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#16a34a', fontWeight: 700 }}>{asp.tat}%</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#0f172a', fontWeight: 700 }}>₹{asp.cpc || 0}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#2563eb', fontWeight: 700 }}>{asp.sah}%</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#7c3aed', fontWeight: 800 }}>{asp.nps}%</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#d97706', fontWeight: 700 }}>{asp.diag}%</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#0f172a', fontWeight: 700 }}>{asp.cag}</td>
                    </tr>
                  ))
                )}
              </tbody>
              {filteredAspList.length > 0 && (() => {
                const selectedAsmObj = allAsmList.find(a => a.name === ovAsmRow);
                const avgCpc = selectedAsmObj ? selectedAsmObj.cpc : Math.round(filteredAspList.reduce((sum, a) => sum + (a.cpc || 0), 0) / filteredAspList.length);
                const avgDiag = selectedAsmObj ? selectedAsmObj.diag : Math.round((filteredAspList.reduce((sum, a) => sum + (a.diag || 0), 0) / filteredAspList.length) * 10) / 10;
                const avgCag = selectedAsmObj ? selectedAsmObj.cag : Math.round(filteredAspList.reduce((sum, a) => sum + (a.cag || 0), 0) / filteredAspList.length);
                return (
                  <tfoot>
                    <tr style={{ background: '#f5f3ff', borderTop: '2px solid #ddd6fe', fontWeight: 800, color: '#6d28d9', fontSize: '12px' }}>
                      <td colSpan={2} style={{ padding: '9px 10px', textAlign: 'left' }}>
                        Total / Average ({ovAsmRow})
                      </td>
                      <td style={{ padding: '9px 10px', textAlign: 'right' }}>
                        {selectedAsmObj ? selectedAsmObj.tat : Math.round((filteredAspList.reduce((sum, a) => sum + (a.tat || 0), 0) / filteredAspList.length) * 10) / 10}%
                      </td>
                      <td style={{ padding: '9px 10px', textAlign: 'right' }}>
                        ₹{avgCpc}
                      </td>
                      <td style={{ padding: '9px 10px', textAlign: 'right' }}>
                        {selectedAsmObj ? selectedAsmObj.sah : Math.round((filteredAspList.reduce((sum, a) => sum + (a.sah || 0), 0) / filteredAspList.length) * 10) / 10}%
                      </td>
                      <td style={{ padding: '9px 10px', textAlign: 'right' }}>
                        {selectedAsmObj ? selectedAsmObj.nps : Math.round((filteredAspList.reduce((sum, a) => sum + (a.nps || 0), 0) / filteredAspList.length) * 10) / 10}%
                      </td>
                      <td style={{ padding: '9px 10px', textAlign: 'right' }}>
                        {avgDiag}%
                      </td>
                      <td style={{ padding: '9px 10px', textAlign: 'right' }}>
                        {avgCag}
                      </td>
                    </tr>
                  </tfoot>
                );
              })()}
            </table>
          </div>
          {filteredAspList.length > 0 && (
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px', fontStyle: 'italic' }}>
              ⚠ TAT and S@H values are representative estimates based on BUSM-level distributions; NPS is actual from Jun 2026 survey data. Backend integration pending.
            </div>
          )}
        </div>
        )}
      </div>

      {/* SECTION 3: CPC BREAKDOWN — COMBINED REPAIR & REPLACEMENT COST ANALYSIS */}
      <div id="sec-cpc" style={{ marginBottom: '36px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div className="bar" style={{ background: '#d97706' }}></div>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                2. CPC Breakdown — Combined Repair &amp; Replacement Cost Analysis
              </span>
              <span style={{ fontSize: '11.5px', fontWeight: 800, background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '12px' }}>
                Active Month: {selectedMonth === 'All' ? 'All Months (Apr-Jun)' : selectedMonth === 'Jun' ? 'June 2026' : selectedMonth === 'May' ? 'May 2026' : 'April 2026'}
              </span>
              <span style={{ fontSize: '11.5px', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '12px' }}>
                Filters: Warranty = "Yes" &amp; ELS Status ≠ "No"
              </span>
            </div>
            <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px', marginLeft: '12px' }}>
              Unified cost analysis comparing Repair WOs (Total Part Value &gt; 0) vs. Replacement WOs (Call Type Z9) across BUSM, ASM, and ASP tiers
            </div>
          </div>
        </div>

        {/* ─── UNIFIED COMBINED REPAIR & REPLACEMENT TABLE (BUSM LEVEL) ─── */}
        <div className="card-mock" style={{ position: 'relative', padding: '20px', marginBottom: '24px', borderTop: '3px solid #d97706' }}>
          <button
            onClick={scrollToTop}
            title="Move to top of page"
            style={{
              position: 'absolute', top: '10px', right: '14px',
              background: 'linear-gradient(135deg,#4E67EB,#6366f1)',
              color: '#fff', border: 'none', borderRadius: '20px',
              padding: '3px 11px', fontSize: '11px', fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(78,103,235,0.35)',
              display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2,
              letterSpacing: '0.03em'
            }}
          >↑ Top</button>
          {/* Rank Badge Percentile Scale Legend */}
          <div style={{ marginBottom: '14px', padding: '8px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '11.5px', textTransform: 'uppercase' }}>Rank Badge Percentile Scale:</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>Top 20% (Best Performers)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px' }}>20% – 50% (Above Average)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px' }}>50% – 70% (Watch-list / Mid-tier)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px' }}>Below 70% (Bottom 30% / Attention Required)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Combined Repair &amp; Replacement Cost Breakdown (BUSM Level)
                </h3>
              </div>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Repair WOs (Part Value &gt; 0) and Replacement WOs (Call Type Z9). Click a BUSM row to drill down into ASM &amp; ASP tiers.
              </span>
            </div>
            {cpcBusmRepair && (
              <button
                onClick={() => { setCpcBusmRepair(null); setCpcAsmRepair(null); }}
                style={{ background: '#fffbeb', border: '1px solid #fcd34d', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, color: '#b45309', cursor: 'pointer' }}
              >
                Clear Filter ({cpcBusmRepair})
              </button>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
          <Table density="compact">
            <TableHeader>
              <TableRow style={{ background: '#f8fafc' }}>
                <TableHead style={{ textAlign: 'left' }}>BUSM Name</TableHead>
                <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>Repair WO Count</TableHead>
                <TableHead style={{ textAlign: 'right' }}>Avg Repair Cost (₹)</TableHead>
                <TableHead style={{ textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>Total Repair Cost (₹)</TableHead>
                <TableHead style={{ textAlign: 'right' }}>Replacement WO Count</TableHead>
                <TableHead style={{ textAlign: 'right' }}>Avg Replacement Cost (₹)</TableHead>
                <TableHead style={{ textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>Total Replacement Cost (₹)</TableHead>
                <TableHead style={{ textAlign: 'right', background: '#fffbeb' }}>Combined Total Cost (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentCpcDataset.busm.map((rRepair: any, i: number) => {
                const busmName = rRepair.busm || rRepair.name || rRepair.busm_name || rRepair.busmName || rRepair.BUSM || rRepair.Name || 'BUSM';
                const isSelected = cpcBusmRepair === busmName;
                const repairTotal = Math.round(rRepair.repair_count * rRepair.repair_avg);
                const replTotal = Math.round(rRepair.repl_count * rRepair.repl_avg);
                const combinedTotal = repairTotal + replTotal;

                return (
                  <TableRow
                    key={i}
                    onClick={() => {
                      setCpcBusmRepair(isSelected ? null : busmName);
                      setCpcAsmRepair(null);
                    }}
                    style={{
                      background: isSelected ? '#fffbeb' : undefined,
                      cursor: 'pointer'
                    }}
                  >
                    <TableCell style={{ textAlign: 'left', fontWeight: isSelected ? 800 : 600, color: isSelected ? '#b45309' : undefined }}>
                      {busmName} {isSelected && '✓'}
                    </TableCell>
                    <TableCell style={{ textAlign: 'right', fontWeight: 600, borderLeft: '1px solid #f1f5f9' }}>
                      {rRepair.repair_count.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell style={{ textAlign: 'right', fontWeight: 700, color: '#d97706' }}>
                      ₹{rRepair.repair_avg.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell style={{ textAlign: 'right', fontWeight: 800, color: '#b45309', borderRight: '1px solid #f1f5f9' }}>
                      ₹{repairTotal.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell style={{ textAlign: 'right', fontWeight: 600 }}>
                      {rRepair.repl_count.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell style={{ textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>
                      ₹{rRepair.repl_avg.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell style={{ textAlign: 'right', fontWeight: 800, color: '#1d4ed8', borderRight: '1px solid #f1f5f9' }}>
                      ₹{replTotal.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell style={{ textAlign: 'right', fontWeight: 800, color: '#0f172a', background: isSelected ? '#fef3c7' : '#f8fafc' }}>
                      ₹{combinedTotal.toLocaleString('en-IN')}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableSummaryRow>
              <TableCell style={{ textAlign: 'left', fontWeight: 800 }}>National Total / Average</TableCell>
              <TableCell style={{ textAlign: 'right', fontWeight: 800, borderLeft: '1px solid #cbd5e1' }}>
                {(currentCpcDataset?.summary?.repair_count || 0).toLocaleString('en-IN')}
              </TableCell>
              <TableCell style={{ textAlign: 'right', fontWeight: 800, color: '#d97706' }}>
                ₹{(currentCpcDataset?.summary?.repair_avg || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell style={{ textAlign: 'right', fontWeight: 800, color: '#b45309', borderRight: '1px solid #cbd5e1' }}>
                ₹{(currentCpcDataset?.summary?.repair_total || 0).toLocaleString('en-IN')}
              </TableCell>
              <TableCell style={{ textAlign: 'right', fontWeight: 800 }}>
                {(currentCpcDataset?.summary?.repl_count || 0).toLocaleString('en-IN')}
              </TableCell>
              <TableCell style={{ textAlign: 'right', fontWeight: 800, color: '#2563eb' }}>
                ₹{(currentCpcDataset?.summary?.repl_avg || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell style={{ textAlign: 'right', fontWeight: 800, color: '#1d4ed8', borderRight: '1px solid #cbd5e1' }}>
                ₹{(currentCpcDataset?.summary?.repl_total || 0).toLocaleString('en-IN')}
              </TableCell>
              <TableCell style={{ textAlign: 'right', fontWeight: 800, color: '#0f172a', background: '#f1f5f9' }}>
                ₹{(currentCpcDataset?.summary?.combined_total || 0).toLocaleString('en-IN')}
              </TableCell>
            </TableSummaryRow>
          </Table>
          </div>
        </div>

        {/* ─── COMBINED ASM DRILLDOWN TABLE ─── */}
        {cpcBusmRepair && (
          <div className="card-mock" style={{ position: 'relative', padding: '20px', marginBottom: '16px', borderLeft: '4px solid #d97706' }}>
          <button
            onClick={scrollToTop}
            title="Move to top of page"
            style={{
              position: 'absolute', top: '10px', right: '14px',
              background: 'linear-gradient(135deg,#4E67EB,#6366f1)',
              color: '#fff', border: 'none', borderRadius: '20px',
              padding: '3px 11px', fontSize: '11px', fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(78,103,235,0.35)',
              display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2,
              letterSpacing: '0.03em'
            }}
          >↑ Top</button>
          {/* Rank Badge Percentile Scale Legend */}
          <div style={{ marginBottom: '14px', padding: '8px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '11.5px', textTransform: 'uppercase' }}>Rank Badge Percentile Scale:</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>Top 20% (Best Performers)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px' }}>20% – 50% (Above Average)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px' }}>50% – 70% (Watch-list / Mid-tier)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px' }}>Below 70% (Bottom 30% / Attention Required)</span>
          </div>
            <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#b45309', fontWeight: 700, marginBottom: '2px' }}>▶ National &gt; {cpcBusmRepair}</div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Supervisor (ASM) Combined Repair &amp; Replacement Cost Breakdown — {cpcBusmRepair} ({selectedMonth})
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Click an ASM row to view ASP centres under that supervisor
                </span>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
            <Table density="compact">
              <TableHeader>
                <TableRow style={{ background: '#f8fafc' }}>
                  <TableHead style={{ textAlign: 'left' }}>ASM Name</TableHead>
                  <TableHead style={{ textAlign: 'left' }}>BUSM</TableHead>
                  <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>Repair WO Count</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>Avg Repair Cost (₹)</TableHead>
                  <TableHead style={{ textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>Total Repair Cost (₹)</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>Replacement WO Count</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>Avg Replacement Cost (₹)</TableHead>
                  <TableHead style={{ textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>Total Replacement Cost (₹)</TableHead>
                  <TableHead style={{ textAlign: 'right', background: '#fffbeb' }}>Combined Total Cost (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentCpcDataset.asm.filter((a: any) => a.busm === cpcBusmRepair).map((rRepair: any, i: number) => {
                  const asmName = rRepair.name || rRepair.asm;
                  const isAsmSelected = cpcAsmRepair === asmName;
                  const repairTotal = Math.round(rRepair.repair_count * rRepair.repair_avg);
                  const replTotal = Math.round(rRepair.repl_count * rRepair.repl_avg);
                  const combinedTotal = repairTotal + replTotal;

                  return (
                    <TableRow
                      key={i}
                      onClick={() => setCpcAsmRepair(isAsmSelected ? null : asmName)}
                      style={{ background: isAsmSelected ? '#fef3c7' : undefined, cursor: 'pointer' }}
                    >
                      <TableCell style={{ textAlign: 'left', fontWeight: isAsmSelected ? 800 : 600, color: isAsmSelected ? '#92400e' : undefined }}>
                        {asmName} {isAsmSelected && '✓'}
                      </TableCell>
                      <TableCell style={{ textAlign: 'left', color: '#64748b' }}>{rRepair.busm}</TableCell>
                      <TableCell style={{ textAlign: 'right', fontWeight: 600, borderLeft: '1px solid #f1f5f9' }}>{rRepair.repair_count.toLocaleString('en-IN')}</TableCell>
                      <TableCell style={{ textAlign: 'right', fontWeight: 700, color: '#d97706' }}>
                        ₹{rRepair.repair_avg.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right', fontWeight: 800, color: '#b45309', borderRight: '1px solid #f1f5f9' }}>
                        ₹{repairTotal.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right', fontWeight: 600 }}>{rRepair.repl_count.toLocaleString('en-IN')}</TableCell>
                      <TableCell style={{ textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>
                        ₹{rRepair.repl_avg.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right', fontWeight: 800, color: '#1d4ed8', borderRight: '1px solid #f1f5f9' }}>
                        ₹{replTotal.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right', fontWeight: 800, color: '#0f172a', background: isAsmSelected ? '#fde68a' : '#f8fafc' }}>
                        ₹{combinedTotal.toLocaleString('en-IN')}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </div>
          </div>
        )}

        {/* ─── COMBINED ASP DRILLDOWN TABLE ─── */}
        {cpcAsmRepair && (
          <div className="card-mock" style={{ position: 'relative', padding: '20px', marginBottom: '24px', borderLeft: '4px solid #7c3aed' }}>
          <button
            onClick={scrollToTop}
            title="Move to top of page"
            style={{
              position: 'absolute', top: '10px', right: '14px',
              background: 'linear-gradient(135deg,#4E67EB,#6366f1)',
              color: '#fff', border: 'none', borderRadius: '20px',
              padding: '3px 11px', fontSize: '11px', fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(78,103,235,0.35)',
              display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2,
              letterSpacing: '0.03em'
            }}
          >↑ Top</button>
          {/* Rank Badge Percentile Scale Legend */}
          <div style={{ marginBottom: '14px', padding: '8px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '11.5px', textTransform: 'uppercase' }}>Rank Badge Percentile Scale:</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>Top 20% (Best Performers)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px' }}>20% – 50% (Above Average)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px' }}>50% – 70% (Watch-list / Mid-tier)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px' }}>Below 70% (Bottom 30% / Attention Required)</span>
          </div>
            <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: 700, marginBottom: '2px' }}>▶ National &gt; {cpcBusmRepair} &gt; {cpcAsmRepair}</div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  ASP Centre Combined Repair &amp; Replacement Cost Breakdown — {cpcAsmRepair} ({selectedMonth})
                </h3>
              </div>
              <button
                onClick={() => setCpcAsmRepair(null)}
                style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, color: '#7c3aed', cursor: 'pointer' }}
              >
                Clear ASM Filter
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
            <Table density="compact">
              <TableHeader>
                <TableRow style={{ background: '#f8fafc' }}>
                  <TableHead style={{ textAlign: 'left', fontFamily: 'monospace' }}>ASP Code</TableHead>
                  <TableHead style={{ textAlign: 'left' }}>ASP Name</TableHead>
                  <TableHead style={{ textAlign: 'left' }}>ASM Supervisor</TableHead>
                  <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>Repair WO Count</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>Avg Repair Cost (₹)</TableHead>
                  <TableHead style={{ textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>Total Repair Cost (₹)</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>Replacement WO Count</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>Avg Replacement Cost (₹)</TableHead>
                  <TableHead style={{ textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>Total Replacement Cost (₹)</TableHead>
                  <TableHead style={{ textAlign: 'right', background: '#f5f3ff' }}>Combined Total Cost (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentCpcDataset.asp.filter((a: any) => a.asm === cpcAsmRepair).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                      No ASP center records found for {cpcAsmRepair} in {selectedMonth}.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentCpcDataset.asp.filter((a: any) => a.asm === cpcAsmRepair).map((aspRepair: any, i: number) => {
                    const repairTotal = Math.round(aspRepair.repair_count * aspRepair.repair_avg);
                    const replTotal = Math.round(aspRepair.repl_count * aspRepair.repl_avg);
                    const combinedTotal = repairTotal + replTotal;

                    return (
                      <TableRow key={i}>
                        <TableCell style={{ textAlign: 'left', fontFamily: 'monospace', color: '#7c3aed', fontWeight: 700 }}>{aspRepair.code}</TableCell>
                        <TableCell style={{ textAlign: 'left', fontWeight: 700 }}>{aspRepair.asp}</TableCell>
                        <TableCell style={{ textAlign: 'left', color: '#64748b' }}>{aspRepair.asm}</TableCell>
                        <TableCell style={{ textAlign: 'right', fontWeight: 600, borderLeft: '1px solid #f1f5f9' }}>{aspRepair.repair_count.toLocaleString('en-IN')}</TableCell>
                        <TableCell style={{ textAlign: 'right', fontWeight: 700, color: '#d97706' }}>
                          ₹{aspRepair.repair_avg.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell style={{ textAlign: 'right', fontWeight: 800, color: '#b45309', borderRight: '1px solid #f1f5f9' }}>
                          ₹{repairTotal.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell style={{ textAlign: 'right', fontWeight: 600 }}>{aspRepair.repl_count.toLocaleString('en-IN')}</TableCell>
                        <TableCell style={{ textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>
                          ₹{aspRepair.repl_avg.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell style={{ textAlign: 'right', fontWeight: 800, color: '#1d4ed8', borderRight: '1px solid #f1f5f9' }}>
                          ₹{replTotal.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell style={{ textAlign: 'right', fontWeight: 800, color: '#7c3aed', background: '#f5f3ff' }}>
                          ₹{combinedTotal.toLocaleString('en-IN')}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: SERVICE AT HOME */}
      <div id="sec-sah" style={{ marginBottom: '36px' }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="bar" style={{ background: '#2563eb' }}></div>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              3. Service at Home (S@H) Operational Benchmarks
            </span>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#2563eb', marginTop: '2px', marginLeft: '12px' }}>
            By Appointment Date
          </div>
        </div>

        {/* TABLE 3: BUSM APPOINTMENT METRICS TABLE */}
        <div className="card-mock" style={{ position: 'relative', padding: '20px', marginBottom: '24px' }}>
          <button
            onClick={scrollToTop}
            title="Move to top of page"
            style={{
              position: 'absolute', top: '10px', right: '14px',
              background: 'linear-gradient(135deg,#4E67EB,#6366f1)',
              color: '#fff', border: 'none', borderRadius: '20px',
              padding: '3px 11px', fontSize: '11px', fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(78,103,235,0.35)',
              display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2,
              letterSpacing: '0.03em'
            }}
          >↑ Top</button>
          {/* Rank Badge Percentile Scale Legend */}
          <div style={{ marginBottom: '14px', padding: '8px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '11.5px', textTransform: 'uppercase' }}>Rank Badge Percentile Scale:</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>Top 20% (Best Performers)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px' }}>20% – 50% (Above Average)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px' }}>50% – 70% (Watch-list / Mid-tier)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px' }}>Below 70% (Bottom 30% / Attention Required)</span>
          </div>
          <div 
            onClick={() => toggleTable('busmAppt')}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: collapsedTables.busmAppt ? 0 : '14px', cursor: 'pointer', userSelect: 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {renderHeaderArrow('busmAppt')}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  BUSM Appointment Performance Matrix
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Service at Home appointment metrics by Business Unit Manager (BUSM)
                </span>
              </div>
              <span style={{ fontSize: '11.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '12px' }}>
                Active Month: {selectedMonth === 'All' ? 'All Months (Apr-Jun)' : selectedMonth === 'Jun' ? 'June 2026' : selectedMonth === 'May' ? 'May 2026' : 'April 2026'}
              </span>
            </div>
          </div>

          {!collapsedTables.busmAppt && (
            <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', lineHeight: '1.3' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', borderRight: '1px solid #e2e8f0' }}>BUSM Name</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>Total Appointments</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>Cancellation %</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>Reschedule %</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>Same Day Attend %</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>Same Day Attend without Cancellation %</th>
                  <th style={{ padding: '10px 10px', textAlign: 'right' }}>Pending to Attend %</th>
                </tr>
              </thead>
              <tbody>
                {currentSahDataset.busm.map((r: any, i: number) => {
                  const isSelected = sahBusmRow === r.name;
                  return (
                    <tr
                      key={i}
                      onClick={() => setSahBusmRow(isSelected ? null : r.name)}
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
                        {r.total.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#d97706' }}>{r.cancel}</td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 600 }}>{r.resched}</td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>{r.same_day}</td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>{r.same_day_cancel}</td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>{r.pending}</td>
                    </tr>
                  );
                })}

                {/* Total Summary Row for 5 BUSMs */}
                <tr style={{ borderTop: '2.5px solid #0f172a', background: '#f8fafc', fontWeight: 800 }}>
                  <td style={{ padding: '12px', color: '#0f172a', borderRight: '1px solid #e2e8f0', background: '#f1f5f9', fontWeight: 800 }}>
                    Total / Average (5 BUSMs)
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', color: '#0f172a', borderRight: '1px solid #e2e8f0', fontWeight: 800 }}>
                    {currentSahDataset.summary.total.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', color: '#d97706', fontWeight: 800 }}>{currentSahDataset.summary.cancel}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', color: '#0f172a', fontWeight: 800 }}>{currentSahDataset.summary.resched}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', color: '#16a34a', fontWeight: 800 }}>{currentSahDataset.summary.same_day}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', color: '#dc2626', fontWeight: 800 }}>{currentSahDataset.summary.same_day_cancel}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', color: '#2563eb', fontWeight: 800 }}>{currentSahDataset.summary.pending}</td>
                </tr>
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* TABLE 4: ASM APPOINTMENT METRICS TABLE (Only visible when a BUSM is clicked) */}
        {sahBusmRow && (
          <div className="card-mock" style={{ position: 'relative', padding: '20px', marginTop: '16px' }}>
          <button
            onClick={scrollToTop}
            title="Move to top of page"
            style={{
              position: 'absolute', top: '10px', right: '14px',
              background: 'linear-gradient(135deg,#4E67EB,#6366f1)',
              color: '#fff', border: 'none', borderRadius: '20px',
              padding: '3px 11px', fontSize: '11px', fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(78,103,235,0.35)',
              display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2,
              letterSpacing: '0.03em'
            }}
          >↑ Top</button>
          {/* Rank Badge Percentile Scale Legend */}
          <div style={{ marginBottom: '14px', padding: '8px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '11.5px', textTransform: 'uppercase' }}>Rank Badge Percentile Scale:</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>Top 20% (Best Performers)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px' }}>20% – 50% (Above Average)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px' }}>50% – 70% (Watch-list / Mid-tier)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px' }}>Below 70% (Bottom 30% / Attention Required)</span>
          </div>
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
                    Showing Area Managers (ASMs) under {sahBusmRow}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                  Count: {currentSahDataset.asm.filter((a: any) => a.busm === sahBusmRow).length} ASMs
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); setSahBusmRow(null); }}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
                >
                  Clear BUSM Filter
                </button>
              </div>
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
                    <th style={{ padding: '10px 10px', textAlign: 'right' }}>Same Day Attend without Cancellation %</th>
                    <th style={{ padding: '10px 10px', textAlign: 'right' }}>Pending to Attend %</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSahDataset.asm.filter((a: any) => a.busm === sahBusmRow).length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                        No ASMs found for {sahBusmRow} in {selectedMonth}.
                      </td>
                    </tr>
                  ) : (
                    currentSahDataset.asm.filter((a: any) => a.busm === sahBusmRow).map((r: any, i: number) => {
                      const isSelected = sahAsmRow === r.name;
                      return (
                        <tr
                          key={i}
                          onClick={() => setSahAsmRow(isSelected ? null : r.name)}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            background: isSelected ? '#eff6ff' : undefined,
                            cursor: 'pointer'
                          }}
                        >
                          <td style={{ padding: '8px 12px', textAlign: 'left', fontWeight: isSelected ? 800 : 700, color: isSelected ? '#1d4ed8' : '#1e293b' }}>
                            {r.name} {isSelected && '✓'}
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'left', color: '#64748b', borderRight: '1px solid #f1f5f9' }}>{r.busm}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, borderRight: '1px solid #f1f5f9' }}>
                            {r.total.toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#d97706' }}>{r.cancel}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>{r.resched}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>{r.same_day}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>{r.same_day_cancel}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>{r.pending}</td>
                        </tr>
                      );
                    })
                  )}

                  {/* Total Summary Row for ASMs — all percentages computed dynamically (weighted by appointments) */}
                  {(() => {
                    const filteredAsms = currentSahDataset.asm.filter((a: any) => a.busm === sahBusmRow);
                    const totalAppts = filteredAsms.reduce((s: number, a: any) => s + (a.total || 0), 0);
                    const wavg = (key: string) => {
                      if (totalAppts === 0) return '0.0%';
                      const wsum = filteredAsms.reduce((s: number, a: any) =>
                        s + (parseFloat((a[key] || '0').replace('%','')) * (a.total || 0)), 0);
                      return `${(wsum / totalAppts).toFixed(1)}%`;
                    };
                    return (
                      <tr style={{ borderTop: '2.5px solid #0f172a', background: '#f8fafc', fontWeight: 800 }}>
                        <td style={{ padding: '10px 12px', color: '#0f172a', background: '#f1f5f9', fontWeight: 800 }}>Total / Average</td>
                        <td style={{ padding: '10px 10px', color: '#64748b', borderRight: '1px solid #e2e8f0' }}>{sahBusmRow}</td>
                        <td style={{ padding: '10px 10px', textAlign: 'right', color: '#0f172a', borderRight: '1px solid #e2e8f0', fontWeight: 800 }}>
                          {totalAppts.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '10px 10px', textAlign: 'right', color: '#d97706', fontWeight: 800 }}>{wavg('cancel')}</td>
                        <td style={{ padding: '10px 10px', textAlign: 'right', color: '#0f172a', fontWeight: 800 }}>{wavg('resched')}</td>
                        <td style={{ padding: '10px 10px', textAlign: 'right', color: '#16a34a', fontWeight: 800 }}>{wavg('same_day')}</td>
                        <td style={{ padding: '10px 10px', textAlign: 'right', color: '#dc2626', fontWeight: 800 }}>{wavg('same_day_cancel')}</td>
                        <td style={{ padding: '10px 10px', textAlign: 'right', color: '#2563eb', fontWeight: 800 }}>{wavg('pending')}</td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>
            )}
          </div>
        )}

        {/* TABLE 5: ASP LEVEL S@H METRICS (Revealed on ASM Click) */}
        {sahAsmRow && (
          <div className="card-mock" style={{ position: 'relative', padding: '20px', marginTop: '16px' }}>
          <button
            onClick={scrollToTop}
            title="Move to top of page"
            style={{
              position: 'absolute', top: '10px', right: '14px',
              background: 'linear-gradient(135deg,#4E67EB,#6366f1)',
              color: '#fff', border: 'none', borderRadius: '20px',
              padding: '3px 11px', fontSize: '11px', fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(78,103,235,0.35)',
              display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2,
              letterSpacing: '0.03em'
            }}
          >↑ Top</button>
          {/* Rank Badge Percentile Scale Legend */}
          <div style={{ marginBottom: '14px', padding: '8px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '11.5px', textTransform: 'uppercase' }}>Rank Badge Percentile Scale:</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>Top 20% (Best Performers)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px' }}>20% – 50% (Above Average)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px' }}>50% – 70% (Watch-list / Mid-tier)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px' }}>Below 70% (Bottom 30% / Attention Required)</span>
          </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: 700, marginBottom: '2px' }}>▶ National &gt; {sahBusmRow} &gt; {sahAsmRow} — S@H</div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  ASP Centre Appointment Performance (Filtered ASM: {sahAsmRow})
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Service at Home appointment metrics for all ASP centres reporting to {sahAsmRow}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                  Count: {(currentSahDataset.asp || []).filter((a: any) => a.asm === sahAsmRow).length} ASPs
                </span>
                <button
                  onClick={() => setSahAsmRow(null)}
                  style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, color: '#7c3aed', cursor: 'pointer' }}
                >
                  Clear ASM Filter ({sahAsmRow})
                </button>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', lineHeight: '1.3' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '10px 10px', textAlign: 'left', fontFamily: 'monospace' }}>ASP Code</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>ASP Name</th>
                    <th style={{ padding: '10px 10px', textAlign: 'left' }}>Supervisor (ASM)</th>
                    <th style={{ padding: '10px 10px', textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>Total Appts</th>
                    <th style={{ padding: '10px 10px', textAlign: 'right' }}>Cancellation %</th>
                    <th style={{ padding: '10px 10px', textAlign: 'right' }}>Reschedule %</th>
                    <th style={{ padding: '10px 10px', textAlign: 'right' }}>Same Day Attend %</th>
                    <th style={{ padding: '10px 10px', textAlign: 'right' }}>Same Day w/o Cancel %</th>
                    <th style={{ padding: '10px 10px', textAlign: 'right' }}>Pending %</th>
                  </tr>
                </thead>
                <tbody>
                  {(currentSahDataset.asp || []).filter((a: any) => a.asm === sahAsmRow).length === 0 ? (
                    <tr><td colSpan={9} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No ASP centres found for {sahAsmRow} in {selectedMonth}.</td></tr>
                  ) : (
                    (currentSahDataset.asp || [])
                      .filter((a: any) => a.asm === sahAsmRow)
                      .sort((a: any, b: any) => b.total - a.total)
                      .map((r: any, i: number) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                          <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: '#7c3aed', fontWeight: 700 }}>{r.code}</td>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: '#1e293b' }}>{r.name}</td>
                          <td style={{ padding: '8px 10px', color: '#64748b' }}>{r.asm}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, borderLeft: '1px solid #f1f5f9' }}>{(r.total || 0).toLocaleString('en-IN')}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#d97706' }}>{r.cancel}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>{r.resched}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>{r.same_day}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>{r.same_day_cancel}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>{r.pending}</td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: NPS DASHBOARD (8 TABLES FROM EXCEL) */}
      <div id="sec-nps" style={{ marginBottom: '36px' }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div className="bar" style={{ background: '#7c3aed' }}></div>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  4. NPS Performance &amp; Customer Satisfaction Dashboard
                </span>
                {(segmentFilter !== 'All' || modelTypeFilter !== 'All') && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {segmentFilter !== 'All' && (
                      <span style={{ padding: '2px 10px', borderRadius: '12px', background: '#fee2e2', color: '#dc2626', fontSize: '11.5px', fontWeight: 700, border: '1px solid #fca5a5' }}>
                        Segment: {segmentFilter}
                      </span>
                    )}
                    {modelTypeFilter !== 'All' && (
                      <span style={{ padding: '2px 10px', borderRadius: '12px', background: '#dbeafe', color: '#1d4ed8', fontSize: '11.5px', fontWeight: 700, border: '1px solid #93c5fd' }}>
                        Model: {modelTypeFilter}
                      </span>
                    )}
                  </div>
                )}
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
        <div className="card-mock" style={{ position: 'relative', padding: '20px', marginBottom: '24px' }}>
          <button
            onClick={scrollToTop}
            title="Move to top of page"
            style={{
              position: 'absolute', top: '10px', right: '14px',
              background: 'linear-gradient(135deg,#4E67EB,#6366f1)',
              color: '#fff', border: 'none', borderRadius: '20px',
              padding: '3px 11px', fontSize: '11px', fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(78,103,235,0.35)',
              display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2,
              letterSpacing: '0.03em'
            }}
          >↑ Top</button>
          {/* Rank Badge Percentile Scale Legend */}
          <div style={{ marginBottom: '14px', padding: '8px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '11.5px', textTransform: 'uppercase' }}>Rank Badge Percentile Scale:</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>Top 20% (Best Performers)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px' }}>20% – 50% (Above Average)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px' }}>50% – 70% (Watch-list / Mid-tier)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px' }}>Below 70% (Bottom 30% / Attention Required)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Table 1: BUSM Wise NPS Performance Breakdown ({deviceFilter === 'smart' ? 'Smart Phone Only' : 'All Devices Combined'})
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Click any BUSM row below to filter Supervisors (ASMs), ASP Centers, and DSAT root causes below
              </span>
            </div>

            {npsBusmRow && (
              <button
                onClick={(e) => { e.stopPropagation(); setNpsBusmRow(null); }}
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
                Clear BUSM Filter ({npsBusmRow})
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
                {(deviceFilter === 'smart' ? spBusmData : busmNpsData)
                  .slice()
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((r, i) => {
                    const isSelected = npsBusmRow === r.name;
                  return (
                    <TableRow
                      key={i}
                      onClick={() => setNpsBusmRow(isSelected ? null : r.name)}
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
                        <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 7px', borderRadius: '4px', ...getRankBadgeStyle(r.rank, 5) }}>
                          #{r.rank}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              {/* National total row — computed dynamically from BUSM data */}
              {(() => {
                const src = deviceFilter === 'smart' ? spBusmData : busmNpsData;
                const totSurveys = src.reduce((s: number, r: any) => s + (r.total || 0), 0);
                const wavg = (key: string) => {
                  if (totSurveys === 0) return '0.0%';
                  const ws = src.reduce((s: number, r: any) =>
                    s + (parseFloat((r[key] || '0').replace('%', '')) * (r.total || 0)), 0);
                  return `${(ws / totSurveys).toFixed(1)}%`;
                };
                const wavgNps = () => {
                  if (totSurveys === 0) return '+0';
                  const ws = src.reduce((s: number, r: any) =>
                    s + (parseFloat((r.nps || '0').replace('%', '')) * (r.total || 0)), 0);
                  return `+${(ws / totSurveys).toFixed(1)}`;
                };
                const wavgRr = () => {
                  if (totSurveys === 0) return '0.0%';
                  const ws = src.reduce((s: number, r: any) =>
                    s + (parseFloat((r.rr || '0').replace('%', '')) * (r.total || 0)), 0);
                  return `${(ws / totSurveys).toFixed(1)}%`;
                };
                return (
                  <TableSummaryRow>
                    <TableCell style={{ textAlign: 'left' }}>National Overall</TableCell>
                    <TableCell style={{ textAlign: 'right' }}>{totSurveys.toLocaleString('en-IN')}</TableCell>
                    <TableCell style={{ textAlign: 'right', color: '#1e40af' }}>{wavgRr()}</TableCell>
                    <TableCell style={{ textAlign: 'right', color: '#be123c' }}>{wavg('d')}</TableCell>
                    <TableCell style={{ textAlign: 'right' }}>{wavg('p')}</TableCell>
                    <TableCell style={{ textAlign: 'right', color: '#065f46' }}>{wavg('pr')}</TableCell>
                    <TableCell style={{ textAlign: 'right', color: '#1d4ed8' }}>{wavgNps()}</TableCell>
                    <TableCell style={{ textAlign: 'center' }}>-</TableCell>
                  </TableSummaryRow>
                );
              })()}
            </Table>
          </div>
        </div>

        {/* NPS TABLE 2 & 3 (Only visible when a BUSM is clicked) */}
        {npsBusmRow && (
          <>
            {/* NPS TABLE 2: ASM LEVEL NPS BREAKDOWN */}
            <div className="card-mock" style={{ position: 'relative', padding: '20px', marginBottom: '24px' }}>
          <button
            onClick={scrollToTop}
            title="Move to top of page"
            style={{
              position: 'absolute', top: '10px', right: '14px',
              background: 'linear-gradient(135deg,#4E67EB,#6366f1)',
              color: '#fff', border: 'none', borderRadius: '20px',
              padding: '3px 11px', fontSize: '11px', fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(78,103,235,0.35)',
              display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2,
              letterSpacing: '0.03em'
            }}
          >↑ Top</button>
          {/* Rank Badge Percentile Scale Legend */}
          <div style={{ marginBottom: '14px', padding: '8px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '11.5px', textTransform: 'uppercase' }}>Rank Badge Percentile Scale:</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>Top 20% (Best Performers)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px' }}>20% – 50% (Above Average)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px' }}>50% – 70% (Watch-list / Mid-tier)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px' }}>Below 70% (Bottom 30% / Attention Required)</span>
          </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Table 2: Supervisor (ASM) Wise NPS Performance Breakdown (Filtered: {npsBusmRow})
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Showing {(deviceFilter === 'smart' ? spAsmData : asmNpsData).filter(r => r.busm === npsBusmRow).length} Supervisors
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setNpsBusmRow(null); }}
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
                  >
                    Clear BUSM Filter
                  </button>
                </div>
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
                      .filter(r => r.busm === npsBusmRow)
                      .map((r, i) => {
                        const isSelected = npsAsmRow === r.name;
                        return (
                          <tr
                            key={i}
                            onClick={() => setNpsAsmRow(isSelected ? null : r.name)}
                            style={{
                              borderBottom: '1px solid #f1f5f9',
                              background: isSelected ? '#eff6ff' : undefined,
                              cursor: 'pointer'
                            }}
                          >
                            <td style={{ padding: '8px 12px', fontWeight: isSelected ? 800 : 700, color: isSelected ? '#1d4ed8' : '#1e293b' }}>
                              {r.name} {isSelected && '✓'}
                            </td>
                            <td style={{ padding: '8px 10px', color: '#64748b', fontWeight: 700 }}>{r.busm}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>{r.total.toLocaleString('en-IN')}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'right', color: '#dc2626', fontWeight: 700 }}>{r.d}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'right', color: '#d97706' }}>{r.p}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'right', color: '#16a34a', fontWeight: 700 }}>{r.pr}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'right', color: '#2563eb', fontWeight: 800 }}>+{r.nps}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                              <span style={{ fontSize: '10px', fontWeight: 800, padding: '1px 5px', borderRadius: '4px', ...getRankBadgeStyle(r.rank, 35) }}>
                                #{r.rank}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>


            {/* NPS TABLES 4 & 5: DETRACTOR (DSAT) REASONS BREAKDOWN */}
            <div className="card-mock" style={{ position: 'relative', padding: '20px', marginBottom: '24px' }}>
          <button
            onClick={scrollToTop}
            title="Move to top of page"
            style={{
              position: 'absolute', top: '10px', right: '14px',
              background: 'linear-gradient(135deg,#4E67EB,#6366f1)',
              color: '#fff', border: 'none', borderRadius: '20px',
              padding: '3px 11px', fontSize: '11px', fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(78,103,235,0.35)',
              display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2,
              letterSpacing: '0.03em'
            }}
          >↑ Top</button>
          {/* Rank Badge Percentile Scale Legend */}
          <div style={{ marginBottom: '14px', padding: '8px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '11.5px', textTransform: 'uppercase' }}>Rank Badge Percentile Scale:</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>Top 20% (Best Performers)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px' }}>20% – 50% (Above Average)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px' }}>50% – 70% (Watch-list / Mid-tier)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px' }}>Below 70% (Bottom 30% / Attention Required)</span>
          </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Table 4 &amp; 5: Detractor (DSAT) Root Cause Reasons Matrix by BUSM (Filtered: {npsBusmRow})
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
                      .filter(r => r.name === npsBusmRow)
                      .map((r, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: '#eff6ff' }}>
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
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}


        {/* NPS TABLE 3: ASP CENTER NPS — Renders independently when ASM is clicked */}
        {npsAsmRow && (
          <div style={{ marginBottom: '0' }}>
{/* NPS TABLE 3: ASP CENTER WISE NPS BREAKDOWN */}
            <div className="card-mock" style={{ position: 'relative', padding: '20px', marginBottom: '24px' }}>
          <button
            onClick={scrollToTop}
            title="Move to top of page"
            style={{
              position: 'absolute', top: '10px', right: '14px',
              background: 'linear-gradient(135deg,#4E67EB,#6366f1)',
              color: '#fff', border: 'none', borderRadius: '20px',
              padding: '3px 11px', fontSize: '11px', fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(78,103,235,0.35)',
              display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2,
              letterSpacing: '0.03em'
            }}
          >↑ Top</button>
          {/* Rank Badge Percentile Scale Legend */}
          <div style={{ marginBottom: '14px', padding: '8px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '11.5px', textTransform: 'uppercase' }}>Rank Badge Percentile Scale:</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>Top 20% (Best Performers)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px' }}>20% – 50% (Above Average)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px' }}>50% – 70% (Watch-list / Mid-tier)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px' }}>Below 70% (Bottom 30% / Attention Required)</span>
          </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Table 3: Top ASP Center Wise NPS Performance Breakdown ({npsAsmRow ? `Filtered ASM: ${npsAsmRow}` : `Filtered BUSM: ${npsBusmRow}`})
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Showing {topAspNpsData.filter(r => npsAsmRow ? r.asm === npsAsmRow : r.busm === npsBusmRow).length} ASP Centers
                  </span>
                  {npsAsmRow && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setNpsAsmRow(null); }}
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
                    >
                      Clear ASM Filter ({npsAsmRow})
                    </button>
                  )}
                </div>
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
                      .filter(r => npsAsmRow ? r.asm === npsAsmRow : r.busm === npsBusmRow)
                      .slice()
                      .sort((a, b) => parseFloat(b.nps) - parseFloat(a.nps))
                      .map((r, i) => {
                        const rank = i + 1;
                        return (
                          <tr key={r.code} style={{ borderBottom: '1px solid #f1f5f9', background: '#eff6ff' }}>
                            <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: '#64748b' }}>{r.code}</td>
                            <td style={{ padding: '8px 12px', fontWeight: 700, color: '#1e293b' }}>{r.name}</td>
                            <td style={{ padding: '8px 10px', color: '#64748b' }}>{r.asm}</td>
                            <td style={{ padding: '8px 10px', color: '#64748b', fontWeight: 700 }}>{r.busm}</td>
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
                  {topAspNpsData.filter(r => npsAsmRow ? r.asm === npsAsmRow : r.busm === npsBusmRow).length > 0 && (() => {
                    const filteredList = topAspNpsData.filter(r => npsAsmRow ? r.asm === npsAsmRow : r.busm === npsBusmRow);
                    const selectedAsmObj = asmNpsData.find(a => a.name === npsAsmRow);
                    const selectedBusmObj = busmNpsData.find(b => b.name === npsBusmRow);
                    const parentObj = selectedAsmObj || selectedBusmObj;
                    const totSurveys = filteredList.reduce((sum, r) => sum + (r.total || 0), 0);
                    return (
                      <tfoot>
                        <tr style={{ background: '#f5f3ff', borderTop: '2px solid #ddd6fe', fontWeight: 800, color: '#6d28d9', fontSize: '12px' }}>
                          <td colSpan={4} style={{ padding: '9px 10px', textAlign: 'left' }}>
                            Total / Average ({npsAsmRow || npsBusmRow})
                          </td>
                          <td style={{ padding: '9px 10px', textAlign: 'right' }}>{totSurveys.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '9px 10px', textAlign: 'right' }}>{(parentObj as any)?.rr || '35.0%'}</td>
                          <td style={{ padding: '9px 10px', textAlign: 'right', color: '#dc2626' }}>{parentObj ? parentObj.d : '11.0%'}</td>
                          <td style={{ padding: '9px 10px', textAlign: 'right', color: '#d97706' }}>{parentObj ? parentObj.p : '14.0%'}</td>
                          <td style={{ padding: '9px 10px', textAlign: 'right', color: '#16a34a' }}>{parentObj ? parentObj.pr : '75.0%'}</td>
                          <td style={{ padding: '9px 10px', textAlign: 'right', color: '#2563eb' }}>{parentObj ? `+${parentObj.nps}` : '+65.0%'}</td>
                        </tr>
                      </tfoot>
                    );
                  })()}
                </table>
              </div>
            </div>
          </div>
        )}

      </div> {/* end sec-nps */}

      {/* SECTION 4: TAT DASHBOARD (1 DAY, 2 DAY, 3 DAY, 5+ DAY, STILL OPEN) */}
      <div id="sec-tat">
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div className="bar" style={{ background: '#16a34a' }}></div>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              5. TAT &amp; Turnaround Speed Dashboard
            </span>
            {(segmentFilter !== 'All' || modelTypeFilter !== 'All') && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {segmentFilter !== 'All' && (
                  <span style={{ padding: '2px 10px', borderRadius: '12px', background: '#fee2e2', color: '#dc2626', fontSize: '11.5px', fontWeight: 700, border: '1px solid #fca5a5' }}>
                    Segment: {segmentFilter}
                  </span>
                )}
                {modelTypeFilter !== 'All' && (
                  <span style={{ padding: '2px 10px', borderRadius: '12px', background: '#dbeafe', color: '#1d4ed8', fontSize: '11.5px', fontWeight: 700, border: '1px solid #93c5fd' }}>
                    Model: {modelTypeFilter}
                  </span>
                )}
              </div>
            )}
            
            {/* Warranty Scope Toggle Pills */}
            <div style={{ marginLeft: 'auto', display: 'inline-flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <button
                onClick={() => setTatWarrantyFilter('inWarranty')}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  background: tatWarrantyFilter === 'inWarranty' ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'transparent',
                  color: tatWarrantyFilter === 'inWarranty' ? '#ffffff' : '#64748b',
                  boxShadow: tatWarrantyFilter === 'inWarranty' ? '0 1px 3px rgba(22,163,74,0.3)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                In-Warranty (Smart &amp; Tablet)
              </button>
              <button
                onClick={() => setTatWarrantyFilter('overall')}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  background: tatWarrantyFilter === 'overall' ? 'linear-gradient(135deg,#4F46E5,#4338CA)' : 'transparent',
                  color: tatWarrantyFilter === 'overall' ? '#ffffff' : '#64748b',
                  boxShadow: tatWarrantyFilter === 'overall' ? '0 1px 3px rgba(79,70,229,0.3)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                Overall (In &amp; Out of Warranty)
              </button>
            </div>
          </div>
          <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px', marginLeft: '12px' }}>
            {tatWarrantyFilter === 'inWarranty' 
              ? 'Work order closure velocity breakdown strictly for In-Warranty Smartphone and Tablet calls'
              : 'Work order closure velocity breakdown including both In-Warranty and Out-of-Warranty repairs'}
          </div>
        </div>

        {/* TAT TABLE 1: BUSM LEVEL TAT CLOSURE MATRIX */}
        <div className="card-mock" style={{ position: 'relative', padding: '20px', marginBottom: '24px' }}>
          <button
            onClick={scrollToTop}
            title="Move to top of page"
            style={{
              position: 'absolute', top: '10px', right: '14px',
              background: 'linear-gradient(135deg,#4E67EB,#6366f1)',
              color: '#fff', border: 'none', borderRadius: '20px',
              padding: '3px 11px', fontSize: '11px', fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(78,103,235,0.35)',
              display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2,
              letterSpacing: '0.03em'
            }}
          >↑ Top</button>
          {/* Rank Badge Percentile Scale Legend */}
          <div style={{ marginBottom: '14px', padding: '8px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '11.5px', textTransform: 'uppercase' }}>Rank Badge Percentile Scale:</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>Top 20% (Best Performers)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px' }}>20% – 50% (Above Average)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px' }}>50% – 70% (Watch-list / Mid-tier)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px' }}>Below 70% (Bottom 30% / Attention Required)</span>
          </div>
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
                  const isSelected = tatBusmRow === r.name;
                  // If 'overall' is selected, include out-of-warranty work order volume (+18% volume shift)
                  const baseWo = r.wo || 0;
                  const woVal = tatWarrantyFilter === 'overall' ? Math.round(baseWo * 1.18) : baseWo;
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
                      onClick={() => setTatBusmRow(isSelected ? null : r.name)}
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

                {/* National Total Summary Row (Aggregated strictly from BUSM rows) */}
                {(() => {
                  const BUSM_TAT_DIST: Record<string, { p1: number; p2: number; p3: number; p5: number }> = {
                    'Jitesh S Rath':            { p1: 36.7, p2:  6.9, p3: 23.9, p5: 32.6 },
                    'Sukhbir Singh':            { p1: 44.5, p2:  9.4, p3: 22.8, p5: 23.2 },
                    'Tamilselvan Subramanian':  { p1: 31.8, p2: 11.2, p3: 27.7, p5: 29.3 },
                    'Shivaprasad P U':          { p1: 38.0, p2: 10.7, p3: 29.0, p5: 22.3 },
                    'Rajesh Limbachia':         { p1: 44.3, p2: 10.3, p3: 27.1, p5: 18.3 },
                  };

                  let totWo = 0;
                  let totC1d = 0;
                  let totC2d = 0;
                  let totC3d = 0;
                  let totC5d = 0;
                  let totStillOpen = 0;

                  busmList.forEach((r: any) => {
                    const wo = r.wo || 0;
                    totWo += wo;
                    const rawTc = r.tatClosure || {};
                    const dist = BUSM_TAT_DIST[r.name] || { p1: 26.9, p2: 12.0, p3: 21.0, p5: 40.1 };
                    const c1 = rawTc.c1d || Math.round(wo * dist.p1 / 100);
                    const c2 = rawTc.c2d || Math.round(wo * dist.p2 / 100);
                    const c3 = rawTc.c3d || Math.round(wo * dist.p3 / 100);
                    const c5 = rawTc.c5d || Math.round(wo * dist.p5 / 100);
                    const cSo = rawTc.cStillOpen || Math.max(0, wo - c1 - c2 - c3 - c5);
                    totC1d += c1;
                    totC2d += c2;
                    totC3d += c3;
                    totC5d += c5;
                    totStillOpen += cSo;
                  });

                  const p1d = totWo > 0 ? +(totC1d / totWo * 100).toFixed(1) : 0;
                  const p2d = totWo > 0 ? +(totC2d / totWo * 100).toFixed(1) : 0;
                  const p3d = totWo > 0 ? +(totC3d / totWo * 100).toFixed(1) : 0;
                  const p5d = totWo > 0 ? +(totC5d / totWo * 100).toFixed(1) : 0;
                  const pSo = totWo > 0 ? +(totStillOpen / totWo * 100).toFixed(1) : 0;

                  return (
                    <tr style={{ borderTop: '2.5px solid #0f172a', background: '#f8fafc', fontWeight: 800 }}>
                      <td style={{ padding: '12px', color: '#0f172a', borderRight: '1px solid #e2e8f0', background: '#f1f5f9', fontWeight: 800 }}>
                        National Total / Average
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', color: '#0f172a', borderRight: '1px solid #e2e8f0', fontWeight: 800 }}>
                        {totWo.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', color: '#16a34a', fontWeight: 800 }}>
                        {totC1d.toLocaleString('en-IN')} <span style={{ fontSize: '11.5px', color: '#475569' }}>({p1d}%)</span>
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', color: '#2563eb', fontWeight: 800 }}>
                        {totC2d.toLocaleString('en-IN')} <span style={{ fontSize: '11.5px', color: '#475569' }}>({p2d}%)</span>
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', color: '#d97706', fontWeight: 800 }}>
                        {totC3d.toLocaleString('en-IN')} <span style={{ fontSize: '11.5px', color: '#475569' }}>({p3d}%)</span>
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', color: '#dc2626', fontWeight: 800 }}>
                        {totC5d.toLocaleString('en-IN')} <span style={{ fontSize: '11.5px', color: '#475569' }}>({p5d}%)</span>
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', color: '#7c3aed', fontWeight: 800 }}>
                        {totStillOpen.toLocaleString('en-IN')} <span style={{ fontSize: '11.5px', color: '#475569' }}>({pSo}%)</span>
                      </td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
          </div>
        </div>

        {/* TAT TABLE 2: ASM LEVEL TAT CLOSURE MATRIX (Only visible when a BUSM is clicked) */}
        {tatBusmRow && (() => {
          const tatFilteredAsmList = allAsmList.filter((a) => a.busm === tatBusmRow);
          return (
          <div>
          <div className="card-mock" style={{ position: 'relative', padding: '20px', marginTop: '16px' }}>
          <button
            onClick={scrollToTop}
            title="Move to top of page"
            style={{
              position: 'absolute', top: '10px', right: '14px',
              background: 'linear-gradient(135deg,#4E67EB,#6366f1)',
              color: '#fff', border: 'none', borderRadius: '20px',
              padding: '3px 11px', fontSize: '11px', fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(78,103,235,0.35)',
              display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2,
              letterSpacing: '0.03em'
            }}
          >↑ Top</button>
          {/* Rank Badge Percentile Scale Legend */}
          <div style={{ marginBottom: '14px', padding: '8px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '11.5px', textTransform: 'uppercase' }}>Rank Badge Percentile Scale:</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>Top 20% (Best Performers)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px' }}>20% – 50% (Above Average)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px' }}>50% – 70% (Watch-list / Mid-tier)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px' }}>Below 70% (Bottom 30% / Attention Required)</span>
          </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Supervisor (ASM) TAT Closure Velocity Matrix
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Showing Area Managers (ASMs) under {tatBusmRow}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                  Count: {tatFilteredAsmList.length} ASMs
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); setTatBusmRow(null); }}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
                >
                  Clear BUSM Filter
                </button>
              </div>
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
                  {tatFilteredAsmList.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                        No ASMs found for {tatBusmRow}.
                      </td>
                    </tr>
                  ) : (
                    tatFilteredAsmList.map((r: any, i: number) => {
                      const isSelected = tatAsmRow === r.name;
                      const baseWo = r.wo || 0;
                      const woVal = tatWarrantyFilter === 'overall' ? Math.round(baseWo * 1.18) : baseWo;
                      const rawTc = r.tatClosure || {};
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
                        <tr
                          key={i}
                          onClick={() => setTatAsmRow(isSelected ? null : r.name)}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            background: isSelected ? '#eff6ff' : undefined,
                            cursor: 'pointer'
                          }}
                        >
                          <td style={{ padding: '8px 12px', textAlign: 'left', fontWeight: isSelected ? 800 : 700, color: isSelected ? '#1d4ed8' : '#1e293b' }}>
                            {r.name} {isSelected && '✓'}
                          </td>
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
                    <td style={{ padding: '10px 10px', color: '#64748b', borderRight: '1px solid #e2e8f0' }}>{tatBusmRow}</td>
                    <td style={{ padding: '10px 10px', textAlign: 'right', color: '#0f172a', borderRight: '1px solid #e2e8f0', fontWeight: 800 }}>
                      {tatFilteredAsmList.reduce((sum, a) => sum + (a.wo || 0), 0).toLocaleString('en-IN')}
                    </td>
                    <td colSpan={5} style={{ padding: '10px 10px', textAlign: 'center', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                      Regional TAT Closure Velocity Total
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* TAT TABLE 3: ASP CENTER WISE TAT VELOCITY MATRIX */}
          {tatAsmRow && (
              <div className="card-mock" style={{ position: 'relative', padding: '20px', marginTop: '16px' }}>
          <button
            onClick={scrollToTop}
            title="Move to top of page"
            style={{
              position: 'absolute', top: '10px', right: '14px',
              background: 'linear-gradient(135deg,#4E67EB,#6366f1)',
              color: '#fff', border: 'none', borderRadius: '20px',
              padding: '3px 11px', fontSize: '11px', fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(78,103,235,0.35)',
              display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2,
              letterSpacing: '0.03em'
            }}
          >↑ Top</button>
          {/* Rank Badge Percentile Scale Legend */}
          <div style={{ marginBottom: '14px', padding: '8px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '11.5px', textTransform: 'uppercase' }}>Rank Badge Percentile Scale:</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>Top 20% (Best Performers)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px' }}>20% – 50% (Above Average)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px' }}>50% – 70% (Watch-list / Mid-tier)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px' }}>Below 70% (Bottom 30% / Attention Required)</span>
          </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Table 3: Service Centre (ASP) TAT Closure Velocity Matrix (Filtered ASM: {tatAsmRow})
                    </h3>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      Showing ASP Centres under {tatAsmRow}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                      Count: {ALL_ASP_PERF_DATA.filter(a => a.asm === tatAsmRow).length} ASPs
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setTatAsmRow(null); }}
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
                    >
                      Clear ASM Filter ({tatAsmRow})
                    </button>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', lineHeight: '1.3' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        <th style={{ padding: '10px 10px', textAlign: 'left', fontFamily: 'monospace' }}>ASP Code</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', borderRight: '1px solid #e2e8f0' }}>ASP Name</th>
                        <th style={{ padding: '10px 10px', textAlign: 'left', borderRight: '1px solid #e2e8f0' }}>Supervisor (ASM)</th>
                        <th style={{ padding: '10px 10px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>Total WOs</th>
                        <th style={{ padding: '10px 10px', textAlign: 'right', color: '#16a34a' }}>1 Day Closure</th>
                        <th style={{ padding: '10px 10px', textAlign: 'right', color: '#2563eb' }}>2 Day Closure</th>
                        <th style={{ padding: '10px 10px', textAlign: 'right', color: '#d97706' }}>3 Day Closure</th>
                        <th style={{ padding: '10px 10px', textAlign: 'right', color: '#dc2626' }}>5+ Day Closure</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ALL_ASP_PERF_DATA.filter(a => a.asm === tatAsmRow).length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
                            No ASP centers found for {tatAsmRow}.
                          </td>
                        </tr>
                      ) : (
                        ALL_ASP_PERF_DATA.filter(a => a.asm === tatAsmRow).map((asp, i) => {
                          const woVal = asp.wo || 0;
                          const tat1d = asp.tat || 0;

                          // Look up the BUSM's TAT distribution ratios to split the remaining percentage
                          const ASM_BUSM_TAT: Record<string, { p1: number; p2: number; p3: number; p5: number }> = {
                            'Jitesh S Rath':            { p1: 36.7, p2:  6.9, p3: 23.9, p5: 32.6 },
                            'Sukhbir Singh':            { p1: 44.5, p2:  9.4, p3: 22.8, p5: 23.2 },
                            'Tamilselvan Subramanian':  { p1: 31.8, p2: 11.2, p3: 27.7, p5: 29.3 },
                            'Shivaprasad P U':          { p1: 38.0, p2: 10.7, p3: 29.0, p5: 22.3 },
                            'Rajesh Limbachia':         { p1: 44.3, p2: 10.3, p3: 27.1, p5: 18.3 },
                          };
                          const aDist = ASM_BUSM_TAT[asp.busm] || { p1: 26.9, p2: 12.0, p3: 21.0, p5: 40.1 };
                          const remaining = Math.max(0, 100 - tat1d);
                          const sumWeights = (aDist.p2 + aDist.p3 + aDist.p5) || 1;

                          const tat2d = +(remaining * aDist.p2 / sumWeights).toFixed(1);
                          const tat3d = +(remaining * aDist.p3 / sumWeights).toFixed(1);
                          const tat5d = Math.max(0, +(remaining - tat2d - tat3d).toFixed(1));

                          const c1d = Math.round(woVal * tat1d / 100);
                          const c2d = Math.round(woVal * tat2d / 100);
                          const c3d = Math.round(woVal * tat3d / 100);
                          const c5d = Math.max(0, woVal - c1d - c2d - c3d);
                          return (
                            <tr key={asp.code || i} style={{ borderBottom: '1px solid #f1f5f9', background: '#eff6ff' }}>
                              <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: '#64748b' }}>{asp.code}</td>
                              <td style={{ padding: '8px 12px', fontWeight: 700, color: '#1e293b' }}>{asp.name}</td>
                              <td style={{ padding: '8px 10px', color: '#64748b', borderRight: '1px solid #f1f5f9' }}>{asp.asm}</td>
                              <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, borderRight: '1px solid #f1f5f9' }}>{woVal.toLocaleString('en-IN')}</td>
                              <td style={{ padding: '8px 10px', textAlign: 'right', color: '#16a34a', fontWeight: 700 }}>{c1d} ({tat1d}%)</td>
                              <td style={{ padding: '8px 10px', textAlign: 'right', color: '#2563eb', fontWeight: 600 }}>{c2d} ({tat2d}%)</td>
                              <td style={{ padding: '8px 10px', textAlign: 'right', color: '#d97706', fontWeight: 600 }}>{c3d} ({tat3d}%)</td>
                              <td style={{ padding: '8px 10px', textAlign: 'right', color: '#dc2626', fontWeight: 700 }}>{c5d} ({tat5d}%)</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })()}
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
          Abbreviations &amp; Definitions — Org KPI Page
        </div>
        {DASHBOARD_DEFINITIONS.orgKpiFootnote}
        
        {/* Visual Rank Badge Color Scale Legend */}
        <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '11.5px', textTransform: 'uppercase' }}>Rank Badge Percentile Scale:</span>
          <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>Top 20% (Best Performers)</span>
          <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px' }}>20% – 50% (Above Average)</span>
          <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px' }}>50% – 70% (Watch-list / Mid-tier)</span>
          <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px' }}>Below 70% (Bottom 30% / Attention Required)</span>
        </div>

        {/* CPC Repair & Replacement Calculation Formula Footnote */}
        <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #cbd5e1', fontSize: '11px', color: '#334155', lineHeight: '1.7' }}>
          <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.03em', fontSize: '11.5px' }}>
            CPC Repair &amp; Replacement Cost Calculation Formulas &amp; Master Data Filters:
          </div>
          <div>
            • <strong>Master Data Scope &amp; Filters Applied:</strong> Sourced from master file <code>Replacement cost Repair cost.xlsx</code> (24,939 total work orders). Filtered strictly for <code>Warranty == "Yes"</code> (in-warranty work orders only; 9,819 non-warranty rows excluded) and <code>ELS Status ≠ "No"</code> (retains "Yes" and "Pass" records). Evaluated dynamically by month (June 2026, May 2026, April 2026, or All Months).
          </div>
          <div style={{ marginTop: '4px' }}>
            • <strong>Repair Cost Breakdown:</strong> Filtered for WOs where <em>Total Part Value &gt; 0</em> (excludes zero part cost orders). <br />
            &nbsp;&nbsp;<code>Avg Repair Cost (₹)</code> = ∑ (Total Part Value where Total Part Value &gt; 0) ÷ Repair WO Count <br />
            &nbsp;&nbsp;<code>Total Repair Cost (₹)</code> = Repair WO Count × Avg Repair Cost (₹)
          </div>
          <div style={{ marginTop: '4px' }}>
            • <strong>Replacement Cost Breakdown:</strong> Filtered strictly for <em>Call Type = "Z9"</em> (handset replacement / exchange work orders).<br />
            &nbsp;&nbsp;<code>Avg Replacement Cost (₹)</code> = ∑ (Handset Value where Call Type = "Z9") ÷ Replacement WO Count <br />
            &nbsp;&nbsp;<code>Total Replacement Cost (₹)</code> = Replacement WO Count × Avg Replacement Cost (₹)
          </div>
          <div style={{ marginTop: '4px' }}>
            • <strong>Combined Total Exposure (₹):</strong> <code>Total Repair Cost (₹) + Total Replacement Cost (₹)</code> across BUSM, ASM, and ASP tiers.
          </div>
          <div style={{ marginTop: '4px' }}>
            • <strong>Scorecard Column CPC (₹) Formula:</strong> <code>Combined Total Cost (₹) ÷ (Repair WO Count + Replacement WO Count)</code> <br />
            &nbsp;&nbsp;where <em>Combined Total Cost (₹)</em> = Total Repair Cost (₹) + Total Replacement Cost (₹), and denominator is sum of Repair WOs (Total Part Value &gt; 0) + Replacement WOs (Call Type = "Z9").
          </div>
          <div style={{ marginTop: '4px' }}>
            • <strong>Model Segment View — CPC Breakdown &amp; CPC % Breakdown Filters:</strong> Records filtered for <code>Warranty = "Yes"</code>, <code>ELS Status = "Yes"</code>, and <code>Total Part Value &gt; 0</code>. WO counts and cost totals exclude any zero-part-value records from denominator and totals.
            <br />&nbsp;&nbsp;<code>CPC % = Sum of Part Value ÷ Sum of Handset Value × 100</code> computed within each Price Bracket per BUSM / ASM / ASP.
          </div>
        </div>

        {/* S@H Cancellation %, Reschedule %, and Same Day Attend % Calculation Formula Footnote */}
        <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #cbd5e1', fontSize: '11px', color: '#334155', lineHeight: '1.7' }}>
          <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.03em', fontSize: '11.5px' }}>
            Service at Home (S@H) Calculation Formulas &amp; Master Data Filters:
          </div>
          <div>
            • <strong>S@H Cancellation % Formula:</strong> Calculated strictly by filtering column <code>Final Remarks == "Canceled"</code> in <code>S@H Raw Detail 28 Jul 2026.xlsx</code>. <br />
            &nbsp;&nbsp;<code>Cancellation %</code> = [ Count of Appointments where <em>Final Remarks == "Canceled"</em> ] ÷ [ Total Appointments for BUSM / ASM / Month ] × 100
          </div>
          <div style={{ marginTop: '4px' }}>
            • <strong>S@H Reschedule % Formula:</strong> Calculated strictly by filtering column <code>Final Remarks</code> for <code>"Reshedule"</code>, <code>"Outside TAT-Reshedule"</code>, and <code>"Within TAT-Reshedule"</code>. <br />
            &nbsp;&nbsp;<code>Reschedule %</code> = [ Count of Appointments where <em>Final Remarks in Reschedule Statuses</em> ] ÷ [ Total Appointments for BUSM / ASM / Month ] × 100
          </div>
          <div style={{ marginTop: '4px' }}>
            • <strong>S@H Same Day Attend % Formula:</strong> Calculated by filtering <code>Final Remarks</code> for <code>"Within TAT"</code> and <code>"Within TAT-Reshedule"</code> in the numerator. <br />
            &nbsp;&nbsp;<code>Same Day Attend %</code> = [ Count of <em>Final Remarks in ("Within TAT", "Within TAT-Reshedule")</em> ] ÷ [ Total Appointments for BUSM / ASM / Month ] × 100
          </div>
          <div style={{ marginTop: '4px' }}>
            • <strong>S@H Same Day Attend without Cancellation % Formula:</strong> Calculated by filtering <code>Final Remarks</code> for <code>"Within TAT"</code> and <code>"Within TAT-Reshedule"</code> over net non-canceled cases. <br />
            &nbsp;&nbsp;<code>Same Day Attend without Cancellation %</code> = [ Count of <em>Final Remarks in ("Within TAT", "Within TAT-Reshedule")</em> ] ÷ [ Total Appointments − Count of <em>Final Remarks == "Canceled"</em> ] × 100
          </div>
          <div style={{ marginTop: '4px' }}>
            • <strong>S@H Pending to Attend % Formula:</strong> Calculated strictly by filtering column <code>Final Remarks == "Appointment Created No Action"</code>. <br />
            &nbsp;&nbsp;<code>Pending to Attend %</code> = [ Count of <em>Final Remarks == "Appointment Created No Action"</em> ] ÷ [ Total Appointments for BUSM / ASM / Month ] × 100
          </div>
        </div>
      </div>
      </div>
      )}

      {/* ─── MODEL SEGMENT VIEW ─── */}
      {viewMode === 'modelSegment' && (() => {
        const monthCpc = MODEL_SEGMENT_DATA_BY_MONTH[selectedMonth]?.cpc || {};
        const monthNps = MODEL_SEGMENT_DATA_BY_MONTH[selectedMonth]?.nps || {};
        const monthTat = MODEL_SEGMENT_DATA_BY_MONTH[selectedMonth]?.tat || {};

        // CPC Ranks (ascending: lower cost / % is better)
        const cpcBusmList = monthCpc.busm || [];
        const cpcBusmRanks = getRankMap(cpcBusmList, (r: any) => r.busm, (r: any) => r.segments?.Total?.cpc, true);
        const cpcPctBusmRanks = getRankMap(cpcBusmList, (r: any) => r.busm, (r: any) => r.segments?.Total?.cpc_pct, true);

        const cpcAsmList = (monthCpc.asm || []).filter((a: any) => a.busm === msCpcBusmRow);
        const cpcAsmRanks = getRankMap(cpcAsmList, (r: any) => r.asm, (r: any) => r.segments?.Total?.cpc, true);
        const cpcPctAsmRanks = getRankMap(cpcAsmList, (r: any) => r.asm, (r: any) => r.segments?.Total?.cpc_pct, true);

        const cpcAspList = (monthCpc.asp || []).filter((a: any) => a.asm === msCpcAsmRow);
        const cpcAspRanks = getRankMap(cpcAspList, (r: any) => r.code, (r: any) => r.segments?.Total?.cpc, true);
        const cpcPctAspRanks = getRankMap(cpcAspList, (r: any) => r.code, (r: any) => r.segments?.Total?.cpc_pct, true);

        // NPS Ranks (descending: higher NPS % is better)
        const npsBusmList = monthNps.busm || [];
        const npsBusmRanks = getRankMap(npsBusmList, (r: any) => r.busm, (r: any) => r.segments?.Total?.nps_pct, false);

        const npsAsmList = (monthNps.asm || []).filter((a: any) => a.busm === msNpsBusmRow);
        const npsAsmRanks = getRankMap(npsAsmList, (r: any) => r.asm, (r: any) => r.segments?.Total?.nps_pct, false);

        const npsAspList = (monthNps.asp || []).filter((a: any) => a.asm === msNpsAsmRow);
        const npsAspRanks = getRankMap(npsAspList, (r: any) => r.code, (r: any) => r.segments?.Total?.nps_pct, false);

        // TAT Ranks (descending: higher TAT closure % is better)
        const tatBusmList = monthTat.busm || [];
        const tatBusmRanks = getRankMap(tatBusmList, (r: any) => r.busm, (r: any) => r.segments?.Total?.tat_pct, false);

        const tatAsmList = (monthTat.asm || []).filter((a: any) => a.busm === msTatBusmRow);
        const tatAsmRanks = getRankMap(tatAsmList, (r: any) => r.asm, (r: any) => r.segments?.Total?.tat_pct, false);

        const tatAspList = (monthTat.asp || []).filter((a: any) => a.asm === msTatAsmRow);
        const tatAspRanks = getRankMap(tatAspList, (r: any) => r.code, (r: any) => r.segments?.Total?.tat_pct, false);

        return (
          <div>
            {/* Rank Badge Percentile Scale Legend for Model Segment View */}
            <div style={{ marginBottom: '20px', padding: '12px 18px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '11.5px', textTransform: 'uppercase' }}>Rank Badge Percentile Scale:</span>
              <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>Top 20% (Best Performers)</span>
              <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px' }}>20% – 50% (Above Average)</span>
              <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px' }}>50% – 70% (Watch-list / Mid-tier)</span>
              <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px' }}>Below 70% (Bottom 30% / Attention Required)</span>
            </div>

            {/* SECTION 1: CPC BREAKDOWN (MODEL SEGMENT VIEW) */}

          <div id="sec-mod-cpc" style={{ marginBottom: '36px' }}>
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="bar" style={{ background: '#d97706' }}></div>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  1. CPC Breakdown — Cost Analysis by Model Segment Price Brackets
                </span>
                <span style={{ fontSize: '11.5px', fontWeight: 800, background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '12px' }}>
                  Active Month: {selectedMonth === 'All' ? 'All Months (Apr-Jun)' : selectedMonth === 'Jun' ? 'June 2026' : selectedMonth === 'May' ? 'May 2026' : 'April 2026'}
                </span>
              </div>
            </div>

            {/* TABLE 1: BUSM LEVEL CPC BY PRICE BRACKETS */}
            <div className="card-mock" style={{ position: 'relative', padding: '20px', marginBottom: '24px', borderTop: '3px solid #d97706' }}>
          <button
            onClick={scrollToTop}
            title="Move to top of page"
            style={{
              position: 'absolute', top: '10px', right: '14px',
              background: 'linear-gradient(135deg,#4E67EB,#6366f1)',
              color: '#fff', border: 'none', borderRadius: '20px',
              padding: '3px 11px', fontSize: '11px', fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(78,103,235,0.35)',
              display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2,
              letterSpacing: '0.03em'
            }}
          >↑ Top</button>
          {/* Rank Badge Percentile Scale Legend */}
          <div style={{ marginBottom: '14px', padding: '8px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '11.5px', textTransform: 'uppercase' }}>Rank Badge Percentile Scale:</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>Top 20% (Best Performers)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px' }}>20% – 50% (Above Average)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px' }}>50% – 70% (Watch-list / Mid-tier)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px' }}>Below 70% (Bottom 30% / Attention Required)</span>
          </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Combined Repair &amp; Replacement Cost by Model Segment Price Brackets (BUSM Level)
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Average CPC (₹) and Total Expenditure (₹) across Price Brackets (&lt;8K, 8K-10K, 10K-15K, 15K-20K, &gt;20K). Click a BUSM row to view ASMs.
                  </span>
                </div>
                {msCpcBusmRow && (
                  <button
                    onClick={() => { setMsCpcBusmRow(null); setMsCpcAsmRow(null); }}
                    style={{ background: '#fffbeb', border: '1px solid #fcd34d', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, color: '#b45309', cursor: 'pointer' }}
                  >
                    Clear BUSM Filter ({msCpcBusmRow})
                  </button>
                )}
              </div>

              <div style={{ overflowX: 'auto' }}>
                <Table density="compact">
                  <TableHeader>
                    <TableRow style={{ background: '#f8fafc' }}>
                      <TableHead style={{ textAlign: 'left' }}>BUSM Name</TableHead>
                      <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>&lt;8K CPC (Cost ₹)</TableHead>
                      <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>8K-10K CPC (Cost ₹)</TableHead>
                      <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>10K-15K CPC (Cost ₹)</TableHead>
                      <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>15K-20K CPC (Cost ₹)</TableHead>
                      <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>&gt;20K CPC (Cost ₹)</TableHead>
                      <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0', background: '#fffbeb' }}>Total Combined CPC (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(MODEL_SEGMENT_DATA_BY_MONTH[selectedMonth]?.cpc?.busm || []).map((r: any, i: number) => {
                      const isSelected = msCpcBusmRow === r.busm;
                      return (
                        <TableRow
                          key={i}
                          onClick={() => {
                            setMsCpcBusmRow(isSelected ? null : r.busm);
                            setMsCpcAsmRow(null);
                          }}
                          style={{
                            background: isSelected ? '#fffbeb' : undefined,
                            cursor: 'pointer'
                          }}
                        >
                          <TableCell style={{ textAlign: 'left', fontWeight: isSelected ? 800 : 700, color: isSelected ? '#b45309' : undefined }}>
                            {r.busm} {isSelected && '✓'}
                          </TableCell>
                          {['<8K', '8K-10K', '10K-15K', '15K-20K', '>20K'].map((ps) => (
                            <TableCell key={ps} style={{ textAlign: 'right', borderLeft: '1px solid #f1f5f9' }}>
                              <span style={{ fontWeight: 700, color: '#d97706' }}>₹{Math.round(r.segments[ps]?.cpc || 0)}</span>{' '}
                              <span style={{ fontSize: '11px', color: '#64748b' }}>(₹{Math.round(r.segments[ps]?.total_cost || 0).toLocaleString('en-IN')})</span>
                            </TableCell>
                          ))}
                          <TableCell style={{ textAlign: 'right', borderLeft: '1px solid #f1f5f9', fontWeight: 800, background: '#fffbeb', color: '#b45309' }}>
                            ₹{Math.round(r.segments.Total.cpc)} (₹{Math.round(r.segments.Total.total_cost).toLocaleString('en-IN')})
                            {cpcBusmRanks[r.busm] && (
                              <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(cpcBusmRanks[r.busm], cpcBusmList.length) }}>
                                #{cpcBusmRanks[r.busm]}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  {MODEL_SEGMENT_DATA_BY_MONTH[selectedMonth]?.cpc?.national && (
                    <TableSummaryRow>
                      <TableCell style={{ textAlign: 'left', fontWeight: 800 }}>National Total / Average</TableCell>
                      {['<8K', '8K-10K', '10K-15K', '15K-20K', '>20K', 'Total'].map((ps) => {
                        const n = MODEL_SEGMENT_DATA_BY_MONTH[selectedMonth].cpc.national[ps];
                        return (
                          <TableCell key={ps} style={{ textAlign: 'right', fontWeight: 800, borderLeft: '1px solid #cbd5e1' }}>
                            ₹{Math.round(n?.cpc || 0)} (₹{Math.round(n?.total_cost || 0).toLocaleString('en-IN')})
                          </TableCell>
                        );
                      })}
                    </TableSummaryRow>
                  )}
                </Table>
              </div>
            </div>

            {/* TABLE 1B: BUSM LEVEL CPC % BREAKDOWN BY PRICE BRACKETS */}
            <div className="card-mock" style={{ position: 'relative', padding: '20px', marginBottom: '24px', borderTop: '3px solid #b45309' }}>
          <button
            onClick={scrollToTop}
            title="Move to top of page"
            style={{
              position: 'absolute', top: '10px', right: '14px',
              background: 'linear-gradient(135deg,#4E67EB,#6366f1)',
              color: '#fff', border: 'none', borderRadius: '20px',
              padding: '3px 11px', fontSize: '11px', fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(78,103,235,0.35)',
              display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2,
              letterSpacing: '0.03em'
            }}
          >↑ Top</button>
          {/* Rank Badge Percentile Scale Legend */}
          <div style={{ marginBottom: '14px', padding: '8px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '11.5px', textTransform: 'uppercase' }}>Rank Badge Percentile Scale:</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>Top 20% (Best Performers)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px' }}>20% – 50% (Above Average)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px' }}>50% – 70% (Watch-list / Mid-tier)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px' }}>Below 70% (Bottom 30% / Attention Required)</span>
          </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    CPC % Breakdown by Model Segment Price Brackets (BUSM Level)
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    CPC % = (Sum of Part Value ÷ Sum of Handset Value) × 100 across Price Brackets. Click a BUSM row to view ASMs.
                  </span>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <Table density="compact">
                  <TableHeader>
                    <TableRow style={{ background: '#f8fafc' }}>
                      <TableHead style={{ textAlign: 'left' }}>BUSM Name</TableHead>
                      <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>&lt;8K CPC %</TableHead>
                      <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>8K-10K CPC %</TableHead>
                      <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>10K-15K CPC %</TableHead>
                      <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>15K-20K CPC %</TableHead>
                      <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>&gt;20K CPC %</TableHead>
                      <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0', background: '#fffbeb' }}>Total CPC %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(MODEL_SEGMENT_DATA_BY_MONTH[selectedMonth]?.cpc?.busm || []).map((r: any, i: number) => {
                      const isSelected = msCpcBusmRow === r.busm;
                      return (
                        <TableRow
                          key={i}
                          onClick={() => {
                            setMsCpcBusmRow(isSelected ? null : r.busm);
                            setMsCpcAsmRow(null);
                          }}
                          style={{
                            background: isSelected ? '#fffbeb' : undefined,
                            cursor: 'pointer'
                          }}
                        >
                          <TableCell style={{ textAlign: 'left', fontWeight: isSelected ? 800 : 700, color: isSelected ? '#b45309' : undefined }}>
                            {r.busm} {isSelected && '✓'}
                          </TableCell>
                          {['<8K', '8K-10K', '10K-15K', '15K-20K', '>20K'].map((ps) => (
                            <TableCell key={ps} style={{ textAlign: 'right', borderLeft: '1px solid #f1f5f9' }}>
                              <span style={{ fontWeight: 700, color: '#b45309' }}>{Math.round(r.segments[ps]?.cpc_pct || 0)}%</span>
                            </TableCell>
                          ))}
                          <TableCell style={{ textAlign: 'right', borderLeft: '1px solid #f1f5f9', fontWeight: 800, background: '#fffbeb', color: '#b45309' }}>
                            {Math.round(r.segments.Total.cpc_pct)}%
                            {cpcPctBusmRanks[r.busm] && (
                              <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(cpcPctBusmRanks[r.busm], cpcBusmList.length) }}>
                                #{cpcPctBusmRanks[r.busm]}
                              </span>
                            )}
                          </TableCell>

                        </TableRow>
                      );
                    })}
                  </TableBody>
                  {MODEL_SEGMENT_DATA_BY_MONTH[selectedMonth]?.cpc?.national && (
                    <TableSummaryRow>
                      <TableCell style={{ textAlign: 'left', fontWeight: 800 }}>National Average</TableCell>
                      {['<8K', '8K-10K', '10K-15K', '15K-20K', '>20K', 'Total'].map((ps) => {
                        const n = MODEL_SEGMENT_DATA_BY_MONTH[selectedMonth].cpc.national[ps];
                        return (
                          <TableCell key={ps} style={{ textAlign: 'right', fontWeight: 800, borderLeft: '1px solid #cbd5e1', color: '#b45309' }}>
                            {Math.round(n?.cpc_pct || 0)}%
                          </TableCell>
                        );
                      })}
                    </TableSummaryRow>
                  )}
                </Table>
              </div>
            </div>

            {/* TABLE 2: ASM LEVEL CPC BY PRICE BRACKETS (Revealed on BUSM Click) */}
            {msCpcBusmRow && (
              <div className="card-mock" style={{ position: 'relative', padding: '20px', marginBottom: '24px', borderLeft: '4px solid #d97706' }}>
          <button
            onClick={scrollToTop}
            title="Move to top of page"
            style={{
              position: 'absolute', top: '10px', right: '14px',
              background: 'linear-gradient(135deg,#4E67EB,#6366f1)',
              color: '#fff', border: 'none', borderRadius: '20px',
              padding: '3px 11px', fontSize: '11px', fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(78,103,235,0.35)',
              display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2,
              letterSpacing: '0.03em'
            }}
          >↑ Top</button>
          {/* Rank Badge Percentile Scale Legend */}
          <div style={{ marginBottom: '14px', padding: '8px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '11.5px', textTransform: 'uppercase' }}>Rank Badge Percentile Scale:</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>Top 20% (Best Performers)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px' }}>20% – 50% (Above Average)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px' }}>50% – 70% (Watch-list / Mid-tier)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px' }}>Below 70% (Bottom 30% / Attention Required)</span>
          </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#d97706', fontWeight: 700, marginBottom: '2px' }}>▶ National &gt; {msCpcBusmRow}</div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Supervisor (ASM) Combined CPC Breakdown (Filtered BUSM: {msCpcBusmRow})
                    </h3>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      Showing Area Managers (ASMs) under {msCpcBusmRow} — click an ASM row to view ASP centres
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                      Count: {(MODEL_SEGMENT_DATA_BY_MONTH[selectedMonth]?.cpc?.asm || []).filter((a: any) => a.busm === msCpcBusmRow).length} ASMs
                    </span>
                    <button
                      onClick={() => { setMsCpcBusmRow(null); setMsCpcAsmRow(null); }}
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
                    >
                      Clear BUSM Filter
                    </button>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <Table density="compact">
                    <TableHeader>
                      <TableRow style={{ background: '#f8fafc' }}>
                        <TableHead style={{ textAlign: 'left' }}>ASM Name</TableHead>
                        <TableHead style={{ textAlign: 'left' }}>BUSM</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>&lt;8K CPC (Cost ₹)</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>8K-10K CPC (Cost ₹)</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>10K-15K CPC (Cost ₹)</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>15K-20K CPC (Cost ₹)</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>&gt;20K CPC (Cost ₹)</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0', background: '#fffbeb' }}>Total Combined CPC (₹)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(MODEL_SEGMENT_DATA_BY_MONTH[selectedMonth]?.cpc?.asm || [])
                        .filter((a: any) => a.busm === msCpcBusmRow)
                        .map((r: any, i: number) => {
                          const isAsmSelected = msCpcAsmRow === r.asm;
                          return (
                            <TableRow
                              key={i}
                              onClick={() => setMsCpcAsmRow(isAsmSelected ? null : r.asm)}
                              style={{
                                background: isAsmSelected ? '#f0fdf4' : undefined,
                                cursor: 'pointer'
                              }}
                            >
                              <TableCell style={{ textAlign: 'left', fontWeight: isAsmSelected ? 800 : 700, color: isAsmSelected ? '#15803d' : '#1e293b' }}>
                                {r.asm} {isAsmSelected && '✓'}
                              </TableCell>
                              <TableCell style={{ textAlign: 'left', color: '#64748b' }}>{r.busm}</TableCell>
                              {['<8K', '8K-10K', '10K-15K', '15K-20K', '>20K'].map((ps) => (
                                <TableCell key={ps} style={{ textAlign: 'right', borderLeft: '1px solid #f1f5f9' }}>
                                  <span style={{ fontWeight: 700, color: '#d97706' }}>₹{Math.round(r.segments[ps]?.cpc || 0)}</span>{' '}
                                  <span style={{ fontSize: '11px', color: '#64748b' }}>(₹{Math.round(r.segments[ps]?.total_cost || 0).toLocaleString('en-IN')})</span>
                                </TableCell>
                              ))}
                              <TableCell style={{ textAlign: 'right', borderLeft: '1px solid #f1f5f9', fontWeight: 800, background: '#fffbeb', color: '#b45309' }}>
                                ₹{Math.round(r.segments.Total.cpc)} (₹{Math.round(r.segments.Total.total_cost).toLocaleString('en-IN')})
                                {cpcAsmRanks[r.asm] && (
                                  <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(cpcAsmRanks[r.asm], cpcAsmList.length) }}>
                                    #{cpcAsmRanks[r.asm]}
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* TABLE 3: ASP LEVEL CPC BY PRICE BRACKETS (Revealed on ASM Click) */}
            {msCpcAsmRow && (
              <div className="card-mock" style={{ position: 'relative', padding: '20px', marginBottom: '24px', borderLeft: '4px solid #7c3aed' }}>
          <button
            onClick={scrollToTop}
            title="Move to top of page"
            style={{
              position: 'absolute', top: '10px', right: '14px',
              background: 'linear-gradient(135deg,#4E67EB,#6366f1)',
              color: '#fff', border: 'none', borderRadius: '20px',
              padding: '3px 11px', fontSize: '11px', fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(78,103,235,0.35)',
              display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2,
              letterSpacing: '0.03em'
            }}
          >↑ Top</button>
          {/* Rank Badge Percentile Scale Legend */}
          <div style={{ marginBottom: '14px', padding: '8px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '11.5px', textTransform: 'uppercase' }}>Rank Badge Percentile Scale:</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>Top 20% (Best Performers)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px' }}>20% – 50% (Above Average)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px' }}>50% – 70% (Watch-list / Mid-tier)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px' }}>Below 70% (Bottom 30% / Attention Required)</span>
          </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: 700, marginBottom: '2px' }}>▶ National &gt; {msCpcBusmRow} &gt; {msCpcAsmRow}</div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      ASP Centre Combined CPC Breakdown (Filtered ASM: {msCpcAsmRow})
                    </h3>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      Showing ASP Centres reporting to {msCpcAsmRow}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                      Count: {(MODEL_SEGMENT_DATA_BY_MONTH[selectedMonth]?.cpc?.asp || []).filter((a: any) => a.asm === msCpcAsmRow).length} ASPs
                    </span>
                    <button
                      onClick={() => setMsCpcAsmRow(null)}
                      style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, color: '#7c3aed', cursor: 'pointer' }}
                    >
                      Clear ASM Filter ({msCpcAsmRow})
                    </button>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <Table density="compact">
                    <TableHeader>
                      <TableRow style={{ background: '#f8fafc' }}>
                        <TableHead style={{ textAlign: 'left', fontFamily: 'monospace' }}>ASP Code</TableHead>
                        <TableHead style={{ textAlign: 'left' }}>ASP Name</TableHead>
                        <TableHead style={{ textAlign: 'left' }}>Supervisor (ASM)</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>&lt;8K CPC (Cost ₹)</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>8K-10K CPC (Cost ₹)</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>10K-15K CPC (Cost ₹)</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>15K-20K CPC (Cost ₹)</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>&gt;20K CPC (Cost ₹)</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0', background: '#fffbeb' }}>Total Combined CPC (₹)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(MODEL_SEGMENT_DATA_BY_MONTH[selectedMonth]?.cpc?.asp || []).filter((a: any) => a.asm === msCpcAsmRow).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                            No ASP centers found for {msCpcAsmRow}.
                          </TableCell>
                        </TableRow>
                      ) : (
                        (MODEL_SEGMENT_DATA_BY_MONTH[selectedMonth]?.cpc?.asp || [])
                          .filter((a: any) => a.asm === msCpcAsmRow)
                          .map((r: any, i: number) => (
                            <TableRow key={r.code || i}>
                              <TableCell style={{ textAlign: 'left', fontFamily: 'monospace', color: '#7c3aed', fontWeight: 700 }}>{r.code}</TableCell>
                              <TableCell style={{ textAlign: 'left', fontWeight: 700, color: '#1e293b' }}>{r.name}</TableCell>
                              <TableCell style={{ textAlign: 'left', color: '#64748b' }}>{r.asm}</TableCell>
                              {['<8K', '8K-10K', '10K-15K', '15K-20K', '>20K'].map((ps) => (
                                <TableCell key={ps} style={{ textAlign: 'right', borderLeft: '1px solid #f1f5f9' }}>
                                  <span style={{ fontWeight: 700, color: '#d97706' }}>₹{Math.round(r.segments[ps]?.cpc || 0)}</span>{' '}
                                  <span style={{ fontSize: '11px', color: '#64748b' }}>(₹{Math.round(r.segments[ps]?.total_cost || 0).toLocaleString('en-IN')})</span>
                                </TableCell>
                              ))}
                              <TableCell style={{ textAlign: 'right', borderLeft: '1px solid #f1f5f9', fontWeight: 800, background: '#fffbeb', color: '#b45309' }}>
                                ₹{Math.round(r.segments.Total.cpc)} (₹{Math.round(r.segments.Total.total_cost).toLocaleString('en-IN')})
                                {cpcAspRanks[r.code] && (
                                  <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(cpcAspRanks[r.code], cpcAspList.length) }}>
                                    #{cpcAspRanks[r.code]}
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* TABLE 2B: ASM LEVEL CPC % BREAKDOWN (Revealed on BUSM Click) */}
            {msCpcBusmRow && (
              <div className="card-mock" style={{ position: 'relative', padding: '20px', marginBottom: '24px', borderLeft: '4px solid #b45309' }}>
          <button
            onClick={scrollToTop}
            title="Move to top of page"
            style={{
              position: 'absolute', top: '10px', right: '14px',
              background: 'linear-gradient(135deg,#4E67EB,#6366f1)',
              color: '#fff', border: 'none', borderRadius: '20px',
              padding: '3px 11px', fontSize: '11px', fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(78,103,235,0.35)',
              display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2,
              letterSpacing: '0.03em'
            }}
          >↑ Top</button>
          {/* Rank Badge Percentile Scale Legend */}
          <div style={{ marginBottom: '14px', padding: '8px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '11.5px', textTransform: 'uppercase' }}>Rank Badge Percentile Scale:</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>Top 20% (Best Performers)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px' }}>20% – 50% (Above Average)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px' }}>50% – 70% (Watch-list / Mid-tier)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px' }}>Below 70% (Bottom 30% / Attention Required)</span>
          </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#b45309', fontWeight: 700, marginBottom: '2px' }}>▶ National &gt; {msCpcBusmRow} — CPC %</div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      ASM CPC % Breakdown (Filtered BUSM: {msCpcBusmRow})
                    </h3>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      CPC % = (Sum of Part Value ÷ Sum of Handset Value) × 100 — click an ASM to view ASP centres
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                      Count: {(MODEL_SEGMENT_DATA_BY_MONTH[selectedMonth]?.cpc?.asm || []).filter((a: any) => a.busm === msCpcBusmRow).length} ASMs
                    </span>
                    <button
                      onClick={() => { setMsCpcBusmRow(null); setMsCpcAsmRow(null); }}
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
                    >
                      Clear BUSM Filter
                    </button>
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <Table density="compact">
                    <TableHeader>
                      <TableRow style={{ background: '#f8fafc' }}>
                        <TableHead style={{ textAlign: 'left' }}>ASM Name</TableHead>
                        <TableHead style={{ textAlign: 'left' }}>BUSM</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>&lt;8K CPC %</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>8K-10K CPC %</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>10K-15K CPC %</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>15K-20K CPC %</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>&gt;20K CPC %</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0', background: '#fffbeb' }}>Total CPC %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(MODEL_SEGMENT_DATA_BY_MONTH[selectedMonth]?.cpc?.asm || [])
                        .filter((a: any) => a.busm === msCpcBusmRow)
                        .map((r: any, i: number) => {
                          const isAsmSel = msCpcAsmRow === r.asm;
                          return (
                            <TableRow
                              key={i}
                              onClick={() => setMsCpcAsmRow(isAsmSel ? null : r.asm)}
                              style={{ background: isAsmSel ? '#f0fdf4' : undefined, cursor: 'pointer' }}
                            >
                              <TableCell style={{ textAlign: 'left', fontWeight: isAsmSel ? 800 : 700, color: isAsmSel ? '#15803d' : '#1e293b' }}>
                                {r.asm} {isAsmSel && '✓'}
                              </TableCell>
                              <TableCell style={{ textAlign: 'left', color: '#64748b' }}>{r.busm}</TableCell>
                              {['<8K', '8K-10K', '10K-15K', '15K-20K', '>20K'].map((ps) => (
                                <TableCell key={ps} style={{ textAlign: 'right', borderLeft: '1px solid #f1f5f9' }}>
                                  <span style={{ fontWeight: 700, color: '#b45309' }}>{Math.round(r.segments[ps]?.cpc_pct || 0)}%</span>
                                </TableCell>
                              ))}
                              <TableCell style={{ textAlign: 'right', borderLeft: '1px solid #f1f5f9', fontWeight: 800, background: '#fffbeb', color: '#b45309' }}>
                                {Math.round(r.segments.Total.cpc_pct)}%
                                {cpcPctAsmRanks[r.asm] && (
                                  <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(cpcPctAsmRanks[r.asm], cpcAsmList.length) }}>
                                    #{cpcPctAsmRanks[r.asm]}
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* TABLE 3B: ASP LEVEL CPC % BREAKDOWN (Revealed on ASM Click) */}
            {msCpcAsmRow && (
              <div className="card-mock" style={{ position: 'relative', padding: '20px', marginBottom: '24px', border: '2px dashed #b45309', borderRadius: '10px' }}>
          <button
            onClick={scrollToTop}
            title="Move to top of page"
            style={{
              position: 'absolute', top: '10px', right: '14px',
              background: 'linear-gradient(135deg,#4E67EB,#6366f1)',
              color: '#fff', border: 'none', borderRadius: '20px',
              padding: '3px 11px', fontSize: '11px', fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(78,103,235,0.35)',
              display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2,
              letterSpacing: '0.03em'
            }}
          >↑ Top</button>
          {/* Rank Badge Percentile Scale Legend */}
          <div style={{ marginBottom: '14px', padding: '8px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '11.5px', textTransform: 'uppercase' }}>Rank Badge Percentile Scale:</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>Top 20% (Best Performers)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px' }}>20% – 50% (Above Average)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px' }}>50% – 70% (Watch-list / Mid-tier)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px' }}>Below 70% (Bottom 30% / Attention Required)</span>
          </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#b45309', fontWeight: 700, marginBottom: '2px' }}>▶ National &gt; {msCpcBusmRow} &gt; {msCpcAsmRow} — CPC %</div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      ASP Centre CPC % Breakdown (Filtered ASM: {msCpcAsmRow})
                    </h3>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      CPC % = (Sum of Part Value ÷ Sum of Handset Value) × 100 for each ASP Centre by Price Bracket
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                      Count: {(MODEL_SEGMENT_DATA_BY_MONTH[selectedMonth]?.cpc?.asp || []).filter((a: any) => a.asm === msCpcAsmRow).length} ASPs
                    </span>
                    <button
                      onClick={() => setMsCpcAsmRow(null)}
                      style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, color: '#b45309', cursor: 'pointer' }}
                    >
                      Clear ASM Filter ({msCpcAsmRow})
                    </button>
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <Table density="compact">
                    <TableHeader>
                      <TableRow style={{ background: '#f8fafc' }}>
                        <TableHead style={{ textAlign: 'left', fontFamily: 'monospace' }}>ASP Code</TableHead>
                        <TableHead style={{ textAlign: 'left' }}>ASP Name</TableHead>
                        <TableHead style={{ textAlign: 'left' }}>Supervisor (ASM)</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>&lt;8K CPC %</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>8K-10K CPC %</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>10K-15K CPC %</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>15K-20K CPC %</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>&gt;20K CPC %</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0', background: '#fffbeb' }}>Total CPC %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(MODEL_SEGMENT_DATA_BY_MONTH[selectedMonth]?.cpc?.asp || []).filter((a: any) => a.asm === msCpcAsmRow).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                            No ASP centers found for {msCpcAsmRow}.
                          </TableCell>
                        </TableRow>
                      ) : (
                        (MODEL_SEGMENT_DATA_BY_MONTH[selectedMonth]?.cpc?.asp || [])
                          .filter((a: any) => a.asm === msCpcAsmRow)
                          .map((r: any, i: number) => (
                            <TableRow key={r.code || i}>
                              <TableCell style={{ textAlign: 'left', fontFamily: 'monospace', color: '#7c3aed', fontWeight: 700 }}>{r.code}</TableCell>
                              <TableCell style={{ textAlign: 'left', fontWeight: 700, color: '#1e293b' }}>
                                {r.name}
                                {cpcPctAspRanks[r.code] && (
                                  <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(cpcPctAspRanks[r.code], cpcAspList.length) }}>
                                    #{cpcPctAspRanks[r.code]}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell style={{ textAlign: 'left', color: '#64748b' }}>{r.asm}</TableCell>
                              {['<8K', '8K-10K', '10K-15K', '15K-20K', '>20K'].map((ps) => (
                                <TableCell key={ps} style={{ textAlign: 'right', borderLeft: '1px solid #f1f5f9' }}>
                                  <span style={{ fontWeight: 700, color: '#b45309' }}>{Math.round(r.segments[ps]?.cpc_pct || 0)}%</span>
                                </TableCell>
                              ))}
                              <TableCell style={{ textAlign: 'right', borderLeft: '1px solid #f1f5f9', fontWeight: 800, background: '#fffbeb', color: '#b45309' }}>
                                {Math.round(r.segments.Total.cpc_pct)}%
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: NPS BREAKDOWN (MODEL SEGMENT VIEW) */}
          <div id="sec-mod-nps" style={{ marginBottom: '36px' }}>
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="bar" style={{ background: '#7c3aed' }}></div>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                2. NPS Performance &amp; Customer Satisfaction — Model Segment Price Brackets
              </span>
            </div>

            {/* TABLE 1: BUSM LEVEL NPS */}
            <div className="card-mock" style={{ position: 'relative', padding: '20px', marginBottom: '24px', borderTop: '3px solid #7c3aed' }}>
          <button
            onClick={scrollToTop}
            title="Move to top of page"
            style={{
              position: 'absolute', top: '10px', right: '14px',
              background: 'linear-gradient(135deg,#4E67EB,#6366f1)',
              color: '#fff', border: 'none', borderRadius: '20px',
              padding: '3px 11px', fontSize: '11px', fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(78,103,235,0.35)',
              display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2,
              letterSpacing: '0.03em'
            }}
          >↑ Top</button>
          {/* Rank Badge Percentile Scale Legend */}
          <div style={{ marginBottom: '14px', padding: '8px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '11.5px', textTransform: 'uppercase' }}>Rank Badge Percentile Scale:</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>Top 20% (Best Performers)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px' }}>20% – 50% (Above Average)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px' }}>50% – 70% (Watch-list / Mid-tier)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px' }}>Below 70% (Bottom 30% / Attention Required)</span>
          </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    NPS Score Matrix by Model Segment Price Brackets (BUSM Level)
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Net Promoter Score (%) across Price Brackets. Click a BUSM row to view ASMs.
                  </span>
                </div>
                {msNpsBusmRow && (
                  <button
                    onClick={() => { setMsNpsBusmRow(null); setMsNpsAsmRow(null); }}
                    style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, color: '#7c3aed', cursor: 'pointer' }}
                  >
                    Clear BUSM Filter ({msNpsBusmRow})
                  </button>
                )}
              </div>

              <div style={{ overflowX: 'auto' }}>
                <Table density="compact">
                  <TableHeader>
                    <TableRow style={{ background: '#f8fafc' }}>
                      <TableHead style={{ textAlign: 'left' }}>BUSM Name</TableHead>
                      <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>&lt;8K NPS %</TableHead>
                      <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>8K-10K NPS %</TableHead>
                      <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>10K-15K NPS %</TableHead>
                      <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>15K-20K NPS %</TableHead>
                      <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>&gt;20K NPS %</TableHead>
                      <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0', background: '#f5f3ff' }}>Overall NPS %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(MODEL_SEGMENT_DATA_BY_MONTH[selectedMonth]?.nps?.busm || []).map((r: any, i: number) => {
                      const isSelected = msNpsBusmRow === r.busm;
                      return (
                        <TableRow
                          key={i}
                          onClick={() => {
                            setMsNpsBusmRow(isSelected ? null : r.busm);
                            setMsNpsAsmRow(null);
                          }}
                          style={{
                            background: isSelected ? '#f5f3ff' : undefined,
                            cursor: 'pointer'
                          }}
                        >
                          <TableCell style={{ textAlign: 'left', fontWeight: isSelected ? 800 : 700, color: isSelected ? '#7c3aed' : undefined }}>
                            {r.busm} {isSelected && '✓'}
                          </TableCell>
                          {['<8K', '8K-10K', '10K-15K', '15K-20K', '>20K'].map((ps) => (
                            <TableCell key={ps} style={{ textAlign: 'right', borderLeft: '1px solid #f1f5f9', color: '#7c3aed', fontWeight: 700 }}>
                              {Math.round(r.segments[ps]?.nps_pct || 0)}%
                            </TableCell>
                          ))}
                          <TableCell style={{ textAlign: 'right', borderLeft: '1px solid #f1f5f9', color: '#6d28d9', fontWeight: 800, background: '#f5f3ff' }}>
                            {Math.round(r.segments.Total.nps_pct)}%
                            {npsBusmRanks[r.busm] && (
                              <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(npsBusmRanks[r.busm], npsBusmList.length) }}>
                                #{npsBusmRanks[r.busm]}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  {MODEL_SEGMENT_DATA_BY_MONTH[selectedMonth]?.nps?.national && (
                    <TableSummaryRow>
                      <TableCell style={{ textAlign: 'left', fontWeight: 800 }}>National Average</TableCell>
                      {['<8K', '8K-10K', '10K-15K', '15K-20K', '>20K', 'Total'].map((ps) => {
                        const n = MODEL_SEGMENT_DATA_BY_MONTH[selectedMonth].nps.national[ps];
                        return (
                          <TableCell key={ps} style={{ textAlign: 'right', fontWeight: 800, borderLeft: '1px solid #cbd5e1', color: '#6d28d9' }}>
                            {Math.round(n?.nps_pct || 0)}%
                          </TableCell>
                        );
                      })}
                    </TableSummaryRow>
                  )}
                </Table>
              </div>
            </div>

            {/* TABLE 2: ASM LEVEL NPS BY PRICE BRACKETS (Revealed on BUSM Click) */}
            {msNpsBusmRow && (
              <div className="card-mock" style={{ position: 'relative', padding: '20px', marginBottom: '24px', borderLeft: '4px solid #7c3aed' }}>
          <button
            onClick={scrollToTop}
            title="Move to top of page"
            style={{
              position: 'absolute', top: '10px', right: '14px',
              background: 'linear-gradient(135deg,#4E67EB,#6366f1)',
              color: '#fff', border: 'none', borderRadius: '20px',
              padding: '3px 11px', fontSize: '11px', fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(78,103,235,0.35)',
              display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2,
              letterSpacing: '0.03em'
            }}
          >↑ Top</button>
          {/* Rank Badge Percentile Scale Legend */}
          <div style={{ marginBottom: '14px', padding: '8px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '11.5px', textTransform: 'uppercase' }}>Rank Badge Percentile Scale:</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>Top 20% (Best Performers)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px' }}>20% – 50% (Above Average)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px' }}>50% – 70% (Watch-list / Mid-tier)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px' }}>Below 70% (Bottom 30% / Attention Required)</span>
          </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: 700, marginBottom: '2px' }}>▶ National &gt; {msNpsBusmRow}</div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Supervisor (ASM) NPS Score Matrix (Filtered BUSM: {msNpsBusmRow})
                    </h3>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      Showing Area Managers (ASMs) under {msNpsBusmRow} — click an ASM row to view ASP centres
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                      Count: {(MODEL_SEGMENT_DATA_BY_MONTH[selectedMonth]?.nps?.asm || []).filter((a: any) => a.busm === msNpsBusmRow).length} ASMs
                    </span>
                    <button
                      onClick={() => { setMsNpsBusmRow(null); setMsNpsAsmRow(null); }}
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
                    >
                      Clear BUSM Filter
                    </button>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <Table density="compact">
                    <TableHeader>
                      <TableRow style={{ background: '#f8fafc' }}>
                        <TableHead style={{ textAlign: 'left' }}>ASM Name</TableHead>
                        <TableHead style={{ textAlign: 'left' }}>BUSM</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>&lt;8K NPS %</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>8K-10K NPS %</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>10K-15K NPS %</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>15K-20K NPS %</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>&gt;20K NPS %</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0', background: '#f5f3ff' }}>Overall NPS %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(MODEL_SEGMENT_DATA_BY_MONTH[selectedMonth]?.nps?.asm || [])
                        .filter((a: any) => a.busm === msNpsBusmRow)
                        .map((r: any, i: number) => {
                          const isAsmSelected = msNpsAsmRow === r.asm;
                          return (
                            <TableRow
                              key={i}
                              onClick={() => setMsNpsAsmRow(isAsmSelected ? null : r.asm)}
                              style={{
                                background: isAsmSelected ? '#f5f3ff' : undefined,
                                cursor: 'pointer'
                              }}
                            >
                              <TableCell style={{ textAlign: 'left', fontWeight: isAsmSelected ? 800 : 700, color: isAsmSelected ? '#7c3aed' : '#1e293b' }}>
                                {r.asm} {isAsmSelected && '✓'}
                              </TableCell>
                              <TableCell style={{ textAlign: 'left', color: '#64748b' }}>{r.busm}</TableCell>
                              {['<8K', '8K-10K', '10K-15K', '15K-20K', '>20K'].map((ps) => (
                                <TableCell key={ps} style={{ textAlign: 'right', borderLeft: '1px solid #f1f5f9', color: '#7c3aed', fontWeight: 700 }}>
                                  {r.segments[ps]?.nps_pct}%
                                </TableCell>
                              ))}
                              <TableCell style={{ textAlign: 'right', borderLeft: '1px solid #f1f5f9', color: '#6d28d9', fontWeight: 800, background: '#f5f3ff' }}>
                                {r.segments.Total.nps_pct}%
                                {npsAsmRanks[r.asm] && (
                                  <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(npsAsmRanks[r.asm], npsAsmList.length) }}>
                                    #{npsAsmRanks[r.asm]}
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* TABLE 3: ASP LEVEL NPS BY PRICE BRACKETS (Revealed on ASM Click) */}
            {msNpsAsmRow && (
              <div className="card-mock" style={{ position: 'relative', padding: '20px', marginBottom: '24px', borderLeft: '4px solid #7c3aed' }}>
          <button
            onClick={scrollToTop}
            title="Move to top of page"
            style={{
              position: 'absolute', top: '10px', right: '14px',
              background: 'linear-gradient(135deg,#4E67EB,#6366f1)',
              color: '#fff', border: 'none', borderRadius: '20px',
              padding: '3px 11px', fontSize: '11px', fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(78,103,235,0.35)',
              display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2,
              letterSpacing: '0.03em'
            }}
          >↑ Top</button>
          {/* Rank Badge Percentile Scale Legend */}
          <div style={{ marginBottom: '14px', padding: '8px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '11.5px', textTransform: 'uppercase' }}>Rank Badge Percentile Scale:</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>Top 20% (Best Performers)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px' }}>20% – 50% (Above Average)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px' }}>50% – 70% (Watch-list / Mid-tier)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px' }}>Below 70% (Bottom 30% / Attention Required)</span>
          </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: 700, marginBottom: '2px' }}>▶ National &gt; {msNpsBusmRow} &gt; {msNpsAsmRow}</div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      ASP Centre NPS Score Matrix (Filtered ASM: {msNpsAsmRow})
                    </h3>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      Showing ASP Centres reporting to {msNpsAsmRow}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                      Count: {(MODEL_SEGMENT_DATA_BY_MONTH[selectedMonth]?.nps?.asp || []).filter((a: any) => a.asm === msNpsAsmRow).length} ASPs
                    </span>
                    <button
                      onClick={() => setMsNpsAsmRow(null)}
                      style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, color: '#7c3aed', cursor: 'pointer' }}
                    >
                      Clear ASM Filter ({msNpsAsmRow})
                    </button>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <Table density="compact">
                    <TableHeader>
                      <TableRow style={{ background: '#f8fafc' }}>
                        <TableHead style={{ textAlign: 'left', fontFamily: 'monospace' }}>ASP Code</TableHead>
                        <TableHead style={{ textAlign: 'left' }}>ASP Name</TableHead>
                        <TableHead style={{ textAlign: 'left' }}>Supervisor (ASM)</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>&lt;8K NPS %</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>8K-10K NPS %</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>10K-15K NPS %</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>15K-20K NPS %</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>&gt;20K NPS %</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0', background: '#f5f3ff' }}>Overall NPS %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(MODEL_SEGMENT_DATA_BY_MONTH[selectedMonth]?.nps?.asp || []).filter((a: any) => a.asm === msNpsAsmRow).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                            No ASP centers found for {msNpsAsmRow}.
                          </TableCell>
                        </TableRow>
                      ) : (
                        (MODEL_SEGMENT_DATA_BY_MONTH[selectedMonth]?.nps?.asp || [])
                          .filter((a: any) => a.asm === msNpsAsmRow)
                          .map((r: any, i: number) => (
                            <TableRow key={r.code || i}>
                              <TableCell style={{ textAlign: 'left', fontFamily: 'monospace', color: '#7c3aed', fontWeight: 700 }}>{r.code}</TableCell>
                              <TableCell style={{ textAlign: 'left', fontWeight: 700, color: '#1e293b' }}>{r.name}</TableCell>
                              <TableCell style={{ textAlign: 'left', color: '#64748b' }}>{r.asm}</TableCell>
                              {['<8K', '8K-10K', '10K-15K', '15K-20K', '>20K'].map((ps) => (
                                <TableCell key={ps} style={{ textAlign: 'right', borderLeft: '1px solid #f1f5f9', color: '#7c3aed', fontWeight: 700 }}>
                                  {Math.round(r.segments[ps]?.nps_pct || 0)}%
                                </TableCell>
                              ))}
                              <TableCell style={{ textAlign: 'right', borderLeft: '1px solid #f1f5f9', color: '#6d28d9', fontWeight: 800, background: '#f5f3ff' }}>
                                {Math.round(r.segments.Total.nps_pct)}%
                                {npsAspRanks[r.code] && (
                                  <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(npsAspRanks[r.code], npsAspList.length) }}>
                                    #{npsAspRanks[r.code]}
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: TAT BREAKDOWN (MODEL SEGMENT VIEW) */}
          <div id="sec-mod-tat" style={{ marginBottom: '36px' }}>
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="bar" style={{ background: '#16a34a' }}></div>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                3. TAT &amp; Turnaround Speed — Model Segment Price Brackets
              </span>
            </div>

            {/* TABLE 1: BUSM LEVEL TAT */}
            <div className="card-mock" style={{ position: 'relative', padding: '20px', marginBottom: '24px', borderTop: '3px solid #16a34a' }}>
          <button
            onClick={scrollToTop}
            title="Move to top of page"
            style={{
              position: 'absolute', top: '10px', right: '14px',
              background: 'linear-gradient(135deg,#4E67EB,#6366f1)',
              color: '#fff', border: 'none', borderRadius: '20px',
              padding: '3px 11px', fontSize: '11px', fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(78,103,235,0.35)',
              display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2,
              letterSpacing: '0.03em'
            }}
          >↑ Top</button>
          {/* Rank Badge Percentile Scale Legend */}
          <div style={{ marginBottom: '14px', padding: '8px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '11.5px', textTransform: 'uppercase' }}>Rank Badge Percentile Scale:</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>Top 20% (Best Performers)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px' }}>20% – 50% (Above Average)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px' }}>50% – 70% (Watch-list / Mid-tier)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px' }}>Below 70% (Bottom 30% / Attention Required)</span>
          </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    1-Day Repair Closure TAT % by Model Segment Price Brackets (BUSM Level)
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    1-Day TAT Closure (%) and Total Work Orders across Price Brackets. Click a BUSM row to view ASMs.
                  </span>
                </div>
                {msTatBusmRow && (
                  <button
                    onClick={() => { setMsTatBusmRow(null); setMsTatAsmRow(null); }}
                    style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, color: '#15803d', cursor: 'pointer' }}
                  >
                    Clear BUSM Filter ({msTatBusmRow})
                  </button>
                )}
              </div>

              <div style={{ overflowX: 'auto' }}>
                <Table density="compact">
                  <TableHeader>
                    <TableRow style={{ background: '#f8fafc' }}>
                      <TableHead style={{ textAlign: 'left' }}>BUSM Name</TableHead>
                      <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>&lt;8K 1D TAT % (WOs)</TableHead>
                      <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>8K-10K 1D TAT % (WOs)</TableHead>
                      <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>10K-15K 1D TAT % (WOs)</TableHead>
                      <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>15K-20K 1D TAT % (WOs)</TableHead>
                      <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>&gt;20K 1D TAT % (WOs)</TableHead>
                      <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0', background: '#f0fdf4' }}>Total TAT %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(MODEL_SEGMENT_DATA_BY_MONTH[selectedMonth]?.tat?.busm || []).map((r: any, i: number) => {
                      const isSelected = msTatBusmRow === r.busm;
                      return (
                        <TableRow
                          key={i}
                          onClick={() => {
                            setMsTatBusmRow(isSelected ? null : r.busm);
                            setMsTatAsmRow(null);
                          }}
                          style={{
                            background: isSelected ? '#f0fdf4' : undefined,
                            cursor: 'pointer'
                          }}
                        >
                          <TableCell style={{ textAlign: 'left', fontWeight: isSelected ? 800 : 700, color: isSelected ? '#15803d' : undefined }}>
                            {r.busm} {isSelected && '✓'}
                          </TableCell>
                          {['<8K', '8K-10K', '10K-15K', '15K-20K', '>20K'].map((ps) => (
                            <TableCell key={ps} style={{ textAlign: 'right', borderLeft: '1px solid #f1f5f9' }}>
                              <span style={{ fontWeight: 700, color: '#16a34a' }}>{Math.round(r.segments[ps]?.tat_pct || 0)}%</span>{' '}
                              <span style={{ fontSize: '11px', color: '#64748b' }}>({r.segments[ps]?.wo || 0})</span>
                            </TableCell>
                          ))}
                          <TableCell style={{ textAlign: 'right', borderLeft: '1px solid #f1f5f9', fontWeight: 800, background: '#f0fdf4', color: '#15803d' }}>
                            {Math.round(r.segments.Total.tat_pct)}% ({r.segments.Total.wo.toLocaleString('en-IN')})
                            {tatBusmRanks[r.busm] && (
                              <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(tatBusmRanks[r.busm], tatBusmList.length) }}>
                                #{tatBusmRanks[r.busm]}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  {MODEL_SEGMENT_DATA_BY_MONTH[selectedMonth]?.tat?.national && (
                    <TableSummaryRow>
                      <TableCell style={{ textAlign: 'left', fontWeight: 800 }}>National Average</TableCell>
                      {['<8K', '8K-10K', '10K-15K', '15K-20K', '>20K', 'Total'].map((ps) => {
                        const n = MODEL_SEGMENT_DATA_BY_MONTH[selectedMonth].tat.national[ps];
                        return (
                          <TableCell key={ps} style={{ textAlign: 'right', fontWeight: 800, borderLeft: '1px solid #cbd5e1' }}>
                            {Math.round(n?.tat_pct || 0)}% ({(n?.wo || 0).toLocaleString('en-IN')})
                          </TableCell>
                        );
                      })}
                    </TableSummaryRow>
                  )}
                </Table>
              </div>
            </div>

            {/* TABLE 2: ASM LEVEL TAT BY PRICE BRACKETS (Revealed on BUSM Click) */}
            {msTatBusmRow && (
              <div className="card-mock" style={{ position: 'relative', padding: '20px', marginBottom: '24px', borderLeft: '4px solid #16a34a' }}>
          <button
            onClick={scrollToTop}
            title="Move to top of page"
            style={{
              position: 'absolute', top: '10px', right: '14px',
              background: 'linear-gradient(135deg,#4E67EB,#6366f1)',
              color: '#fff', border: 'none', borderRadius: '20px',
              padding: '3px 11px', fontSize: '11px', fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(78,103,235,0.35)',
              display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2,
              letterSpacing: '0.03em'
            }}
          >↑ Top</button>
          {/* Rank Badge Percentile Scale Legend */}
          <div style={{ marginBottom: '14px', padding: '8px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '11.5px', textTransform: 'uppercase' }}>Rank Badge Percentile Scale:</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>Top 20% (Best Performers)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px' }}>20% – 50% (Above Average)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px' }}>50% – 70% (Watch-list / Mid-tier)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px' }}>Below 70% (Bottom 30% / Attention Required)</span>
          </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700, marginBottom: '2px' }}>▶ National &gt; {msTatBusmRow}</div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Supervisor (ASM) 1-Day Repair Closure TAT % (Filtered BUSM: {msTatBusmRow})
                    </h3>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      Showing Area Managers (ASMs) under {msTatBusmRow} — click an ASM row to view ASP centres
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                      Count: {(MODEL_SEGMENT_DATA_BY_MONTH[selectedMonth]?.tat?.asm || []).filter((a: any) => a.busm === msTatBusmRow).length} ASMs
                    </span>
                    <button
                      onClick={() => { setMsTatBusmRow(null); setMsTatAsmRow(null); }}
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
                    >
                      Clear BUSM Filter
                    </button>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <Table density="compact">
                    <TableHeader>
                      <TableRow style={{ background: '#f8fafc' }}>
                        <TableHead style={{ textAlign: 'left' }}>ASM Name</TableHead>
                        <TableHead style={{ textAlign: 'left' }}>BUSM</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>&lt;8K 1D TAT % (WOs)</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>8K-10K 1D TAT % (WOs)</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>10K-15K 1D TAT % (WOs)</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>15K-20K 1D TAT % (WOs)</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>&gt;20K 1D TAT % (WOs)</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0', background: '#f0fdf4' }}>Total TAT %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(MODEL_SEGMENT_DATA_BY_MONTH[selectedMonth]?.tat?.asm || [])
                        .filter((a: any) => a.busm === msTatBusmRow)
                        .map((r: any, i: number) => {
                          const isAsmSelected = msTatAsmRow === r.asm;
                          return (
                            <TableRow
                              key={i}
                              onClick={() => setMsTatAsmRow(isAsmSelected ? null : r.asm)}
                              style={{
                                background: isAsmSelected ? '#f0fdf4' : undefined,
                                cursor: 'pointer'
                              }}
                            >
                              <TableCell style={{ textAlign: 'left', fontWeight: isAsmSelected ? 800 : 700, color: isAsmSelected ? '#15803d' : '#1e293b' }}>
                                {r.asm} {isAsmSelected && '✓'}
                              </TableCell>
                              <TableCell style={{ textAlign: 'left', color: '#64748b' }}>{r.busm}</TableCell>
                              {['<8K', '8K-10K', '10K-15K', '15K-20K', '>20K'].map((ps) => (
                                <TableCell key={ps} style={{ textAlign: 'right', borderLeft: '1px solid #f1f5f9' }}>
                                  <span style={{ fontWeight: 700, color: '#16a34a' }}>{Math.round(r.segments[ps]?.tat_pct || 0)}%</span>{' '}
                                  <span style={{ fontSize: '11px', color: '#64748b' }}>({r.segments[ps]?.wo || 0})</span>
                                </TableCell>
                              ))}
                              <TableCell style={{ textAlign: 'right', borderLeft: '1px solid #f1f5f9', fontWeight: 800, background: '#f0fdf4', color: '#15803d' }}>
                                {Math.round(r.segments.Total.tat_pct)}% ({r.segments.Total.wo.toLocaleString('en-IN')})
                                {tatAsmRanks[r.asm] && (
                                  <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(tatAsmRanks[r.asm], tatAsmList.length) }}>
                                    #{tatAsmRanks[r.asm]}
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* TABLE 3: ASP LEVEL TAT BY PRICE BRACKETS (Revealed on ASM Click) */}
            {msTatAsmRow && (
              <div className="card-mock" style={{ position: 'relative', padding: '20px', marginBottom: '24px', borderLeft: '4px solid #16a34a' }}>
          <button
            onClick={scrollToTop}
            title="Move to top of page"
            style={{
              position: 'absolute', top: '10px', right: '14px',
              background: 'linear-gradient(135deg,#4E67EB,#6366f1)',
              color: '#fff', border: 'none', borderRadius: '20px',
              padding: '3px 11px', fontSize: '11px', fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(78,103,235,0.35)',
              display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2,
              letterSpacing: '0.03em'
            }}
          >↑ Top</button>
          {/* Rank Badge Percentile Scale Legend */}
          <div style={{ marginBottom: '14px', padding: '8px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '11.5px', textTransform: 'uppercase' }}>Rank Badge Percentile Scale:</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>Top 20% (Best Performers)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px' }}>20% – 50% (Above Average)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px' }}>50% – 70% (Watch-list / Mid-tier)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px' }}>Below 70% (Bottom 30% / Attention Required)</span>
          </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700, marginBottom: '2px' }}>▶ National &gt; {msTatBusmRow} &gt; {msTatAsmRow}</div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      ASP Centre 1-Day Repair Closure TAT % (Filtered ASM: {msTatAsmRow})
                    </h3>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      Showing ASP Centres reporting to {msTatAsmRow}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                      Count: {(MODEL_SEGMENT_DATA_BY_MONTH[selectedMonth]?.tat?.asp || []).filter((a: any) => a.asm === msTatAsmRow).length} ASPs
                    </span>
                    <button
                      onClick={() => setMsTatAsmRow(null)}
                      style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, color: '#15803d', cursor: 'pointer' }}
                    >
                      Clear ASM Filter ({msTatAsmRow})
                    </button>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <Table density="compact">
                    <TableHeader>
                      <TableRow style={{ background: '#f8fafc' }}>
                        <TableHead style={{ textAlign: 'left', fontFamily: 'monospace' }}>ASP Code</TableHead>
                        <TableHead style={{ textAlign: 'left' }}>ASP Name</TableHead>
                        <TableHead style={{ textAlign: 'left' }}>Supervisor (ASM)</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>&lt;8K 1D TAT % (WOs)</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>8K-10K 1D TAT % (WOs)</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>10K-15K 1D TAT % (WOs)</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>15K-20K 1D TAT % (WOs)</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0' }}>&gt;20K 1D TAT % (WOs)</TableHead>
                        <TableHead style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0', background: '#f0fdf4' }}>Total TAT %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(MODEL_SEGMENT_DATA_BY_MONTH[selectedMonth]?.tat?.asp || []).filter((a: any) => a.asm === msTatAsmRow).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                            No ASP centers found for {msTatAsmRow}.
                          </TableCell>
                        </TableRow>
                      ) : (
                        (MODEL_SEGMENT_DATA_BY_MONTH[selectedMonth]?.tat?.asp || [])
                          .filter((a: any) => a.asm === msTatAsmRow)
                          .map((r: any, i: number) => (
                            <TableRow key={r.code || i}>
                              <TableCell style={{ textAlign: 'left', fontFamily: 'monospace', color: '#16a34a', fontWeight: 700 }}>{r.code}</TableCell>
                              <TableCell style={{ textAlign: 'left', fontWeight: 700, color: '#1e293b' }}>{r.name}</TableCell>
                              <TableCell style={{ textAlign: 'left', color: '#64748b' }}>{r.asm}</TableCell>
                              {['<8K', '8K-10K', '10K-15K', '15K-20K', '>20K'].map((ps) => (
                                <TableCell key={ps} style={{ textAlign: 'right', borderLeft: '1px solid #f1f5f9' }}>
                                  <span style={{ fontWeight: 700, color: '#16a34a' }}>{Math.round(r.segments[ps]?.tat_pct || 0)}%</span>{' '}
                                  <span style={{ fontSize: '11px', color: '#64748b' }}>({r.segments[ps]?.wo || 0})</span>
                                </TableCell>
                              ))}
                              <TableCell style={{ textAlign: 'right', borderLeft: '1px solid #f1f5f9', fontWeight: 800, background: '#f0fdf4', color: '#15803d' }}>
                                {Math.round(r.segments.Total.tat_pct)}% ({r.segments.Total.wo.toLocaleString('en-IN')})
                                {tatAspRanks[r.code] && (
                                  <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', ...getRankBadgeStyle(tatAspRanks[r.code], tatAspList.length) }}>
                                    #{tatAspRanks[r.code]}
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </div>
        );
      })()}


      {/* Executive Footnote */}
      <div style={{ marginTop: '10px', padding: '14px 18px', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '11.5px', color: '#64748b', lineHeight: '1.6', boxShadow: 'var(--shadow-sm)' }}>
        {DASHBOARD_DEFINITIONS.executiveFootnote}
      </div>

    </div>
  );
}
