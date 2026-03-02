import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

let refreshTokenPromise: Promise<void> | null = null;

const refreshTokens = async (): Promise<void> => {
  if (!refreshTokenPromise) {
    refreshTokenPromise = axios
      .post('/api/auth/refresh-token')
      .then(() => {
        refreshTokenPromise = null;
      })
      .catch((error) => {
        refreshTokenPromise = null;
        throw error;
      });
  }

  return refreshTokenPromise;
};

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
        window.location.pathname !== '/login'
      ) {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Failed to clear expired session:', error);
      if (
        typeof window !== 'undefined' &&
        window.location.pathname !== '/login'
      ) {
        window.location.href = '/login';
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
    defaultErrorMessage: string = 'Request failed',
    options: { skipSessionClear?: boolean } = {}
  ): Error => {
    const { skipSessionClear = false } = options;
    let errorMessage = defaultErrorMessage;

    if (error.response) {
      const { data, status } = error.response;
      const requestUrl = error.config?.url || '';

      if (status === 401 && !requestUrl.includes('/api/auth/login')) {
        if (!skipSessionClear) {
          apiUtils.clearExpiredSession();
        }
      }

      // Pass through the BE error message directly
      if (data && typeof data === 'object') {
        const errorData = data as any;
        errorMessage =
          errorData.message || errorData.error || defaultErrorMessage;
      }
    } else if (error.request) {
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout - server is not responding';
      } else {
        errorMessage =
          'No response from server. Please check your internet connection.';
      }
    } else {
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
    defaultErrorMessage: string = 'Request failed',
    retryOn401: boolean = true
  ): Promise<T> => {
    try {
      const axiosConfig = apiUtils.createConfig(config);
      const response: AxiosResponse<T> = await axios(axiosConfig);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const requestUrl = error.config?.url || config.url || '';

        const isLoginRequest =
          typeof requestUrl === 'string' &&
          requestUrl.includes('/api/auth/login');
        const isRefreshRequest =
          typeof requestUrl === 'string' &&
          requestUrl.includes('/api/auth/refresh-token');
        const isClearSessionRequest =
          typeof requestUrl === 'string' &&
          requestUrl.includes('/api/auth/clear-session');

        const shouldAttemptRefresh =
          retryOn401 &&
          status === 401 &&
          !isLoginRequest &&
          !isRefreshRequest &&
          !isClearSessionRequest;

        if (shouldAttemptRefresh) {
          try {
            await refreshTokens();
            return apiUtils.makeRequest<T>(config, defaultErrorMessage, false);
          } catch (refreshError) {
            if (axios.isAxiosError(refreshError)) {
              await apiUtils.clearExpiredSession();
              throw apiUtils.handleAxiosError(
                refreshError,
                'Failed to refresh token',
                { skipSessionClear: true }
              );
            }
            throw refreshError;
          }
        }

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
   * PATCH request helper
   * @param url - API endpoint URL
   * @param data - Request body data
   * @param defaultErrorMessage - Default error message
   * @returns Promise with response data
   */
  patch: async <T = any>(
    url: string,
    data?: any,
    defaultErrorMessage?: string
  ): Promise<T> => {
    return apiUtils.makeRequest<T>(
      {
        method: 'PATCH',
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
