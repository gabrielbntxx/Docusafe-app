/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use SWC minifier instead of Terser to handle modern JS syntax
  swcMinify: true,
  images: {
    unoptimized: true,
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
  // Transpile packages that use modern JS syntax
  transpilePackages: [
    '@radix-ui/react-slot',
    'lucide-react',
    '@hookform/resolvers',
    'react-hook-form',
    'zod',
  ],
};

module.exports = nextConfig;
