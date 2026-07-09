'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  LayoutDashboard, ShieldAlert, UploadCloud, ChevronRight, 
  MapPin, CheckCircle, AlertTriangle, RefreshCw, Send, LogOut, FileSpreadsheet
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  
  // Mounted check to prevent SSR hydration mismatches with Recharts
  const [isMounted, setIsMounted] = useState(false);

  // Layout state
  const [activeTab, setActiveTab] = useState<'executive' | 'dealer' | 'upload'>('executive');
  
  // Fetching state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dashboard data state
  const [executiveData, setExecutiveData] = useState<any>(null);
  const [dealerData, setDealerData] = useState<any>(null);
  
  // Filters state
  const [busmFilter, setBusmFilter] = useState('All');
  const [asmFilter, setAsmFilter] = useState('All');
  const [selectedAsp, setSelectedAsp] = useState('');

  // Webhook trigger state
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  // Upload state
  const [dragActive, setDragActive] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch Executive Dashboard data
  const fetchExecutive = async (busm = 'All', asm = 'All') => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/v1/dashboard/executive?busmName=${encodeURIComponent(busm)}&asmName=${encodeURIComponent(asm)}`);
      const data = await res.json();
      
      if (res.status === 401) {
        router.push('/signin');
        return;
      }
      
      if (res.ok && data.result) {
        setExecutiveData(data.result);
        // Automatically default the selected ASP to the first option if empty
        if (data.result.filters?.asps?.length > 0 && !selectedAsp) {
          setSelectedAsp(data.result.filters.asps[0]);
        }
      } else {
        setError(data.message || 'Failed to retrieve executive dashboard metrics');
      }
    } catch (err) {
      setError('Connection to Lava backend failed. Check that the service is running.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Dealer snapshot data
  const fetchDealer = async (asp: string) => {
    if (!asp) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/v1/dashboard/dealer/${encodeURIComponent(asp)}`);
      const data = await res.json();
      
      if (res.status === 401) {
        router.push('/signin');
        return;
      }

      if (res.ok && data.result) {
        setDealerData(data.result);
      } else {
        setError(data.message || `Failed to fetch snapshot for ASP "${asp}"`);
      }
    } catch (err) {
      setError('Connection to Lava backend failed.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchExecutive(busmFilter, asmFilter);
  }, []);

  // React to Executive filters
  const handleBusmChange = (val: string) => {
    setBusmFilter(val);
    setAsmFilter('All'); // reset ASM filter
    fetchExecutive(val, 'All');
  };

  const handleAsmChange = (val: string) => {
    setAsmFilter(val);
    fetchExecutive(busmFilter, val);
  };

  // Trigger loading dealer tab data
  useEffect(() => {
    if (activeTab === 'dealer' && selectedAsp) {
      fetchDealer(selectedAsp);
    }
  }, [activeTab, selectedAsp]);

  // Sign out helper
  const handleSignOut = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/signin');
  };

  // Webhook action mock
  const handleWebhookPush = () => {
    setWebhookStatus('sending');
    setTimeout(() => {
      setWebhookStatus('success');
      setTimeout(() => setWebhookStatus('idle'), 3000);
    }, 1500);
  };

  // ─── File Upload Logic ──────────────────────────────────────────────────────
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
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
      const data = await res.json();

      if (res.ok && data.result) {
        setUploadResult(data.result);
        setUploadProgress(100);
        // Refresh dashboard data
        fetchExecutive(busmFilter, asmFilter);
      } else {
        setError(data.message || 'File upload parsing failed.');
      }
    } catch (err) {
      setError('Network request failed during file upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <aside className="sidebar">
        <div className="brand-section">
          <div className="brand-logo">L</div>
          <span className="brand-name">Lava Risk</span>
        </div>

        <nav style={{ flexGrow: 1 }}>
          <ul className="nav-links">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'executive' ? 'active' : ''}`}
                onClick={() => setActiveTab('executive')}
              >
                <LayoutDashboard size={18} />
                Executive View
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'dealer' ? 'active' : ''}`}
                onClick={() => setActiveTab('dealer')}
              >
                <MapPin size={18} />
                ASP snapshot
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'upload' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('upload');
                  setUploadResult(null);
                  setUploadFile(null);
                }}
              >
                <UploadCloud size={18} />
                Ingest Data
              </button>
            </li>
          </ul>
        </nav>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.25rem' }}>
          <button onClick={handleSignOut} className="nav-link" style={{ color: 'rgba(255,255,255,0.5)' }}>
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main dashboard content */}
      <main className="main-canvas">
        {/* Header bar */}
        <div className="top-header">
          <div className="header-title">
            <h1>
              {activeTab === 'executive' && 'Executive Risk Dashboard'}
              {activeTab === 'dealer' && 'Service Centre Snapshot'}
              {activeTab === 'upload' && 'Data Ingestion Control'}
            </h1>
            <p className="header-subtitle">
              {activeTab === 'executive' && `Analysing aggregate decision risks — Active dataset: ${executiveData?.filename || 'No data'}`}
              {activeTab === 'dealer' && `Review performance anomaly snapshots for individual service centers.`}
              {activeTab === 'upload' && 'Upload monthly master service spreadsheets to sync and trigger the rule engine.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={() => {
                if (activeTab === 'executive') fetchExecutive(busmFilter, asmFilter);
                if (activeTab === 'dealer') fetchDealer(selectedAsp);
              }}
              className="btn-primary" 
              style={{ backgroundColor: 'transparent', color: 'var(--color-primary-light)', border: '1px solid var(--color-border)' }}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Global error message banner */}
        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', color: 'var(--color-danger)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <AlertTriangle size={20} />
            <span style={{ fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {/* LOADING SHIM */}
        {loading && activeTab !== 'upload' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: '1rem', color: 'var(--color-text-muted)' }}>
            <RefreshCw size={32} className="animate-spin" style={{ color: 'var(--color-primary-light)' }} />
            <p style={{ fontWeight: 500 }}>Syncing database aggregates...</p>
          </div>
        ) : (
          <>
            {/* ─── TAB 1: EXECUTIVE VIEW ────────────────────────────────────── */}
            {activeTab === 'executive' && executiveData && (
              <>
                {/* Score Cards Grid */}
                <div className="metrics-grid">
                  <div className="metric-card process">
                    <span className="metric-label">Avg Process Score</span>
                    <div className="metric-val-row">
                      <span className="metric-value">{executiveData.metrics.avgProcessScore}</span>
                      <span className="metric-max">/100</span>
                    </div>
                  </div>
                  <div className="metric-card skill">
                    <span className="metric-label">Avg Skill Score</span>
                    <div className="metric-val-row">
                      <span className="metric-value">{executiveData.metrics.avgSkillScore}</span>
                      <span className="metric-max">/100</span>
                    </div>
                  </div>
                  <div className="metric-card audit">
                    <span className="metric-label">Avg Audit Score</span>
                    <div className="metric-val-row">
                      <span className="metric-value">{executiveData.metrics.avgAuditScore}</span>
                      <span className="metric-max">/100</span>
                    </div>
                  </div>
                  <div className="metric-card total">
                    <span className="metric-label">Scored Records</span>
                    <div className="metric-val-row">
                      <span className="metric-value">{(executiveData.metrics?.totalWorkOrders ?? 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Filter selects */}
                <div className="filter-bar">
                  <div className="filter-group">
                    <label>Filter by Business Unit (BUSM)</label>
                    <select 
                      className="filter-select" 
                      value={busmFilter}
                      onChange={(e) => handleBusmChange(e.target.value)}
                    >
                      <option value="All">All Units</option>
                      {executiveData.filters.busms.map((name: string) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>Filter by Supervisor (ASM)</label>
                    <select 
                      className="filter-select"
                      value={asmFilter}
                      onChange={(e) => handleAsmChange(e.target.value)}
                    >
                      <option value="All">All Supervisors</option>
                      {executiveData.filters.asms.map((name: string) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Line trend chart */}
                <div className="charts-grid" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="chart-card">
                    <div className="chart-header">
                      <h3 className="chart-title">Monthly Risk Scores Trend</h3>
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                      {isMounted && (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={executiveData.trends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                            <XAxis dataKey="month" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} />
                            <YAxis domain={[0, 100]} stroke="var(--color-text-muted)" fontSize={12} tickLine={false} />
                            <Tooltip contentStyle={{ background: '#fff', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                            <Legend verticalAlign="top" height={36} iconType="circle" />
                            <Line type="monotone" dataKey="processScore" name="Process Score" stroke="#0033a0" strokeWidth={3} activeDot={{ r: 6 }} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="skillScore" name="Skill Score" stroke="#3388ff" strokeWidth={3} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="auditScore" name="Audit Score" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Center Hit List table */}
                <div className="table-card">
                  <div className="table-header-bar">
                    <div>
                      <h3 className="chart-title">Action Center: High-Risk Exception Workorders</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        Displaying {(executiveData.hitListCount ?? 0).toLocaleString()} anomalies flagging at least 2 risk criteria.
                      </p>
                    </div>

                    <button onClick={handleWebhookPush} className="btn-primary" disabled={webhookStatus === 'sending'}>
                      <Send size={16} />
                      {webhookStatus === 'idle' && 'Push exceptions to Slack'}
                      {webhookStatus === 'sending' && 'Pushing Exceptions...'}
                      {webhookStatus === 'success' && 'Exceptions Pushed! ✅'}
                    </button>
                  </div>

                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Workorder ID</th>
                          <th>ASP Service Centre</th>
                          <th>Customer City</th>
                          <th>Device IMEI</th>
                          <th>Triggered Exceptions</th>
                          <th style={{ textAlign: 'center' }}>Anomaly Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {executiveData.hitList.length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
                              No high-risk exceptions identified in the current dataset.
                            </td>
                          </tr>
                        ) : (
                          executiveData.hitList.map((item: any) => (
                            <tr key={item.id}>
                              <td style={{ fontWeight: 600, color: 'var(--color-primary-light)' }}>{item.workorder}</td>
                              <td>{item.aspName}</td>
                              <td>{item.customerCity}</td>
                              <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{item.imei}</td>
                              <td>
                                <div className="anomaly-pill-container">
                                  <span className={`anomaly-pill ${item.flags.repeatImei ? 'active' : 'inactive'}`}>
                                    Repeat IMEI
                                  </span>
                                  <span className={`anomaly-pill ${item.flags.suspiciousPhone ? 'active' : 'inactive'}`}>
                                    Contact Frequency
                                  </span>
                                  <span className={`anomaly-pill ${item.flags.processBreakdown ? 'active' : 'inactive'}`}>
                                    NPS Detractor
                                  </span>
                                </div>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <span className="badge danger">{item.totalAnomalies} Flags</span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* ─── TAB 2: ASP SNAPSHOT VIEW ───────────────────────────────── */}
            {activeTab === 'dealer' && (
              <>
                {/* Select ASP centre */}
                {executiveData && (
                  <div className="filter-bar" style={{ marginTop: '0.5rem' }}>
                    <div className="filter-group">
                      <label>Select ASP Service Centre</label>
                      <select 
                        className="filter-select"
                        value={selectedAsp}
                        onChange={(e) => setSelectedAsp(e.target.value)}
                        style={{ maxWidth: '400px' }}
                      >
                        {executiveData.filters.asps.map((name: string) => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {dealerData && (
                  <>
                    {/* Metrics snapshot cards */}
                    <div className="metrics-grid">
                      <div className="metric-card process">
                        <span className="metric-label">ASP Process Score</span>
                        <div className="metric-val-row">
                          <span className="metric-value">{dealerData.metrics.avgProcessScore}</span>
                          <span className="metric-max">/100</span>
                        </div>
                      </div>
                      <div className="metric-card skill">
                        <span className="metric-label">ASP Skill Score</span>
                        <div className="metric-val-row">
                          <span className="metric-value">{dealerData.metrics.avgSkillScore}</span>
                          <span className="metric-max">/100</span>
                        </div>
                      </div>
                      <div className="metric-card audit">
                        <span className="metric-label">ASP Audit Score</span>
                        <div className="metric-val-row">
                          <span className="metric-value">{dealerData.metrics.avgAuditScore}</span>
                          <span className="metric-max">/100</span>
                        </div>
                      </div>
                    </div>

                    {/* Chart & Breakdowns */}
                    <div className="charts-grid">
                      {/* Bar chart displaying flag frequencies */}
                      <div className="chart-card">
                        <div className="chart-header">
                          <h3 className="chart-title">Incident Type Frequencies</h3>
                        </div>
                        <div style={{ width: '100%', height: 300 }}>
                          {isMounted && (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={[
                                  { name: 'Repeat IMEI (Skill)', count: dealerData.incidentSummary.repeatImei },
                                  { name: 'Suspicious Contacts (Audit)', count: dealerData.incidentSummary.suspiciousPhone },
                                  { name: 'NPS Detractor (Process)', count: dealerData.incidentSummary.processBreakdown },
                                ]}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} />
                                <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} allowDecimals={false} />
                                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                                <Bar dataKey="count" fill="var(--color-primary-light)" radius={[4, 4, 0, 0]} barSize={50} />
                              </BarChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                      </div>

                      {/* Summary list */}
                      <div className="chart-card" style={{ justifyContent: 'flex-start' }}>
                        <div className="chart-header" style={{ marginBottom: '1.5rem' }}>
                          <h3 className="chart-title">Incident Breakdown</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                            <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Repeat IMEI (Skill Gap)</span>
                            <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{dealerData.incidentSummary.repeatImei}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                            <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Suspicious Customer Contact</span>
                            <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{dealerData.incidentSummary.suspiciousPhone}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem' }}>
                            <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Process Breakdown (NPS detractor)</span>
                            <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{dealerData.incidentSummary.processBreakdown}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Table GraveYard */}
                    <div className="table-card">
                      <div className="table-header-bar">
                        <h3 className="chart-title">Workorder Graveyard (Flagged Records)</h3>
                      </div>

                      <div className="table-wrapper">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Workorder ID</th>
                              <th>Customer City</th>
                              <th>Device IMEI</th>
                              <th>Anomalies</th>
                              <th style={{ textAlign: 'center' }}>Flags Count</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dealerData.flaggedWorkOrders.length === 0 ? (
                              <tr>
                                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
                                  No flagged workorders for this ASP in the active import.
                                </td>
                              </tr>
                            ) : (
                              dealerData.flaggedWorkOrders.map((item: any) => (
                                <tr key={item.id}>
                                  <td style={{ fontWeight: 600 }}>{item.workorder}</td>
                                  <td>{item.customerCity}</td>
                                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{item.imei}</td>
                                  <td>
                                    <div className="anomaly-pill-container">
                                      <span className={`anomaly-pill ${item.flags.repeatImei ? 'active' : 'inactive'}`}>
                                        Repeat IMEI
                                      </span>
                                      <span className={`anomaly-pill ${item.flags.suspiciousPhone ? 'active' : 'inactive'}`}>
                                        Contact Frequency
                                      </span>
                                      <span className={`anomaly-pill ${item.flags.processBreakdown ? 'active' : 'inactive'}`}>
                                        NPS Detractor
                                      </span>
                                    </div>
                                  </td>
                                  <td style={{ textAlign: 'center' }}>
                                    <span className={`badge ${item.totalAnomalies >= 2 ? 'danger' : 'warning'}`}>
                                      {item.totalAnomalies} Flags
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* ─── TAB 3: DATA INGESTION CONTROL ───────────────────────────── */}
            {activeTab === 'upload' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', alignItems: 'center' }}>
                {!uploadResult && !uploading && (
                  <div className="upload-card">
                    <div 
                      className={`dropzone ${dragActive ? 'active' : ''}`}
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                    >
                      <UploadCloud className="upload-icon" />
                      <h3 className="upload-title">Drag and drop your spreadsheet</h3>
                      <p className="upload-subtitle">Supports master service data (.xlsx or .csv up to 10MB)</p>
                      
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>or</span>
                        <label className="btn-primary" style={{ cursor: 'pointer', margin: 0 }}>
                          Browse Files
                          <input 
                            type="file" 
                            accept=".csv,.xlsx,.xls" 
                            style={{ display: 'none' }} 
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                    </div>

                    {uploadFile && (
                      <div style={{ display: 'flex', gap: '0.75rem', padding: '1rem', background: 'var(--color-bg)', borderRadius: '8px', width: '100%', border: '1px solid var(--color-border)', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', textAlign: 'left' }}>
                          <FileSpreadsheet style={{ color: 'var(--color-primary-light)' }} />
                          <div>
                            <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-main)' }}>{uploadFile.name}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button onClick={triggerUpload} className="btn-primary">
                          Ingest & Score
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {uploading && (
                  <div className="upload-card">
                    <RefreshCw className="upload-icon animate-spin" />
                    <h3 className="upload-title" style={{ marginTop: '0.5rem' }}>Ingesting Data & Scanning Anomalies</h3>
                    <p className="upload-subtitle" style={{ maxWidth: '400px', margin: '0 auto 1rem' }}>
                      Executing the rule engine (Repeat IMEI, Suspicious Contacts, NPS Detractor) and caching aggregations.
                    </p>
                    <div className="upload-progress-bar">
                      <div className="upload-progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary-light)', marginTop: '0.5rem' }}>
                      {uploadProgress}% Complete
                    </span>
                  </div>
                )}

                {uploadResult && !uploading && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '800px' }}>
                    <div className="upload-card" style={{ maxWidth: '100%', margin: 0 }}>
                      <div className="success-overlay">
                        <div className="success-icon">✔</div>
                        <div style={{ textAlign: 'center' }}>
                          <h3 className="upload-title" style={{ fontSize: '1.3rem' }}>File Ingestion Successful</h3>
                          <p className="upload-subtitle">Pipeline processed and committed the dataset.</p>
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
                            <span className="success-item-val" style={{ color: 'var(--color-danger)' }}>{(uploadResult?.hitListCount ?? 0).toLocaleString()}</span>
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
                            setActiveTab('executive');
                          }} 
                          className="btn-primary" 
                          style={{ width: '100%', justifyContent: 'center' }}
                        >
                          View Dashboards
                        </button>
                      </div>
                    </div>

                    {/* Previews of uploaded hit list */}
                    <div className="table-card">
                      <div className="table-header-bar">
                        <h3 className="chart-title">New Hit-List Preview (Top Ingested Anomalies)</h3>
                      </div>
                      <div className="table-wrapper">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Workorder ID</th>
                              <th>ASP Service Centre</th>
                              <th>Customer City</th>
                              <th>Device IMEI</th>
                              <th style={{ textAlign: 'center' }}>Anomaly Count</th>
                            </tr>
                          </thead>
                          <tbody>
                            {uploadResult.hitList.map((item: any, i: number) => (
                              <tr key={i}>
                                <td style={{ fontWeight: 600, color: 'var(--color-primary-light)' }}>{item.workorder}</td>
                                <td>{item.aspName}</td>
                                <td>{item.customerCity}</td>
                                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{item.imei}</td>
                                <td style={{ textAlign: 'center' }}>
                                  <span className="badge danger">{item.totalAnomalies} Flags</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
