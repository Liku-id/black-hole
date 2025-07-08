/**
 * Custom API Error class
 * Extends the built-in Error class with additional properties
 */
export class ApiError extends Error {
  constructor(
    public code: number,
    public message: string,
    public details?: any[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
} 