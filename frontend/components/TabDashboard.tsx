import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, Cell, LabelList, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { DASHBOARD_DEFINITIONS } from '../constants/definitions';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableSummaryRow } from './ui/Table';

interface TabDashboardProps {
  data: any;
  isMounted: boolean;
  leakCur: number;
  leakDelta: number;
  annualLeakRunRate: number;
  latestKPI: any;
  previousKPI: any;
  fmtINR: (v: number) => string;
  fmtPct: (v: number) => string;
}

export default function TabDashboard({
  data,
  isMounted,
  leakCur: initialLeakCur,
  leakDelta: initialLeakDelta,
  annualLeakRunRate: initialAnnualLeakRunRate,
  latestKPI: initialLatestKPI,
  previousKPI: initialPreviousKPI,
  fmtINR,
  fmtPct
}: TabDashboardProps) {
  const allMonths = data?.kpi?.months || [];
  const latestMonthName = allMonths[allMonths.length - 1]?.month || initialLatestKPI?.month || 'Jun';
  
  const [selectedMonth, setSelectedMonth] = useState<string>(latestMonthName);
  
  // Accordion open/close state for all deep dive sections
  const [expandedSections, setExpandedSections] = useState({
    leakage: true,
    mttr: true,
    csat: true,
    trends: true,
    calc: true,
  });

  const toggleSection = (key: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allExpanded = Object.values(expandedSections).every(Boolean);

  const toggleExpandAll = () => {
    const nextState = !allExpanded;
    setExpandedSections({
      leakage: nextState,
      mttr: nextState,
      csat: nextState,
      trends: nextState,
      calc: nextState,
    });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -70; // Header & sticky bar offset
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (allMonths.length > 0) {
      const latestName = allMonths[allMonths.length - 1]?.month;
      if (latestName) {
        setSelectedMonth(latestName);
      }
    }
  }, [allMonths]);

  // Find currently selected month's KPI object and its previous month's KPI object
  const selectedMonthIdx = allMonths.findIndex((m: any) => m.month === selectedMonth);
  const currentKPI = selectedMonthIdx !== -1 ? allMonths[selectedMonthIdx] : initialLatestKPI;
  const prevKPI = selectedMonthIdx > 0 ? allMonths[selectedMonthIdx - 1] : null;

  // Active month dynamic calculations
  const activeLeakCur = currentKPI?.leak || 0;
  const activeLeakPrev = prevKPI ? (prevKPI.leak || 0) : 0;
  const activeLeakDelta = prevKPI ? (activeLeakCur - activeLeakPrev) : 0;
  const activeAnnualLeakRunRate = activeLeakCur * 12;

  const currentBreakdown = currentKPI?.breakdown || [
    { key: 'pcba', label: 'Motherboard (PCBA)', quantity: currentKPI?._leakparts?.pcba || 0, cost: (currentKPI?._leakparts?.pcba || 0) * 1800 },
    { key: 'lcd', label: 'Display Screen (LCD)', quantity: currentKPI?._leakparts?.lcd || 0, cost: (currentKPI?._leakparts?.lcd || 0) * 1200 },
    { key: 'battery', label: 'Battery Unit', quantity: Math.round((currentKPI?._leakparts?.pcba || 0) * 0.15), cost: Math.round((currentKPI?._leakparts?.pcba || 0) * 0.15 * 600) },
    { key: 'camera', label: 'Camera Module', quantity: Math.round((currentKPI?._leakparts?.lcd || 0) * 0.1), cost: Math.round((currentKPI?._leakparts?.lcd || 0) * 0.1 * 450) },
    { key: 'speaker', label: 'Speaker / Audio Assembly', quantity: Math.round((currentKPI?._leakparts?.pcba || 0) * 0.08), cost: Math.round((currentKPI?._leakparts?.pcba || 0) * 0.08 * 150) },
    { key: 'charger', label: 'Charger / Power Adapter', quantity: Math.round((currentKPI?._leakparts?.pcba || 0) * 0.05), cost: Math.round((currentKPI?._leakparts?.pcba || 0) * 0.05 * 250) },
    { key: 'travel', label: 'Technician Home Travel Fee', quantity: currentKPI?._leaktravel || 0, cost: (currentKPI?._leaktravel || 0) * 500 },
  ];

  const prevBreakdown = prevKPI?.breakdown || [];

  // Real MTTR distribution — Lava Delivered Master Data (107,407 WOs, Apr–Jun 2026)
  const currentTatDist = currentKPI?.tatDistribution || [
    { key: '1d',   label: 'Repaired in 1 Day (24 Hours)', quantity: Math.round((currentKPI?.wo || 0) * 0.269), pct: 26.9 },
    { key: '3d',   label: 'Repaired in 2 – 3 Days',       quantity: Math.round((currentKPI?.wo || 0) * 0.235), pct: 23.5 },
    { key: 'gt3d', label: 'Repaired in > 3 Days',          quantity: Math.round((currentKPI?.wo || 0) * 0.497), pct: 49.7 },
  ];

  // Real CSAT distribution approximated from NPS survey data (Promoter 66% → 5★, Passive 17% → 4★, Detractors 17% → 1–3★)
  const currentCsatDist = currentKPI?.csatDistribution || [
    { key: '5', label: 'Rating 5 (5-Star — Promoters)', quantity: Math.round((currentKPI?.wo || 0) * 0.46), pct: 46.0 },
    { key: '4', label: 'Rating 4 (4-Star — Passive high)', quantity: Math.round((currentKPI?.wo || 0) * 0.20), pct: 20.0 },
    { key: '3', label: 'Rating 3 (3-Star — Passive low)', quantity: Math.round((currentKPI?.wo || 0) * 0.17), pct: 17.0 },
    { key: '2', label: 'Rating 2 (2-Star — Detractor)', quantity: Math.round((currentKPI?.wo || 0) * 0.10), pct: 10.0 },
    { key: '1', label: 'Rating 1 (1-Star — Detractor)', quantity: Math.round((currentKPI?.wo || 0) * 0.07), pct:  7.0 },
  ];

  const prevTatDist = prevKPI?.tatDistribution || [];

  return (
    <div className="view-mock on" style={{ paddingBottom: '60px' }}>

      {/* Month Dropdown Selector on left-hand side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Select Reporting Month:
        </label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{
            background: '#ffffff',
            border: '2px solid #E50046',
            borderRadius: '8px',
            padding: '6px 14px',
            fontSize: '14px',
            fontWeight: 700,
            color: '#0f172a',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            outline: 'none'
          }}
        >
          {allMonths.map((m: any) => (
            <option key={m.month} value={m.month}>
              {m.month} {m.month === latestMonthName ? '(Latest)' : ''}
            </option>
          ))}
        </select>
      </div>      {/* EXECUTIVE COMMAND CENTER HERO BANNER */}
      <div className="executive-hero">
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '32px', alignItems: 'center' }}>
          {/* Left Column: Financial Risk Headline & Run Rate */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{
                background: 'rgba(229, 0, 70, 0.2)',
                color: '#ff6b8b',
                border: '1px solid rgba(229, 0, 70, 0.4)',
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}>
                Decision Risk Exposure
              </span>
              <span style={{ fontSize: '12.5px', color: '#94a3b8', fontWeight: 600 }}>
                {currentKPI?.month || selectedMonth} 2026 Snapshot
              </span>
            </div>

            <div style={{ fontSize: '13px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Estimated Monthly Leakage Exposure
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '12px' }}>
              <div className="hero-display-metric">{fmtINR(activeLeakCur)}</div>
              {prevKPI && (
                <span style={{
                  background: activeLeakDelta < 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: activeLeakDelta < 0 ? '#34d399' : '#f87171',
                  border: `1px solid ${activeLeakDelta < 0 ? 'rgba(52, 211, 153, 0.4)' : 'rgba(248, 113, 113, 0.4)'}`,
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 700
                }}>
                  {activeLeakDelta < 0 ? '↓ ' : '↑ '}{fmtINR(Math.abs(activeLeakDelta))} vs {prevKPI.month}
                </span>
              )}
            </div>

            <p style={{ fontSize: '13.5px', color: '#cbd5e1', lineHeight: '1.6', margin: '0 0 16px 0', maxWidth: '640px' }}>
              Component-level leakage exposure (PCBA, LCD, Battery &amp; Travel Fees) logged for anomalous work orders. 
              Annualised Run-Rate is holding at <strong style={{ color: '#ffffff' }}>{fmtINR(activeAnnualLeakRunRate)}</strong>.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.07)', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', fontWeight: 600 }}>Top Leakage Component</span>
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#ffffff' }}>PCBA Motherboards (53.0%)</span>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.07)', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', fontWeight: 600 }}>Secondary Driver</span>
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#ffffff' }}>Display Screens (11.7%)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Decision Confidence Index & Quality Meter */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '14px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Decision Quality
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', margin: '2px 0 0 0' }}>
                  Confidence Score
                </h3>
              </div>
              <span style={{ background: '#047857', color: '#ecfdf5', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 800 }}>
                ↑ 2.4% vs May
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                position: 'relative',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'conic-gradient(#4E67EB 0% 94.2%, rgba(255,255,255,0.1) 94.2% 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(78, 103, 235, 0.4)'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#101735',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontWeight: 800,
                  color: '#ffffff'
                }}>
                  94.2
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>
                  Primary Quality Driver:
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                  Technician Diagnostic Accuracy
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '94.2%', height: '100%', background: 'linear-gradient(90deg, #4E67EB 0%, #34d399 100%)' }}></div>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px', fontSize: '12px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
              <span>Target Standard: <b>90.0 Score</b></span>
              <span style={{ color: '#34d399', fontWeight: 700 }}>Optimal Range</span>
            </div>
          </div>
        </div>
      </div>

      {/* RISK SIGNAL STRIP */}
      <div className="risk-strip">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ background: '#E50046', color: '#ffffff', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
            Anomaly Alert
          </span>
          <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
            Motherboard (PCBA) anomalies account for ₹10,92,930 (53.0% of total headline leakage) across 320 work orders in June.
          </span>
        </div>
        <button 
          onClick={() => scrollToSection('sec-leakage')}
          style={{ background: 'transparent', border: 'none', color: '#E50046', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
        >
          View Leakage Deep Dive →
        </button>
      </div>

      {/* EXECUTIVE INSTRUMENT KPI CARDS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '24px' }}>
        {[
          { 
            label: 'First-Time Fix Rate', 
            value: currentKPI?.ftfr || 0, 
            target: data?.kpi?.targets?.ftfr || 85, 
            delta: prevKPI ? Math.round((currentKPI.ftfr - prevKPI.ftfr) * 10) / 10 : null, 
            higherBetter: true, 
            driver: 'Fewer repeat bounces lift this',
            badgeText: 'Optimal Benchmark'
          },
          { 
            label: 'Customer Satisfaction (C-SAT)', 
            value: currentKPI?.csat || 0, 
            target: data?.kpi?.targets?.csat || 95, 
            delta: prevKPI ? Math.round((currentKPI.csat - prevKPI.csat) * 10) / 10 : null, 
            higherBetter: true, 
            driver: 'Fewer detractor ratings lift this',
            badgeText: 'Near Target'
          },
          { 
            label: 'Mean Time to Repair (MTTR)', 
            value: currentKPI?.mttr || 0, 
            target: data?.kpi?.targets?.mttr || 3.5, 
            delta: prevKPI ? Math.round((currentKPI.mttr - prevKPI.mttr) * 100) / 100 : null, 
            higherBetter: false, 
            format: (v: number) => `${v.toFixed(2)}d`,
            driver: 'Faster turnaround lowers this',
            badgeText: 'Best in 12 Months'
          },
          { 
            label: 'Diagnostic Accuracy', 
            value: currentKPI?.diag || 0, 
            target: data?.kpi?.targets?.diag || 90, 
            delta: prevKPI ? Math.round((currentKPI.diag - prevKPI.diag) * 10) / 10 : null, 
            higherBetter: true, 
            driver: 'Fewer part mismatches lift this',
            badgeText: 'Exceeding Standard'
          },
        ].map((k, i) => {
          const isGood = k.higherBetter ? k.value >= k.target : k.value <= k.target;

          return (
            <div className="decision-kpi-card" key={i}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {k.label}
                  </span>
                  <span style={{
                    fontSize: '10.5px',
                    fontWeight: 700,
                    background: isGood ? 'var(--badge-emerald-bg)' : 'var(--badge-amber-bg)',
                    color: isGood ? 'var(--badge-emerald-text)' : 'var(--badge-amber-text)',
                    border: `1px solid ${isGood ? 'var(--badge-emerald-border)' : 'var(--badge-amber-border)'}`,
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {k.badgeText}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                    {k.format ? k.format(k.value) : fmtPct(k.value)}
                  </span>
                  {k.delta !== null && (
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: k.delta >= 0 === k.higherBetter ? '#047857' : '#be123c',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '2px'
                    }}>
                      {k.delta >= 0 ? '↑' : '↓'} {k.format ? k.format(Math.abs(k.delta)) : fmtPct(Math.abs(k.delta))}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748b', marginBottom: '8px' }}>
                  <span>Target: <b>{k.format ? k.format(k.target) : fmtPct(k.target)}</b></span>
                  <span>Variance: <b style={{ color: isGood ? '#047857' : '#b45309' }}>{isGood ? 'Optimal' : 'Needs Focus'}</b></span>
                </div>
                <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden', marginBottom: '10px' }}>
                  <div style={{
                    width: `${Math.min(100, Math.max(0, (k.value / k.target) * 100))}%`,
                    height: '100%',
                    background: isGood ? 'linear-gradient(90deg, #4E67EB, #10b981)' : 'linear-gradient(90deg, #f59e0b, #ef4444)'
                  }}></div>
                </div>
                <div style={{ fontSize: '11.5px', color: '#475569', fontWeight: 500 }}>
                  {k.driver}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Section Navigator Bar */}
      <div style={{
        position: 'sticky',
        top: '0px',
        zIndex: 90,
        background: '#ffffff',
        borderBottom: '2px solid #e2e8f0',
        padding: '10px 16px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: '10px',
        boxShadow: '0 4px 12px -2px rgba(0,0,0,0.06)',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '4px' }}>
            Jump to Deep Dive:
          </span>
          <button onClick={() => scrollToSection('sec-leakage')} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
            Leakage Exposure
          </button>
          <button onClick={() => scrollToSection('sec-mttr')} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
            MTTR Deep Dive
          </button>
          <button onClick={() => scrollToSection('sec-csat')} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
            C-SAT Deep Dive
          </button>
          <button onClick={() => scrollToSection('sec-trends')} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
            KPI Trends &amp; Changes
          </button>
          <button onClick={() => scrollToSection('sec-calc')} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
            KPI Formulas
          </button>
        </div>

        <button
          onClick={toggleExpandAll}
          style={{
            background: '#111827',
            color: '#ffffff',
            border: 'none',
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          {allExpanded ? 'Collapse All Sections' : 'Expand All Sections'}
        </button>
      </div>

      {/* SECTION 1: LEAKAGE EXPOSURE DEEP DIVE ACCORDION */}
      <div id="sec-leakage" className="panel" style={{ marginBottom: '24px', padding: '0', overflow: 'hidden' }}>
        <div
          onClick={() => toggleSection('leakage')}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            background: '#f8fafc',
            borderBottom: expandedSections.leakage ? '1px solid #e2e8f0' : 'none',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#E50046' }}>
              {expandedSections.leakage ? '▼' : '▶'}
            </span>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                Estimated Monthly Leakage Exposure Deep Dive
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Service at Home (S@H) component-level line items summing to total headline leakage of {fmtINR(activeLeakCur)} (excluding walk-in calls) for {currentKPI?.month || selectedMonth}
              </span>
            </div>
          </div>
          <span style={{ background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 800 }}>
            Total Exposure: {fmtINR(activeLeakCur)}
          </span>
        </div>

        {expandedSections.leakage && (
          <div style={{ padding: '20px' }}>
            <div style={{ overflowX: 'auto' }}>
              <Table density="comfortable">
                <TableHeader>
                  <TableRow>
                    <TableHead style={{ textAlign: 'left' }}>Line Item / Component</TableHead>
                    <TableHead style={{ textAlign: 'center' }}>Quantity (Units / Visits)</TableHead>
                    <TableHead style={{ textAlign: 'right' }}>Total Exposure Cost</TableHead>
                    <TableHead style={{ textAlign: 'right' }}>% Share of Total</TableHead>
                    <TableHead style={{ textAlign: 'center' }}>MoM Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentBreakdown.map((item: any, idx: number) => {
                    const prevItem = prevBreakdown.find((pb: any) => pb.key === item.key || pb.label === item.label);
                    const prevCost = prevItem?.cost || 0;
                    const costDiff = prevKPI ? (item.cost - prevCost) : 0;
                    const pctShare = activeLeakCur > 0 ? ((item.cost / activeLeakCur) * 100).toFixed(1) : '0.0';

                    return (
                      <TableRow key={idx}>
                        <TableCell style={{ textAlign: 'left', fontWeight: 600, color: '#1e293b' }}>{item.label}</TableCell>
                        <TableCell style={{ textAlign: 'center', fontWeight: 600, color: '#475569' }}>
                          {(item.quantity || 0).toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                          {fmtINR(item.cost || 0)}
                        </TableCell>
                        <TableCell style={{ textAlign: 'right', fontWeight: 600, color: '#64748b' }}>
                          {pctShare}%
                        </TableCell>
                        <TableCell style={{ textAlign: 'center', fontWeight: 700 }}>
                          {prevKPI ? (
                            <span style={{
                              color: costDiff < 0 ? '#047857' : costDiff > 0 ? '#be123c' : '#475569',
                              background: costDiff < 0 ? '#d1fae5' : costDiff > 0 ? '#ffe4e6' : '#e2e8f0',
                              border: `1px solid ${costDiff < 0 ? '#34d399' : costDiff > 0 ? '#f87171' : '#cbd5e1'}`,
                              padding: '3px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 700
                            }}>
                              {costDiff > 0 ? `↑ +${fmtINR(costDiff)}` : costDiff < 0 ? `↓ -${fmtINR(Math.abs(costDiff))}` : '• Stable'}
                            </span>
                          ) : (
                            <span style={{ color: '#64748b', fontSize: '12px' }}>• Baseline</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                <TableSummaryRow>
                  <TableCell style={{ textAlign: 'left' }}>TOTAL MONTHLY LEAKAGE</TableCell>
                  <TableCell style={{ textAlign: 'center' }}>
                    {currentBreakdown.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0).toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell style={{ textAlign: 'right' }}>
                    {fmtINR(activeLeakCur)}
                  </TableCell>
                  <TableCell style={{ textAlign: 'right' }}>
                    100.0%
                  </TableCell>
                  <TableCell style={{ textAlign: 'center' }}>
                    {prevKPI ? (
                      <span style={{
                        color: activeLeakDelta < 0 ? '#047857' : activeLeakDelta > 0 ? '#be123c' : '#475569',
                        background: activeLeakDelta < 0 ? '#d1fae5' : activeLeakDelta > 0 ? '#ffe4e6' : '#e2e8f0',
                        border: `1px solid ${activeLeakDelta < 0 ? '#34d399' : activeLeakDelta > 0 ? '#f87171' : '#cbd5e1'}`,
                        padding: '3px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 700
                      }}>
                        {activeLeakDelta > 0 ? `↑ +${fmtINR(activeLeakDelta)}` : activeLeakDelta < 0 ? `↓ -${fmtINR(Math.abs(activeLeakDelta))}` : '• Stable'}
                      </span>
                    ) : (
                      <span style={{ color: '#64748b', fontSize: '12px' }}>• Baseline</span>
                    )}
                  </TableCell>
                </TableSummaryRow>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: MEAN TIME TO REPAIR (MTTR) DEEP DIVE ACCORDION */}
      <div id="sec-mttr" className="panel" style={{ marginBottom: '24px', padding: '0', overflow: 'hidden' }}>
        <div
          onClick={() => toggleSection('mttr')}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            background: '#f8fafc',
            borderBottom: expandedSections.mttr ? '1px solid #e2e8f0' : 'none',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#E50046' }}>
              {expandedSections.mttr ? '▼' : '▶'}
            </span>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                Mean Time to Repair (MTTR) Deep Dive ({currentKPI?.month || selectedMonth})
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Frequency breakdown of work orders by turnaround speed (1 Day, 2–3 Days, &gt;3 Days)
              </span>
            </div>
          </div>
          <span style={{ background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 800 }}>
            Average MTTR: {(currentKPI?.mttr || 0).toFixed(2)} Days
          </span>
        </div>

        {expandedSections.mttr && (
          <div style={{ padding: '20px' }}>
            {/* Top Summary Badges Row */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {currentTatDist.map((item: any, idx: number) => {
                const badgeColor = item.key === '1d' ? '#10b981' : item.key === '3d' ? '#f59e0b' : '#ef4444';
                const bgTint = item.key === '1d' ? '#ecfdf5' : item.key === '3d' ? '#fffbeb' : '#fef2f2';
                return (
                  <div key={idx} style={{
                    background: bgTint,
                    border: `1px solid ${badgeColor}40`,
                    borderRadius: '10px',
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    flex: 1,
                    minWidth: '180px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: badgeColor, flexShrink: 0 }}></span>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                      {item.quantity.toLocaleString('en-IN')} <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>({item.pct}%)</span>
                    </div>
                  </div>
                );
              })}

              {/* Total Work Orders Summary Badge */}
              {(() => {
                const totalWo = currentTatDist.reduce((sum: number, i: any) => sum + (i.quantity || 0), 0);
                return (
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    flex: 1,
                    minWidth: '180px'
                  }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                      Total Monthly Work Orders
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                      {totalWo.toLocaleString('en-IN')} <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>(100.0%)</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Full Width Frequency Bar Chart */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px 20px 10px 20px', height: '300px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Turnaround Speed Frequency Distribution (Work Order Count &amp; % Share)
              </div>
              {isMounted && (
                <ResponsiveContainer width="100%" height="82%">
                  <BarChart data={currentTatDist} margin={{ top: 25, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="label" tickLine={false} style={{ fontSize: '12px', fontWeight: 700, fill: '#1e293b' }} />
                    <YAxis tickLine={false} style={{ fontSize: '11px', fill: '#64748b' }} />
                    <Tooltip formatter={(val: any) => [`${val.toLocaleString('en-IN')} work orders`, 'Quantity']} />
                    <Bar dataKey="quantity" name="Work Orders" radius={[6, 6, 0, 0]}>
                      {currentTatDist.map((entry: any, index: number) => {
                        const colors = ['#10b981', '#f59e0b', '#ef4444'];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                      <LabelList
                        dataKey="quantity"
                        position="top"
                        content={({ x, y, width, index }: any) => {
                          const entry = currentTatDist[index];
                          if (!entry) return null;
                          const countStr = entry.quantity.toLocaleString('en-IN');
                          const pctStr = `${entry.pct}%`;
                          return (
                            <text
                              x={Number(x) + Number(width) / 2}
                              y={Number(y) - 8}
                              fill="#0f172a"
                              textAnchor="middle"
                              fontSize={13}
                              fontWeight={800}
                            >
                              {countStr} ({pctStr})
                            </text>
                          );
                        }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: CUSTOMER SATISFACTION (C-SAT) DEEP DIVE ACCORDION */}
      <div id="sec-csat" className="panel" style={{ marginBottom: '24px', padding: '0', overflow: 'hidden' }}>
        <div
          onClick={() => toggleSection('csat')}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            background: '#f8fafc',
            borderBottom: expandedSections.csat ? '1px solid #e2e8f0' : 'none',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#E50046' }}>
              {expandedSections.csat ? '▼' : '▶'}
            </span>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                Customer Satisfaction (C-SAT) Deep Dive
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Empirical NPS survey distribution, feedback channel breakdown (WhatsApp vs IVR), and rating frequencies for {currentKPI?.month || selectedMonth}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
              ✓ Verified NPS Dataset (10,570 Surveys)
            </span>
            <span style={{ background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 800 }}>
              C-SAT Score: {fmtPct(currentKPI?.csat || 83.4)}
            </span>
          </div>
        </div>

        {expandedSections.csat && (
          <div style={{ padding: '20px' }}>
            {/* Top KPI Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>C-SAT Satisfaction Index</span>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#16a34a' }}>{fmtPct(currentKPI?.csat || 83.4)}</span>
                <span style={{ fontSize: '11px', color: '#475569' }}>Target 95.0% (+1.2% MoM)</span>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Net Promoter Score (NPS)</span>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#2563eb' }}>+63.9</span>
                <span style={{ fontSize: '11px', color: '#475569' }}>Promoters % − Detractors %</span>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Detractor Rate (1-2 Stars)</span>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#dc2626' }}>10.0%</span>
                <span style={{ fontSize: '11px', color: '#dc2626' }}>372 Detractor Work Orders</span>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Survey Response Rate</span>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>35.1%</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>3,707 Responded / 10,570 Sent</span>
              </div>
            </div>

            {/* Top Summary Badges Row for Rating 5 to 1 */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {currentCsatDist.map((item: any, idx: number) => {
                const badgeColor = item.key === '5' ? '#10b981' : item.key === '4' ? '#34d399' : item.key === '3' ? '#f59e0b' : item.key === '2' ? '#f97316' : '#ef4444';
                const bgTint = item.key === '5' || item.key === '4' ? '#ecfdf5' : item.key === '3' ? '#fffbeb' : '#fef2f2';
                return (
                  <div key={idx} style={{
                    background: bgTint,
                    border: `1px solid ${badgeColor}40`,
                    borderRadius: '10px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    flex: 1,
                    minWidth: '150px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: badgeColor, flexShrink: 0 }}></span>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                      {item.quantity.toLocaleString('en-IN')} <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>({item.pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Full Width Rating Frequency Bar Chart */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px 20px 10px 20px', height: '300px', marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Rating Frequency Distribution (Rating 1 to Rating 5 Count &amp; % Share)
              </div>
              {isMounted && (
                <ResponsiveContainer width="100%" height="82%">
                  <BarChart data={currentCsatDist} margin={{ top: 25, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="label" tickLine={false} style={{ fontSize: '12px', fontWeight: 700, fill: '#1e293b' }} />
                    <YAxis tickLine={false} style={{ fontSize: '11px', fill: '#64748b' }} />
                    <Tooltip formatter={(val: any) => [`${val.toLocaleString('en-IN')} survey responses`, 'Quantity']} />
                    <Bar dataKey="quantity" name="Responses" radius={[6, 6, 0, 0]}>
                      {currentCsatDist.map((entry: any, index: number) => {
                        const colors = ['#10b981', '#34d399', '#f59e0b', '#f97316', '#ef4444'];
                        return <Cell key={`cell-csat-${index}`} fill={colors[index % colors.length]} />;
                      })}
                      <LabelList
                        dataKey="quantity"
                        position="top"
                        content={({ x, y, width, index }: any) => {
                          const item = currentCsatDist[index];
                          if (!item) return null;
                          return (
                            <text
                              x={Number(x) + Number(width) / 2}
                              y={Number(y) - 8}
                              fill="#0f172a"
                              textAnchor="middle"
                              style={{ fontSize: '12px', fontWeight: 800 }}
                            >
                              {`${item.quantity.toLocaleString('en-IN')} (${item.pct}%)`}
                            </text>
                          );
                        }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                NPS Survey Feedback Channel Performance (WhatsApp vs IVR)
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
                Performance breakdown across automated customer feedback touchpoints
              </div>

              <Table density="comfortable">
                <TableHeader>
                  <TableRow>
                    <TableHead style={{ textAlign: 'left' }}>Survey Channel</TableHead>
                    <TableHead style={{ textAlign: 'right' }}>Surveys Sent</TableHead>
                    <TableHead style={{ textAlign: 'right' }}>Responded Count</TableHead>
                    <TableHead style={{ textAlign: 'right' }}>Response Rate</TableHead>
                    <TableHead style={{ textAlign: 'right' }}>Promoters &amp; Satisfied (4-5★)</TableHead>
                    <TableHead style={{ textAlign: 'right' }}>Detractors (1-2★)</TableHead>
                    <TableHead style={{ textAlign: 'right' }}>Net Promoter Score</TableHead>
                    <TableHead style={{ textAlign: 'right' }}>Channel CSAT %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell style={{ textAlign: 'left', fontWeight: 700, color: '#4E67EB' }}>WhatsApp Channel</TableCell>
                    <TableCell style={{ textAlign: 'right', fontWeight: 600 }}>6,339</TableCell>
                    <TableCell style={{ textAlign: 'right', fontWeight: 600 }}>2,690</TableCell>
                    <TableCell style={{ textAlign: 'right', fontWeight: 600, color: '#475569' }}>42.4%</TableCell>
                    <TableCell style={{ textAlign: 'right', fontWeight: 700, color: '#047857' }}>2,208 (82.1%)</TableCell>
                    <TableCell style={{ textAlign: 'right', fontWeight: 700, color: '#be123c' }}>292 (10.9%)</TableCell>
                    <TableCell style={{ textAlign: 'right', fontWeight: 800, color: '#1d4ed8' }}>+61.3</TableCell>
                    <TableCell style={{ textAlign: 'right', fontWeight: 800, color: '#047857' }}>82.1%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ textAlign: 'left', fontWeight: 700, color: '#7e22ce' }}>IVR Call Channel</TableCell>
                    <TableCell style={{ textAlign: 'right', fontWeight: 600 }}>4,231</TableCell>
                    <TableCell style={{ textAlign: 'right', fontWeight: 600 }}>1,017</TableCell>
                    <TableCell style={{ textAlign: 'right', fontWeight: 600, color: '#475569' }}>24.0%</TableCell>
                    <TableCell style={{ textAlign: 'right', fontWeight: 700, color: '#047857' }}>882 (86.7%)</TableCell>
                    <TableCell style={{ textAlign: 'right', fontWeight: 700, color: '#be123c' }}>80 (7.9%)</TableCell>
                    <TableCell style={{ textAlign: 'right', fontWeight: 800, color: '#1d4ed8' }}>+71.3</TableCell>
                    <TableCell style={{ textAlign: 'right', fontWeight: 800, color: '#047857' }}>86.7%</TableCell>
                  </TableRow>
                </TableBody>
                <TableSummaryRow>
                  <TableCell style={{ textAlign: 'left' }}>Total / National Overall</TableCell>
                  <TableCell style={{ textAlign: 'right' }}>10,570</TableCell>
                  <TableCell style={{ textAlign: 'right' }}>3,707</TableCell>
                  <TableCell style={{ textAlign: 'right' }}>35.1%</TableCell>
                  <TableCell style={{ textAlign: 'right', color: '#047857' }}>3,090 (83.4%)</TableCell>
                  <TableCell style={{ textAlign: 'right', color: '#be123c' }}>372 (10.0%)</TableCell>
                  <TableCell style={{ textAlign: 'right', color: '#1d4ed8' }}>+63.9</TableCell>
                  <TableCell style={{ textAlign: 'right', color: '#047857', fontSize: '15px' }}>83.4%</TableCell>
                </TableSummaryRow>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: ORGANIZATIONAL KPI TREND LINES & WHAT CHANGED ACCORDION */}
      <div id="sec-trends" className="panel" style={{ marginBottom: '24px', padding: '0', overflow: 'hidden' }}>
        <div
          onClick={() => toggleSection('trends')}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            background: '#f8fafc',
            borderBottom: expandedSections.trends ? '1px solid #e2e8f0' : 'none',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#E50046' }}>
              {expandedSections.trends ? '▼' : '▶'}
            </span>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                Organizational KPI Trends &amp; Monthly Shifts ({currentKPI?.month || selectedMonth})
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Multi-month trajectory lines for FTFR, C-SAT, MTTR, Diagnostic Accuracy and MoM operational changes
              </span>
            </div>
          </div>
          <span style={{ background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 800 }}>
            {allMonths.length} Months Trajectory
          </span>
        </div>

        {expandedSections.trends && (
          <div style={{ padding: '20px' }}>
            <div className="exec-grid">
              <div className="panel" style={{ boxShadow: 'none', border: '1px solid #e2e8f0', margin: 0 }}>
                <div className="panel-h">Organizational KPI Trend Lines</div>
                <div className="chart-box-mock">
                  {isMounted && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.kpi.months} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                        <XAxis dataKey="month" tickLine={false} />
                        <YAxis yAxisId="left" domain={[75, 100]} label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} tickLine={false} />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 4]} label={{ value: 'Days', angle: 90, position: 'insideRight' }} tickLine={false} />
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        <Line yAxisId="left" type="monotone" dataKey="ftfr" name="First-time fix rate (%)" stroke="#2E4D8E" strokeWidth={3} />
                        <Line yAxisId="left" type="monotone" dataKey="csat" name="C-SAT (%)" stroke="#4E67EB" strokeWidth={3} />
                        <Line yAxisId="left" type="monotone" dataKey="diag" name="Diagnostic accuracy (%)" stroke="#C0392B" strokeWidth={3} />
                        <Line yAxisId="right" type="monotone" dataKey="mttr" name="MTTR (days)" stroke="#D98A1F" strokeWidth={3} strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="panel" style={{ boxShadow: 'none', border: '1px solid #e2e8f0', margin: 0 }}>
                <div className="panel-h">What Changed in {currentKPI?.month || selectedMonth}?</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {[
                    { 
                      title: 'Same-day swaps leakage', 
                      diff: prevKPI ? ((currentKPI._leakparts.pcba + currentKPI._leakparts.lcd) - (prevKPI._leakparts.pcba + prevKPI._leakparts.lcd)) : 0, 
                      desc: `Swapped parts: ${currentKPI._leakparts.pcba} PCBAs, ${currentKPI._leakparts.lcd} LCDs.`, 
                      negativeBad: true 
                    },
                    { 
                      title: 'Repeat visit travel charge', 
                      diff: prevKPI ? (currentKPI._leaktravel - (prevKPI._leaktravel || 0)) : 0, 
                      desc: `${currentKPI._leaktravel} devices bounced back for follow-up repairs.`, 
                      negativeBad: true 
                    },
                    { 
                      title: 'C-SAT / Detractors count', 
                      diff: prevKPI ? (currentKPI.detractor - (prevKPI.detractor || 0)) : 0, 
                      desc: `Detractors count: ${currentKPI.detractor} cases.`, 
                      negativeBad: true 
                    }
                  ].map((w, index) => {
                    const colorClass = !prevKPI || w.diff === 0 ? 'flat' : (w.diff < 0 === w.negativeBad ? 'up' : 'down');
                    return (
                      <div className="wc-row" key={index}>
                        <div className={`wc-ind ${colorClass}`}>{!prevKPI || w.diff === 0 ? '•' : w.diff < 0 ? '↓' : '↑'}</div>
                        <div className="wc-body">
                          <div className="wc-name">{w.title}</div>
                          <div className="wc-detail">{w.desc} {prevKPI ? `(Changed by ${Math.abs(w.diff).toLocaleString()} cases vs ${prevKPI.month})` : ''}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 5: KPI FORMULAS & OPERATIONAL REVIEW ACCORDION */}
      <div id="sec-calc" className="panel" style={{ marginBottom: '24px', padding: '0', overflow: 'hidden' }}>
        <div
          onClick={() => toggleSection('calc')}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            background: '#f8fafc',
            borderBottom: expandedSections.calc ? '1px solid #e2e8f0' : 'none',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#E50046' }}>
              {expandedSections.calc ? '▼' : '▶'}
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

        {expandedSections.calc && (
          <div style={{ padding: '20px' }}>
            <div className="panel" style={{ borderLeft: '4px solid var(--cobalt)', marginBottom: '20px', boxShadow: 'none' }}>
              <div className="panel-h">Suggested monthly operational review cycle</div>
              <p className="exec-foot" style={{ border: 'none', padding: 0 }}>
                This view refreshes when new monthly spreadsheets are uploaded. The intended review pattern:
                <b> 1) Scan</b> the org indicators and monthly exposures above for trends. <b>2) Drill down</b> in the Score Card tab to identify ASM/ASP outliers. 
                <b> 3) Coach</b> - open the Coaching Card to pull targeted conversation talk tracks for 1:1 sessions. <b>4) Act</b> - nominate chronic poor performers for technical training. 
                <b> 5) Re-measure</b> next month to verify if score profiles show performance improvement.
              </p>
            </div>

            <div className="panel-h" style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
              How each KPI is calculated
            </div>
            <div className="formula-grid">
              {DASHBOARD_DEFINITIONS.kpiCalculations.map((item, idx) => (
                <div className="fz" key={idx} style={{ marginBottom: '10px' }}>
                  <div className="fz-name" style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b' }}>{item.title}</div>
                  <div className="fz-def" style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>{item.definition}</div>
                </div>
              ))}
            </div>
            <div className="panel-note" style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--line)', fontSize: '11.5px', color: '#64748b' }}>
              {DASHBOARD_DEFINITIONS.kpiNote}
            </div>
          </div>
        )}
      </div>

      {/* Executive Footnote */}
      <div className="exec-foot" style={{ marginTop: '16px', padding: '12px 16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '11.5px', color: '#64748b', lineHeight: '1.6' }}>
        {DASHBOARD_DEFINITIONS.executiveFootnote}
      </div>
    </div>
  );
}
