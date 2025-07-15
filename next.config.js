const withImages = require('next-images');

const redirects = {
  async redirects() {
    return [
      {
        source: '/dashboards',
        destination: '/dashboards/crypto',
        permanent: true
      }
    ];
  }
};

const nextConfig = {
  ...redirects,
  // Exclude demo-reference folder from build
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  
  // Ignore demo-reference folder during development and build
  webpack: (config, { dev, isServer }) => {
    // Exclude demo-reference folder from webpack compilation
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules/**',
        '**/demo-reference/**',
        '**/.git/**',
        '**/.next/**'
      ]
    };

    // Add resolve alias to ignore demo-reference imports
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/demo-reference': false
    };

    return config;
  },

  // Exclude demo-reference from page routing
  async rewrites() {
    return [];
  }
};

module.exports = withImages(nextConfig);
