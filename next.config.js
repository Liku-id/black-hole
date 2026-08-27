/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable TypeScript and JSX
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],

  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Add resolve alias for cleaner imports
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src')
    };

    return config;
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/register',
        permanent: false
      }
    ];
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY
  },

  // Image optimization (Next.js built-in)
  images: {
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wukong-staging-public.s3.ap-southeast-3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'wukong-dev-public.s3.ap-southeast-3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'wukong-staging-private.s3.ap-southeast-3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'wukong-production-public.s3.ap-southeast-3.amazonaws.com',
      },
      // GCS (GEN-3947). One host covers every bucket, and assets arrive as V4
      // signed URLs so the query string carries a per-response signature. The
      // path is pinned to our buckets: the host alone would turn /_next/image
      // into an optimizer for every public bucket on GCS.
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/wukong-*/**',
      }
    ],
    formats: ['image/webp', 'image/avif']
  }
};

module.exports = nextConfig;
