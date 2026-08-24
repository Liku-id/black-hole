const nextConfig = require('./next.config');

// next/image rejects any host that is not whitelisted here, and it fails at
// runtime only — a build and the whole test suite stay green while every asset
// image 400s in production.
describe('next.config images', () => {
  const hostnames = nextConfig.images.remotePatterns.map(
    (pattern) => pattern.hostname
  );

  it('allows the GCS asset host', () => {
    expect(hostnames).toContain('storage.googleapis.com');
  });

  // Without a path, /_next/image would happily optimize any public bucket on
  // GCS on someone else's behalf.
  it('pins the GCS host to our buckets', () => {
    const gcs = nextConfig.images.remotePatterns.find(
      (pattern) => pattern.hostname === 'storage.googleapis.com'
    );
    expect(gcs.pathname).toBe('/wukong-*/**');
  });

  it('still allows the S3 asset hosts until the production cutover is done', () => {
    expect(hostnames).toContain(
      'wukong-production-public.s3.ap-southeast-3.amazonaws.com'
    );
  });
});
