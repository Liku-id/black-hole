/**
 * @jest-environment node
 */
import { deviceUtils } from './deviceUtils';

describe('deviceUtils (SSR node environment)', () => {
  it('returns safe defaults when window is undefined', () => {
    expect(typeof window).toBe('undefined');
    expect(deviceUtils.getDevicePlatform()).toBe('web');
    expect(deviceUtils.isMobile()).toBe(false);
    expect(deviceUtils.isTablet()).toBe(false);
    expect(deviceUtils.isDesktop()).toBe(true);
  });
});
