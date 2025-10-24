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
    domains: [
      'wukong-staging-public.s3.ap-southeast-3.amazonaws.com',
      'wukong-dev-public.s3.ap-southeast-3.amazonaws.com',
      'wukong-staging-private.s3.ap-southeast-3.amazonaws.com',
      'wukong-production-public.s3.ap-southeast-3.amazonaws.com',
      'wukong-production-private.s3.ap-southeast-3.amazonaws.com',
    ],
    formats: ['image/webp', 'image/avif']
  }
};

module.exports = nextConfig;
