'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedToken = token.trim();
    if (!trimmedToken) {
      setError('Please paste a valid JWT token.');
      return;
    }

    try {
      // Set the shared JWT token inside the cookie named 'token'
      // This matches backend auth.middleware.ts cookie check AND frontend middleware.ts redirect gate
      document.cookie = `token=${trimmedToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      
      // Redirect back to root dashboard
      router.push('/');
      router.refresh();
    } catch (err) {
      setError('Failed to save the session cookie.');
    }
  };

  const handleDemoSignIn = () => {
    // Generate a mock JWT for development environment testing if they don't have Pathways running
    // The backend uses JWT_SECRET to verify, so mock tokens will fail backend checks if secret is verified.
    // However, if they have a token from PathwaysBackend, pasting it is best.
    setError('Please copy the JWT token from your active PathwaysBackend session (Applications -> Cookies -> token) and paste it below.');
  };

  return (
    <main style={{ display: 'flex', width: '100vw', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)' }}>
      <div className="signin-card">
        <div style={{ textAlign: 'center' }}>
          <div className="brand-logo" style={{ margin: '0 auto 1rem', width: '48px', height: '48px', backgroundColor: 'var(--color-primary)', color: '#fff', fontSize: '1.5rem' }}>
            L
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Lava Decision Risk
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            Single Sign-On (SSO) Portal
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', color: 'var(--color-danger)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 500 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label htmlFor="jwt-token">ZenLearn SSO Token (JWT)</label>
            <textarea
              id="jwt-token"
              placeholder="Paste JWT token here..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              rows={4}
              className="form-input"
              style={{ resize: 'none', fontFamily: 'monospace', fontSize: '0.8rem' }}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '0.75rem', width: '100%', fontSize: '0.95rem' }}>
            Verify & Authenticate
          </button>
        </form>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', textAlign: 'center' }}>
          <button 
            type="button" 
            onClick={handleDemoSignIn}
            style={{ border: 'none', background: 'none', color: 'var(--color-primary-light)', fontWeight: 500, fontSize: '0.85rem', cursor: 'pointer' }}
          >
            How do I get my token?
          </button>
        </div>
      </div>
    </main>
  );
}
