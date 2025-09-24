import type { NextApiRequest, NextApiResponse } from 'next/types';

import { getSession, setSessionData } from '@/lib/sessionHelpers';
import { ALLOWED_ROLES } from '@/types/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    const response = await fetch(`${process.env.BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // Check if user role is allowed
    const userRole = data.body.user?.role;
    if (!userRole || !ALLOWED_ROLES.includes(userRole)) {
      return res.status(403).json({
        message: 'Access denied. Your role is not authorized to access this platform.',
        code: 'ROLE_NOT_ALLOWED'
      });
    }

    // Get the session and store tokens securely
    const session = await getSession(req, res);

    // Store user data and tokens in the encrypted session
    setSessionData(session, {
      user: data.body.user,
      accessToken: data.body.accessToken,
      refreshToken: data.body.refreshToken,
      isLoggedIn: true
    });

    await session.save();

    // Return success response without tokens (they're now stored server-side)
    return res.status(200).json({
      message: 'Login successful',
      body: {
        user: data.body.user
      }
    });
  } catch (error) {
    console.error('Login API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
