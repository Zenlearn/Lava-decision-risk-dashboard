'use client';
import React, { useEffect, useState } from 'react';

interface TrainingRow {
  name: string;
  lava_role: string;
  assigned: number;
  completed: number;
  completionPct: number;
}

export default function TabTraining() {
  const [rows, setRows] = useState<TrainingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/dashboard/training-status')
      .then((r) => r.json())
      .then((d) => setRows(d?.result?.rows ?? []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Loading training status…</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 8, fontSize: 20, fontWeight: 600 }}>Training Compliance</h2>
      <p style={{ marginBottom: 16, opacity: 0.65, fontSize: 14 }}>
        Weekly programmes are auto-assigned by role. Completion updates as learners finish modules in ZenLearn.
      </p>
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
    </div>
  );
}
