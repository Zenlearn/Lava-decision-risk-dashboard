/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // PathwaysBackend handles auth (sign-in, sign-up, etc.)
    // Lava backend handles dashboard, imports, audit, health
    const backendUrl = process.env.LAVA_API_URL || 'http://localhost:3010';
    const pathwaysUrl = process.env.PATHWAYS_API_URL || 'https://api.zenlearn.ai';
    return [
      // Auth routes go to PathwaysBackend (Lava does not handle auth)
      {
        source: '/api/v1/auth/:path*',
        destination: `${pathwaysUrl}/api/v1/auth/:path*`,
      },
      // All other Lava API routes go to Lava backend
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
