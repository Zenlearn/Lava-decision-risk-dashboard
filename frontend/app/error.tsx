'use client';

import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        background: 'var(--bg, #0f172a)',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <AlertTriangle size={48} style={{ color: '#f87171' }} />
      <div>
        <h2 style={{ color: '#f1f5f9', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Dashboard failed to load
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '480px' }}>
          An unexpected error occurred while rendering the dashboard.
          {error?.message ? ` Detail: ${error.message}` : ''}
        </p>
        {error?.digest && (
          <p style={{ color: '#475569', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <button
        onClick={reset}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          background: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        <RefreshCw size={14} />
        Retry
      </button>
    </div>
  );
}
