/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable TypeScript and JSX
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  
  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Add resolve alias for cleaner imports
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };

    return config;
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false
      }
    ];
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Image optimization (Next.js built-in)
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
};

module.exports = nextConfig;
