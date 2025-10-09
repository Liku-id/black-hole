import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * API utilities for common operations using axios
 */
export const apiUtils = {
  /**
   * Clear session when auth expires
   */
  clearExpiredSession: async (): Promise<void> => {
    try {
      await axios.post('/api/auth/clear-session');
      if (
        typeof window !== 'undefined' &&
        window.location.pathname !== '/register'
      ) {
        window.location.href = '/register';
      }
    } catch (error) {
      console.error('Failed to clear expired session:', error);
      if (
        typeof window !== 'undefined' &&
        window.location.pathname !== '/register'
      ) {
        window.location.href = '/register';
      }
    }
  },

  /**
   * Create default axios config with authentication
   * @param additionalConfig - Additional axios config
   * @returns AxiosRequestConfig
   */
  createConfig: (additionalConfig?: AxiosRequestConfig): AxiosRequestConfig => {
    return {
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...additionalConfig?.headers
      },
      withCredentials: true, // Include session cookies
      ...additionalConfig
    };
  },

  /**
   * Enhanced error handler for axios responses
   * @param error - Axios error
   * @param defaultErrorMessage - Default error message if parsing fails
   * @returns Error with proper message
   */
  handleAxiosError: (
    error: AxiosError,
    defaultErrorMessage: string = 'Request failed'
  ): Error => {
    let errorMessage = defaultErrorMessage;

    if (error.response) {
      // Server responded with error status
      const { data, status } = error.response;

      // Check if it's an authentication error
      if (status === 401) {
        // Check if it's a login attempt (login endpoint) or session expired
        if (error.config?.url?.includes('/api/auth/login')) {
          if (data && typeof data === 'object' && (data as any).message) {
            errorMessage = (data as any).message;
          }
        } else {
          apiUtils.clearExpiredSession();
          errorMessage = 'Session expired. Please log in again.';
        }
      } else if (status === 413) {
        // Handle payload too large error
        errorMessage =
          'File size too large. Please ensure your files are less than 2MB and try again.';
      } else if (data && typeof data === 'object') {
        const errorData = data as any;
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.details && Array.isArray(errorData.details)) {
          errorMessage = errorData.details.join(', ');
        } else {
          errorMessage = `Server error (${status})`;
        }
      } else {
        errorMessage = `Server error (${status})`;
      }
    } else if (error.request) {
      // Request was made but no response received
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout - server is not responding';
      } else {
        errorMessage =
          'No response from server. Please check your internet connection.';
      }
    } else {
      // Something else happened
      errorMessage = error.message || defaultErrorMessage;
    }

    console.error('API Error:', {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      code: error.code
    });

    return new Error(errorMessage);
  },

  /**
   * Make authenticated API request with axios
   * @param config - Axios request config
   * @param defaultErrorMessage - Default error message
   * @returns Promise with response data
   */
  makeRequest: async <T = any>(
    config: AxiosRequestConfig,
    defaultErrorMessage: string = 'Request failed'
  ): Promise<T> => {
    try {
      const axiosConfig = apiUtils.createConfig(config);
      const response: AxiosResponse<T> = await axios(axiosConfig);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw apiUtils.handleAxiosError(error, defaultErrorMessage);
      }
      throw error;
    }
  },

  /**
   * GET request helper
   * @param url - API endpoint URL
   * @param params - Query parameters
   * @param defaultErrorMessage - Default error message
   * @returns Promise with response data
   */
  get: async <T = any>(
    url: string,
    params?: Record<string, any>,
    defaultErrorMessage?: string
  ): Promise<T> => {
    return apiUtils.makeRequest<T>(
      {
        method: 'GET',
        url,
        params
      },
      defaultErrorMessage
    );
  },

  /**
   * POST request helper
   * @param url - API endpoint URL
   * @param data - Request body data
   * @param defaultErrorMessage - Default error message
   * @returns Promise with response data
   */
  post: async <T = any>(
    url: string,
    data?: any,
    defaultErrorMessage?: string
  ): Promise<T> => {
    return apiUtils.makeRequest<T>(
      {
        method: 'POST',
        url,
        data
      },
      defaultErrorMessage
    );
  },

  /**
   * PUT request helper
   * @param url - API endpoint URL
   * @param data - Request body data
   * @param defaultErrorMessage - Default error message
   * @returns Promise with response data
   */
  put: async <T = any>(
    url: string,
    data?: any,
    defaultErrorMessage?: string
  ): Promise<T> => {
    return apiUtils.makeRequest<T>(
      {
        method: 'PUT',
        url,
        data
      },
      defaultErrorMessage
    );
  },

  /**
   * DELETE request helper
   * @param url - API endpoint URL
   * @param defaultErrorMessage - Default error message
   * @returns Promise with response data
   */
  delete: async <T = any>(
    url: string,
    defaultErrorMessage?: string
  ): Promise<T> => {
    return apiUtils.makeRequest<T>(
      {
        method: 'DELETE',
        url
      },
      defaultErrorMessage
    );
  }
};
