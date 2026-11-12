import { getIronSession } from 'iron-session';
import { NextRequest, NextResponse } from 'next/server';
import { NextApiRequest, NextApiResponse } from 'next/types';

import { defaultSession, SessionData, sessionOptions } from './session';
import {
  clearSessionData,
  getSession,
  getSessionFromRequest,
  isAuthenticated,
  setSessionData
} from './sessionHelpers';

jest.mock('iron-session', () => ({
  getIronSession: jest.fn()
}));

jest.mock('next/server', () => ({
  NextResponse: jest.fn().mockImplementation(() => ({
    cookies: { set: jest.fn(), get: jest.fn() }
  }))
}));

describe('sessionHelpers', () => {
  const mockGetIronSession = getIronSession as jest.MockedFunction<
    typeof getIronSession
  >;
  const mockNextResponse = NextResponse as unknown as jest.Mock;

  const mockUser: NonNullable<SessionData['user']> = {
    id: 'user-1',
    fullName: 'Test User',
    email: 'test@example.com',
    phoneNumber: '08123456789',
    ktpNumber: '1234567890123456',
    dateOfBirth: '1990-01-01',
    gender: 'male',
    isVerified: true,
    isGuest: false,
    role: {
      id: 'role-1',
      name: 'admin'
    },
    profilePicture: {
      id: 'pic-1',
      url: 'https://example.com/avatar.png'
    },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSession', () => {
    it('returns existing logged-in session without overwriting isLoggedIn', async () => {
      const req = {} as NextApiRequest;
      const res = {} as NextApiResponse;
      const mockSession = {
        user: mockUser,
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
        isLoggedIn: true,
        save: jest.fn(),
        destroy: jest.fn(),
        updateConfig: jest.fn()
      };

      mockGetIronSession.mockResolvedValue(mockSession as any);

      const result = await getSession(req, res);

      expect(mockGetIronSession).toHaveBeenCalledWith(req, res, sessionOptions);
      expect(result).toBe(mockSession);
      expect(result.isLoggedIn).toBe(true);
    });

    it('defaults isLoggedIn to false when session isLoggedIn is undefined or falsy', async () => {
      const req = {} as NextApiRequest;
      const res = {} as NextApiResponse;
      const mockSession: Record<string, any> = {};

      mockGetIronSession.mockResolvedValue(mockSession as any);

      const result = await getSession(req, res);

      expect(mockGetIronSession).toHaveBeenCalledWith(req, res, sessionOptions);
      expect(result.isLoggedIn).toBe(defaultSession.isLoggedIn);
      expect(result.isLoggedIn).toBe(false);
    });
  });

  describe('getSessionFromRequest', () => {
    it('creates NextResponse, retrieves iron-session, and preserves logged-in state', async () => {
      const req = {} as NextRequest;
      const mockResInstance = { cookies: { set: jest.fn() } };
      mockNextResponse.mockImplementationOnce(() => mockResInstance);

      const mockSession = {
        user: mockUser,
        accessToken: 'access-123',
        isLoggedIn: true
      };
      mockGetIronSession.mockResolvedValue(mockSession as any);

      const result = await getSessionFromRequest(req);

      expect(mockNextResponse).toHaveBeenCalledTimes(1);
      expect(mockGetIronSession).toHaveBeenCalledWith(
        req,
        mockResInstance,
        sessionOptions
      );
      expect(result).toEqual({
        session: mockSession,
        response: mockResInstance
      });
      expect(result.session.isLoggedIn).toBe(true);
    });

    it('defaults isLoggedIn to false when session is not logged in', async () => {
      const req = {} as NextRequest;
      const mockResInstance = { cookies: { set: jest.fn() } };
      mockNextResponse.mockImplementationOnce(() => mockResInstance);

      const mockSession: Record<string, any> = { isLoggedIn: undefined };
      mockGetIronSession.mockResolvedValue(mockSession as any);

      const result = await getSessionFromRequest(req);

      expect(result.session.isLoggedIn).toBe(false);
      expect(result.response).toBe(mockResInstance);
    });
  });

  describe('clearSessionData', () => {
    it('clears user, tokens, and sets isLoggedIn to false', () => {
      const session: any = {
        user: mockUser,
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
        isLoggedIn: true
      };

      clearSessionData(session);

      expect(session.user).toBeUndefined();
      expect(session.accessToken).toBeUndefined();
      expect(session.refreshToken).toBeUndefined();
      expect(session.isLoggedIn).toBe(false);
    });
  });

  describe('setSessionData', () => {
    it('sets user, accessToken, refreshToken, and forces isLoggedIn to true', () => {
      const session: any = {};

      setSessionData(session, {
        user: mockUser,
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
        isLoggedIn: false
      });

      expect(session.user).toEqual(mockUser);
      expect(session.accessToken).toBe('new-access');
      expect(session.refreshToken).toBe('new-refresh');
      expect(session.isLoggedIn).toBe(true);
    });
  });

  describe('isAuthenticated', () => {
    it('returns true when isLoggedIn is true and user and accessToken are present', () => {
      const session: SessionData = {
        user: mockUser,
        accessToken: 'valid-token',
        refreshToken: 'refresh-token',
        isLoggedIn: true
      };

      expect(isAuthenticated(session)).toBe(true);
    });

    it('returns false when isLoggedIn is false', () => {
      const session: SessionData = {
        user: mockUser,
        accessToken: 'valid-token',
        isLoggedIn: false
      };

      expect(isAuthenticated(session)).toBe(false);
    });

    it('returns false when user is missing', () => {
      const session: SessionData = {
        accessToken: 'valid-token',
        isLoggedIn: true
      };

      expect(isAuthenticated(session)).toBe(false);
    });

    it('returns false when accessToken is missing or empty', () => {
      expect(
        isAuthenticated({
          user: mockUser,
          isLoggedIn: true
        })
      ).toBe(false);

      expect(
        isAuthenticated({
          user: mockUser,
          accessToken: '',
          isLoggedIn: true
        })
      ).toBe(false);
    });
  });
});
