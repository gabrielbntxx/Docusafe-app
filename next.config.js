/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable SWC minifier to avoid download issues on Railway
  swcMinify: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
      },
    ],
  },
};

module.exports = nextConfig;
