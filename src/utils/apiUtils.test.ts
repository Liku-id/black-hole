import axios, { AxiosError } from 'axios';
import Router from 'next/router';

import { apiUtils } from './apiUtils';

jest.mock('axios', () => {
  const mockAxios = jest.fn() as jest.Mock & {
    post: jest.Mock;
    isAxiosError: jest.Mock;
  };
  mockAxios.post = jest.fn();
  mockAxios.isAxiosError = jest.fn();
  return {
    __esModule: true,
    default: mockAxios
  };
});

jest.mock('next/router', () => ({
  __esModule: true,
  default: {
    replace: jest.fn()
  }
}));

const createMockAxiosError = (
  overrides: Partial<AxiosError> & { isAxios?: boolean } = {}
): AxiosError => {
  const { isAxios = true, ...rest } = overrides;
  const err = new Error(rest.message || 'Axios error') as AxiosError & {
    isAxiosError?: boolean;
  };
  err.isAxiosError = isAxios;
  Object.assign(err, rest);
  return err;
};

describe('apiUtils', () => {
  const mockAxios = axios as unknown as jest.Mock & {
    post: jest.Mock;
    isAxiosError: jest.Mock;
  };
  const mockRouterReplace = Router.replace as jest.Mock;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockAxios.isAxiosError.mockImplementation((err: any) =>
      Boolean(err && err.isAxiosError === true)
    );
    window.history.pushState({}, '', '/dashboard');
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe('clearExpiredSession', () => {
    it('clears session and redirects to /login when not already on /login', async () => {
      mockAxios.post.mockResolvedValueOnce({ data: { message: 'cleared' } });
      window.history.pushState({}, '', '/events');

      await apiUtils.clearExpiredSession();

      expect(mockAxios.post).toHaveBeenCalledWith('/api/auth/clear-session');
      expect(mockRouterReplace).toHaveBeenCalledWith('/login');
    });

    it('clears session without redirecting when already on /login', async () => {
      mockAxios.post.mockResolvedValueOnce({ data: { message: 'cleared' } });
      window.history.pushState({}, '', '/login');

      await apiUtils.clearExpiredSession();

      expect(mockAxios.post).toHaveBeenCalledWith('/api/auth/clear-session');
      expect(mockRouterReplace).not.toHaveBeenCalled();
    });

    it('logs error and still redirects to /login when clear-session fails off /login', async () => {
      const failure = new Error('Network error');
      mockAxios.post.mockRejectedValueOnce(failure);
      window.history.pushState({}, '', '/settings');

      await apiUtils.clearExpiredSession();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to clear expired session:',
        failure
      );
      expect(mockRouterReplace).toHaveBeenCalledWith('/login');
    });

    it('logs error and does not redirect when clear-session fails on /login', async () => {
      const failure = new Error('Network error');
      mockAxios.post.mockRejectedValueOnce(failure);
      window.history.pushState({}, '', '/login');

      await apiUtils.clearExpiredSession();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to clear expired session:',
        failure
      );
      expect(mockRouterReplace).not.toHaveBeenCalled();
    });
  });

  describe('createConfig', () => {
    it('creates default axios config when no additional config is provided', () => {
      const config = apiUtils.createConfig();

      expect(config).toEqual({
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        paramsSerializer: {
          indexes: null
        },
        withCredentials: true
      });
    });

    it('merges additional config options and headers', () => {
      const config = apiUtils.createConfig({
        method: 'POST',
        url: '/api/items',
        timeout: 5000,
        headers: {
          'X-Custom-Header': 'custom-value'
        }
      });

      expect(config).toEqual({
        timeout: 5000,
        method: 'POST',
        url: '/api/items',
        headers: {
          'X-Custom-Header': 'custom-value'
        },
        paramsSerializer: {
          indexes: null
        },
        withCredentials: true
      });
    });
  });

  describe('handleAxiosError', () => {
    it('uses response.data.message when response error provides message', () => {
      const error = createMockAxiosError({
        response: {
          status: 400,
          data: { message: 'Validation failed' }
        } as any,
        config: { url: '/api/events' } as any
      });

      const result = apiUtils.handleAxiosError(error, 'Fallback error');

      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Validation failed');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('uses response.data.error when response.data.message is absent', () => {
      const error = createMockAxiosError({
        response: {
          status: 422,
          data: { error: 'Unprocessable entity' }
        } as any,
        config: { url: '/api/events' } as any
      });

      const result = apiUtils.handleAxiosError(error, 'Fallback error');

      expect(result.message).toBe('Unprocessable entity');
    });

    it('falls back to defaultErrorMessage when response.data lacks message/error or is not an object', () => {
      const emptyDataError = createMockAxiosError({
        response: {
          status: 500,
          data: {}
        } as any
      });
      expect(apiUtils.handleAxiosError(emptyDataError).message).toBe(
        'Request failed'
      );

      const stringDataError = createMockAxiosError({
        response: {
          status: 500,
          data: 'Internal error string'
        } as any
      });
      expect(
        apiUtils.handleAxiosError(stringDataError, 'Custom default').message
      ).toBe('Custom default');
    });

    it('calls clearExpiredSession on 401 when not login request and skipSessionClear is false', () => {
      const clearSpy = jest
        .spyOn(apiUtils, 'clearExpiredSession')
        .mockResolvedValueOnce();

      const error = createMockAxiosError({
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        } as any,
        config: { url: '/api/protected' } as any
      });

      const result = apiUtils.handleAxiosError(error);

      expect(result.message).toBe('Unauthorized');
      expect(clearSpy).toHaveBeenCalledTimes(1);
    });

    it('calls clearExpiredSession on 401 even when error.config is missing', () => {
      const clearSpy = jest
        .spyOn(apiUtils, 'clearExpiredSession')
        .mockResolvedValueOnce();

      const error = createMockAxiosError({
        response: {
          status: 401,
          data: { message: 'Token invalid' }
        } as any
      });

      apiUtils.handleAxiosError(error);

      expect(clearSpy).toHaveBeenCalledTimes(1);
    });

    it('does not call clearExpiredSession on 401 when skipSessionClear is true', () => {
      const clearSpy = jest
        .spyOn(apiUtils, 'clearExpiredSession')
        .mockResolvedValueOnce();

      const error = createMockAxiosError({
        response: {
          status: 401,
          data: { message: 'Refresh failed' }
        } as any,
        config: { url: '/api/protected' } as any
      });

      apiUtils.handleAxiosError(error, 'Request failed', {
        skipSessionClear: true
      });

      expect(clearSpy).not.toHaveBeenCalled();
    });

    it('does not call clearExpiredSession on 401 for login requests', () => {
      const clearSpy = jest
        .spyOn(apiUtils, 'clearExpiredSession')
        .mockResolvedValueOnce();

      const error = createMockAxiosError({
        response: {
          status: 401,
          data: { message: 'Invalid credentials' }
        } as any,
        config: { url: '/api/auth/login' } as any
      });

      const result = apiUtils.handleAxiosError(error);

      expect(result.message).toBe('Invalid credentials');
      expect(clearSpy).not.toHaveBeenCalled();
    });

    it('handles request timeout (ECONNABORTED) without response', () => {
      const error = createMockAxiosError({
        request: {},
        code: 'ECONNABORTED'
      });

      const result = apiUtils.handleAxiosError(error);

      expect(result.message).toBe('Request timeout - server is not responding');
    });

    it('handles network error when request was made without response', () => {
      const error = createMockAxiosError({
        request: {},
        code: 'ERR_NETWORK'
      });

      const result = apiUtils.handleAxiosError(error);

      expect(result.message).toBe(
        'No response from server. Please check your internet connection.'
      );
    });

    it('handles setup errors without response or request', () => {
      const errorWithMessage = createMockAxiosError({
        message: 'Bad config'
      });
      expect(apiUtils.handleAxiosError(errorWithMessage).message).toBe(
        'Bad config'
      );

      const errorWithoutMessage = createMockAxiosError({
        message: ''
      });
      errorWithoutMessage.message = '';
      expect(
        apiUtils.handleAxiosError(errorWithoutMessage, 'Default setup error')
          .message
      ).toBe('Default setup error');
    });
  });

  describe('makeRequest', () => {
    it('executes axios with created config and returns response data', async () => {
      mockAxios.mockResolvedValueOnce({ data: { items: [1, 2, 3] } });

      const result = await apiUtils.makeRequest({
        method: 'GET',
        url: '/api/items'
      });

      expect(mockAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/api/items',
          timeout: 30000,
          withCredentials: true
        })
      );
      expect(result).toEqual({ items: [1, 2, 3] });
    });

    it('rethrows non-axios errors directly without handleAxiosError', async () => {
      const plainError = new Error('Unexpected failure');
      mockAxios.mockRejectedValueOnce(plainError);
      mockAxios.isAxiosError.mockReturnValueOnce(false);
      const handleSpy = jest.spyOn(apiUtils, 'handleAxiosError');

      await expect(
        apiUtils.makeRequest({ method: 'GET', url: '/api/items' })
      ).rejects.toThrow('Unexpected failure');

      expect(handleSpy).not.toHaveBeenCalled();
    });

    it('handles non-401 axios errors without attempting token refresh', async () => {
      const serverError = createMockAxiosError({
        response: { status: 500, data: { message: 'Server exploded' } } as any,
        config: { url: '/api/items' } as any
      });
      mockAxios.mockRejectedValueOnce(serverError);

      await expect(
        apiUtils.makeRequest({ method: 'GET', url: '/api/items' })
      ).rejects.toThrow('Server exploded');

      expect(mockAxios.post).not.toHaveBeenCalled();
    });

    it.each([
      '/api/auth/login',
      '/api/auth/refresh-token',
      '/api/auth/clear-session'
    ])(
      'does not attempt token refresh on 401 for excluded auth endpoint: %s',
      async (url) => {
        const authError = createMockAxiosError({
          response: { status: 401, data: { message: 'Auth error' } } as any,
          config: { url } as any
        });
        mockAxios.mockRejectedValueOnce(authError);
        mockAxios.post.mockResolvedValue({ data: {} });

        await expect(
          apiUtils.makeRequest({ method: 'POST', url })
        ).rejects.toThrow('Auth error');

        expect(mockAxios.post).not.toHaveBeenCalledWith(
          '/api/auth/refresh-token'
        );
      }
    );

    it('uses config.url when error.config?.url is absent to skip refresh on login', async () => {
      const loginError = createMockAxiosError({
        response: { status: 401, data: { message: 'Bad login' } } as any
      });
      mockAxios.mockRejectedValueOnce(loginError);
      mockAxios.post.mockResolvedValueOnce({ data: {} });

      await expect(
        apiUtils.makeRequest({ method: 'POST', url: '/api/auth/login' })
      ).rejects.toThrow('Bad login');

      expect(mockAxios.post).not.toHaveBeenCalledWith(
        '/api/auth/refresh-token'
      );
      expect(mockAxios.post).toHaveBeenCalledWith('/api/auth/clear-session');
    });

    it('does not refresh when retryOn401 is false', async () => {
      const error401 = createMockAxiosError({
        response: { status: 401, data: { message: 'Unauthorized' } } as any,
        config: { url: '/api/data' } as any
      });
      mockAxios.mockRejectedValueOnce(error401);
      mockAxios.post.mockResolvedValueOnce({ data: {} }); // clear-session

      await expect(
        apiUtils.makeRequest(
          { method: 'GET', url: '/api/data' },
          'Failed',
          false
        )
      ).rejects.toThrow('Unauthorized');

      expect(mockAxios.post).not.toHaveBeenCalledWith(
        '/api/auth/refresh-token'
      );
      expect(mockAxios.post).toHaveBeenCalledWith('/api/auth/clear-session');
    });

    it('refreshes token on 401 and retries the original request successfully', async () => {
      const error401 = createMockAxiosError({
        response: { status: 401, data: { message: 'Expired' } } as any,
        config: { url: '/api/events' } as any
      });

      mockAxios
        .mockRejectedValueOnce(error401)
        .mockResolvedValueOnce({ data: { events: ['event-1'] } });
      mockAxios.post.mockResolvedValueOnce({ data: { statusCode: 200 } });

      const result = await apiUtils.makeRequest({
        method: 'GET',
        url: '/api/events'
      });

      expect(mockAxios.post).toHaveBeenCalledTimes(1);
      expect(mockAxios.post).toHaveBeenCalledWith('/api/auth/refresh-token');
      expect(mockAxios).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ events: ['event-1'] });
    });

    it('attempts refresh when both error.config?.url and config.url are missing', async () => {
      const error401 = createMockAxiosError({
        response: { status: 401, data: { message: 'Expired' } } as any
      });

      mockAxios
        .mockRejectedValueOnce(error401)
        .mockResolvedValueOnce({ data: { ok: true } });
      mockAxios.post.mockResolvedValueOnce({ data: {} });

      const result = await apiUtils.makeRequest({ method: 'GET' });

      expect(mockAxios.post).toHaveBeenCalledWith('/api/auth/refresh-token');
      expect(result).toEqual({ ok: true });
    });

    it('deduplicates concurrent 401 token refresh calls and resets promise afterwards', async () => {
      let resolveRefresh!: () => void;
      const pendingRefresh = new Promise<void>((resolve) => {
        resolveRefresh = resolve;
      });

      const err1 = createMockAxiosError({
        response: { status: 401, data: { message: 'Expired 1' } } as any,
        config: { url: '/api/first' } as any
      });
      const err2 = createMockAxiosError({
        response: { status: 401, data: { message: 'Expired 2' } } as any,
        config: { url: '/api/second' } as any
      });

      mockAxios
        .mockRejectedValueOnce(err1)
        .mockRejectedValueOnce(err2)
        .mockResolvedValueOnce({ data: { first: true } })
        .mockResolvedValueOnce({ data: { second: true } });

      mockAxios.post.mockReturnValueOnce(pendingRefresh);

      const firstPromise = apiUtils.makeRequest({
        method: 'GET',
        url: '/api/first'
      });
      const secondPromise = apiUtils.makeRequest({
        method: 'GET',
        url: '/api/second'
      });

      // Allow both initial requests to fail and hit refreshTokens()
      await Promise.resolve();
      await Promise.resolve();

      expect(mockAxios.post).toHaveBeenCalledTimes(1);
      expect(mockAxios.post).toHaveBeenCalledWith('/api/auth/refresh-token');

      resolveRefresh();

      const [res1, res2] = await Promise.all([firstPromise, secondPromise]);
      expect(res1).toEqual({ first: true });
      expect(res2).toEqual({ second: true });

      // Subsequent 401 triggers a fresh refresh call because refreshTokenPromise was cleared
      const err3 = createMockAxiosError({
        response: { status: 401, data: { message: 'Expired 3' } } as any,
        config: { url: '/api/third' } as any
      });
      mockAxios
        .mockRejectedValueOnce(err3)
        .mockResolvedValueOnce({ data: { third: true } });
      mockAxios.post.mockResolvedValueOnce({ data: {} });

      const res3 = await apiUtils.makeRequest({
        method: 'GET',
        url: '/api/third'
      });
      expect(res3).toEqual({ third: true });
      expect(mockAxios.post).toHaveBeenCalledTimes(2);
    });

    it('does not loop infinitely if retried request after refresh still returns 401', async () => {
      const error401 = createMockAxiosError({
        response: {
          status: 401,
          data: { message: 'Still unauthorized' }
        } as any,
        config: { url: '/api/events' } as any
      });

      mockAxios.mockRejectedValueOnce(error401).mockRejectedValueOnce(error401);
      mockAxios.post.mockResolvedValue({ data: {} });

      await expect(
        apiUtils.makeRequest({ method: 'GET', url: '/api/events' })
      ).rejects.toThrow('Still unauthorized');

      expect(mockAxios.post).toHaveBeenCalledWith('/api/auth/refresh-token');
      expect(mockAxios.post).toHaveBeenCalledWith('/api/auth/clear-session');
      expect(mockAxios).toHaveBeenCalledTimes(2);
    });

    it('clears expired session and throws handled error when refresh fails with AxiosError', async () => {
      const initial401 = createMockAxiosError({
        response: { status: 401, data: { message: 'Expired' } } as any,
        config: { url: '/api/events' } as any
      });
      const refreshAxiosError = createMockAxiosError({
        response: {
          status: 401,
          data: { message: 'Refresh token expired' }
        } as any,
        config: { url: '/api/auth/refresh-token' } as any
      });

      mockAxios.mockRejectedValueOnce(initial401);
      mockAxios.post
        .mockRejectedValueOnce(refreshAxiosError)
        .mockResolvedValueOnce({ data: {} }); // clear-session

      const clearSpy = jest.spyOn(apiUtils, 'clearExpiredSession');
      const handleSpy = jest.spyOn(apiUtils, 'handleAxiosError');

      await expect(
        apiUtils.makeRequest({ method: 'GET', url: '/api/events' })
      ).rejects.toThrow('Refresh token expired');

      expect(clearSpy).toHaveBeenCalledTimes(1);
      expect(handleSpy).toHaveBeenCalledWith(
        refreshAxiosError,
        'Failed to refresh token',
        { skipSessionClear: true }
      );
    });

    it('rethrows non-axios error directly when refresh fails with non-axios error', async () => {
      const initial401 = createMockAxiosError({
        response: { status: 401, data: { message: 'Expired' } } as any,
        config: { url: '/api/events' } as any
      });
      const unexpectedRefreshError = new Error('Unexpected refresh crash');

      mockAxios.mockRejectedValueOnce(initial401);
      mockAxios.post.mockRejectedValueOnce(unexpectedRefreshError);

      const clearSpy = jest.spyOn(apiUtils, 'clearExpiredSession');

      await expect(
        apiUtils.makeRequest({ method: 'GET', url: '/api/events' })
      ).rejects.toThrow('Unexpected refresh crash');

      expect(clearSpy).not.toHaveBeenCalled();
    });
  });

  describe('HTTP method helpers', () => {
    it('get calls makeRequest with GET, url, params, and defaultErrorMessage', async () => {
      const spy = jest
        .spyOn(apiUtils, 'makeRequest')
        .mockResolvedValueOnce({ list: [] });

      const res = await apiUtils.get(
        '/api/events',
        { page: 1 },
        'Failed to fetch'
      );

      expect(spy).toHaveBeenCalledWith(
        { method: 'GET', url: '/api/events', params: { page: 1 } },
        'Failed to fetch'
      );
      expect(res).toEqual({ list: [] });
    });

    it('post calls makeRequest with POST, url, data, and defaultErrorMessage', async () => {
      const spy = jest
        .spyOn(apiUtils, 'makeRequest')
        .mockResolvedValueOnce({ id: '1' });

      const res = await apiUtils.post(
        '/api/events',
        { name: 'Concert' },
        'Failed to create'
      );

      expect(spy).toHaveBeenCalledWith(
        { method: 'POST', url: '/api/events', data: { name: 'Concert' } },
        'Failed to create'
      );
      expect(res).toEqual({ id: '1' });
    });

    it('put calls makeRequest with PUT, url, data, and defaultErrorMessage', async () => {
      const spy = jest
        .spyOn(apiUtils, 'makeRequest')
        .mockResolvedValueOnce({ updated: true });

      const res = await apiUtils.put(
        '/api/events/1',
        { name: 'Updated' },
        'Failed to update'
      );

      expect(spy).toHaveBeenCalledWith(
        { method: 'PUT', url: '/api/events/1', data: { name: 'Updated' } },
        'Failed to update'
      );
      expect(res).toEqual({ updated: true });
    });

    it('patch calls makeRequest with PATCH, url, data, and defaultErrorMessage', async () => {
      const spy = jest
        .spyOn(apiUtils, 'makeRequest')
        .mockResolvedValueOnce({ patched: true });

      const res = await apiUtils.patch(
        '/api/events/1',
        { status: 'active' },
        'Failed to patch'
      );

      expect(spy).toHaveBeenCalledWith(
        { method: 'PATCH', url: '/api/events/1', data: { status: 'active' } },
        'Failed to patch'
      );
      expect(res).toEqual({ patched: true });
    });

    it('delete calls makeRequest with DELETE, url, and defaultErrorMessage', async () => {
      const spy = jest
        .spyOn(apiUtils, 'makeRequest')
        .mockResolvedValueOnce({ deleted: true });

      const res = await apiUtils.delete('/api/events/1', 'Failed to delete');

      expect(spy).toHaveBeenCalledWith(
        { method: 'DELETE', url: '/api/events/1' },
        'Failed to delete'
      );
      expect(res).toEqual({ deleted: true });
    });
  });
});
