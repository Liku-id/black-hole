import type { NextApiRequest, NextApiResponse } from 'next/types';

import { getSession, isAuthenticated } from '@/lib/sessionHelpers';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getSession(req, res);

    if (!isAuthenticated(session) || !session.accessToken) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Call the backend /event-organizers/me endpoint
    const response = await fetch(
      `${process.env.BACKEND_URL}/event-organizers/me`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // If it's an auth error, clear the session
      if (response.status === 401) {
        session.destroy();
        await session.save();
      }
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Event organizers me API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
