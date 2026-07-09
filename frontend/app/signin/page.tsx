'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, Eye, EyeOff, Loader2 } from 'lucide-react';

function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmLogin = async () => {
    setLoading(true);
    setShowConfirmDialog(false);

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const payload = await response.json();

      if (response.ok && payload.token) {
        document.cookie = `token=${payload.token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
        router.push(redirectPath);
        router.refresh();
      } else {
        setError(payload.message || 'Login failed. Please check your credentials and try again.');
      }
    } catch (err) {
      setError('Connection to auth server failed. Please verify PathwaysBackend is online.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Confirmation Dialog matching Micro */}
      {showConfirmDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e5e7eb',
            width: '90%',
            maxWidth: '512px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: '#fef3c7', color: '#d97706', padding: '8px', borderRadius: '50%', display: 'flex' }}>
                <AlertTriangle size={20} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: 0, fontFamily: 'var(--font-sans)' }}>
                Confirm Login
              </h3>
            </div>
            <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.5', margin: '0 0 24px 0', padding: '0 8px' }}>
              You will be logged out from all your currently running sessions. Are you sure you want to continue?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowConfirmDialog(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  background: '#fff',
                  color: '#374151',
                  fontWeight: 500,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogin}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#294d89',
                  color: '#fff',
                  fontWeight: 500,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Page Layout matching Micro gradient and container shapes */}
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 16px',
        boxSizing: 'border-box',
        background: 'linear-gradient(135deg, #8896ef 0%, #0C2652 100%)'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '448px',
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          boxSizing: 'border-box'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img
                src="/logo_144.png"
                alt="Logo"
                style={{ height: '44px', width: 'auto', display: 'block' }}
              />
            </div>
            <p style={{ color: '#294d89', marginTop: '12px', fontWeight: 'bold', fontSize: '15px', fontFamily: 'var(--font-sans)', margin: '8px 0 0 0' }}>
              AI-native personalized micro-learning platform
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div style={{
                padding: '12px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                borderRadius: '8px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <div>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  fontFamily: 'var(--font-sans)'
                }}
                required
                disabled={loading}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  fontFamily: 'var(--font-sans)'
                }}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '12px',
                  border: 'none',
                  background: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                style={{
                  border: 'none',
                  background: 'none',
                  color: '#294d89',
                  fontWeight: 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Forgot password?
              </button>
            </div>

            <p style={{ fontSize: '11px', color: '#6b7280', textAlign: 'center', lineHeight: '1.4', margin: 0 }}>
              By proceeding, you are indicating that you have read and that you agree to our{' '}
              <a href="#" style={{ color: '#2563eb', textDecoration: 'none' }}>terms of use</a> and{' '}
              <a href="#" style={{ color: '#2563eb', textDecoration: 'none' }}>privacy notice</a>.
            </p>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                background: '#294d89',
                color: '#fff',
                fontWeight: 'bold',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background 0.2s'
              }}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0C2652', color: '#fff' }}>
        <Loader2 className="animate-spin" size={32} />
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
