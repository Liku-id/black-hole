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
  transpilePackages: [
    '@mui/material',
    '@mui/x-date-pickers',
    '@mui/lab',
    '@mui/icons-material'
  ]
};

module.exports = withImages(redirects);
