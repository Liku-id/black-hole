/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

// Use proxy in development to avoid CORS issues
export const API_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? '/api/v1'
    : 'http://172.16.1.33:8080/v1';

/**
 * Default API headers
 */
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json'
};

/**
 * API request options
 */
export const API_OPTIONS = {
  mode: 'cors' as const,
  credentials: 'omit' as const
}; 