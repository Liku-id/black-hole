import { getIronSession } from 'iron-session';
import { NextRequest, NextResponse } from 'next/server';
import { NextApiRequest, NextApiResponse } from 'next/types';

import { defaultSession, SessionData, sessionOptions } from './session';

// For API routes (Pages Router)
export async function getSession(req: NextApiRequest, res: NextApiResponse) {
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  if (!session.isLoggedIn) {
    session.isLoggedIn = defaultSession.isLoggedIn;
  }

  return session;
}

// For middleware and server components (App Router)
export async function getSessionFromRequest(req: NextRequest) {
  const res = new NextResponse();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  if (!session.isLoggedIn) {
    session.isLoggedIn = defaultSession.isLoggedIn;
  }

  return { session, response: res };
}

// Helper function to clear session data
export function clearSessionData(session: any) {
  session.user = undefined;
  session.accessToken = undefined;
  session.refreshToken = undefined;
  session.isLoggedIn = false;
}

// Helper function to set session data
export function setSessionData(session: any, userData: SessionData) {
  session.user = userData.user;
  session.accessToken = userData.accessToken;
  session.refreshToken = userData.refreshToken;
  session.isLoggedIn = true;
}

// Helper function to check if user is authenticated
export function isAuthenticated(session: SessionData): boolean {
  return session.isLoggedIn && !!session.user && !!session.accessToken;
}
