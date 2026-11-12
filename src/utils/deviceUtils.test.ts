import { deviceUtils } from './deviceUtils';

describe('deviceUtils', () => {
  const originalUserAgent = navigator.userAgent;

  const setUserAgent = (ua: string) => {
    Object.defineProperty(navigator, 'userAgent', {
      value: ua,
      configurable: true
    });
  };

  afterEach(() => {
    setUserAgent(originalUserAgent);
  });

  describe('browser userAgent branches', () => {
    it('detects android', () => {
      setUserAgent('Mozilla/5.0 (Linux; Android 13; Pixel 7) Mobile');
      expect(deviceUtils.getDevicePlatform()).toBe('android');
      expect(deviceUtils.isMobile()).toBe(true);
      expect(deviceUtils.isTablet()).toBe(false);
      expect(deviceUtils.isDesktop()).toBe(false);
    });

    it('detects ios (iPhone/iPad)', () => {
      setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)');
      expect(deviceUtils.getDevicePlatform()).toBe('ios');
      expect(deviceUtils.isMobile()).toBe(true);
      expect(deviceUtils.isDesktop()).toBe(false);

      setUserAgent('Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)');
      expect(deviceUtils.getDevicePlatform()).toBe('ios');
      expect(deviceUtils.isTablet()).toBe(true);
    });

    it('detects tablet', () => {
      setUserAgent('Mozilla/5.0 (Tablet; rv:109.0)');
      expect(deviceUtils.getDevicePlatform()).toBe('tablet');
      expect(deviceUtils.isTablet()).toBe(true);
      expect(deviceUtils.isMobile()).toBe(false);
      expect(deviceUtils.isDesktop()).toBe(false);
    });

    it('detects generic mobile', () => {
      setUserAgent('Mozilla/5.0 (Mobile; rv:109.0)');
      expect(deviceUtils.getDevicePlatform()).toBe('mobile');
      expect(deviceUtils.isMobile()).toBe(true);
    });

    it('detects web/desktop', () => {
      setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      );
      expect(deviceUtils.getDevicePlatform()).toBe('web');
      expect(deviceUtils.isMobile()).toBe(false);
      expect(deviceUtils.isTablet()).toBe(false);
      expect(deviceUtils.isDesktop()).toBe(true);
    });
  });
});
