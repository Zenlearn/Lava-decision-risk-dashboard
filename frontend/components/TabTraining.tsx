'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '../lib/apiFetch';

const S3_BASE = 'https://zenlearnmedia.s3.ap-south-1.amazonaws.com/';
const MICRO_BASE = 'https://m.zenlearn.ai';

/** If `time` is a bare number or numeric string ("34"), appends " min". Leaves "~43 min" untouched. */
function formatTime(t?: string | number | null): string {
  if (t == null || t === '') return '';
  const s = String(t).trim();
  return /^\d+$/.test(s) ? `${s} min` : s;
}

/**
 * Opens a Micro path via SSO token exchange so users from lava.zenlearn.ai
 * don't need to log in again on m.zenlearn.ai.
 *
 * Opens a blank tab immediately (synchronous, inside the click handler) so
 * popup blockers don't interfere, then sets its URL once the SSO URL is ready.
 */
async function openInZenLearn(path: string): Promise<void> {
  const newTab = window.open('', '_blank');
  if (!newTab) {
    // Popup blocked — graceful fallback
    window.location.href = `${MICRO_BASE}${path}`;
    return;
  }
  try {
    const res = await fetch(`/api/v1/auth/sso-url?next=${encodeURIComponent(path)}`);
    if (res.ok) {
      const d = await res.json();
      if (d?.result?.url) {
        newTab.location.href = d.result.url;
        return;
      }
    }
  } catch { /* fall through */ }
  newTab.location.href = `${MICRO_BASE}${path}`;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TrainingRow {
  name: string;
  lava_role: string;
  assigned: number;
  completed: number;
  completionPct: number;
}

interface ProgrammeAssignment {
  assignment: {
    id: string;
    startDate: string;
    endDate: string;
    isMandatory: boolean;
    status: string;
  };
  program: {
    id: string;
    title: string;
    description: string;
    thumbnail: string | null;
    industry: string;
    difficulty: string;
    time: string;
    _count: { modules: number };
  };
}

interface ModuleProgress {
  serial: number;
  id: string;
  title: string;
  status: 'passed' | 'failed' | 'not_attempted';
  score: number;
  correct: number;
  incorrect: number;
}

// ---------------------------------------------------------------------------
// Module status badge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: ModuleProgress['status'] }) {
  const map: Record<ModuleProgress['status'], { label: string; bg: string; color: string }> = {
    passed: { label: 'Passed', bg: '#dcfce7', color: '#16a34a' },
    failed: { label: 'Failed', bg: '#fee2e2', color: '#dc2626' },
    not_attempted: { label: 'Not started', bg: '#f3f4f6', color: '#6b7280' },
  };
  const s = map[status] ?? map.not_attempted;
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 12,
      fontSize: 12,
      fontWeight: 600,
      background: s.bg,
      color: s.color,
    }}>
      {s.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Progress drawer (lazy-loaded on first open)
// ---------------------------------------------------------------------------

function ProgressDrawer({ programmeId, moduleCount }: { programmeId: string; moduleCount: number }) {
  const [modules, setModules] = useState<ModuleProgress[] | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/api/v1/dashboard/my-programmes/${programmeId}/progress`)
      .then((r) => {
        if (!r.ok) { setError(true); return null; }
        return r.json();
      })
      .then((d) => { if (d) setModules(d?.result?.modules ?? []); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [programmeId]);

  if (loading) {
    return (
      <div style={{ padding: '16px 20px', fontSize: 13, color: '#6b7280' }}>
        Loading modules…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '16px 20px', fontSize: 13, color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Progress unavailable right now.</span>
        <button
          onClick={() => openInZenLearn(`/programme/${programmeId}`)}
          style={{ fontSize: 13, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: 0 }}
        >
          Open in ZenLearn →
        </button>
      </div>
    );
  }

  if (!modules || modules.length === 0) {
    return (
      <div style={{ padding: '16px 20px', fontSize: 13, color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{moduleCount > 0 ? `${moduleCount} modules — start in ZenLearn to record progress.` : 'No modules found for this programme.'}</span>
        {moduleCount > 0 && (
          <button
            onClick={() => openInZenLearn(`/programme/${programmeId}`)}
            style={{ fontSize: 13, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: 0 }}
          >
            Open in ZenLearn →
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '12px 20px 16px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
            <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600, color: '#374151' }}>#</th>
            <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600, color: '#374151' }}>Module</th>
            <th style={{ textAlign: 'center', padding: '6px 8px', fontWeight: 600, color: '#374151' }}>Status</th>
            <th style={{ textAlign: 'center', padding: '6px 8px', fontWeight: 600, color: '#374151' }}>Score</th>
          </tr>
        </thead>
        <tbody>
          {modules.map((m) => (
            <tr key={m.id}
              style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}
              onClick={() => openInZenLearn(`/programme/${programmeId}/${m.serial - 1}`)}
            >
              <td style={{ padding: '8px 8px', color: '#9ca3af', width: 28 }}>{m.serial}</td>
              <td style={{ padding: '8px 8px', color: '#2563eb', textDecoration: 'underline' }}>{m.title}</td>
              <td style={{ textAlign: 'center', padding: '8px 8px' }}>
                <StatusBadge status={m.status} />
              </td>
              <td style={{ textAlign: 'center', padding: '8px 8px', color: '#374151' }}>
                {m.status === 'not_attempted' ? '—' : `${m.score}%`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 14, textAlign: 'right' }}>
        <button
          onClick={() => openInZenLearn(`/programme/${programmeId}`)}
          style={{ fontSize: 13, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: 0 }}
        >
          Open in ZenLearn →
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Programme card
// ---------------------------------------------------------------------------

function ProgrammeCard({ item }: { item: ProgrammeAssignment }) {
  const [open, setOpen] = useState(false);

  const { assignment, program } = item;

  const toggleOpen = useCallback(() => setOpen((v) => !v), []);

  const difficultyColor: Record<string, string> = {
    beginner: '#16a34a',
    intermediate: '#d97706',
    advanced: '#dc2626',
  };

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: 10,
      overflow: 'hidden',
      background: '#fff',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      display: 'flex',
      flexDirection: 'column',
      cursor: 'pointer',
      transition: 'box-shadow 0.15s',
    }}
      onClick={toggleOpen}
    >
      {/* Thumbnail */}
      <div style={{ position: 'relative', height: 140, background: '#e5e7eb', flexShrink: 0 }}>
        {program.thumbnail ? (
          <img
            src={`${S3_BASE}${program.thumbnail}`}
            alt={program.title}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #dbeafe 0%, #ede9fe 100%)',
            fontSize: 36,
          }}>
            📚
          </div>
        )}
        {assignment.isMandatory && (
          <span style={{
            position: 'absolute', top: 10, right: 10,
            background: '#dc2626', color: '#fff',
            fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 10,
            letterSpacing: 0.3,
          }}>
            Required
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', lineHeight: 1.35 }}>
          {program.title}
        </div>
        <div style={{
          fontSize: 13, color: '#6b7280', lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {program.description}
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 8, display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#9ca3af' }}>
          <span>{program._count.modules} modules</span>
          <span>·</span>
          <span>{formatTime(program.time)}</span>
          {program.difficulty && (
            <>
              <span>·</span>
              <span style={{ color: difficultyColor[program.difficulty] ?? '#6b7280', fontWeight: 600, textTransform: 'capitalize' }}>
                {program.difficulty}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Expand indicator */}
      <div style={{
        borderTop: '1px solid #f3f4f6',
        padding: '8px 16px',
        fontSize: 12,
        color: '#2563eb',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        background: open ? '#eff6ff' : 'transparent',
      }}>
        {open ? '▲ Hide progress' : '▼ Show progress'}
      </div>

      {/* Progress drawer — rendered inline below the card footer, stops click propagation on interior links */}
      {open && (
        <div
          style={{ borderTop: '1px solid #e5e7eb', background: '#fafafa' }}
          onClick={(e) => e.stopPropagation()}
        >
          <ProgressDrawer programmeId={program.id} moduleCount={program._count.modules} />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function TabTraining() {
  // My Programmes state
  const [assignments, setAssignments] = useState<ProgrammeAssignment[]>([]);
  const [programmeLoading, setProgrammeLoading] = useState(true);

  // Team Compliance state
  const [rows, setRows] = useState<TrainingRow[]>([]);
  const [complianceLoading, setComplianceLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/v1/dashboard/my-programmes')
      .then((r) => r.json())
      .then((d) => setAssignments(d?.result?.assignments ?? []))
      .catch(() => setAssignments([]))
      .finally(() => setProgrammeLoading(false));

    apiFetch('/api/v1/dashboard/training-status')
      .then((r) => r.json())
      .then((d) => setRows(d?.result?.rows ?? []))
      .catch(() => setRows([]))
      .finally(() => setComplianceLoading(false));
  }, []);

  return (
    <div style={{ padding: 24 }}>

      {/* ------------------------------------------------------------------ */}
      {/* Section 1: My Programmes                                            */}
      {/* ------------------------------------------------------------------ */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 4, fontSize: 20, fontWeight: 600 }}>My Training</h2>
        <p style={{ marginBottom: 20, opacity: 0.65, fontSize: 14 }}>
          Your assigned ZenLearn programmes. Click any card to see per-module progress.
        </p>

        {programmeLoading ? (
          <div style={{ fontSize: 14, color: '#6b7280' }}>Loading your programmes…</div>
        ) : assignments.length === 0 ? (
          <div style={{
            padding: '32px 24px', textAlign: 'center', border: '1px dashed #e5e7eb',
            borderRadius: 10, color: '#9ca3af', fontSize: 14,
          }}>
            No programmes assigned to you yet.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {assignments.map((item) => (
              <ProgrammeCard key={item.assignment.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Section 2: Team Compliance                                          */}
      {/* ------------------------------------------------------------------ */}
      <section>
        <h2 style={{ marginBottom: 8, fontSize: 20, fontWeight: 600 }}>Team Compliance</h2>
        <p style={{ marginBottom: 16, opacity: 0.65, fontSize: 14 }}>
          Weekly programmes are auto-assigned by role. Completion updates as learners finish modules in ZenLearn.
        </p>

        {complianceLoading ? (
          <div style={{ fontSize: 14, color: '#6b7280' }}>Loading training status…</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 600 }}>Name</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>Role</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>Assigned</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>Completed</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>Completion %</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={`${r.name}-${r.lava_role}-${i}`}
                    style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '9px 8px' }}>{r.name}</td>
                    <td style={{ textAlign: 'center', padding: '9px 8px', color: '#6b7280' }}>{r.lava_role}</td>
                    <td style={{ textAlign: 'center', padding: '9px 8px' }}>{r.assigned}</td>
                    <td style={{ textAlign: 'center', padding: '9px 8px' }}>{r.completed}</td>
                    <td style={{
                      textAlign: 'center', padding: '9px 8px', fontWeight: 600,
                      color: r.completionPct >= 80 ? '#16a34a' : r.completionPct >= 50 ? '#d97706' : '#dc2626',
                    }}>
                      {r.completionPct}%
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: 40, opacity: 0.45, fontSize: 14 }}>
                      No training assigned yet. Add assignment rules in the Training Rules tab.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
}
