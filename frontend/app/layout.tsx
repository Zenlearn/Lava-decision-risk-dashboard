import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lava Decision Risk',
  description: 'Decision intelligence platform for Lava service network — risk scoring, audit hit-lists, and role-scoped dashboards.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
