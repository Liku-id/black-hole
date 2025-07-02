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
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:8080/v1/:path*'
      }
    ];
  },
  transpilePackages: [
    '@mui/material',
    '@mui/x-date-pickers',
    '@mui/lab',
    '@mui/icons-material'
  ]
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:8080/v1/:path*'
      }
    ];
  }
};

module.exports = withImages(redirects);
