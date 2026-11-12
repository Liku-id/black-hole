import { validateRedirectUrl } from './security';

describe('validateRedirectUrl', () => {
  it('returns / for null, undefined, or empty string', () => {
    expect(validateRedirectUrl(undefined)).toBe('/');
    expect(validateRedirectUrl(null)).toBe('/');
    expect(validateRedirectUrl('')).toBe('/');
    expect(validateRedirectUrl(123 as any)).toBe('/');
  });

  it('rejects dangerous protocols', () => {
    expect(validateRedirectUrl('javascript:alert(1)')).toBe('/');
    expect(validateRedirectUrl('DATA:text/html,<script>')).toBe('/');
    expect(validateRedirectUrl('vbscript:msgbox(1)')).toBe('/');
    expect(validateRedirectUrl('file:///etc/passwd')).toBe('/');
  });

  it('allows relative paths starting with single slash and blocks protocol-relative //', () => {
    expect(validateRedirectUrl('/dashboard')).toBe('/dashboard');
    expect(validateRedirectUrl('/events/123?tab=tickets')).toBe(
      '/events/123?tab=tickets'
    );
    expect(validateRedirectUrl('//evil.com')).toBe('/');
  });

  it('validates absolute URLs against allowedDomains', () => {
    expect(
      validateRedirectUrl('https://bo-staging-aws.wukong.co.id/dashboard', [
        'https://bo-staging-aws.wukong.co.id'
      ])
    ).toBe('https://bo-staging-aws.wukong.co.id/dashboard');

    expect(
      validateRedirectUrl('http://app.wukong.co.id/events', [
        'app.wukong.co.id'
      ])
    ).toBe('http://app.wukong.co.id/events');

    expect(
      validateRedirectUrl('https://evil.com/phish', ['app.wukong.co.id'])
    ).toBe('/');
  });

  it('rejects non-http/https protocols and invalid URL strings', () => {
    expect(
      validateRedirectUrl('ftp://app.wukong.co.id/file', ['app.wukong.co.id'])
    ).toBe('/');
    expect(validateRedirectUrl('not-a-valid-url')).toBe('/');
  });
});
