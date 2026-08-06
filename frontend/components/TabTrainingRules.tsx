'use client';
import React, { useEffect, useState, useCallback } from 'react';

interface Rule {
  id: string;
  lava_role: string;
  programme_id: string;
  programme_title: string;
}

const LAVA_ROLES = ['BUSM', 'ASM', 'ASP'];

export default function TabTrainingRules() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRole, setNewRole] = useState('ASM');
  const [newProgId, setNewProgId] = useState('');
  const [newProgTitle, setNewProgTitle] = useState('');
  const [assignUserId, setAssignUserId] = useState('');
  const [assignProgId, setAssignProgId] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const loadRules = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/v1/dashboard/training-rules');
      const d = await r.json();
      setRules(d?.result?.rules ?? []);
    } catch {
      setRules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRules(); }, [loadRules]);

  const addRule = async () => {
    if (!newProgId.trim() || !newProgTitle.trim()) {
      setMsg('Programme ID and title are required.');
      return;
    }
    setBusy(true);
    setMsg('');
    try {
      const r = await fetch('/api/v1/dashboard/training-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lava_role: newRole, programme_id: newProgId.trim(), programme_title: newProgTitle.trim() }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setNewProgId('');
      setNewProgTitle('');
      setMsg('Rule added successfully.');
      await loadRules();
    } catch (e: unknown) {
      setMsg(`Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const deleteRule = async (id: string, title: string) => {
    if (!confirm(`Delete rule for "${title}"? Users will no longer be auto-assigned this programme.`)) return;
    setBusy(true);
    setMsg('');
    try {
      await fetch(`/api/v1/dashboard/training-rules/${id}`, { method: 'DELETE' });
      setMsg('Rule deleted.');
      await loadRules();
    } catch {
      setMsg('Delete failed.');
    } finally {
      setBusy(false);
    }
  };

  const manualAssign = async () => {
    if (!assignUserId.trim() || !assignProgId.trim()) {
      setMsg('User ID and Programme ID are required.');
      return;
    }
    setBusy(true);
    setMsg('');
    try {
      const r = await fetch('/api/v1/dashboard/training-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: assignUserId.trim(), programme_id: assignProgId.trim() }),
      });
      if (r.status === 409) {
        setMsg('User already has an active assignment for this programme this week.');
        return;
      }
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setAssignUserId('');
      setAssignProgId('');
      setMsg('Assignment created successfully.');
    } catch (e: unknown) {
      setMsg(`Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db',
    fontSize: 13, outline: 'none',
  };
  const btnStyle = (color: string): React.CSSProperties => ({
    padding: '7px 16px', borderRadius: 6, background: color, color: '#fff',
    border: 'none', cursor: busy ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 500,
  });

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <h2 style={{ marginBottom: 8, fontSize: 20, fontWeight: 600 }}>Training Assignment Rules</h2>
      <p style={{ marginBottom: 20, opacity: 0.65, fontSize: 14 }}>
        Active rules are used by the weekly Monday cron to auto-assign programmes by role.
        Programme IDs come from the ZenLearn CMS.
      </p>

      {/* Rules table */}
      <div style={{ overflowX: 'auto', marginBottom: 32 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 600 }}>Role</th>
              <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 600 }}>Programme</th>
              <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 600, color: '#9ca3af' }}>Programme ID</th>
              <th style={{ padding: '10px 8px' }}></th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '9px 8px', fontWeight: 600 }}>{r.lava_role}</td>
                <td style={{ padding: '9px 8px' }}>{r.programme_title}</td>
                <td style={{ padding: '9px 8px', fontFamily: 'monospace', fontSize: 12, color: '#9ca3af' }}>{r.programme_id}</td>
                <td style={{ padding: '9px 8px', textAlign: 'right' }}>
                  <button onClick={() => deleteRule(r.id, r.programme_title)} disabled={busy}
                    style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 13 }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {rules.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: 32, opacity: 0.45, fontSize: 14 }}>
                  No active rules. Add one below.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add rule */}
      <h3 style={{ marginBottom: 12, fontSize: 15, fontWeight: 600 }}>Add Rule</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 32 }}>
        <select value={newRole} onChange={(e) => setNewRole(e.target.value)} style={{ ...inputStyle, width: 100 }}>
          {LAVA_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <input placeholder="Programme ID (from ZenLearn CMS)" value={newProgId}
          onChange={(e) => setNewProgId(e.target.value)} style={{ ...inputStyle, width: 260 }} />
        <input placeholder="Display name" value={newProgTitle}
          onChange={(e) => setNewProgTitle(e.target.value)} style={{ ...inputStyle, width: 200 }} />
        <button onClick={addRule} disabled={busy} style={btnStyle('#2563eb')}>Add Rule</button>
      </div>

      {/* Manual assign */}
      <h3 style={{ marginBottom: 12, fontSize: 15, fontWeight: 600 }}>Manual Assign</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
        <input placeholder="ZenLearn User ID" value={assignUserId}
          onChange={(e) => setAssignUserId(e.target.value)} style={{ ...inputStyle, width: 220 }} />
        <input placeholder="Programme ID" value={assignProgId}
          onChange={(e) => setAssignProgId(e.target.value)} style={{ ...inputStyle, width: 220 }} />
        <button onClick={manualAssign} disabled={busy} style={btnStyle('#16a34a')}>Assign Now</button>
      </div>

      {msg && (
        <p style={{ marginTop: 8, fontSize: 13, fontWeight: 500,
          color: msg.startsWith('Error') || msg.includes('failed') ? '#dc2626' : '#16a34a' }}>
          {msg}
        </p>
      )}
    </div>
  );
}
