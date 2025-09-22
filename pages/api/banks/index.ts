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

    const response = await fetch(`${process.env.BACKEND_URL}/banks`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({
        message: errorData.message || 'Failed to fetch banks'
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Banks API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
