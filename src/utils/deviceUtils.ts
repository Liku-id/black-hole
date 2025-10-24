/**
 * Device detection utilities
 */
export const deviceUtils = {
  /**
   * Detect device platform based on user agent
   * @returns Device platform string
   */
  getDevicePlatform: (): string => {
    if (typeof window === 'undefined') return 'web'; // SSR fallback
    
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/android/.test(userAgent)) {
      return 'android';
    } else if (/iphone|ipad|ipod/.test(userAgent)) {
      return 'ios';
    } else if (/tablet|ipad/.test(userAgent)) {
      return 'tablet';
    } else if (/mobile/.test(userAgent)) {
      return 'mobile';
    } else {
      return 'web';
    }
  },

  /**
   * Check if device is mobile
   * @returns boolean
   */
  isMobile: (): boolean => {
    if (typeof window === 'undefined') return false;
    const userAgent = navigator.userAgent.toLowerCase();
    return /mobile|android|iphone|ipad|ipod/.test(userAgent);
  },

  /**
   * Check if device is tablet
   * @returns boolean
   */
  isTablet: (): boolean => {
    if (typeof window === 'undefined') return false;
    const userAgent = navigator.userAgent.toLowerCase();
    return /tablet|ipad/.test(userAgent);
  },

  /**
   * Check if device is desktop
   * @returns boolean
   */
  isDesktop: (): boolean => {
    if (typeof window === 'undefined') return true;
    const userAgent = navigator.userAgent.toLowerCase();
    return !/mobile|android|iphone|ipad|ipod|tablet/.test(userAgent);
  }
};
