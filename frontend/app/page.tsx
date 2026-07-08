import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lava Decision Risk | Dashboard',
};

/**
 * Landing/dashboard page — Phase 0 shell.
 *
 * This route is PROTECTED by middleware.ts (requires `token` cookie).
 * Phase 2 will replace this with the Executive dashboard view.
 */
export default function DashboardPage() {
  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Lava Decision Risk — Phase 0</h1>
      <p style={{ color: '#666' }}>
        Backend API skeleton is running. Dashboards coming in Phase 2.
      </p>
      <ul style={{ marginTop: '1.5rem', lineHeight: '2rem', color: '#444' }}>
        <li>✅ Auth middleware (shared JWT)</li>
        <li>✅ Postgres + Redis (docker-compose)</li>
        <li>✅ Prisma schema</li>
        <li>✅ /api/v1/health endpoint</li>
        <li>⏳ Import pipeline (Phase 1)</li>
        <li>⏳ Dashboards (Phase 2)</li>
        <li>⏳ Full RBAC (Phase 3)</li>
      </ul>
    </main>
  );
}
