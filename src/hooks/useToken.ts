import { useCallback } from 'react';

/**
 * Token management hook
 * Provides token-related functionality with React integration
 */
export const useToken = () => {
  /**
   * Get access token from localStorage
   */
  const getAccessToken = useCallback((): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }, []);

  /**
   * Get refresh token from localStorage
   */
  const getRefreshToken = useCallback((): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }, []);

  /**
   * Store access and refresh tokens in localStorage
   */
  const setTokens = useCallback((accessToken: string, refreshToken: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }, []);

  /**
   * Clear all tokens from localStorage
   */
  const clearTokens = useCallback((): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }, []);

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = useCallback((): boolean => {
    const token = getAccessToken();
    return !!token;
  }, [getAccessToken]);

  return {
    getAccessToken,
    getRefreshToken,
    setTokens,
    clearTokens,
    isAuthenticated
  };
}; 