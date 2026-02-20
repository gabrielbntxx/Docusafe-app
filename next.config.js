/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "docusafe.online" }],
        destination: "https://www.docusafe.online/:path*",
        permanent: true,
      },
    ];
  },
  // Use SWC minifier instead of Terser to handle modern JS syntax
  swcMinify: true,
  // Prevent webpack from bundling these native/file-dependent packages.
  // pdfkit needs its AFM font files to stay at their real node_modules path;
  // sharp uses native binaries. Bundling either breaks them at runtime.
  serverExternalPackages: ['pdfkit', 'sharp'],
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
