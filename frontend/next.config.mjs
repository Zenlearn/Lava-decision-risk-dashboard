/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // All API routes (including auth) go to the Lava backend.
    // The Lava backend proxies /api/v1/auth/* to PathwaysBackend
    // on the internal Docker network — no public PathwaysBackend URL required.
    const backendUrl = process.env.LAVA_API_URL || 'http://localhost:3010';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
