'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { 
  LayoutDashboard, ShieldAlert, UploadCloud, ChevronRight, 
  MapPin, CheckCircle, AlertTriangle, RefreshCw, Send, LogOut, FileSpreadsheet,
  Settings, BookOpen, AlertCircle, TrendingUp, Info, HelpCircle
} from 'lucide-react';

// Static coaching guide playbooks matching HTML mockup
const STD_SCRIPTS = {
  ghost: {
    title: 'Same-day board swap (walk-in)',
    open: '"On these jobs, a high-value board part (PCBA/LCD) was billed on a walk-in and closed the same day. Walk me through how that\'s possible in one visit."',
    ask: [
      'Do you stock LCD/PCB boards at this centre? Show me the stock register.',
      'For these workorders, where is the defective board that was removed - is it in the return batch to Lava?',
      'Was the customer\'s device opened, diagnosed, and the board fitted in a single sitting? Who did it?'
    ],
    good: 'A genuine case: the ASP stocks the board, the old board is in the return log, and the repair is documented. That is fast, good service - acknowledge it.',
    watch: 'A concern: board billed, no matching return, no local stock. That needs escalation to the audit desk before any conclusion.'
  },
  home: {
    title: 'Board repair at home',
    open: '"Policy says major / board-level repairs go back to the ASP workshop - software and L1-L2 only at the doorstep. These were board jobs logged at home. Help me understand."',
    ask: [
      'Which technician logged the board replacement at the customer\'s address?',
      'Was the device actually carried back to the ASP and the system entry just made under a home visit?',
      'Do field kits at this centre carry board-level spares? They are not supposed to.'
    ],
    good: 'Sometimes the entry is a tagging error - the job was done at the ASP but logged under the home channel. Fixable with correct tagging.',
    watch: 'If boards are genuinely being swapped in the field without workshop tools, repair quality and warranty integrity are both at risk.'
  },
  cross: {
    title: 'Cross-ASP device collision',
    open: '"The same device (same IMEI) appears at two different service centres. Let\'s look at why a customer would go to two ASPs."',
    ask: [
      'Did the customer visit a second centre because the first repair did not hold?',
      'Or was the same IMEI used to book claims at two centres? Pull both workorders.',
      'Are both entries for the same genuine fault, or different symptoms?'
    ],
    good: 'Legitimate: a customer travelled, or sought a second opinion after an unresolved fault. That points to a quality issue at the first centre, not misconduct.',
    watch: 'Concern: same IMEI used to draw parts or claims at multiple centres. Cross-check the part-return log for both.'
  },
  bounce: {
    title: 'Repeat bounce (same device returns)',
    open: '"This device came back again after we said it was fixed. A repeat visit costs us money and annoys the customer. What happened on the first repair?"',
    ask: [
      'Was the root cause actually identified the first time, or was it a hit-and-trial part swap?',
      'Did the same technician handle both visits? What did they change the second time?',
      'Is this model showing a pattern of repeat bounces here?'
    ],
    good: 'A genuinely new, unrelated fault on the second visit is not a skill issue - confirm the symptoms differ.',
    watch: 'Same symptom bouncing back means the first diagnosis was wrong. This is a training signal - route to the Judgment Uplift Program.'
  },
  mmb: {
    title: 'Mismatch that bounced',
    open: '"A hardware symptom was closed with a software-only action, and then the device came back. The software fix did not hold. Let\'s review the diagnosis."',
    ask: [
      'What was the actual root cause? Was a hardware check (e.g. PCB resistance) done before closing on software?',
      'Was this a real No-Fault-Found, or was a hardware fault missed?',
      'Would a root-cause check (per the training: camera fault to IC short) have caught it?'
    ],
    good: 'A software fix for a software-rooted symptom is correct even if labelled hardware - confirm the root cause was genuinely software.',
    watch: 'If a hardware fault was closed on software and bounced, that is a diagnostic gap - the exact thing structured training fixes.'
  },
  det: {
    title: 'Detractor ratings (1-3)',
    open: '"These customers rated us 1 to 3 after the service. Let\'s look at what drove the low scores at this centre."',
    ask: [
      'Is there a common theme - delay, behaviour, repair not fixing the issue?',
      'Were these the repeat-visit customers, or first-time?',
      'What did the closing remarks say on these jobs?'
    ],
    good: 'A low score from an out-of-scope or out-of-warranty expectation gap is a communication fix, not a repair-quality one.',
    watch: 'Clustered detractors on one technician or one symptom point to a specific, coachable behaviour.'
  },
  doa: {
    title: 'DOA (dead on arrival)',
    open: '"These were logged as dead-on-arrival - failed at first use out of the box. This is a product/supply signal, not a service one, but we track it."',
    ask: [
      'Were these confirmed as true out-of-box failures, or later failures mis-tagged as DOA?',
      'Is one model or batch over-represented?'
    ],
    good: 'Genuine DOA is a manufacturing matter - route the pattern to the product/quality team, not the technician.',
    watch: 'If non-DOA failures are being tagged DOA to speed replacement, that is a process-discipline issue worth a quiet check.'
  }
};

export default function UnifiedMockupDashboard() {
  const router = useRouter();
  // SSR hydration guard — recharts cannot render on the server; only show charts after mount
  const [isMounted, setIsMounted] = useState(false);

  // Unified Dashboard Data state
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Primary active visual tabs matching mockup
  const [activeTab, setActiveTab] = useState<'exec' | 'deep' | 'coach' | 'ins' | 'eved' | 'cost' | 'upload'>('exec');

  // Part cost configuration states (editable master)
  const [costs, setCosts] = useState({
    pcba: 1800,
    lcd: 1200,
    battery: 600,
    camera: 400,
    speaker: 250,
    charger: 300,
    travel: 750,
  });

  // Score Card navigation / controls state
  const [scMode, setScMode] = useState<'single' | 'cohort'>('single');
  const [scLevel, setScLevel] = useState<'busm' | 'asm' | 'asp'>('busm');
  const [actorSel, setActorSel] = useState('');
  const [fb, setFb] = useState(''); // BUSM Filter
  const [fa, setFa] = useState(''); // ASM Filter
  const [fm, setFm] = useState(''); // Month Filter

  // Outlier threshold drawer state
  const [thrDrawer, setThrDrawer] = useState<{ open: boolean; title: string; overStrict: any[]; overP90: any[] }>({ open: false, title: '', overStrict: [], overP90: [] });

  // Coaching Card navigation / controls state
  const [cLevel, setCLevel] = useState<'asm' | 'asp' | 'busm'>('asm');
  const [cActor, setCActor] = useState('');
  const [nominated, setNominated] = useState<Map<string, any>>(new Map());

  // Evidence log list filters
  const [evF, setEvF] = useState({
    flag: '',
    busm: '',
    asm: '',
    asp: '',
    city: '',
    month: '',
    search: '',
  });

  // Webhook exception push state
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  // Upload ingestion state
  const [dragActive, setDragActive] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    // Load custom costs from local storage if existing
    const saved = localStorage.getItem('lava_assumed_costs');
    if (saved) {
      try {
        setCosts(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
    fetchDashboardPayload();
  }, []);

  const fetchDashboardPayload = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/dashboard/full-data');
      const payload = await res.json();
      
      if (res.status === 401) {
        router.push('/signin');
        return;
      }

      if (res.ok && payload.result) {
        setData(payload.result);
        
        // Auto default single actor dropdown options based on dynamic data
        const actors = [...new Set(payload.result.busm.map((r: any) => r.actor))] as string[];
        if (actors.length > 0) {
          setActorSel(actors[0]!);
        }

        // Auto default coaching dropdown options
        const coachingActors = Object.keys(payload.result.coaching.asm.cards).sort();
        if (coachingActors.length > 0) {
          setCActor(coachingActors[0]!);
        }
      } else {
        setError(payload.message || 'Failed to retrieve Unified Dashboard dataset.');
      }
    } catch (err) {
      setError('Connection to backend failed. Please verify that the services are online.');
    } finally {
      setLoading(false);
    }
  };

  // Synchronise costs state and write to localStorage
  const handleCostChange = (key: keyof typeof costs, value: number) => {
    const updated = { ...costs, [key]: value };
    setCosts(updated);
    localStorage.setItem('lava_assumed_costs', JSON.stringify(updated));
  };

  // Re-calculate monthly leakage exposure client-side
  const getLeakLive = (m: any) => {
    if (!m || !m._leakparts) return 0;
    return m._leakparts.pcba * costs.pcba + m._leakparts.lcd * costs.lcd + m._leaktravel * costs.travel;
  };

  const fmtINR = (v: number) => {
    return '₹' + Math.round(v).toLocaleString('en-IN');
  };

  const fmtPct = (v: number) => {
    return (v ?? 0).toFixed(1) + '%';
  };

  // Sign out helper
  const handleSignOut = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/signin');
  };

  // Ingestion File drag/drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadFile(e.dataTransfer.files[0]);
    }
  };

  const triggerUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    setUploadProgress(20);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      setUploadProgress(50);
      const res = await fetch('/api/v1/imports', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(90);
      const payload = await res.json();

      if (res.ok && payload.result) {
        setUploadResult(payload.result);
        setUploadProgress(100);
        fetchDashboardPayload();
      } else {
        setError(payload.message || 'File Ingestion failed.');
      }
    } catch (err) {
      setError('Network request timeout during upload.');
    } finally {
      setUploading(false);
    }
  };


  const handleSlackPush = () => {
    // NOTE: Slack integration is not yet wired up. Alert the user so they
    // are not misled into thinking a real notification was sent.
    alert('Slack integration is not yet configured. Please contact your administrator to set up the webhook URL.');
  };


  // Jumps to Evidence pre-filtered to actor and flag
  const triggerCoachingJump = (flag: string, actor: string) => {
    setActiveTab('eved');
    setEvF({
      flag: flag || '',
      busm: cLevel === 'busm' ? actor : '',
      asm: cLevel === 'asm' ? actor : '',
      asp: cLevel === 'asp' ? actor : '',
      city: '',
      month: '',
      search: '',
    });
  };

  const handleNominate = (actor: string, card: any) => {
    const nextMap = new Map(nominated);
    const key = `${cLevel}:${actor}`;
    if (nextMap.has(key)) {
      nextMap.delete(key);
    } else {
      // Find top reason
      const flagRates = [
        { name: 'same-day swaps', val: card.flags.ghost, p90: data.coaching[cLevel].thresholds.ghost.p90 },
        { name: 'board-at-home', val: card.flags.home, p90: data.coaching[cLevel].thresholds.home_board.p90 },
        { name: 'cross-ASP', val: card.flags.cross, p90: data.coaching[cLevel].thresholds.cross.p90 },
        { name: 'repeat bounces', val: card.flags.bounce, p90: data.coaching[cLevel].thresholds.bounce.p90 },
        { name: 'mismatch-bounced', val: card.flags.mmb, p90: data.coaching[cLevel].thresholds.mismatch.p90 },
      ];
      const hits = flagRates
        .filter((c) => (c.val / card.wo * 100) >= c.p90 && c.val >= 3)
        .map((c) => c.name);
      
      const reason = hits.length > 0 ? hits.join(', ') : 'cohort outlier';

      nextMap.set(key, {
        level: cLevel.toUpperCase(),
        actor,
        reason,
        audit: (card.trend.reduce((sum: number, x: any) => sum + x.audit, 0) / card.trend.length).toFixed(1),
        skill: (card.trend.reduce((sum: number, x: any) => sum + x.skill, 0) / card.trend.length).toFixed(1),
        process: (card.trend.reduce((sum: number, x: any) => sum + x.process, 0) / card.trend.length).toFixed(1),
        wo: card.wo,
      });
    }
    setNominated(nextMap);
  };

  const handleBulkNominate = () => {
    const nextMap = new Map(nominated);
    const cards = data.coaching[cLevel].cards;
    Object.entries(cards).forEach(([actorName, card]: [string, any]) => {
      if (card.nominate) {
        const key = `${cLevel}:${actorName}`;
        if (!nextMap.has(key)) {
          const flagRates = [
            { name: 'same-day swaps', val: card.flags.ghost, p90: data.coaching[cLevel].thresholds.ghost.p90 },
            { name: 'board-at-home', val: card.flags.home, p90: data.coaching[cLevel].thresholds.home_board.p90 },
            { name: 'cross-ASP', val: card.flags.cross, p90: data.coaching[cLevel].thresholds.cross.p90 },
            { name: 'repeat bounces', val: card.flags.bounce, p90: data.coaching[cLevel].thresholds.bounce.p90 },
            { name: 'mismatch-bounced', val: card.flags.mmb, p90: data.coaching[cLevel].thresholds.mismatch.p90 },
          ];
          const hits = flagRates
            .filter((c) => (c.val / card.wo * 100) >= c.p90 && c.val >= 3)
            .map((c) => c.name);
          const reason = hits.length > 0 ? hits.join(', ') : 'cohort outlier';

          nextMap.set(key, {
            level: cLevel.toUpperCase(),
            actor: actorName,
            reason,
            audit: (card.trend.reduce((sum: number, x: any) => sum + x.audit, 0) / card.trend.length).toFixed(1),
            skill: (card.trend.reduce((sum: number, x: any) => sum + x.skill, 0) / card.trend.length).toFixed(1),
            process: (card.trend.reduce((sum: number, x: any) => sum + x.process, 0) / card.trend.length).toFixed(1),
            wo: card.wo,
          });
        }
      }
    });
    setNominated(nextMap);
  };

  const handleDownloadNominations = () => {
    const list = Array.from(nominated.values());
    if (list.length === 0) return;
    const headers = ['Level', 'Actor', 'Flagged For', 'Audit Score', 'Skill Score', 'Process Score', 'Workorders'];
    const rows = list.map((x) => [x.level, x.actor, x.reason, x.audit, x.skill, x.process, x.wo]);
    const csvContent = [headers, ...rows].map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'judgment_uplift_nominations.csv';
    link.click();
  };

  if (loading || !data) {
    return (
      <div className="mockup-dashboard wrap" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '100px 0' }}>
        <RefreshCw className="animate-spin" size={40} style={{ color: 'var(--cobalt)' }} />
        <p style={{ fontWeight: 600, color: 'var(--muted)', fontSize: '14px' }}>Loading and compiling database aggregates...</p>
        {error && <p style={{ color: 'var(--bad)', fontWeight: 600 }}>{error}</p>}
      </div>
    );
  }

  // Find unique months in order
  const uniqueMonths = data.org.map((r: any) => r.month);

  // Extract variables for easier markup layout mapping
  const latestKPI = data.kpi.months[data.kpi.months.length - 1];
  const previousKPI = data.kpi.months[data.kpi.months.length - 2];

  // Leakage values based on cost configurations
  const leakCur = getLeakLive(latestKPI);
  const leakPrev = getLeakLive(previousKPI);
  const leakDelta = leakCur - leakPrev;
  const annualLeakRunRate = leakCur * 12;

  return (
    <div className="mockup-dashboard">
      <header className="mockup-header">
        <div className="wrap">
          <div className="brand-title">
            <img
              src="/logo_144.png"
              alt="ZenLearn"
              style={{ height: '38px', width: 'auto', display: 'block', borderRadius: '4px' }}
            />
            <span style={{ fontSize: '11px', color: '#C5D1EE', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Decision Intelligence</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div>
              <h1>Decision Risk & Leakage Dashboard</h1>
              <p>Continuous monitoring of service centre integrity, technician skill gaps, and billing integrity anomalies.</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button 
                onClick={fetchDashboardPayload}
                className="btn-primary" 
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '6px' }}
              >
                <RefreshCw size={14} style={{ marginRight: '4px' }} />
                Sync
              </button>
              <button 
                onClick={handleSignOut}
                className="btn-primary"
                style={{ backgroundColor: 'transparent', color: '#C5D1EE', border: 'none', padding: '8px 12px' }}
              >
                <LogOut size={14} style={{ marginRight: '4px' }} />
                Logout
              </button>
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="tabs-mock">
            <button className={`tab-mock ${activeTab === 'exec' ? 'on' : ''}`} onClick={() => setActiveTab('exec')}>Executive One-Pager</button>
            <button className={`tab-mock ${activeTab === 'deep' ? 'on' : ''}`} onClick={() => setActiveTab('deep')}>Score Card</button>
            <button className={`tab-mock ${activeTab === 'coach' ? 'on' : ''}`} onClick={() => setActiveTab('coach')}>Coaching Card {nominated.size > 0 && <span style={{ background: 'var(--bad)', color: '#fff', borderRadius: '10px', padding: '1px 6px', fontSize: '10px', marginLeft: '4px' }}>{nominated.size}</span>}</button>
            <button className={`tab-mock ${activeTab === 'ins' ? 'on' : ''}`} onClick={() => setActiveTab('ins')}>Insights</button>
            <button className={`tab-mock ${activeTab === 'eved' ? 'on' : ''}`} onClick={() => setActiveTab('eved')}>Evidence & Hit-List</button>
            <button className={`tab-mock ${activeTab === 'cost' ? 'on' : ''}`} onClick={() => setActiveTab('cost')}>Part-Cost Assumptions</button>
            <button className={`tab-mock ${activeTab === 'upload' ? 'on' : ''}`} onClick={() => setActiveTab('upload')}>Ingest Data</button>
          </div>
        </div>
      </header>

      <div className="wrap" style={{ padding: '24px 0' }}>
        
        {/* ─── TAB 1: EXECUTIVE ONE-PAGER ─── */}
        {activeTab === 'exec' && (
          <div className="view-mock on">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span className="exec-sub">Reporting period: <b>{data.kpi.months.map((m: any) => m.month).join(' – ')}</b> &bull; active file: {data.summary.filename}</span>
              </div>
              <div className="exec-stamp">
                Provisional &mdash; placeholder costs used<br />Calculated live from database
              </div>
            </div>

            {/* Headline exposure box */}
            <div className="headline">
              <div className="hl-main">
                <div className="hl-label">Estimated monthly leakage exposure</div>
                <div className="hl-value">{fmtINR(leakCur)}</div>
                <div className={`hl-delta ${leakDelta < 0 ? 'up' : 'down'}`}>
                  {leakDelta < 0 ? '↓ ' : '↑ '}{fmtINR(Math.abs(leakDelta))} vs {previousKPI?.month || 'prior'}
                </div>
                <div className="hl-context">
                  Board-level part exposure (same-day walk-in swaps + board repairs logged at home) plus repeat home-visit travel, on <b>{latestKPI.month}</b> work orders. Annualised run-rate &asymp; <b>{fmtINR(annualLeakRunRate)}</b>. Configured using costs set in Part-Cost Assumptions.
                </div>
              </div>
              <div className="hl-side">
                <div className="hl-srow"><span className="k">First-time fix rate</span><span className="v">{fmtPct(latestKPI.ftfr)}</span></div>
                <div className="hl-srow"><span className="k">Customer satisfaction</span><span className="v">{fmtPct(latestKPI.csat)}</span></div>
                <div className="hl-srow"><span className="k">Mean time to repair</span><span className="v">{latestKPI.mttr.toFixed(2)} days</span></div>
                <div className="hl-srow"><span className="k">Work orders, {latestKPI.month}</span><span className="v">{(latestKPI.wo).toLocaleString('en-IN')}</span></div>
              </div>
            </div>

            {/* KPI Cards Strip */}
            <div className="kpi-strip">
              {[
                { label: 'First-time fix rate', value: latestKPI.ftfr, target: data.kpi.targets.ftfr, delta: latestKPI.d.ftfr, higherBetter: true, driver: 'Fewer repeat bounces lift this' },
                { label: 'Customer satisfaction', value: latestKPI.csat, target: data.kpi.targets.csat, delta: latestKPI.d.csat, higherBetter: true, driver: 'Fewer detractor ratings lift this' },
                { label: 'Mean time to repair', value: latestKPI.mttr, target: data.kpi.targets.mttr, delta: latestKPI.d.mttr, higherBetter: false, format: (v: number) => `${v.toFixed(2)} d`, driver: 'Faster doorstep turnaround lowers this' },
                { label: 'Diagnostic accuracy', value: latestKPI.diag, target: data.kpi.targets.diag, delta: latestKPI.d.diag, higherBetter: true, driver: 'Fewer hardware-software mismatches lift this' },
              ].map((k, i) => {
                const met = k.higherBetter ? k.value >= k.target : k.value <= k.target;
                const barColor = met ? '#1F9E6B' : (Math.abs(k.value - k.target) / k.target < 0.1 ? '#D98A1F' : '#C0392B');
                const fillWidth = k.higherBetter ? Math.max(8, Math.min(100, (k.value / k.target) * 100)) : Math.max(8, Math.min(100, (k.target / k.value) * 100));

                return (
                  <div className="kc" key={i}>
                    <div className="kc-label">{k.label}</div>
                    <div className="kc-value">{k.format ? k.format(k.value) : fmtPct(k.value)}</div>
                    <div className="kc-meta">
                      {k.delta !== null && (
                        <span className={`kc-trend ${k.delta >= 0 === k.higherBetter ? 'up' : 'down'}`}>
                          {k.delta >= 0 ? '↑' : '↓'} {k.format ? k.format(Math.abs(k.delta)) : fmtPct(Math.abs(k.delta))}
                        </span>
                      )}
                      <span className="kc-target">Target {k.format ? k.format(k.target) : fmtPct(k.target)}</span>
                    </div>
                    <div className="kc-bar">
                      <div className="kc-fill" style={{ width: `${fillWidth}%`, backgroundColor: barColor }}></div>
                    </div>
                    <div className="kc-driver">{k.driver}</div>
                  </div>
                );
              })}
            </div>

            {/* Split row: trend lines + what changed */}
            <div className="exec-grid">
              <div className="panel">
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

              <div className="panel">
                <div className="panel-h">What Changed in {latestKPI.month}?</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {[
                    { title: 'Same-day swaps leakage', diff: (latestKPI._leakparts.pcba + latestKPI._leakparts.lcd) - (previousKPI?._leakparts.pcba + previousKPI?._leakparts.lcd), desc: `Swapped parts: ${latestKPI._leakparts.pcba} PCBAs, ${latestKPI._leakparts.lcd} LCDs.`, negativeBad: true },
                    { title: 'Repeat visit travel charge', diff: latestKPI._leaktravel - (previousKPI?._leaktravel || 0), desc: `${latestKPI._leaktravel} devices bounced back for follow-up repairs.`, negativeBad: true },
                    { title: 'C-SAT / Detractors count', diff: latestKPI.detractor - (previousKPI?.detractor || 0), desc: `Detractors count changed by ${latestKPI.detractor - (previousKPI?.detractor || 0)} cases.`, negativeBad: true }
                  ].map((w, index) => {
                    const colorClass = w.diff === 0 ? 'flat' : (w.diff < 0 === w.negativeBad ? 'up' : 'down');
                    return (
                      <div className="wc-row" key={index}>
                        <div className={`wc-ind ${colorClass}`}>{w.diff < 0 ? '↓' : w.diff > 0 ? '↑' : '•'}</div>
                        <div className="wc-body">
                          <div className="wc-name">{w.title}</div>
                          <div className="wc-detail">{w.desc} (Changed by {Math.abs(w.diff).toLocaleString()} cases)</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="panel" style={{ borderLeft: '4px solid var(--cobalt)' }}>
              <div className="panel-h">Suggested monthly operational review cycle</div>
              <p className="exec-foot" style={{ border: 'none', padding: 0 }}>
                This view refreshes when new monthly spreadsheets are uploaded. The intended review pattern:
                <b> 1) Scan</b> the org indicators and monthly exposures above for trends. <b>2) Drill down</b> in the Score Card tab to identify ASM/ASP outliers. 
                <b> 3) Coach</b> - open the Coaching Card to pull targeted conversation talk tracks for 1:1 sessions. <b>4) Act</b> - nominate chronic poor performers for technical training. 
                <b> 5) Re-measure</b> next month to verify if score profiles show performance improvement.
              </p>
            </div>
          </div>
        )}

        {/* ─── TAB 2: SCORE CARD ─── */}
        {activeTab === 'deep' && (
          <div className="view-mock on">
            <div className="controls-mock">
              <div className="ctrl-mock">
                <label>View Mode</label>
                <div className="seg-mock">
                  <button className={scMode === 'single' ? 'on' : ''} onClick={() => setScMode('single')}>Single Actor 360</button>
                  <button className={scMode === 'cohort' ? 'on' : ''} onClick={() => setScMode('cohort')}>Compare Cohort</button>
                </div>
              </div>

              <div className="ctrl-mock">
                <label>Hierarchy Level</label>
                <div className="seg-mock">
                  <button className={scLevel === 'busm' ? 'on' : ''} onClick={() => { setScLevel('busm'); setActorSel(data.busm[0]?.actor || ''); }}>BUSM</button>
                  <button className={scLevel === 'asm' ? 'on' : ''} onClick={() => { setScLevel('asm'); setActorSel(data.asm[0]?.actor || ''); }}>ASM</button>
                  <button className={scLevel === 'asp' ? 'on' : ''} onClick={() => { setScLevel('asp'); setActorSel(data.asp[0]?.actor || ''); }}>ASP</button>
                </div>
              </div>

              {scMode === 'single' ? (
                <div className="ctrl-mock">
                  <label>Select Actor</label>
                  <select className="filter-select" value={actorSel} onChange={(e) => setActorSel(e.target.value)}>
                    {[...new Set(data[scLevel].map((r: any) => r.actor))].sort().map((name: any) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div className="ctrl-mock">
                    <label>Filter by BUSM</label>
                    <select className="filter-select" value={fb} onChange={(e) => { setFb(e.target.value); setFa(''); }}>
                      <option value="">All</option>
                      {Object.keys(data.hier).sort().map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="ctrl-mock">
                    <label>Filter by ASM</label>
                    <select className="filter-select" value={fa} onChange={(e) => setFa(e.target.value)}>
                      <option value="">All</option>
                      {fb && Object.keys(data.hier[fb] || {}).sort().map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="ctrl-mock">
                <label>Filter by Month</label>
                <select className="filter-select" value={fm} onChange={(e) => setFm(e.target.value)}>
                  <option value="">All Months</option>
                  {uniqueMonths.map((m: string) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Render Single Actor 360 View */}
            {scMode === 'single' && (
              <div id="singleView">
                {(() => {
                  const actRows = data[scLevel].filter((r: any) => r.actor === actorSel);
                  const filteredRows = fm ? actRows.filter((r: any) => r.month === fm) : actRows;
                  if (filteredRows.length === 0) {
                    return <div className="card-mock">No data available for this selection.</div>;
                  }

                  const totalWo = filteredRows.reduce((sum: number, r: any) => sum + r.wo, 0);
                  const processAvg = filteredRows.reduce((sum: number, r: any) => sum + r.process * r.wo, 0) / totalWo;
                  const skillAvg = filteredRows.reduce((sum: number, r: any) => sum + r.skill * r.wo, 0) / totalWo;
                  const auditAvg = filteredRows.reduce((sum: number, r: any) => sum + r.audit * r.wo, 0) / totalWo;

                  return (
                    <>
                      <div className="grid-mock k3">
                        <div className="card-mock kpi-mock">
                          <h3>Process Score (Avg)</h3>
                          <div className="big">{processAvg.toFixed(1)}</div>
                          <div className="sub">across period, {totalWo} WO</div>
                        </div>
                        <div className="card-mock kpi-mock">
                          <h3>Skill Score (Avg)</h3>
                          <div className="big">{skillAvg.toFixed(1)}</div>
                          <div className="sub">across period, {totalWo} WO</div>
                        </div>
                        <div className="card-mock kpi-mock">
                          <h3>Audit Score (Avg)</h3>
                          <div className="big">{auditAvg.toFixed(1)}</div>
                          <div className="sub">across period, {totalWo} WO</div>
                        </div>
                      </div>

                      <div className="grid-mock k2" style={{ marginTop: '16px' }}>
                        <div className="card-mock">
                          <h3>Score Trend - {actorSel}</h3>
                          <div className="chart-box-mock">
                            {isMounted && (
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={actRows}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                                  <XAxis dataKey="month" tickLine={false} />
                                  <YAxis domain={[70, 100]} tickLine={false} />
                                  <Tooltip />
                                  <Line type="monotone" dataKey="process" name="Process Score" stroke="#4E67EB" strokeWidth={3} />
                                  <Line type="monotone" dataKey="skill" name="Skill Score" stroke="#294D89" strokeWidth={3} />
                                  <Line type="monotone" dataKey="audit" name="Audit Score" stroke="#C0392B" strokeWidth={3} />
                                </LineChart>
                              </ResponsiveContainer>
                            )}
                          </div>
                        </div>

                        <div className="card-mock">
                          <h3>Anomalous Flag Counts by Month</h3>
                          <div className="tbl-wrap-mock">
                            <table>
                              <thead>
                                <tr>
                                  <th>Month</th>
                                  <th>WO</th>
                                  <th>Same-day Swap</th>
                                  <th>Board@Home</th>
                                  <th>Cross-ASP</th>
                                  <th>Bounce</th>
                                  <th>Mismatch</th>
                                  <th>Detractor</th>
                                  <th>DOA</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredRows.map((r: any, idx: number) => (
                                  <tr key={idx}>
                                    <td><b>{r.month}</b></td>
                                    <td>{r.wo}</td>
                                    <td>{r.ghost}</td>
                                    <td>{r.home_board}</td>
                                    <td>{r.cross}</td>
                                    <td>{r.bounce}</td>
                                    <td>{r.mismatch}</td>
                                    <td>{r.detractor}</td>
                                    <td>{r.doa}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Render Cohort Comparative View */}
            {scMode === 'cohort' && (
              <div id="cohortView">
                {(() => {
                  let filteredStats = data[scLevel].slice();
                  if (fb) {
                    if (scLevel === 'busm') filteredStats = filteredStats.filter((r: any) => r.actor === fb);
                    else if (scLevel === 'asm') {
                      const allowedAsms = Object.keys(data.hier[fb] || {});
                      filteredStats = filteredStats.filter((r: any) => allowedAsms.includes(r.actor));
                    } else {
                      const allowedAsps: string[] = [];
                      Object.values(data.hier[fb] || {}).forEach((arr: any) => allowedAsps.push(...arr));
                      filteredStats = filteredStats.filter((r: any) => allowedAsps.includes(r.actor));
                    }
                  }
                  if (fa && scLevel !== 'busm') {
                    if (scLevel === 'asm') filteredStats = filteredStats.filter((r: any) => r.actor === fa);
                    else {
                      let allowedAsps: string[] = [];
                      if (fb) allowedAsps = data.hier[fb]?.[fa] || [];
                      else {
                        Object.keys(data.hier).forEach((b) => {
                          if (data.hier[b]?.[fa]) allowedAsps.push(...data.hier[b]![fa]!);
                        });
                      }
                      filteredStats = filteredStats.filter((r: any) => allowedAsps.includes(r.actor));
                    }
                  }
                  if (fm) {
                    filteredStats = filteredStats.filter((r: any) => r.month === fm);
                  }

                  // Group by Actor to aggregate multiple months
                  const groupedActors = new Map<string, any[]>();
                  filteredStats.forEach((r: any) => {
                    const list = groupedActors.get(r.actor) || [];
                    list.push(r);
                    groupedActors.set(r.actor, list);
                  });

                  const aggData = Array.from(groupedActors.entries()).map(([actName, list]) => {
                    const totalWo = list.reduce((sum, r) => sum + r.wo, 0);
                    return {
                      actor: actName,
                      wo: totalWo,
                      process: list.reduce((sum, r) => sum + r.process * r.wo, 0) / totalWo,
                      skill: list.reduce((sum, r) => sum + r.skill * r.wo, 0) / totalWo,
                      audit: list.reduce((sum, r) => sum + r.audit * r.wo, 0) / totalWo,
                      ghost: list.reduce((sum, r) => sum + r.ghost, 0),
                      home_board: list.reduce((sum, r) => sum + r.home_board, 0),
                      cross: list.reduce((sum, r) => sum + r.cross, 0),
                      bounce: list.reduce((sum, r) => sum + r.bounce, 0),
                      mismatch: list.reduce((sum, r) => sum + r.mismatch, 0),
                      detractor: list.reduce((sum, r) => sum + r.detractor, 0),
                      doa: list.reduce((sum, r) => sum + r.doa, 0),
                      conf: list.some((r) => r.conf === 'LOW') ? 'LOW' : 'OK',
                    };
                  }).sort((x, y) => x.audit - y.audit);

                  if (aggData.length === 0) {
                    return <div className="card-mock">No comparative cohort data matching active filters.</div>;
                  }

                  const totalCohortWo = aggData.reduce((sum, r) => sum + r.wo, 0);
                  const wAvgProcess = aggData.reduce((sum, r) => sum + r.process * r.wo, 0) / totalCohortWo;
                  const wAvgSkill = aggData.reduce((sum, r) => sum + r.skill * r.wo, 0) / totalCohortWo;
                  const wAvgAudit = aggData.reduce((sum, r) => sum + r.audit * r.wo, 0) / totalCohortWo;

                  const rankDataSlice = aggData.slice(0, 12);
                  const minScore = Math.min(...rankDataSlice.map((r) => r.audit));

                  return (
                    <>
                      <div className="grid-mock k2">
                        <div className="card-mock">
                          <h3>Cohort Average Standings</h3>
                          <div className="chart-box-mock">
                            {isMounted && (
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                  { name: 'Process', score: wAvgProcess },
                                  { name: 'Skill', score: wAvgSkill },
                                  { name: 'Audit', score: wAvgAudit }
                                ]}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                                  <XAxis dataKey="name" tickLine={false} />
                                  <YAxis domain={[75, 100]} tickLine={false} />
                                  <Tooltip />
                                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                                    <Cell fill="#4E67EB" />
                                    <Cell fill="#294D89" />
                                    <Cell fill="#C0392B" />
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            )}
                          </div>
                        </div>

                        <div className="card-mock">
                          <h3>Worst 12 Outliers by Audit Score</h3>
                          <div className="chart-box-mock">
                            {isMounted && (
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={rankDataSlice}>
                                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--line)" />
                                  <XAxis type="number" domain={[Math.max(0, Math.floor(minScore - 3)), 100]} tickLine={false} />
                                  <YAxis type="category" dataKey="actor" tickLine={false} width={130} />
                                  <Tooltip />
                                  <Bar dataKey="audit" radius={[0, 4, 4, 0]}>
                                    {rankDataSlice.map((entry: any, index: number) => {
                                      const fill = entry.audit >= 95 ? '#1F9E6B' : entry.audit >= 90 ? '#D98A1F' : '#C0392B';
                                      return <Cell key={`cell-${index}`} fill={fill} />;
                                    })}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="card-mock" style={{ marginTop: '16px' }}>
                        <h3>{scLevel.toUpperCase()} Scorecard</h3>
                        <div className="tbl-wrap-mock">
                          <table>
                            <thead>
                              <tr>
                                <th>{scLevel.toUpperCase()} Name</th>
                                <th>Process</th>
                                <th>Skill</th>
                                <th>Audit</th>
                                <th>WO Count</th>
                                <th>Same-day Swap</th>
                                <th>Board@Home</th>
                                <th>Cross-ASP</th>
                                <th>Bounce</th>
                                <th>Mismatch</th>
                                <th>Detractor</th>
                                <th>DOA</th>
                                <th>Confidence</th>
                              </tr>
                            </thead>
                            <tbody>
                              {aggData.map((r, idx) => (
                                <tr key={idx}>
                                  <td><b>{r.actor}</b></td>
                                  <td><span className={`score-pill ${r.process >= 95 ? 's-good' : r.process >= 90 ? 's-warn' : 's-bad'}`}>{r.process.toFixed(1)}</span></td>
                                  <td><span className={`score-pill ${r.skill >= 95 ? 's-good' : r.skill >= 90 ? 's-warn' : 's-bad'}`}>{r.skill.toFixed(1)}</span></td>
                                  <td><span className={`score-pill ${r.audit >= 95 ? 's-good' : r.audit >= 90 ? 's-warn' : 's-bad'}`}>{r.audit.toFixed(1)}</span></td>
                                  <td>{r.wo.toLocaleString('en-IN')}</td>
                                  <td>{r.ghost}</td>
                                  <td>{r.home_board}</td>
                                  <td>{r.cross}</td>
                                  <td>{r.bounce}</td>
                                  <td>{r.mismatch}</td>
                                  <td>{r.detractor}</td>
                                  <td>{r.doa}</td>
                                  <td>{r.conf === 'LOW' ? <span style={{ color: 'var(--bad)', fontWeight: 700 }}>LOW</span> : 'OK'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Outlier thresholds list drawer panel */}
            <div className="sec-title">
              <div className="bar"></div>
              <span>Cohort Risk Threshold Configurations</span>
            </div>
            
            <div className="card-mock">
              <table>
                <thead>
                  <tr>
                    <th>Anomalous Indicator</th>
                    <th>Mean Rate (Typical)</th>
                    <th>Spread (StdDev)</th>
                    <th>Strict Threshold (Mean + 2SD)</th>
                    <th>Watch Threshold (P90)</th>
                    <th>Actors Over Strict Line</th>
                    <th>Actors Over Watch Line</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.coaching[scLevel].thresholds).map(([key, t]: [string, any]) => (
                    <tr key={key} style={{ cursor: 'pointer' }} onClick={() => setThrDrawer({ open: true, title: t.indicator, overStrict: t.over_strict, overP90: t.over_p90 })}>
                      <td><b>{t.indicator}</b></td>
                      <td>{t.mean}%</td>
                      <td>{t.sd}</td>
                      <td>{t.strict}%</td>
                      <td>{t.p90}%</td>
                      <td style={{ color: 'var(--bad)', fontWeight: 700 }}>{t.over_strict.length}</td>
                      <td style={{ color: 'var(--warn)', fontWeight: 700 }}>{t.over_p90.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {thrDrawer.open && (
              <div className="drawer-mock open" style={{ marginTop: '16px', background: 'var(--ice)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <b style={{ color: 'var(--deep)', fontSize: '14px' }}>Outlier Details &mdash; {thrDrawer.title}</b>
                  <button onClick={() => setThrDrawer({ open: false, title: '', overStrict: [], overP90: [] })} style={{ background: 'transparent', border: 'none', color: 'var(--bad)', cursor: 'pointer', fontWeight: 700 }}>[Close Details]</button>
                </div>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <b style={{ fontSize: '12px', color: 'var(--bad)' }}>Over Strict Investigation Limit ({thrDrawer.overStrict.length})</b>
                    <table style={{ marginTop: '8px' }}>
                      <thead>
                        <tr><th>Name</th><th>Flagged Rate</th></tr>
                      </thead>
                      <tbody>
                        {thrDrawer.overStrict.length === 0 ? (
                          <tr><td colSpan={2}>None in this category.</td></tr>
                        ) : (
                          thrDrawer.overStrict.map((x: any, i: number) => (
                            <tr key={i}><td><b>{x.asm}</b></td><td>{x.rate}%</td></tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <b style={{ fontSize: '12px', color: 'var(--warn)' }}>Over P90 Watch Limit ({thrDrawer.overP90.length})</b>
                    <table style={{ marginTop: '8px' }}>
                      <thead>
                        <tr><th>Name</th><th>Flagged Rate</th></tr>
                      </thead>
                      <tbody>
                        {thrDrawer.overP90.length === 0 ? (
                          <tr><td colSpan={2}>None in this category.</td></tr>
                        ) : (
                          thrDrawer.overP90.map((x: any, i: number) => (
                            <tr key={i}><td><b>{x.asm}</b></td><td>{x.rate}%</td></tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 3: COACHING CARD ─── */}
        {activeTab === 'coach' && (
          <div className="view-mock on">
            <div className="controls-mock">
              <div className="ctrl-mock">
                <label>Coaching Focus</label>
                <div className="seg-mock">
                  <button className={cLevel === 'asm' ? 'on' : ''} onClick={() => { setCLevel('asm'); const keys = Object.keys(data.coaching.asm.cards).sort(); setCActor(keys[0] || ''); }}>ASM</button>
                  <button className={cLevel === 'asp' ? 'on' : ''} onClick={() => { setCLevel('asp'); const keys = Object.keys(data.coaching.asp.cards).sort(); setCActor(keys[0] || ''); }}>ASP</button>
                  <button className={cLevel === 'busm' ? 'on' : ''} onClick={() => { setCLevel('busm'); const keys = Object.keys(data.coaching.busm.cards).sort(); setCActor(keys[0] || ''); }}>BUSM</button>
                </div>
              </div>

              <div className="ctrl-mock">
                <label>Select Staff Member</label>
                <select className="filter-select" value={cActor} onChange={(e) => setCActor(e.target.value)}>
                  {Object.keys(data.coaching[cLevel].cards).sort().map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginLeft: 'auto' }}>
                <button onClick={handleBulkNominate} className="btn-primary" style={{ background: 'var(--deep)' }}>Bulk Nominate P90+ Outliers</button>
              </div>
            </div>

            {/* Detail for selected Coach Actor */}
            {(() => {
              const card = data.coaching[cLevel].cards[cActor];
              if (!card) return <div className="card-mock">No coaching details loaded.</div>;

              const avgAudit = card.trend.reduce((sum: number, r: any) => sum + r.audit, 0) / card.trend.length;
              const avgSkill = card.trend.reduce((sum: number, r: any) => sum + r.skill, 0) / card.trend.length;
              const avgProcess = card.trend.reduce((sum: number, r: any) => sum + r.process, 0) / card.trend.length;

              const isNominated = nominated.has(`${cLevel}:${cActor}`);

              return (
                <div id="coachCard">
                  <div className="grid-mock k2">
                    <div className="card-mock">
                      <h3>{cActor} &mdash; Score Trend Summary</h3>
                      <div className="chart-box-mock" style={{ height: '240px' }}>
                        {isMounted && (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={card.trend}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                              <XAxis dataKey="month" tickLine={false} />
                              <YAxis domain={[80, 100]} tickLine={false} />
                              <Tooltip />
                              <Line type="monotone" dataKey="audit" name="Audit" stroke="#C0392B" strokeWidth={3} />
                              <Line type="monotone" dataKey="skill" name="Skill" stroke="#294D89" strokeWidth={3} />
                              <Line type="monotone" dataKey="process" name="Process" stroke="#4E67EB" strokeWidth={3} />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                      {!card.qualifies && (
                        <div className="note-mock" style={{ color: 'var(--bad)' }}>Low volume ({card.wo} WO) &mdash; ranking percentile values suppressed.</div>
                      )}
                    </div>

                    <div className="card-mock">
                      <h3>How {cActor} Compares to Cohort Average</h3>
                      {[
                        { label: 'Audit Score', val: avgAudit, mean: card.cohort_mean.audit, pct: card.pct.audit },
                        { label: 'Skill Score', val: avgSkill, mean: card.cohort_mean.skill, pct: card.pct.skill },
                        { label: 'Process Score', val: avgProcess, mean: card.cohort_mean.process, pct: card.pct.process },
                      ].map((bar, i) => {
                        const scorePct = Math.max(0, Math.min(100, (bar.val - 80) / 20 * 100));
                        const meanPct = Math.max(0, Math.min(100, (bar.mean - 80) / 20 * 100));
                        const barColor = bar.val >= 95 ? 'var(--good)' : (bar.val >= 90 ? 'var(--warn)' : 'var(--bad)');

                        return (
                          <div key={i} style={{ margin: '10px 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
                              <span><b>{bar.label}:</b> {bar.val.toFixed(1)}</span>
                              <span style={{ color: 'var(--muted)' }}>cohort average {bar.mean.toFixed(1)} &bull; better than {bar.pct}% of peers</span>
                            </div>
                            <div style={{ position: 'relative', height: '14px', background: '#EEF2FC', borderRadius: '7px' }}>
                              <div style={{ position: 'absolute', left: 0, top: 0, height: '14px', width: `${scorePct}%`, backgroundColor: barColor, borderRadius: '7px' }}></div>
                              <div style={{ position: 'absolute', left: `${meanPct}%`, top: '-3px', height: '20px', width: '2px', backgroundColor: 'var(--ink)' }} title="cohort average"></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Flag highlights panel */}
                  <div className="card-mock" style={{ marginTop: '16px' }}>
                    <h3>Anomalous Flag Highlights &mdash; Click arrows to drill down in Evidence Logs</h3>
                    <div className="grid-mock k4">
                      {[
                        { label: 'Same-day swaps', count: card.flags.ghost, flagName: 'Same-day board swap (walk-in)' },
                        { label: 'Board repairs at home', count: card.flags.home, flagName: 'Board repair at home' },
                        { label: 'Cross-ASP device collisions', count: card.flags.cross, flagName: 'Cross-ASP IMEI' },
                        { label: 'Repeat bounces', count: card.flags.bounce, flagName: 'Repeat bounce' },
                        { label: 'Mismatch bounced', count: card.flags.mmb, flagName: 'Mismatch that bounced' },
                        { label: 'NPS Detractors', count: card.flags.det },
                        { label: 'DOA cases', count: card.flags.doa },
                      ].map((f, i) => (
                        <div className="card-mock kpi-mock" key={i} style={{ padding: '13px 15px' }}>
                          <div className="big" style={{ fontSize: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {f.count}
                            {f.flagName && f.count > 0 && (
                              <button 
                                onClick={() => triggerCoachingJump(f.flagName, cActor)} 
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--cobalt)', fontWeight: 800 }}
                              >
                                &rarr;
                              </button>
                            )}
                          </div>
                          <div className="sub">{f.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Talk tracks */}
                  <div className="card-mock" style={{ marginTop: '16px' }}>
                    <h3>Target Talking Points for 1:1 Review Sessions</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {card.talking_points.map((tp: any, idx: number) => {
                        const borderCol = tp.sev === 'high' ? 'var(--bad)' : (tp.sev === 'mid' ? 'var(--warn)' : 'var(--good)');
                        return (
                          <li key={idx} style={{ padding: '9px 12px', margin: '6px 0', borderLeft: `4px solid ${borderCol}`, background: 'var(--ice)', borderRadius: '0 7px 7px 0', fontSize: '13px' }}>
                            {tp.text}
                          </li>
                        );
                      })}
                    </ul>
                    <button 
                      onClick={() => handleNominate(cActor, card)} 
                      className="btn-primary" 
                      style={{ marginTop: '12px', background: isNominated ? 'var(--bad)' : 'var(--mid)', color: '#fff' }}
                    >
                      {isNominated ? `Remove ${cActor} from Uplift Program` : `Nominate ${cActor} for Judgment Uplift Program`}
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Reusable standard conversation scripts */}
            <div className="card-mock" style={{ marginTop: '16px' }}>
              <h3>Standard Coaching Playbooks &mdash; How to address anomalous metrics with ASPs</h3>
              <p className="note-mock">Use these playbooks as starting talk tracks when discussing flagged workorders.</p>
              
              {Object.entries(STD_SCRIPTS).map(([key, s]) => (
                <details key={key} style={{ margin: '8px 0', border: '1px solid var(--line)', borderRadius: '8px', padding: '8px 12px' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--deep)' }}>{s.title}</summary>
                  <div style={{ fontSize: '13px', lineHeight: 1.7, marginTop: '8px' }}>
                    <p><b>Opening script line:</b> <span style={{ color: 'var(--muted)' }}>{s.open}</span></p>
                    <p><b>Verification questions:</b></p>
                    <ul style={{ marginLeft: '18px' }}>
                      {s.ask.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                    <p style={{ color: 'var(--good)' }}><b>Action track if valid:</b> {s.good}</p>
                    <p style={{ color: 'var(--bad)' }}><b>Action track if suspect:</b> {s.watch}</p>
                  </div>
                </details>
              ))}
            </div>

            {/* Nominations drawer list panel */}
            <div className="sec-title">
              <div className="bar"></div>
              <span>Uplift Program Nominations Tracker ({nominated.size})</span>
            </div>

            <div className="card-mock">
              <p className="note-mock" style={{ marginBottom: '12px' }}>Track outliers designated for custom training. Nominated list is exportable.</p>
              
              {nominated.size > 0 ? (
                <>
                  <div style={{ marginBottom: '12px' }}>
                    <button onClick={handleDownloadNominations} className="btn-primary" style={{ marginRight: '8px' }}>Export List (CSV)</button>
                    <button onClick={() => setNominated(new Map())} className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--bad)', color: 'var(--bad)' }}>Reset Tracker</button>
                  </div>
                  
                  <table>
                    <thead>
                      <tr>
                        <th>Staff Level</th>
                        <th>Name</th>
                        <th>Designated Exception Gaps</th>
                        <th>Audit Avg</th>
                        <th>Skill Avg</th>
                        <th>Process Avg</th>
                        <th>WO Volume</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from(nominated.values()).map((x, idx) => (
                        <tr key={idx}>
                          <td>{x.level}</td>
                          <td><b>{x.actor}</b></td>
                          <td>{x.reason}</td>
                          <td>{x.audit}</td>
                          <td>{x.skill}</td>
                          <td>{x.process}</td>
                          <td>{x.wo}</td>
                          <td>
                            <button onClick={() => {
                              const nextMap = new Map(nominated);
                              nextMap.delete(`${x.level.toLowerCase()}:${x.actor}`);
                              setNominated(nextMap);
                            }} style={{ background: 'transparent', border: 'none', color: 'var(--bad)', cursor: 'pointer', fontWeight: 600 }}>Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <p className="note-mock" style={{ color: 'var(--muted)', textAlign: 'center', padding: '20px 0' }}>No active nominations. Use the action button inside any staff member\'s coaching card to register them for training.</p>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 4: INSIGHTS ─── */}
        {activeTab === 'ins' && (
          <div className="view-mock on">
            <div className="sec-title">
              <div className="bar"></div>
              <span>Doorstep Board Repair Integrity Panel</span>
            </div>

            <div className="grid-mock k4">
              <div className="card-mock kpi-mock warnC">
                <div className="big">{(data.home?.board_at_home ?? 0).toLocaleString()}</div>
                <div className="sub">board replacements logged at home ({data.home?.pct_of_home}% of home visits)</div>
              </div>
              <div className="card-mock kpi-mock warnC">
                <div className="big">{(data.home?.pcba_at_home ?? 0).toLocaleString()}</div>
                <div className="sub">of which motherboard swaps (PCBA)</div>
              </div>
              <div className="card-mock kpi-mock warnC">
                <div className="big">{(data.home?.lcd_at_home ?? 0).toLocaleString()}</div>
                <div className="sub">of which display screens (LCD)</div>
              </div>
              <div className="card-mock kpi-mock warnC">
                <div className="big">{fmtINR(data.home?.pcba_at_home * costs.pcba + data.home?.lcd_at_home * costs.lcd)}</div>
                <div className="sub">assumed doorstep board swap exposure</div>
              </div>
            </div>

            <div className="grid-mock k2" style={{ marginTop: '16px' }}>
              <div className="card-mock">
                <h3>Top ASPs with Doorstep Board-level Swaps</h3>
                <table>
                  <thead>
                    <tr><th>ASP Name</th><th>Supervisor (ASM)</th><th>Doorstep Board Swaps Count</th></tr>
                  </thead>
                  <tbody>
                    {data.home?.top_asps.map((r: any, i: number) => (
                      <tr key={i}>
                        <td><b>{r.asp}</b></td>
                        <td>{r.asm}</td>
                        <td style={{ color: 'var(--bad)', fontWeight: 700 }}>{r.n}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="note-mock">
                  Pull files for these outlying service centers from the Evidence Logs first. Verify motherboard/display billings against parts-return batches.
                </div>
              </div>

              <div className="card-mock">
                <h3>Insights: Affected Model Series and Action Codes</h3>
                <p className="note-mock">Concentration by device model</p>
                <table style={{ marginBottom: '16px' }}>
                  <thead>
                    <tr><th>Device Model</th><th>Incident Count</th></tr>
                  </thead>
                  <tbody>
                    {data.home?.top_models.map((r: any, i: number) => (
                      <tr key={i}><td>{r.model}</td><td>{r.n}</td></tr>
                    ))}
                  </tbody>
                </table>

                <p className="note-mock">Concentration by action codes</p>
                <table>
                  <thead>
                    <tr><th>Action Recorded</th><th>Incident Count</th></tr>
                  </thead>
                  <tbody>
                    {data.home?.top_actions.map((r: any, i: number) => (
                      <tr key={i}><td>{r.action}</td><td>{r.n}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Structured verify workflow alerts */}
            <div className="card-mock" style={{ marginTop: '16px', borderLeft: '4px solid var(--cobalt)' }}>
              <h3>Recommended audit check guidelines for doorstep board billing</h3>
              <ol style={{ marginLeft: '18px', fontSize: '13px', lineHeight: '1.9', color: 'var(--muted)', marginTop: '8px' }}>
                <li>Export high-outlier doorstep workorders from the Evidence tab (filter flag: "Board repair at home").</li>
                <li>Cross check these against the defective-part returns tracker to check if defective motherboards/displays were physically returned.</li>
                <li>Verify ASP inventory registers to check if they stock board components locally. If no local stock exists, doorstep swap was not physically possible.</li>
                <li>Verify root cause. If software upgrades could resolve the symptom, check if the technician billed high-value boards on hit-and-trial diagnosis.</li>
              </ol>
            </div>
          </div>
        )}

        {/* ─── TAB 5: EVIDENCE & HIT-LIST ─── */}
        {activeTab === 'eved' && (
          <div className="view-mock on">
            <div className="controls-mock">
              <div className="ctrl-mock">
                <label>Filter Flag</label>
                <select className="filter-select" value={evF.flag} onChange={(e) => setEvF({ ...evF, flag: e.target.value })}>
                  <option value="">All Anomalies</option>
                  <option value="Same-day board swap (walk-in)">Same-day swaps</option>
                  <option value="Board repair at home">Board at home</option>
                  <option value="Cross-ASP IMEI">Cross-ASP</option>
                  <option value="Mismatch that bounced">Mismatch bounced</option>
                  <option value="Symptom-action mismatch">Symptom-action mismatch</option>
                  <option value="Repeat bounce">Repeat Bounces</option>
                </select>
              </div>

              <div className="ctrl-mock">
                <label>Filter BUSM</label>
                <select className="filter-select" value={evF.busm} onChange={(e) => setEvF({ ...evF, busm: e.target.value, asm: '', asp: '' })}>
                  <option value="">All</option>
                  {Object.keys(data.hier).sort().map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              <div className="ctrl-mock">
                <label>Filter ASM</label>
                <select className="filter-select" value={evF.asm} onChange={(e) => setEvF({ ...evF, asm: e.target.value, asp: '' })}>
                  <option value="">All</option>
                  {evF.busm ? (
                    Object.keys(data.hier[evF.busm] || {}).sort().map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))
                  ) : (
                    [...new Set(data.evidence.map((r: any) => r.asm))].sort().map((name: any) => (
                      <option key={name} value={name}>{name}</option>
                    ))
                  )}
                </select>
              </div>

              <div className="ctrl-mock">
                <label>Filter ASP</label>
                <select className="filter-select" value={evF.asp} onChange={(e) => setEvF({ ...evF, asp: e.target.value })}>
                  <option value="">All</option>
                  {evF.asm ? (
                    (data.hier[evF.busm]?.[evF.asm] || []).sort().map((name: string) => (
                      <option key={name} value={name}>{name}</option>
                    ))
                  ) : (
                    [...new Set(data.evidence.map((r: any) => r.asp))].sort().map((name: any) => (
                      <option key={name} value={name}>{name}</option>
                    ))
                  )}
                </select>
              </div>

              <div className="ctrl-mock">
                <label>Filter Month</label>
                <select className="filter-select" value={evF.month} onChange={(e) => setEvF({ ...evF, month: e.target.value })}>
                  <option value="">All Months</option>
                  {uniqueMonths.map((m: string) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="ctrl-mock">
                <label>Text Search</label>
                <input 
                  type="text" 
                  value={evF.search} 
                  onChange={(e) => setEvF({ ...evF, search: e.target.value })} 
                  placeholder="Search workorder/model..." 
                  style={{ minWidth: '180px' }} 
                />
              </div>

              <div style={{ marginLeft: 'auto' }}>
                <button 
                  onClick={handleSlackPush} 
                  className="btn-primary" 
                  style={{ background: webhookStatus === 'success' ? 'var(--good)' : 'var(--cobalt)' }}
                  disabled={webhookStatus === 'sending'}
                >
                  {webhookStatus === 'idle' && 'Push Outliers to Slack'}
                  {webhookStatus === 'sending' && 'Pushing...'}
                  {webhookStatus === 'success' && 'Exceptions Pushed! ✅'}
                </button>
              </div>
            </div>

            {/* Evidence Logs Table */}
            {(() => {
              const rows = data.evidence.filter((r: any) => {
                if (evF.flag && r.flag !== evF.flag) return false;
                if (evF.busm && r.busm !== evF.busm) return false;
                if (evF.asm && r.asm !== evF.asm) return false;
                if (evF.asp && r.asp !== evF.asp) return false;
                if (evF.month && r.month !== evF.month) return false;
                if (evF.search) {
                  const s = evF.search.toLowerCase();
                  return (
                    r.wo.toLowerCase().includes(s) ||
                    r.model.toLowerCase().includes(s) ||
                    r.symptom.toLowerCase().includes(s) ||
                    r.asp.toLowerCase().includes(s) ||
                    r.city.toLowerCase().includes(s)
                  );
                }
                return true;
              });

              return (
                <div className="table-card">
                  <div className="table-header-bar">
                    <h3 className="chart-title">Anomalous Exception Workorders ({rows.length.toLocaleString('en-IN')} rows found)</h3>
                  </div>

                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Excel Row</th>
                          <th>Workorder ID</th>
                          <th>Anomaly Category</th>
                          <th>ASP Centre</th>
                          <th>Supervisor (ASM)</th>
                          <th>BUSM</th>
                          <th>Customer City</th>
                          <th>Created</th>
                          <th>Delivered</th>
                          <th>Mo</th>
                          <th>Device Model</th>
                          <th>Symptom</th>
                          <th>Action Taken</th>
                          <th>Part Swapped</th>
                          <th>TAT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.length === 0 ? (
                          <tr><td colSpan={15} style={{ textAlign: 'center', padding: '30px' }}>No exception rows matched active filters.</td></tr>
                        ) : (
                          rows.slice(0, 500).map((r: any, i: number) => {
                            const tagClass = r.flag.includes('Same-day') ? 'f-ghost' : (r.flag.includes('home') ? 'f-home' : 'f-cross');
                            return (
                              <tr key={i}>
                                <td><b>{r.row}</b></td>
                                <td style={{ fontWeight: 600, color: 'var(--cobalt)' }}>{r.wo}</td>
                                <td><span className={`flag-tag-mock ${tagClass}`}>{r.flag}</span></td>
                                <td>{r.asp}</td>
                                <td>{r.asm}</td>
                                <td>{r.busm}</td>
                                <td>{r.city}</td>
                                <td>{r.created || '–'}</td>
                                <td>{r.delivered || '–'}</td>
                                <td>{r.month}</td>
                                <td>{r.model}</td>
                                <td>{r.symptom}</td>
                                <td>{r.action}</td>
                                <td>{r.part || '–'}</td>
                                <td>{r.tat !== null ? `${r.tat} d` : '–'}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                  {rows.length > 500 && (
                    <div className="note-mock" style={{ padding: '12px', background: 'var(--ice)', margin: 0, borderRadius: '0 0 12px 12px' }}>
                      Showing first 500 of {rows.length.toLocaleString('en-IN')} matches. Refine filter selections to view specific cohorts.
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="glossary-mock">
              <b>TAT</b> = Turnaround Time in days (creation to delivery) &bull; 
              <b> Excel Row</b> = Row index in source Excel spreadsheet for auditing &bull; 
              <b> Same-day board swap</b> = Board swap Consumed on same day walk-in visit.
            </div>
          </div>
        )}

        {/* ─── TAB 6: PART-COST ASSUMPTIONS ─── */}
        {activeTab === 'cost' && (
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
        )}

        {/* ─── TAB 7: INGEST DATA ─── */}
        {activeTab === 'upload' && (
          <div className="view-mock on">
            <div className="sec-title">
              <div className="bar"></div>
              <span>Upload Month spreadsheet files</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', alignItems: 'center' }}>
              {!uploadResult && !uploading && (
                <div className="upload-card" style={{ marginTop: '1rem', width: '100%' }}>
                  <div 
                    className={`dropzone ${dragActive ? 'active' : ''}`}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                  >
                    <UploadCloud className="upload-icon" />
                    <h3 className="upload-title">Drag and drop raw Excel/CSV file</h3>
                    <p className="upload-subtitle">Upload spreadsheet file to update calculations.</p>
                    
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>or</span>
                      <label className="btn-primary" style={{ cursor: 'pointer', margin: 0, backgroundColor: 'var(--cobalt)' }}>
                        Browse Files
                        <input 
                          type="file" 
                          accept=".csv,.xlsx,.xls" 
                          style={{ display: 'none' }} 
                          onChange={(e) => { if (e.target.files && e.target.files[0]) setUploadFile(e.target.files[0]); }}
                        />
                      </label>
                    </div>
                  </div>

                  {uploadFile && (
                    <div style={{ display: 'flex', gap: '0.75rem', padding: '1rem', background: 'var(--color-bg)', borderRadius: '8px', width: '100%', border: '1px solid var(--color-border)', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', textAlign: 'left' }}>
                        <FileSpreadsheet style={{ color: 'var(--cobalt)' }} />
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-main)' }}>{uploadFile.name}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button onClick={triggerUpload} className="btn-primary" style={{ backgroundColor: 'var(--cobalt)' }}>
                        Ingest & Score
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {uploading && (
                <div className="upload-card" style={{ marginTop: '1rem', width: '100%' }}>
                  <RefreshCw className="upload-icon animate-spin" style={{ color: 'var(--cobalt)' }} />
                  <h3 className="upload-title" style={{ marginTop: '0.5rem' }}>Processing Ingestion & Executing Rule Engine</h3>
                  <p className="upload-subtitle" style={{ maxWidth: '450px', margin: '0 auto 1rem' }}>
                    Parsing Excel rows, mapping fields, executing exception checking, and committing transaction logs.
                  </p>
                  <div className="upload-progress-bar">
                    <div className="upload-progress-fill" style={{ width: `${uploadProgress}%`, backgroundColor: 'var(--cobalt)' }}></div>
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--cobalt)', marginTop: '0.5rem' }}>
                    {uploadProgress}% Complete
                  </span>
                </div>
              )}

              {uploadResult && !uploading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '800px' }}>
                  <div className="upload-card" style={{ maxWidth: '100%', margin: 0, width: '100%' }}>
                    <div className="success-overlay">
                      <div className="success-icon" style={{ backgroundColor: 'rgba(31, 158, 107, 0.1)', color: 'var(--good)' }}>✔</div>
                      <div style={{ textAlign: 'center' }}>
                        <h3 className="upload-title" style={{ fontSize: '1.3rem' }}>File Ingested Successfully</h3>
                        <p className="upload-subtitle">PostgreSQL database tables updated.</p>
                      </div>

                      <div className="success-grid">
                        <div className="success-item">
                          <span className="success-item-label">Dataset Filename</span>
                          <span className="success-item-val" style={{ fontSize: '0.95rem', wordBreak: 'break-all' }}>{uploadResult.filename}</span>
                        </div>
                        <div className="success-item">
                          <span className="success-item-label">Processed Workorders</span>
                          <span className="success-item-val">{(uploadResult?.validCount ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="success-item">
                          <span className="success-item-label">High-Risk Anomalies</span>
                          <span className="success-item-val" style={{ color: 'var(--bad)' }}>{(uploadResult?.hitListCount ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="success-item">
                          <span className="success-item-label">Total Execution Time</span>
                          <span className="success-item-val">{(uploadResult.processingMs / 1000).toFixed(2)}s</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          setUploadResult(null);
                          setUploadFile(null);
                          setActiveTab('exec');
                        }} 
                        className="btn-primary" 
                        style={{ width: '100%', justifyContent: 'center', backgroundColor: 'var(--cobalt)' }}
                      >
                        Open Dashboard Panels
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
      
      <footer>
        <div className="wrap">
          <p>© 2026 LAVA Decision Risk Dashboard — powered by ZenLearn.</p>
        </div>
      </footer>
    </div>
  );
}
