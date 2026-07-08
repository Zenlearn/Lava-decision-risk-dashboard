import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lava Decision Risk | Sign In',
};

/**
 * Sign-in page — Phase 0 shell.
 *
 * Users authenticate via PathwaysBackend's existing login endpoint
 * (shared JWT — no separate Lava login).
 *
 * Phase 2 will implement a redirect to the ZenLearn login URL or
 * an inline login form depending on the deployment topology.
 */
export default function SignInPage() {
  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Lava Decision Risk</h1>
      <p style={{ color: '#666' }}>
        Sign in via ZenLearn — shared authentication in place (Phase 2 will wire the UI).
      </p>
    </main>
  );
}
