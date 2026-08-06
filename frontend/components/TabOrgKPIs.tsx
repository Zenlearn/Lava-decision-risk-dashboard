import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableSummaryRow } from './ui/Table';
import { DASHBOARD_DEFINITIONS } from '../constants/definitions';
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
  const modelTypeFilter: string = 'Smart & Tablet';  // Section 1 NPS uses busmSmartTablet — informational label, not a selectable filter
  const [tatWarrantyFilter, setTatWarrantyFilter] = useState<'inWarranty' | 'overall'>('inWarranty');

  // CPC Drilldown State
  const [cpcBusmRepair, setCpcBusmRepair] = useState<string | null>(null);
  const [cpcAsmRepair, setCpcAsmRepair] = useState<string | null>(null);
  const [cpcBusmRepl, setCpcBusmRepl] = useState<string | null>(null);
  const [cpcAsmRepl, setCpcAsmRepl] = useState<string | null>(null);

  // Training compliance — fetched from /api/v1/dashboard/training-status
  // keyed by lowercase-trimmed name for case-insensitive lookup.
  const [trainingByName, setTrainingByName] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    fetch('/api/v1/dashboard/training-status')
      .then((r) => r.json())
      .then((d) => {
        const m = new Map<string, number>();
        (d?.result?.rows ?? []).forEach((row: any) => {
          m.set(row.name.trim().toLowerCase(), row.completionPct);
        });
        setTrainingByName(m);
      })
      .catch(() => setTrainingByName(new Map()));
  }, []);

  // Reset ASM selection when BUSM selection changes (Overall Regional Performance Scorecards)
  const handleOvBusmClick = (name: string | null) => {
    setOvBusmRow(name);
    setOvAsmRow(null);
  };

  // Real per-BUSM/ASM NPS breakdown from the NPS survey dataset — replaces
  // the previous static arrays that were frozen on June 2026 forever (they
  // wouldn't have updated even after new months' data was imported).
  // toDisplayNps reshapes the backend's numeric fields into the display
  // format (percentage strings) the tables below already render.
  const toDisplayNps = (entries: any[], includeRr: boolean) => (entries || []).map((e: any) => ({
    name: e.name,
    busm: e.busm,
    total: e.sent,
    ...(includeRr ? { rr: `${e.responseRate}%` } : {}),
    d: `${e.detractorPct}%`,
    p: `${e.passivePct}%`,
    pr: `${e.promoterPct}%`,
    nps: `${e.npsScore}%`,
    rank: e.rank,
  }));

  const npsMonthData = data?.npsInsights?.by_month?.[selectedMonth] || {};
  const stBusmData = toDisplayNps(npsMonthData.busmSmartTablet, true);
  const stAsmData = toDisplayNps(npsMonthData.asmSmartTablet, false);

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

  // orgKpis now carries two REAL, independently-computed variants per month —
  // "overall" (every row, no filter) and "inWarranty" (Warranty=Yes + Smart/
  // Tablet only). Every section except the TAT warranty toggle now uses "inWarranty".
  const activeOrgKpiMonth = data?.orgKpis?.by_month?.[selectedMonth] || data?.orgKpis?.all || {};
  const activeOrgKpi = activeOrgKpiMonth.inWarranty || { busms: [], asms: [], national: {} };
  // TAT section's own source, switched by the In-Warranty/Overall toggle —
  // was previously a single dataset with a fabricated "+18%" multiplier
  // applied for "Overall" (which is why every closure % was identical
  // between the two toggle states); now genuinely two different populations.
  const tatOrgKpi = activeOrgKpiMonth[tatWarrantyFilter] || { busms: [], asms: [], national: {} };
  const tatRawBusmList: any[] = (tatOrgKpi.busms || []).filter((b: any) => b.name && !b.name.toLowerCase().includes('unknown'));
  const tatRawAsmList: any[] = (tatOrgKpi.asms || []).filter((a: any) => a.name && !a.name.toLowerCase().includes('unknown') && a.busm && !a.busm.toLowerCase().includes('unknown'));
  // Real per-ASP TAT closure (backend-computed) — replaces the old synthetic
  // allocation that split a static ASP list's national/BUSM distribution
  // proportionally, with no basis in that ASP's own actual work orders.
  const tatRawAspList: any[] = (tatOrgKpi.asps || []).filter((a: any) => a.name && !a.name.toLowerCase().includes('unknown') && a.asm && !a.asm.toLowerCase().includes('unknown'));
  const tatRawNational: any = tatOrgKpi.national || {};
  // Live CPC/SAH datasets derived from backend (replaces frozen static files)
  // Fields: repair_count/avg/total, repl_count/avg/total, combined_total, sahBreakdown
  // are now returned by computeOrgKpiTable() on every BUSM/ASM/national row.

  // Real per-BUSM/ASM NPS breakdown — Smart device only (matches the Section 1 scorecard scope)
  const busmNpsData = toDisplayNps(npsMonthData.busmSmartTablet, true);
  const asmNpsData = toDisplayNps(npsMonthData.asmSmartTablet, false);

  // Helper map for normalizing name comparisons
  const normalizeKey = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  // Scroll to top of page helper
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });


  const busmNpsMap = new Map(busmNpsData.map(b => [normalizeKey(b.name), b]));
  const asmNpsMap = new Map(asmNpsData.map(a => [normalizeKey(a.name), a]));

  const rawBusmList: any[] = (activeOrgKpi.busms || []).filter((b: any) => b.name && !b.name.toLowerCase().includes('unknown'));
  const rawAllAsmList: any[] = (activeOrgKpi.asms || []).filter((a: any) => a.name && !a.name.toLowerCase().includes('unknown') && a.busm && !a.busm.toLowerCase().includes('unknown'));
  const rawNationalSummary: any = activeOrgKpi.national || {};
  const rawAspList: any[] = (activeOrgKpi.asps || []).filter((a: any) => a.name && !a.name.toLowerCase().includes('unknown'));

  // Live CPC/SAH datasets shaped to match the old static-file structure so Sections 2+3 can use them with minimal template changes
  const currentCpcDataset = {
    busm: rawBusmList,
    asm: rawAllAsmList,
    asp: rawAspList,
    summary: rawNationalSummary,
  };
  const emptySah = { total: 0, cancel: '0.0%', resched: '0.0%', same_day: '0.0%', same_day_cancel: '0.0%', pending: '0.0%' };
  const currentSahDataset = {
    busm: rawBusmList.map((b: any) => ({ name: b.name, ...(b.sahBreakdown || emptySah) })),
    asm: rawAllAsmList.map((a: any) => ({ name: a.name, busm: a.busm, ...(a.sahBreakdown || emptySah) })),
    asp: rawAspList.map((a: any) => ({ name: a.name, asm: a.asm, busm: a.busm, ...(a.sahBreakdown || emptySah) })),
    summary: rawNationalSummary.sahBreakdown || emptySah,
  };

  const busmListWithCpc = rawBusmList.map((b: any) => {
    const npsInfo = busmNpsMap.get(normalizeKey(b.name));
    // Prefer real survey-pipeline NPS; fall back to backend's b.nps
    const npsVal = npsInfo ? parseFloat(npsInfo.nps) : (b.nps || 0);
    return {
      ...b,
      nps: npsVal,
    };
  });

  // Compute ALL 6 BUSM ranks locally against the displayed set — avoids backend hybrid mismatch
  const localRankBy = (arr: any[], key: string, ascending = false) => {
    const sorted = [...arr].sort((a, b) => ascending ? (a[key] || 0) - (b[key] || 0) : (b[key] || 0) - (a[key] || 0));
    const m = new Map<string, number>();
    sorted.forEach((x, i) => m.set(normalizeKey(x.name), i + 1));
    return m;
  };
  const busmCpcRankMap  = localRankBy(busmListWithCpc, 'cpc', true);   // lower CPC = better
  const busmTatRankMap  = localRankBy(busmListWithCpc, 'tat');
  const busmSahRankMap  = localRankBy(busmListWithCpc, 'sah');
  const busmNpsRankMap  = localRankBy(busmListWithCpc, 'nps');
  const busmDiagRankMap = localRankBy(busmListWithCpc, 'diag');
  const busmCagRankMap  = localRankBy(busmListWithCpc, 'cag');

  const busmList = busmListWithCpc.map((b: any) => ({
    ...b,
    ranks: {
      cpc:  busmCpcRankMap.get(normalizeKey(b.name))  ?? null,
      tat:  busmTatRankMap.get(normalizeKey(b.name))  ?? null,
      sah:  busmSahRankMap.get(normalizeKey(b.name))  ?? null,
      nps:  busmNpsRankMap.get(normalizeKey(b.name))  ?? null,
      diag: busmDiagRankMap.get(normalizeKey(b.name)) ?? null,
      cag:  busmCagRankMap.get(normalizeKey(b.name))  ?? null,
    }
  }));

  const allAsmListWithNps = rawAllAsmList.map((a: any) => {
    const npsInfo = asmNpsMap.get(normalizeKey(a.name));
    // Prefer real survey-pipeline NPS; fall back to backend's a.nps
    const npsVal = npsInfo ? parseFloat(npsInfo.nps) : (a.nps || 0);
    return { ...a, nps: npsVal };
  });

  // Compute ALL 6 ASM ranks locally against the displayed set
  const asmCpcRankMap  = localRankBy(allAsmListWithNps, 'cpc', true);
  const asmTatRankMap  = localRankBy(allAsmListWithNps, 'tat');
  const asmSahRankMap  = localRankBy(allAsmListWithNps, 'sah');
  const asmNpsRankMap  = localRankBy(allAsmListWithNps, 'nps');
  const asmDiagRankMap = localRankBy(allAsmListWithNps, 'diag');
  const asmCagRankMap  = localRankBy(allAsmListWithNps, 'cag');

  const allAsmList = allAsmListWithNps.map((a: any) => ({
    ...a,
    ranks: {
      cpc:  asmCpcRankMap.get(normalizeKey(a.name))  ?? null,
      tat:  asmTatRankMap.get(normalizeKey(a.name))  ?? null,
      sah:  asmSahRankMap.get(normalizeKey(a.name))  ?? null,
      nps:  asmNpsRankMap.get(normalizeKey(a.name))  ?? null,
      diag: asmDiagRankMap.get(normalizeKey(a.name)) ?? null,
      cag:  asmCagRankMap.get(normalizeKey(a.name))  ?? null,
    }
  }));

  // National TAT/S@H must be rolled up from the SAME corrected per-BUSM values
  // shown in the table above, not the backend's independently-computed
  // national figure — otherwise the two disagree (e.g. National TAT below
  // every individual BUSM's TAT, which is impossible for a weighted average).
  const busmTotalWoForNational = busmList.reduce((sum, b) => sum + (b.wo || 0), 0);
  const weightedBusmAvg = (key: 'tat' | 'sah') => {
    if (busmTotalWoForNational === 0) return busmList.length > 0 ? busmList.reduce((s, b) => s + (b[key] || 0), 0) / busmList.length : 0;
    return Math.round((busmList.reduce((s, b) => s + (b[key] || 0) * (b.wo || 0), 0) / busmTotalWoForNational) * 10) / 10;
  };

  // National NPS: WO-weighted average across displayed BUSMs (same methodology as TAT/SAH)
  const weightedNationalNps = busmTotalWoForNational > 0
    ? Math.round((busmList.reduce((s, b) => s + (b.nps || 0) * (b.wo || 0), 0) / busmTotalWoForNational) * 10) / 10
    : (busmList.length > 0 ? Math.round((busmList.reduce((s, b) => s + (b.nps || 0), 0) / busmList.length) * 10) / 10 : 0);

  const nationalSummary = {
    ...rawNationalSummary,
    cpc: rawNationalSummary.cpc || 0,
    tat: weightedBusmAvg('tat'),
    sah: weightedBusmAvg('sah'),
    nps: weightedNationalNps || 0,
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

  // Real per-ASP performance, sourced from the backend's aspStats/childMetrics
  // (Score Card v2 pipeline) — replaces the previous 610-entry fabricated
  // constants/aspData.ts. "All Months" is a WO-weighted average across every
  // month an ASP has data for, matching the methodology used elsewhere in
  // this file rather than picking one arbitrary snapshot month.
  const allAspRows: any[] = data?.asp || [];
  const aspRowsForSelectedMonth: any[] = selectedMonth === 'All'
    ? (() => {
      const byActor = new Map<string, any[]>();
      allAspRows.forEach((r) => {
        if (!byActor.has(r.actor)) byActor.set(r.actor, []);
        byActor.get(r.actor)!.push(r);
      });
      const wavg = (rows: any[], getter: (r: any) => number | null | undefined): number => {
        const valid = rows.filter((r) => getter(r) !== null && getter(r) !== undefined);
        const w = valid.reduce((s, r) => s + (r.wo || 0), 0);
        return w > 0 ? valid.reduce((s, r) => s + (getter(r) as number) * (r.wo || 0), 0) / w : 0;
      };
      return Array.from(byActor.entries()).map(([actor, rows]) => ({
        actor,
        code: rows[0]?.code,
        busm: rows[0]?.busm,
        asm: rows[0]?.asm,
        wo: rows.reduce((s, r) => s + (r.wo || 0), 0),
        overall: wavg(rows, (r) => r.overall),
        childMetrics: {
          tatClosurePct: { value: wavg(rows, (r) => r.childMetrics?.tatClosurePct?.value) },
          cpc: { value: wavg(rows, (r) => r.childMetrics?.cpc?.value) },
          sahCombinedPct: { value: wavg(rows, (r) => r.childMetrics?.sahCombinedPct?.value) },
          npsPct: { value: wavg(rows, (r) => r.childMetrics?.npsPct?.value) },
          diagPct: { value: wavg(rows, (r) => r.childMetrics?.diagPct?.value) },
        },
      }));
    })()
    : allAspRows.filter((r) => r.month === selectedMonth);

  const filteredAspList = ovAsmRow
    ? aspRowsForSelectedMonth
      .filter((a) => a.asm === ovAsmRow)
      .map((a) => ({
        code: a.code,
        name: a.actor,
        asm: a.asm,
        busm: a.busm,
        wo: a.wo,
        tat: Math.round((a.childMetrics?.tatClosurePct?.value ?? 0) * 10) / 10,
        cpc: Math.round(a.childMetrics?.cpc?.value ?? 0),
        sah: Math.round((100 - (a.childMetrics?.sahCombinedPct?.value ?? 0)) * 10) / 10,
        nps: Math.round((a.childMetrics?.npsPct?.value ?? 0) * 10) / 10,
        diag: Math.round((a.childMetrics?.diagPct?.value ?? 0) * 10) / 10,
        cag: Math.round((a.overall ?? 0) * 10) / 10,
      }))
    : [];

  // Real DSAT (detractor callback reason) breakdown by BUSM, from the NPS
  // survey dataset's "Detractor Calling" reason column.
  const dsatBusmData = npsMonthData.dsatByBusm || [];

  // Real device-category NPS summary (Feature Phone / Smart & Tablet / Overall
  // Combined), from the same dataset's device-category field.
  const deviceCategoryNps = (npsMonthData.deviceCategorySummary || []).map((c: any) => ({
    cat: c.cat,
    surveys: c.sent,
    d: `${c.detractorPct}%`,
    p: `${c.passivePct}%`,
    pr: `${c.promoterPct}%`,
    nps: `${c.npsScore}%`,
  }));

  // Real Feature-Phone-only BUSM NPS breakdown.
  const fpBusmData = toDisplayNps(npsMonthData.busmFeaturePhone, true);
  const fpAsmData = toDisplayNps(npsMonthData.asmFeaturePhone, false);



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
          <div style={{ display: 'flex', gap: '6px', marginLeft: '8px', flexWrap: 'wrap' }}>
            {segmentFilter !== 'All' && (
              <span style={{ padding: '2px 10px', borderRadius: '12px', background: '#fee2e2', color: '#dc2626', fontSize: '11.5px', fontWeight: 700, border: '1px solid #fca5a5' }}>
                Segment: {segmentFilter}
              </span>
            )}
            <span style={{ padding: '2px 10px', borderRadius: '12px', background: '#dbeafe', color: '#1d4ed8', fontSize: '11.5px', fontWeight: 700, border: '1px solid #93c5fd' }}>
              NPS: {modelTypeFilter} devices
            </span>
          </div>
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
                  <TableHead style={{ textAlign: 'right' }}>Training %</TableHead>
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
                      <TableCell style={{ textAlign: 'right', fontWeight: 600, color: (() => { const pct = trainingByName.get(r.name?.trim().toLowerCase() ?? ''); return pct !== undefined ? (pct >= 80 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626') : '#94a3b8'; })() }}>
                        {(() => { const pct = trainingByName.get(r.name?.trim().toLowerCase() ?? ''); return pct !== undefined ? `${pct}%` : '—'; })()}
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
                <TableCell style={{ textAlign: 'right' }}>—</TableCell>
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
                    <TableHead style={{ textAlign: 'right' }}>Training %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredAsmList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
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
                          <TableCell style={{ textAlign: 'right', fontWeight: 600, color: (() => { const pct = trainingByName.get(r.name?.trim().toLowerCase() ?? ''); return pct !== undefined ? (pct >= 80 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626') : '#94a3b8'; })() }}>
                            {(() => { const pct = trainingByName.get(r.name?.trim().toLowerCase() ?? ''); return pct !== undefined ? `${pct}%` : '—'; })()}
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
                        <TableCell style={{ textAlign: 'right' }}>—</TableCell>
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
                  {filteredAspList.length > 0 ? `${filteredAspList.length} ASP centre(s) under ${ovAsmRow}` : `No ASP data available for ${ovAsmRow} in ${selectedMonth === 'All' ? 'any month' : selectedMonth}`}
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
                      No ASP centres with data under <strong>{ovAsmRow}</strong> for this period.
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
                📱 Smart Phone & Tablet (Default)
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
                Table 1: BUSM Wise NPS Performance Breakdown ({deviceFilter === 'smart' ? 'Smart Phone & Tablet' : 'All Devices Combined'})
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
                {(deviceFilter === 'smart' ? stBusmData : fpBusmData)
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
                const src = deviceFilter === 'smart' ? stBusmData : fpBusmData;
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
                    Showing {(deviceFilter === 'smart' ? stAsmData : fpAsmData).filter(r => r.busm === npsBusmRow).length} Supervisors
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
                    {(deviceFilter === 'smart' ? stAsmData : fpAsmData)
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
                      .filter((r: any) => r.name === npsBusmRow)
                      .map((r: any, i: number) => (
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
                          <td style={{ padding: '9px 10px', textAlign: 'right' }}>{parentObj ? parentObj.rr : '—'}</td>
                          <td style={{ padding: '9px 10px', textAlign: 'right', color: '#dc2626' }}>{parentObj ? parentObj.d : '—'}</td>
                          <td style={{ padding: '9px 10px', textAlign: 'right', color: '#d97706' }}>{parentObj ? parentObj.p : '—'}</td>
                          <td style={{ padding: '9px 10px', textAlign: 'right', color: '#16a34a' }}>{parentObj ? parentObj.pr : '—'}</td>
                          <td style={{ padding: '9px 10px', textAlign: 'right', color: '#2563eb' }}>{parentObj ? `+${parentObj.nps}` : '—'}</td>
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
                {tatRawBusmList.map((r: any, i: number) => {
                  const isSelected = tatBusmRow === r.name;
                  const woVal = r.wo || 0;
                  // Always the backend's real per-BUSM closure counts — no
                  // hardcoded distribution fallback. Missing/zero data shows
                  // as 0, not a plausible-looking synthetic split.
                  const rawTc = r.tatClosure || {};
                  const c1d = rawTc.c1d || 0;
                  const c2d = rawTc.c2d || 0;
                  const c3d = rawTc.c3d || 0;
                  const c5d = rawTc.c5d || 0;
                  const cStillOpen = Math.max(0, woVal - c1d - c2d - c3d - c5d);

                  const tc = {
                    c1d,
                    tat1dPct: woVal > 0 ? +((c1d / woVal) * 100).toFixed(1) : 0,
                    c2d,
                    tat2dPct: woVal > 0 ? +((c2d / woVal) * 100).toFixed(1) : 0,
                    c3d,
                    tat3dPct: woVal > 0 ? +((c3d / woVal) * 100).toFixed(1) : 0,
                    c5d,
                    tat5dPct: woVal > 0 ? +((c5d / woVal) * 100).toFixed(1) : 0,
                    cStillOpen,
                    stillOpenPct: woVal > 0 ? +((cStillOpen / woVal) * 100).toFixed(1) : 0,
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
                        {woVal.toLocaleString('en-IN')}
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
                  let totWo = 0;
                  let totC1d = 0;
                  let totC2d = 0;
                  let totC3d = 0;
                  let totC5d = 0;
                  let totStillOpen = 0;

                  tatRawBusmList.forEach((r: any) => {
                    const woVal = r.wo || 0;
                    totWo += woVal;
                    const rawTc = r.tatClosure || {};
                    const c1 = rawTc.c1d || 0;
                    const c2 = rawTc.c2d || 0;
                    const c3 = rawTc.c3d || 0;
                    const c5 = rawTc.c5d || 0;
                    const cSo = Math.max(0, woVal - c1 - c2 - c3 - c5);
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
          const tatFilteredAsmList = tatRawAsmList.filter((a) => a.busm === tatBusmRow);
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
                      const woVal = r.wo || 0;
                      // Always the backend's real per-ASM closure counts —
                      // no hardcoded distribution fallback.
                      const rawTc = r.tatClosure || {};
                      const c1d = rawTc.c1d || 0;
                      const c2d = rawTc.c2d || 0;
                      const c3d = rawTc.c3d || 0;
                      const c5d = rawTc.c5d || 0;
                      const cStillOpen = Math.max(0, woVal - c1d - c2d - c3d - c5d);
                      const tc = {
                        c1d,
                        tat1dPct: woVal > 0 ? +((c1d / woVal) * 100).toFixed(1) : 0,
                        c2d,
                        tat2dPct: woVal > 0 ? +((c2d / woVal) * 100).toFixed(1) : 0,
                        c3d,
                        tat3dPct: woVal > 0 ? +((c3d / woVal) * 100).toFixed(1) : 0,
                        c5d,
                        tat5dPct: woVal > 0 ? +((c5d / woVal) * 100).toFixed(1) : 0,
                        cStillOpen,
                        stillOpenPct: woVal > 0 ? +((cStillOpen / woVal) * 100).toFixed(1) : 0,
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
                            {woVal.toLocaleString('en-IN')}
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
                      Count: {tatRawAspList.filter(a => a.asm === tatAsmRow).length} ASPs
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
                      {tatRawAspList.filter(a => a.asm === tatAsmRow).length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
                            No ASP centers found for {tatAsmRow}.
                          </td>
                        </tr>
                      ) : (
                        tatRawAspList.filter(a => a.asm === tatAsmRow).map((asp, i) => {
                          const woVal = asp.wo || 0;
                          const tc = asp.tatClosure || {};
                          return (
                            <tr key={asp.code || i} style={{ borderBottom: '1px solid #f1f5f9', background: '#eff6ff' }}>
                              <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: '#64748b' }}>{asp.code}</td>
                              <td style={{ padding: '8px 12px', fontWeight: 700, color: '#1e293b' }}>{asp.name}</td>
                              <td style={{ padding: '8px 10px', color: '#64748b', borderRight: '1px solid #f1f5f9' }}>{asp.asm}</td>
                              <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, borderRight: '1px solid #f1f5f9' }}>{woVal.toLocaleString('en-IN')}</td>
                              <td style={{ padding: '8px 10px', textAlign: 'right', color: '#16a34a', fontWeight: 700 }}>{tc.c1d || 0} ({tc.tat1dPct || 0}%)</td>
                              <td style={{ padding: '8px 10px', textAlign: 'right', color: '#2563eb', fontWeight: 600 }}>{tc.c2d || 0} ({tc.tat2dPct || 0}%)</td>
                              <td style={{ padding: '8px 10px', textAlign: 'right', color: '#d97706', fontWeight: 600 }}>{tc.c3d || 0} ({tc.tat3dPct || 0}%)</td>
                              <td style={{ padding: '8px 10px', textAlign: 'right', color: '#dc2626', fontWeight: 700 }}>{tc.c5d || 0} ({tc.tat5dPct || 0}%)</td>
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
