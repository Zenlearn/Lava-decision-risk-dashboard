'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, LogOut, UploadCloud } from 'lucide-react';

// Import split subcomponents
import Sidebar from '../components/Sidebar';
import TabDashboard from '../components/TabDashboard';
import TabScorecard from '../components/TabScorecard';
import TabCoaching from '../components/TabCoaching';
import TabInsights from '../components/TabInsights';
import TabEvidence from '../components/TabEvidence';
import TabPartCosts from '../components/TabPartCosts';
import TabIngest from '../components/TabIngest';
import TabProfile from '../components/TabProfile';
import TabActivities from '../components/TabActivities';
import { DASHBOARD_DEFINITIONS } from '../constants/definitions';

export default function UnifiedMockupDashboard() {
  const router = useRouter();
  
  // SSR hydration guard — recharts cannot render on the server; only show charts after mount
  const [isMounted, setIsMounted] = useState(false);

  // Unified Dashboard Data state
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<{ name: string; email: string } | undefined>(undefined);

  // Active navigation tab — default is 'exec' (Executive Dashboard)
  const [activeTab, setActiveTab] = useState('exec');

  // Nominations tracker (for Judgment Uplift Program)
  const [nominated, setNominated] = useState<Map<string, any>>(new Map());

  // Coaching card focus details state
  const [cLevel, setCLevel] = useState<'busm' | 'asm' | 'asp'>('asm');
  const [cActor, setCActor] = useState<string>('');

  // Evidence query filter state
  const [evF, setEvF] = useState({
    flag: '',
    busm: '',
    asm: '',
    asp: '',
    month: '',
    search: '',
  });

  // Slack Mock web hook notification mock state
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  // Ingestion File Uploader state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);

  // Custom assumed parts/travel costs configurations state
  const [costs, setCosts] = useState({
    pcba: 1800,
    lcd: 1200,
    battery: 600,
    camera: 450,
    speaker: 150,
    charger: 250,
    travel: 500,
  });

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

    // Read user profile stored at login time (set by signin/page.tsx after successful auth).
    // PathwaysBackend's JWT does not include first_name/last_name in its claims,
    // so we store the full profile at login and read it back here.
    try {
      const savedUser = localStorage.getItem('lava_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Error reading user profile from localStorage:', e);
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
    if (!m) return 0;
    if (typeof m.leak === 'number' && m.leak > 0) return m.leak;
    if (!m._leakparts) return 0;
    return m._leakparts.pcba * costs.pcba + m._leakparts.lcd * costs.lcd + m._leaktravel * costs.travel;
  };

  const fmtINR = (v: number) => {
    return '₹' + Math.round(v).toLocaleString('en-IN');
  };

  const fmtPct = (v: number) => {
    return (v ?? 0).toFixed(1) + '%';
  };

  // Sign out helper
  // The `token` cookie is HttpOnly (set by the backend on /sign-in), so client
  // JS can't clear it via document.cookie — /api/v1/auth/sign-out does that
  // server-side via clearCookie.
  const handleSignOut = async () => {
    try {
      await fetch('/api/v1/auth/sign-out', { method: 'POST' });
    } catch {
      // Best-effort — still clear local profile data and redirect below.
    }
    localStorage.removeItem('lava_user');
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

  // Check if data is completely empty (no imported rows)
  if (data.summary.total_wo === 0) {
    return (
      <div className="mockup-dashboard" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg, #f8fafc)' }}>
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          nominatedCount={nominated.size} 
          handleSignOut={handleSignOut} 
          user={user}
        />
        <div style={{ flex: 1, marginLeft: '260px', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
          <div className="card-mock" style={{ maxWidth: '600px', textAlign: 'center', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
              <UploadCloud size={32} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: 'var(--font-sans)' }}>
              Decision Risk Dashboard is Empty
            </h2>
            <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
              No service workorders have been uploaded yet. To visualize metrics, anomalies, and leakage exposures, please ingest your Lava service record spreadsheet.
            </p>
            <button 
              onClick={() => setActiveTab('upload')} 
              className="btn-primary"
              style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background 0.2s',
                marginTop: '10px'
              }}
            >
              Go to Ingest Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Extract variables for easier markup layout mapping
  const latestKPI = data.kpi.months[data.kpi.months.length - 1];
  const previousKPI = data.kpi.months[data.kpi.months.length - 2];

  // Leakage values based on cost configurations
  const leakCur = getLeakLive(latestKPI);
  const leakPrev = getLeakLive(previousKPI);
  const leakDelta = leakCur - leakPrev;
  const annualLeakRunRate = leakCur * 12;

  return (
    <div className="mockup-dashboard" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg, #f8fafc)' }}>
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        nominatedCount={nominated.size} 
        handleSignOut={handleSignOut} 
        user={user}
      />

      {/* Main panel content area offset by sidebar width (260px) */}
      <div style={{ flex: 1, marginLeft: '260px', padding: '24px 32px', boxSizing: 'border-box', overflowX: 'hidden' }}>
        <header style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
              Decision Risk & Leakage Dashboard
            </h1>
            <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
              Continuous monitoring of service centre integrity, technician skill gaps, and billing integrity anomalies.
            </p>
          </div>
        </header>

        {activeTab === 'exec' && (
          <TabDashboard
            data={data}
            isMounted={isMounted}
            leakCur={leakCur}
            leakDelta={leakDelta}
            annualLeakRunRate={annualLeakRunRate}
            latestKPI={latestKPI}
            previousKPI={previousKPI}
            fmtINR={fmtINR}
            fmtPct={fmtPct}
          />
        )}

        {activeTab === 'deep' && (
          <TabScorecard
            data={data}
            isMounted={isMounted}
            uniqueMonths={uniqueMonths}
          />
        )}

        {activeTab === 'coach' && (
          <TabCoaching
            data={data}
            isMounted={isMounted}
            cLevel={cLevel}
            setCLevel={setCLevel}
            cActor={cActor}
            setCActor={setCActor}
            nominated={nominated}
            handleNominate={handleNominate}
            handleBulkNominate={handleBulkNominate}
            handleDownloadNominations={handleDownloadNominations}
            setNominated={setNominated}
            triggerCoachingJump={triggerCoachingJump}
          />
        )}

        {activeTab === 'ins' && (
          <TabInsights
            data={data}
            costs={costs}
            fmtINR={fmtINR}
          />
        )}

        {activeTab === 'eved' && (
          <TabEvidence
            data={data}
            uniqueMonths={uniqueMonths}
            webhookStatus={webhookStatus}
            handleSlackPush={handleSlackPush}
            evF={evF}
            setEvF={setEvF}
          />
        )}

        {activeTab === 'cost' && (
          <TabPartCosts
            costs={costs}
            handleCostChange={handleCostChange}
            latestKPI={latestKPI}
            kpiMonths={data.kpi?.months}
            leakCur={leakCur}
            annualLeakRunRate={annualLeakRunRate}
            fmtINR={fmtINR}
          />
        )}

        {activeTab === 'upload' && (
          <TabIngest
            uploadFile={uploadFile}
            setUploadFile={setUploadFile}
            uploading={uploading}
            uploadProgress={uploadProgress}
            uploadResult={uploadResult}
            setUploadResult={setUploadResult}
            dragActive={dragActive}
            handleDrag={handleDrag}
            handleDrop={handleDrop}
            triggerUpload={triggerUpload}
            setActiveTab={setActiveTab}
          />
        )}


        {activeTab === 'profile' && (
          <TabProfile user={user} />
        )}

        {activeTab === 'activities' && (
          <TabActivities />
        )}

        <footer style={{ marginTop: '64px', paddingTop: '24px', borderTop: '1px solid #e2e8f0', color: '#94a3b8', fontSize: '13px', textAlign: 'center' }}>
          <p>{DASHBOARD_DEFINITIONS.globalFooter}</p>
        </footer>
      </div>
    </div>
  );
}
