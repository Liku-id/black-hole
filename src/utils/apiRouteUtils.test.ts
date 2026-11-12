import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next/types';

import {
  clearSessionData,
  getSession,
  isAuthenticated,
  setSessionData
} from '@/lib/sessionHelpers';
import { UserRole } from '@/types/auth';

import { apiRouteUtils } from './apiRouteUtils';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    isAxiosError: jest.fn()
  }
}));

jest.mock('@/lib/sessionHelpers', () => ({
  clearSessionData: jest.fn(),
  getSession: jest.fn(),
  isAuthenticated: jest.fn(),
  setSessionData: jest.fn()
}));

const createMockReq = (
  overrides: Partial<NextApiRequest> = {}
): NextApiRequest =>
  ({
    method: 'GET',
    query: {},
    body: {},
    headers: {},
    ...overrides
  }) as NextApiRequest;

const createMockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res as NextApiResponse & {
    status: jest.Mock;
    json: jest.Mock;
    send: jest.Mock;
    setHeader: jest.Mock;
  };
};

const createMockSession = (overrides: Record<string, any> = {}) => ({
  user: { id: 'user-1', role: UserRole.ADMIN },
  accessToken: 'access-token-123',
  refreshToken: 'refresh-token-456',
  isLoggedIn: true,
  save: jest.fn().mockResolvedValue(undefined),
  destroy: jest.fn(),
  updateConfig: jest.fn(),
  ...overrides
});

describe('apiRouteUtils', () => {
  const mockAxios = axios as jest.Mocked<typeof axios>;
  const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;
  const mockIsAuthenticated = isAuthenticated as jest.MockedFunction<
    typeof isAuthenticated
  >;
  const mockSetSessionData = setSessionData as jest.MockedFunction<
    typeof setSessionData
  >;
  const mockClearSessionData = clearSessionData as jest.MockedFunction<
    typeof clearSessionData
  >;

  const originalBackendUrl = process.env.BACKEND_URL;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BACKEND_URL = 'https://backend.example.com';
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockAxios.isAxiosError.mockImplementation((err: any) =>
      Boolean(err && err.isAxiosError === true)
    );
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.useRealTimers();
    if (originalBackendUrl === undefined) {
      delete process.env.BACKEND_URL;
    } else {
      process.env.BACKEND_URL = originalBackendUrl;
    }
  });

  describe('createGetHandler', () => {
    it('returns 405 when HTTP method is not GET', async () => {
      const handler = apiRouteUtils.createGetHandler({ endpoint: '/events' });
      const req = createMockReq({ method: 'POST' });
      const res = createMockRes();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({ message: 'Method not allowed' });
    });

    it('returns 401 when auth is required and session is not authenticated', async () => {
      const handler = apiRouteUtils.createGetHandler({ endpoint: '/events' });
      const req = createMockReq({ method: 'GET' });
      const res = createMockRes();

      mockGetSession.mockResolvedValueOnce(createMockSession() as any);
      mockIsAuthenticated.mockReturnValueOnce(false);

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Authentication required'
      });
      expect(mockAxios.get).not.toHaveBeenCalled();
    });

    it('returns 401 when session is authenticated but accessToken is missing', async () => {
      const handler = apiRouteUtils.createGetHandler({ endpoint: '/events' });
      const req = createMockReq({ method: 'GET' });
      const res = createMockRes();

      mockGetSession.mockResolvedValueOnce(
        createMockSession({ accessToken: '' }) as any
      );
      mockIsAuthenticated.mockReturnValueOnce(true);

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Authentication required'
      });
    });

    it('forwards authenticated GET request with default options and returns backend response', async () => {
      const handler = apiRouteUtils.createGetHandler({ endpoint: '/events' });
      const req = createMockReq({ method: 'GET', query: { page: '1' } });
      const res = createMockRes();

      mockGetSession.mockResolvedValueOnce(createMockSession() as any);
      mockIsAuthenticated.mockReturnValueOnce(true);
      mockAxios.get.mockResolvedValueOnce({
        status: 200,
        data: { items: ['e1'] }
      });

      await handler(req, res);

      expect(mockAxios.get).toHaveBeenCalledWith(
        'https://backend.example.com/events',
        {
          params: { page: '1' },
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: 'Bearer access-token-123'
          },
          timeout: 10000,
          paramsSerializer: { indexes: null }
        }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ items: ['e1'] });
    });

    it('supports requireAuth: false, transformQuery, transformResponse, and custom timeout', async () => {
      const handler = apiRouteUtils.createGetHandler({
        endpoint: '/public-events',
        requireAuth: false,
        timeout: 5000,
        transformQuery: (q) => ({ limit: Number(q.limit) }),
        transformResponse: (d) => ({ wrapped: d })
      });
      const req = createMockReq({ method: 'GET', query: { limit: '20' } });
      const res = createMockRes();

      mockAxios.get.mockResolvedValueOnce({
        status: 200,
        data: [1, 2]
      });

      await handler(req, res);

      expect(mockGetSession).not.toHaveBeenCalled();
      expect(mockAxios.get).toHaveBeenCalledWith(
        'https://backend.example.com/public-events',
        expect.objectContaining({
          params: { limit: 20 },
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          }
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ wrapped: [1, 2] });
    });

    it('forwards axios error response status and data', async () => {
      const handler = apiRouteUtils.createGetHandler({
        endpoint: '/events',
        requireAuth: false
      });
      const req = createMockReq({ method: 'GET' });
      const res = createMockRes();

      mockAxios.get.mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 404, data: { message: 'Not found' } }
      });

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not found' });
    });

    it('returns 500 on non-axios error or axios error without response', async () => {
      const handler = apiRouteUtils.createGetHandler({
        endpoint: '/events',
        requireAuth: false
      });
      const req = createMockReq({ method: 'GET' });
      const res = createMockRes();

      mockAxios.get.mockRejectedValueOnce(new Error('Unexpected crash'));

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal server error'
      });
    });
  });

  describe('createPostHandler', () => {
    it('returns 405 when HTTP method is not POST', async () => {
      const handler = apiRouteUtils.createPostHandler({ endpoint: '/events' });
      const req = createMockReq({ method: 'GET' });
      const res = createMockRes();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({ message: 'Method not allowed' });
    });

    it('returns 401 when auth is required and unauthenticated', async () => {
      const handler = apiRouteUtils.createPostHandler({ endpoint: '/events' });
      const req = createMockReq({
        method: 'POST',
        headers: { origin: 'https://app.example.com' }
      });
      const res = createMockRes();

      mockGetSession.mockResolvedValueOnce(createMockSession() as any);
      mockIsAuthenticated.mockReturnValueOnce(false);

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Authentication required'
      });
    });

    it('forwards authenticated POST request with origin headers and body', async () => {
      const handler = apiRouteUtils.createPostHandler({ endpoint: '/events' });
      const req = createMockReq({
        method: 'POST',
        body: { title: 'New Event' },
        headers: { origin: 'https://app.example.com' }
      });
      const res = createMockRes();

      mockGetSession.mockResolvedValueOnce(createMockSession() as any);
      mockIsAuthenticated.mockReturnValueOnce(true);
      mockAxios.post.mockResolvedValueOnce({
        status: 201,
        data: { id: 'evt-1' }
      });

      await handler(req, res);

      expect(mockAxios.post).toHaveBeenCalledWith(
        'https://backend.example.com/events',
        { title: 'New Event' },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Frontend-Origin': 'https://app.example.com',
            Origin: 'https://app.example.com',
            Authorization: 'Bearer access-token-123'
          },
          timeout: 30000
        }
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 'evt-1' });
    });

    it('supports requireAuth: false and custom timeout', async () => {
      const handler = apiRouteUtils.createPostHandler({
        endpoint: '/public-submit',
        requireAuth: false,
        timeout: 15000
      });
      const req = createMockReq({
        method: 'POST',
        body: { name: 'Guest' },
        headers: { origin: 'https://app.example.com' }
      });
      const res = createMockRes();

      mockAxios.post.mockResolvedValueOnce({ status: 200, data: { ok: true } });

      await handler(req, res);

      expect(mockGetSession).not.toHaveBeenCalled();
      expect(mockAxios.post).toHaveBeenCalledWith(
        'https://backend.example.com/public-submit',
        { name: 'Guest' },
        expect.objectContaining({ timeout: 15000 })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('forwards axios error response and handles non-axios errors with 500', async () => {
      const handler = apiRouteUtils.createPostHandler({
        endpoint: '/events',
        requireAuth: false
      });
      const req = createMockReq({ method: 'POST', headers: {} });
      const res = createMockRes();

      mockAxios.post.mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 422, data: { message: 'Invalid payload' } }
      });
      await handler(req, res);
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid payload' });

      const res2 = createMockRes();
      mockAxios.post.mockRejectedValueOnce(new Error('Network failure'));
      await handler(req, res2);
      expect(res2.status).toHaveBeenCalledWith(500);
      expect(res2.json).toHaveBeenCalledWith({
        message: 'Internal server error'
      });
    });
  });

  describe('createPutHandler', () => {
    it('returns 405 when HTTP method is not PUT', async () => {
      const handler = apiRouteUtils.createPutHandler({ endpoint: '/events/1' });
      const req = createMockReq({ method: 'POST' });
      const res = createMockRes();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({ message: 'Method not allowed' });
    });

    it('returns 401 when auth is required and unauthenticated', async () => {
      const handler = apiRouteUtils.createPutHandler({ endpoint: '/events/1' });
      const req = createMockReq({ method: 'PUT' });
      const res = createMockRes();

      mockGetSession.mockResolvedValueOnce(createMockSession() as any);
      mockIsAuthenticated.mockReturnValueOnce(false);

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Authentication required'
      });
    });

    it('forwards authenticated PUT request and supports requireAuth: false with custom timeout', async () => {
      const authHandler = apiRouteUtils.createPutHandler({
        endpoint: '/events/1'
      });
      const req = createMockReq({ method: 'PUT', body: { name: 'Updated' } });
      const res = createMockRes();

      mockGetSession.mockResolvedValueOnce(createMockSession() as any);
      mockIsAuthenticated.mockReturnValueOnce(true);
      mockAxios.put.mockResolvedValueOnce({
        status: 200,
        data: { updated: true }
      });

      await authHandler(req, res);

      expect(mockAxios.put).toHaveBeenCalledWith(
        'https://backend.example.com/events/1',
        { name: 'Updated' },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: 'Bearer access-token-123'
          },
          timeout: 30000
        }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ updated: true });

      const publicHandler = apiRouteUtils.createPutHandler({
        endpoint: '/events/1',
        requireAuth: false,
        timeout: 8000
      });
      const res2 = createMockRes();
      mockAxios.put.mockResolvedValueOnce({ status: 204, data: null });

      await publicHandler(req, res2);
      expect(mockAxios.put).toHaveBeenLastCalledWith(
        'https://backend.example.com/events/1',
        { name: 'Updated' },
        expect.objectContaining({ timeout: 8000 })
      );
      expect(res2.status).toHaveBeenCalledWith(204);
    });

    it('handles axios error response and generic errors', async () => {
      const handler = apiRouteUtils.createPutHandler({
        endpoint: '/events/1',
        requireAuth: false
      });
      const req = createMockReq({ method: 'PUT' });
      const res = createMockRes();

      mockAxios.put.mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 409, data: { message: 'Conflict' } }
      });
      await handler(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'Conflict' });

      const res2 = createMockRes();
      mockAxios.put.mockRejectedValueOnce(new Error('Timeout'));
      await handler(req, res2);
      expect(res2.status).toHaveBeenCalledWith(500);
      expect(res2.json).toHaveBeenCalledWith({
        message: 'Internal server error'
      });
    });
  });

  describe('createPatchHandler', () => {
    it('returns 405 when HTTP method is not PATCH', async () => {
      const handler = apiRouteUtils.createPatchHandler({
        endpoint: '/events/1'
      });
      const req = createMockReq({ method: 'PUT' });
      const res = createMockRes();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({ message: 'Method not allowed' });
    });

    it('returns 401 when auth is required and unauthenticated', async () => {
      const handler = apiRouteUtils.createPatchHandler({
        endpoint: '/events/1'
      });
      const req = createMockReq({ method: 'PATCH' });
      const res = createMockRes();

      mockGetSession.mockResolvedValueOnce(createMockSession() as any);
      mockIsAuthenticated.mockReturnValueOnce(false);

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Authentication required'
      });
    });

    it('forwards authenticated PATCH request and supports requireAuth: false with custom timeout', async () => {
      const handler = apiRouteUtils.createPatchHandler({
        endpoint: '/events/1'
      });
      const req = createMockReq({
        method: 'PATCH',
        body: { status: 'published' }
      });
      const res = createMockRes();

      mockGetSession.mockResolvedValueOnce(createMockSession() as any);
      mockIsAuthenticated.mockReturnValueOnce(true);
      mockAxios.patch.mockResolvedValueOnce({
        status: 200,
        data: { patched: true }
      });

      await handler(req, res);

      expect(mockAxios.patch).toHaveBeenCalledWith(
        'https://backend.example.com/events/1',
        { status: 'published' },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: 'Bearer access-token-123'
          },
          timeout: 30000
        }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ patched: true });

      const publicHandler = apiRouteUtils.createPatchHandler({
        endpoint: '/events/1',
        requireAuth: false,
        timeout: 4500
      });
      const res2 = createMockRes();
      mockAxios.patch.mockResolvedValueOnce({
        status: 200,
        data: { ok: true }
      });
      await publicHandler(req, res2);
      expect(mockAxios.patch).toHaveBeenLastCalledWith(
        'https://backend.example.com/events/1',
        { status: 'published' },
        expect.objectContaining({ timeout: 4500 })
      );
    });

    it('handles axios error response and generic errors', async () => {
      const handler = apiRouteUtils.createPatchHandler({
        endpoint: '/events/1',
        requireAuth: false
      });
      const req = createMockReq({ method: 'PATCH' });
      const res = createMockRes();

      mockAxios.patch.mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 400, data: { message: 'Bad patch' } }
      });
      await handler(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Bad patch' });

      const res2 = createMockRes();
      mockAxios.patch.mockRejectedValueOnce(new Error('Failure'));
      await handler(req, res2);
      expect(res2.status).toHaveBeenCalledWith(500);
      expect(res2.json).toHaveBeenCalledWith({
        message: 'Internal server error'
      });
    });
  });

  describe('createDeleteHandler', () => {
    it('returns 405 when HTTP method is not DELETE', async () => {
      const handler = apiRouteUtils.createDeleteHandler({
        endpoint: '/events/1'
      });
      const req = createMockReq({ method: 'GET' });
      const res = createMockRes();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({ message: 'Method not allowed' });
    });

    it('returns 401 when auth is required and unauthenticated', async () => {
      const handler = apiRouteUtils.createDeleteHandler({
        endpoint: '/events/1'
      });
      const req = createMockReq({ method: 'DELETE' });
      const res = createMockRes();

      mockGetSession.mockResolvedValueOnce(createMockSession() as any);
      mockIsAuthenticated.mockReturnValueOnce(false);

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Authentication required'
      });
    });

    it('forwards authenticated DELETE request and supports transformQuery, requireAuth: false, and custom timeout', async () => {
      const handler = apiRouteUtils.createDeleteHandler({
        endpoint: '/events/1'
      });
      const req = createMockReq({ method: 'DELETE', query: { force: 'true' } });
      const res = createMockRes();

      mockGetSession.mockResolvedValueOnce(createMockSession() as any);
      mockIsAuthenticated.mockReturnValueOnce(true);
      mockAxios.delete.mockResolvedValueOnce({
        status: 200,
        data: { deleted: true }
      });

      await handler(req, res);

      expect(mockAxios.delete).toHaveBeenCalledWith(
        'https://backend.example.com/events/1',
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: 'Bearer access-token-123'
          },
          params: { force: 'true' },
          timeout: 30000
        }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ deleted: true });

      const publicHandler = apiRouteUtils.createDeleteHandler({
        endpoint: '/events/1',
        requireAuth: false,
        timeout: 6000,
        transformQuery: (q) => ({ hardDelete: q.force === 'true' })
      });
      const res2 = createMockRes();
      mockAxios.delete.mockResolvedValueOnce({
        status: 200,
        data: { hardDeleted: true }
      });

      await publicHandler(req, res2);
      expect(mockAxios.delete).toHaveBeenLastCalledWith(
        'https://backend.example.com/events/1',
        expect.objectContaining({
          params: { hardDelete: true },
          timeout: 6000
        })
      );
    });

    it('handles axios error response and generic errors', async () => {
      const handler = apiRouteUtils.createDeleteHandler({
        endpoint: '/events/1',
        requireAuth: false
      });
      const req = createMockReq({ method: 'DELETE' });
      const res = createMockRes();

      mockAxios.delete.mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 403, data: { message: 'Forbidden' } }
      });
      await handler(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });

      const res2 = createMockRes();
      mockAxios.delete.mockRejectedValueOnce(new Error('Crash'));
      await handler(req, res2);
      expect(res2.status).toHaveBeenCalledWith(500);
      expect(res2.json).toHaveBeenCalledWith({
        message: 'Internal server error'
      });
    });
  });

  describe('createLoginHandler', () => {
    it('returns 405 when HTTP method is not POST', async () => {
      const handler = apiRouteUtils.createLoginHandler({
        endpoint: '/auth/login'
      });
      const req = createMockReq({ method: 'GET' });
      const res = createMockRes();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({ message: 'Method not allowed' });
    });

    it('returns 500 when BACKEND_URL is not configured', async () => {
      delete process.env.BACKEND_URL;
      const handler = apiRouteUtils.createLoginHandler({
        endpoint: '/auth/login'
      });
      const req = createMockReq({ method: 'POST', body: {} });
      const res = createMockRes();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server configuration error: BACKEND_URL not set'
      });
    });

    it('returns 403 when user role is missing or not in ALLOWED_ROLES', async () => {
      const handler = apiRouteUtils.createLoginHandler({
        endpoint: '/auth/login',
        timeout: 12000
      });
      const req = createMockReq({
        method: 'POST',
        body: { email: 'buyer@example.com', password: 'secret' }
      });
      const res = createMockRes();
      const session = createMockSession();

      mockGetSession.mockResolvedValueOnce(session as any);
      mockAxios.post.mockResolvedValueOnce({
        status: 200,
        data: {
          body: {
            user: { id: 'u-1', role: UserRole.BUYER },
            accessToken: 'at',
            refreshToken: 'rt'
          }
        }
      });

      await handler(req, res);

      expect(mockAxios.post).toHaveBeenCalledWith(
        'https://backend.example.com/auth/login',
        { email: 'buyer@example.com', password: 'secret' },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          timeout: 12000
        }
      );
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message:
          'Access denied. Your role is not authorized to access this platform.',
        code: 'ROLE_NOT_ALLOWED'
      });
      expect(mockSetSessionData).not.toHaveBeenCalled();
      expect(session.save).not.toHaveBeenCalled();

      // Also test missing user object (user?.role is undefined)
      const res2 = createMockRes();
      mockGetSession.mockResolvedValueOnce(session as any);
      mockAxios.post.mockResolvedValueOnce({
        status: 200,
        data: { body: {} }
      });
      await handler(req, res2);
      expect(res2.status).toHaveBeenCalledWith(403);
    });

    it('stores session tokens and returns user without tokens for allowed role', async () => {
      const handler = apiRouteUtils.createLoginHandler({
        endpoint: '/auth/login'
      });
      const req = createMockReq({
        method: 'POST',
        body: { email: 'admin@example.com', password: 'secret' }
      });
      const res = createMockRes();
      const session = createMockSession();
      const user = {
        id: 'u-admin',
        role: UserRole.ADMIN,
        email: 'admin@example.com'
      };

      mockGetSession.mockResolvedValueOnce(session as any);
      mockAxios.post.mockResolvedValueOnce({
        status: 200,
        data: {
          body: {
            user,
            accessToken: 'jwt-access',
            refreshToken: 'jwt-refresh'
          }
        }
      });

      await handler(req, res);

      expect(mockSetSessionData).toHaveBeenCalledWith(session, {
        user,
        accessToken: 'jwt-access',
        refreshToken: 'jwt-refresh',
        isLoggedIn: true
      });
      expect(session.save).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Login successful',
        body: { user }
      });
    });

    it('handles axios error with response, with request only (503), and without response/request (500)', async () => {
      const handler = apiRouteUtils.createLoginHandler({
        endpoint: '/auth/login'
      });
      const req = createMockReq({ method: 'POST', body: {} });

      const res1 = createMockRes();
      mockAxios.post.mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 401, data: { message: 'Invalid credentials' } }
      });
      await handler(req, res1);
      expect(res1.status).toHaveBeenCalledWith(401);
      expect(res1.json).toHaveBeenCalledWith({
        message: 'Invalid credentials'
      });

      const res2 = createMockRes();
      mockAxios.post.mockRejectedValueOnce({
        isAxiosError: true,
        request: {}
      });
      await handler(req, res2);
      expect(res2.status).toHaveBeenCalledWith(503);
      expect(res2.json).toHaveBeenCalledWith({
        message: 'Backend server is not responding. Please try again later.'
      });

      const res3 = createMockRes();
      mockAxios.post.mockRejectedValueOnce({
        isAxiosError: true,
        message: 'Bad request setup'
      });
      await handler(req, res3);
      expect(res3.status).toHaveBeenCalledWith(500);
      expect(res3.json).toHaveBeenCalledWith({
        message: 'Request failed: Bad request setup'
      });
    });

    it('handles non-axios Error and non-Error thrown values', async () => {
      const handler = apiRouteUtils.createLoginHandler({
        endpoint: '/auth/login'
      });
      const req = createMockReq({ method: 'POST', body: {} });

      const res1 = createMockRes();
      mockAxios.post.mockRejectedValueOnce(new Error('Session store down'));
      await handler(req, res1);
      expect(res1.status).toHaveBeenCalledWith(500);
      expect(res1.json).toHaveBeenCalledWith({
        message: 'Internal server error: Session store down'
      });

      const res2 = createMockRes();
      mockAxios.post.mockRejectedValueOnce('string-failure');
      await handler(req, res2);
      expect(res2.status).toHaveBeenCalledWith(500);
      expect(res2.json).toHaveBeenCalledWith({
        message: 'Internal server error: Unknown error'
      });
    });
  });

  describe('createRefreshTokenHandler', () => {
    it('returns 405 when HTTP method is not POST', async () => {
      const handler = apiRouteUtils.createRefreshTokenHandler({
        endpoint: '/auth/refresh'
      });
      const req = createMockReq({ method: 'GET' });
      const res = createMockRes();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({ message: 'Method not allowed' });
    });

    it('returns 500 when BACKEND_URL is not configured', async () => {
      delete process.env.BACKEND_URL;
      const handler = apiRouteUtils.createRefreshTokenHandler({
        endpoint: '/auth/refresh'
      });
      const req = createMockReq({ method: 'POST' });
      const res = createMockRes();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server configuration error: BACKEND_URL not set'
      });
    });

    it('returns 400 when refresh token is missing from both body and session', async () => {
      const handler = apiRouteUtils.createRefreshTokenHandler({
        endpoint: '/auth/refresh'
      });
      const req = createMockReq({ method: 'POST', body: undefined });
      const res = createMockRes();

      mockGetSession.mockResolvedValueOnce(
        createMockSession({ refreshToken: undefined }) as any
      );

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Refresh token is required'
      });
    });

    it('refreshes tokens using req.body.refreshToken and saves updated session', async () => {
      const handler = apiRouteUtils.createRefreshTokenHandler({
        endpoint: '/auth/refresh',
        timeout: 15000
      });
      const req = createMockReq({
        method: 'POST',
        body: { refreshToken: 'body-rt' }
      });
      const res = createMockRes();
      const session = createMockSession();
      const newUser = { id: 'u-1', role: UserRole.ADMIN };

      mockGetSession.mockResolvedValueOnce(session as any);
      mockAxios.post.mockResolvedValueOnce({
        status: 200,
        data: {
          statusCode: 200,
          message: 'Refreshed',
          body: {
            user: newUser,
            accessToken: 'new-at',
            refreshToken: 'new-rt'
          }
        }
      });

      await handler(req, res);

      expect(mockAxios.post).toHaveBeenCalledWith(
        'https://backend.example.com/auth/refresh',
        { refreshToken: 'body-rt' },
        expect.objectContaining({ timeout: 15000 })
      );
      expect(mockSetSessionData).toHaveBeenCalledWith(session, {
        user: newUser,
        accessToken: 'new-at',
        refreshToken: 'new-rt',
        isLoggedIn: true
      });
      expect(session.save).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: 200,
        message: 'Refreshed',
        body: {
          accessToken: 'new-at',
          refreshToken: 'new-rt'
        }
      });
    });

    it('falls back to session.refreshToken, session.user, and default response fields', async () => {
      const handler = apiRouteUtils.createRefreshTokenHandler({
        endpoint: '/auth/refresh'
      });
      const req = createMockReq({ method: 'POST', body: {} });
      const res = createMockRes();
      const session = createMockSession({ refreshToken: 'session-rt' });

      mockGetSession.mockResolvedValueOnce(session as any);
      mockAxios.post.mockResolvedValueOnce({
        status: 200,
        data: {
          body: {
            accessToken: 'new-at',
            refreshToken: 'new-rt'
          }
        }
      });

      await handler(req, res);

      expect(mockAxios.post).toHaveBeenCalledWith(
        'https://backend.example.com/auth/refresh',
        { refreshToken: 'session-rt' },
        expect.objectContaining({ timeout: 30000 })
      );
      expect(mockSetSessionData).toHaveBeenCalledWith(session, {
        user: session.user,
        accessToken: 'new-at',
        refreshToken: 'new-rt',
        isLoggedIn: true
      });
      expect(res.json).toHaveBeenCalledWith({
        statusCode: 0,
        message: 'Token refreshed successfully',
        body: {
          accessToken: 'new-at',
          refreshToken: 'new-rt'
        }
      });
    });

    it('skips session update when response body lacks tokens', async () => {
      const handler = apiRouteUtils.createRefreshTokenHandler({
        endpoint: '/auth/refresh'
      });
      const req = createMockReq({ method: 'POST', body: {} });
      const res = createMockRes();
      const session = createMockSession();

      mockGetSession.mockResolvedValueOnce(session as any);
      mockAxios.post.mockResolvedValueOnce({
        status: 200,
        data: undefined
      });

      await handler(req, res);

      expect(mockSetSessionData).not.toHaveBeenCalled();
      expect(session.save).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: 0,
        message: 'Token refreshed successfully',
        body: {
          accessToken: undefined,
          refreshToken: undefined
        }
      });
    });

    it('handles axios errors (response, request-only, setup) and non-axios errors', async () => {
      const handler = apiRouteUtils.createRefreshTokenHandler({
        endpoint: '/auth/refresh'
      });
      const req = createMockReq({
        method: 'POST',
        body: { refreshToken: 'rt' }
      });
      mockGetSession.mockResolvedValue(createMockSession() as any);

      const res1 = createMockRes();
      mockAxios.post.mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 401, data: { message: 'Token expired' } }
      });
      await handler(req, res1);
      expect(res1.status).toHaveBeenCalledWith(401);
      expect(res1.json).toHaveBeenCalledWith({ message: 'Token expired' });

      const res2 = createMockRes();
      mockAxios.post.mockRejectedValueOnce({
        isAxiosError: true,
        request: {}
      });
      await handler(req, res2);
      expect(res2.status).toHaveBeenCalledWith(503);
      expect(res2.json).toHaveBeenCalledWith({
        message: 'Backend server is not responding. Please try again later.'
      });

      const res3 = createMockRes();
      mockAxios.post.mockRejectedValueOnce({
        isAxiosError: true,
        message: 'Config error'
      });
      await handler(req, res3);
      expect(res3.status).toHaveBeenCalledWith(500);
      expect(res3.json).toHaveBeenCalledWith({
        message: 'Request failed: Config error'
      });

      const res4 = createMockRes();
      mockAxios.post.mockRejectedValueOnce(new Error('Boom'));
      await handler(req, res4);
      expect(res4.status).toHaveBeenCalledWith(500);
      expect(res4.json).toHaveBeenCalledWith({
        message: 'Internal server error: Boom'
      });

      const res5 = createMockRes();
      mockAxios.post.mockRejectedValueOnce(12345);
      await handler(req, res5);
      expect(res5.status).toHaveBeenCalledWith(500);
      expect(res5.json).toHaveBeenCalledWith({
        message: 'Internal server error: Unknown error'
      });
    });
  });

  describe('createLogoutHandler', () => {
    it('returns 405 when HTTP method is not POST', async () => {
      const handler = apiRouteUtils.createLogoutHandler({
        endpoint: '/auth/logout'
      });
      const req = createMockReq({ method: 'GET' });
      const res = createMockRes();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({ message: 'Method not allowed' });
    });

    it('clears session locally when BACKEND_URL is not set', async () => {
      jest.useFakeTimers();
      delete process.env.BACKEND_URL;

      const handler = apiRouteUtils.createLogoutHandler({
        endpoint: '/auth/logout'
      });
      const req = createMockReq({ method: 'POST' });
      const res = createMockRes();
      const session = createMockSession();

      mockGetSession.mockResolvedValueOnce(session as any);

      const promise = handler(req, res);
      await jest.advanceTimersByTimeAsync(500);
      await promise;

      expect(mockAxios.post).not.toHaveBeenCalled();
      expect(mockClearSessionData).toHaveBeenCalledWith(session);
      expect(session.save).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Logout successful' });
    });

    it('calls backend logout with Authorization header when accessToken exists and clears session', async () => {
      const handler = apiRouteUtils.createLogoutHandler({
        endpoint: '/auth/logout'
      });
      const req = createMockReq({ method: 'POST' });
      const res = createMockRes();
      const session = createMockSession({ accessToken: 'token-abc' });

      mockGetSession.mockResolvedValueOnce(session as any);
      mockAxios.post.mockResolvedValueOnce({
        status: 200,
        data: { success: true, message: 'Logged out' }
      });

      await handler(req, res);

      expect(mockAxios.post).toHaveBeenCalledWith(
        'https://backend.example.com/auth/logout',
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer token-abc'
          },
          timeout: 30000
        }
      );
      expect(mockClearSessionData).toHaveBeenCalledWith(session);
      expect(session.save).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logged out'
      });
    });

    it('calls backend logout without Authorization header when accessToken is absent', async () => {
      const handler = apiRouteUtils.createLogoutHandler({
        endpoint: '/auth/logout',
        timeout: 7000
      });
      const req = createMockReq({ method: 'POST' });
      const res = createMockRes();
      const session = createMockSession({ accessToken: undefined });

      mockGetSession.mockResolvedValueOnce(session as any);
      mockAxios.post.mockResolvedValueOnce({
        status: 200,
        data: { message: 'Ok' }
      });

      await handler(req, res);

      expect(mockAxios.post).toHaveBeenCalledWith(
        'https://backend.example.com/auth/logout',
        {},
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 7000
        }
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('still clears session and forwards axios error response on backend failure', async () => {
      const handler = apiRouteUtils.createLogoutHandler({
        endpoint: '/auth/logout'
      });
      const req = createMockReq({ method: 'POST' });
      const res = createMockRes();
      const session = createMockSession();

      mockGetSession.mockResolvedValue(session as any);
      mockAxios.post.mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 401, data: { message: 'Already expired' } }
      });

      await handler(req, res);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Logout API error:',
        expect.anything()
      );
      expect(mockClearSessionData).toHaveBeenCalledWith(session);
      expect(session.save).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Already expired' });
    });

    it('logs session clear error and returns 500 when both logout and session clearing fail', async () => {
      const handler = apiRouteUtils.createLogoutHandler({
        endpoint: '/auth/logout'
      });
      const req = createMockReq({ method: 'POST' });
      const res = createMockRes();

      const sessionClearFailure = new Error('Cookie write failed');
      mockGetSession
        .mockResolvedValueOnce(createMockSession() as any)
        .mockRejectedValueOnce(sessionClearFailure);
      mockAxios.post.mockRejectedValueOnce(new Error('Backend down'));

      await handler(req, res);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Logout API error:',
        expect.any(Error)
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Session clear error:',
        sessionClearFailure
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal server error'
      });
    });
  });

  describe('createExportHandler', () => {
    it('returns 405 when HTTP method is not GET', async () => {
      const handler = apiRouteUtils.createExportHandler({
        endpoint: '/tickets/export'
      });
      const req = createMockReq({ method: 'POST' });
      const res = createMockRes();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({ message: 'Method not allowed' });
    });

    it('returns 401 when auth is required and session is unauthenticated', async () => {
      const handler = apiRouteUtils.createExportHandler({
        endpoint: '/tickets/export'
      });
      const req = createMockReq({ method: 'GET' });
      const res = createMockRes();

      mockGetSession.mockResolvedValueOnce(createMockSession() as any);
      mockIsAuthenticated.mockReturnValueOnce(false);

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Authentication required'
      });
    });

    it('exports binary file with filename extracted from Content-Disposition and Content-Type headers', async () => {
      const handler = apiRouteUtils.createExportHandler({
        endpoint: '/tickets/export'
      });
      const req = createMockReq({ method: 'GET', query: { eventId: 'e1' } });
      const res = createMockRes();
      const csvBytes = Buffer.from('id,name\n1,Jane');

      mockGetSession.mockResolvedValueOnce(createMockSession() as any);
      mockIsAuthenticated.mockReturnValueOnce(true);
      mockAxios.get.mockResolvedValueOnce({
        status: 200,
        data: csvBytes,
        headers: {
          'content-disposition': 'attachment; filename="tickets-2026.csv"',
          'content-type': 'text/csv'
        }
      });

      await handler(req, res);

      expect(mockAxios.get).toHaveBeenCalledWith(
        'https://backend.example.com/tickets/export',
        {
          params: { eventId: 'e1' },
          headers: {
            Accept: 'text/csv, application/octet-stream',
            Authorization: 'Bearer access-token-123'
          },
          responseType: 'arraybuffer',
          timeout: 30000
        }
      );
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename=tickets-2026.csv'
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'no-cache, no-store, must-revalidate'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(Buffer.from(csvBytes));
    });

    it('uses default filename and content-type when headers are missing or lack filename', async () => {
      const handler = apiRouteUtils.createExportHandler({
        endpoint: '/tickets/export',
        requireAuth: false,
        timeout: 12000,
        transformQuery: (q) => ({ filter: q.q })
      });
      const req = createMockReq({ method: 'GET', query: { q: 'vip' } });
      const res1 = createMockRes();

      mockAxios.get.mockResolvedValueOnce({
        status: 200,
        data: Buffer.from('a,b'),
        headers: {}
      });

      await handler(req, res1);

      expect(mockAxios.get).toHaveBeenCalledWith(
        'https://backend.example.com/tickets/export',
        expect.objectContaining({
          params: { filter: 'vip' },
          timeout: 12000
        })
      );
      expect(res1.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/csv; charset=utf-8'
      );
      expect(res1.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename=export.csv'
      );

      // Content-Disposition present but without filename=...
      const res2 = createMockRes();
      mockAxios.get.mockResolvedValueOnce({
        status: 200,
        data: Buffer.from('a,b'),
        headers: { 'content-disposition': 'attachment' }
      });

      await handler(req, res2);
      expect(res2.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename=export.csv'
      );
    });

    it('clears session on 401 export error and parses JSON error message from arraybuffer', async () => {
      const handler = apiRouteUtils.createExportHandler({
        endpoint: '/tickets/export',
        requireAuth: false
      });
      const req = createMockReq({ method: 'GET' });
      const res = createMockRes();
      const session = createMockSession();

      mockGetSession.mockResolvedValueOnce(session as any);
      mockAxios.get.mockRejectedValueOnce({
        isAxiosError: true,
        response: {
          status: 401,
          data: Buffer.from(JSON.stringify({ message: 'Session expired' }))
        }
      });

      await handler(req, res);

      expect(mockClearSessionData).toHaveBeenCalledWith(session);
      expect(session.save).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Session expired' });
    });

    it('logs session clear error on 401 when clearing session fails', async () => {
      const handler = apiRouteUtils.createExportHandler({
        endpoint: '/tickets/export',
        requireAuth: false
      });
      const req = createMockReq({ method: 'GET' });
      const res = createMockRes();
      const clearErr = new Error('Save failed');

      mockGetSession.mockRejectedValueOnce(clearErr);
      mockAxios.get.mockRejectedValueOnce({
        isAxiosError: true,
        response: {
          status: 401,
          data: Buffer.from(JSON.stringify({}))
        }
      });

      await handler(req, res);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Session clear error:',
        clearErr
      );
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Export failed' });
    });

    it('falls back to "Export failed" when non-401 error response buffer is not valid JSON', async () => {
      const handler = apiRouteUtils.createExportHandler({
        endpoint: '/tickets/export',
        requireAuth: false
      });
      const req = createMockReq({ method: 'GET' });
      const res = createMockRes();

      mockAxios.get.mockRejectedValueOnce({
        isAxiosError: true,
        response: {
          status: 500,
          data: Buffer.from('not-json-data')
        }
      });

      await handler(req, res);

      expect(mockClearSessionData).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Export failed' });
    });

    it('returns 500 on non-axios error or axios error without response', async () => {
      const handler = apiRouteUtils.createExportHandler({
        endpoint: '/tickets/export',
        requireAuth: false
      });
      const req = createMockReq({ method: 'GET' });
      const res = createMockRes();

      mockAxios.get.mockRejectedValueOnce(new Error('Network dropped'));

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal server error'
      });
    });
  });
});
