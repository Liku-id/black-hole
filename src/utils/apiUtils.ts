/**
 * API utilities for common operations
 */
export const apiUtils = {
  /**
   * Build query string from object
   * @param params - Object containing query parameters
   * @returns Query string
   */
  buildQueryString: (params: Record<string, any>): string => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    
    return queryParams.toString();
  },

  /**
   * Handle API response with error handling
   * @param response - Fetch response
   * @returns Parsed response data
   */
  handleResponse: async (response: Response): Promise<any> => {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  /**
   * Make authenticated API request
   * @param url - API endpoint URL
   * @param options - Fetch options
   * @returns Promise with response data
   */
  makeRequest: async (url: string, options: RequestInit = {}): Promise<any> => {
    const token = localStorage.getItem('authToken');
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      }
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    return apiUtils.handleResponse(response);
  },

  /**
   * GET request helper
   * @param url - API endpoint URL
   * @param params - Query parameters
   * @returns Promise with response data
   */
  get: async (url: string, params?: Record<string, any>): Promise<any> => {
    const queryString = params ? `?${apiUtils.buildQueryString(params)}` : '';
    return apiUtils.makeRequest(`${url}${queryString}`);
  },

  /**
   * POST request helper
   * @param url - API endpoint URL
   * @param data - Request body data
   * @returns Promise with response data
   */
  post: async (url: string, data?: any): Promise<any> => {
    return apiUtils.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  /**
   * PUT request helper
   * @param url - API endpoint URL
   * @param data - Request body data
   * @returns Promise with response data
   */
  put: async (url: string, data?: any): Promise<any> => {
    return apiUtils.makeRequest(url, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  /**
   * DELETE request helper
   * @param url - API endpoint URL
   * @returns Promise with response data
   */
  delete: async (url: string): Promise<any> => {
    return apiUtils.makeRequest(url, {
      method: 'DELETE'
    });
  },

  /**
   * Upload file helper
   * @param url - API endpoint URL
   * @param file - File to upload
   * @param fieldName - Form field name for the file
   * @returns Promise with response data
   */
  uploadFile: async (url: string, file: File, fieldName: string = 'file'): Promise<any> => {
    const formData = new FormData();
    formData.append(fieldName, file);

    const token = localStorage.getItem('authToken');
    
    const options: RequestInit = {
      method: 'POST',
      body: formData,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      }
    };

    const response = await fetch(url, options);
    return apiUtils.handleResponse(response);
  },

  /**
   * Download file helper
   * @param url - File URL
   * @param filename - Optional filename for download
   */
  downloadFile: async (url: string, filename?: string): Promise<void> => {
    try {
      const response = await apiUtils.makeRequest(url);
      const blob = await response.blob();
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  },

  /**
   * Retry API request with exponential backoff
   * @param fn - Function to retry
   * @param retries - Number of retries
   * @param delay - Initial delay in milliseconds
   * @returns Promise with response data
   */
  retry: async <T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
  ): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return apiUtils.retry(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  }
};
