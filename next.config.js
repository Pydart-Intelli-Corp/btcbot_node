/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export to enable SSR
  // output: 'export', 
  trailingSlash: false,
  images: {
    // Re-enable optimization for SSR
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Configure for Express integration
  outputFileTracingRoot: __dirname,
};

module.exports = nextConfig;
