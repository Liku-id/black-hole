import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

/**
 * API utilities for common operations using axios
 */
export const apiUtils = {
  /**
   * Get authentication token from localStorage
   * @returns Auth token or null
   */
  getAuthToken: (): string | null => {
    return localStorage.getItem('auth_access_token');
  },

  /**
   * Create default axios config with authentication
   * @param additionalConfig - Additional axios config
   * @returns AxiosRequestConfig
   */
  createConfig: (additionalConfig?: AxiosRequestConfig): AxiosRequestConfig => {
    const token = apiUtils.getAuthToken();

    return {
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...additionalConfig?.headers
      },
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

      if (data && typeof data === 'object') {
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
