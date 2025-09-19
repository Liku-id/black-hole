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

    if (isAuthenticated(session)) {
      return res.status(200).json({
        isAuthenticated: true,
        user: session.user
      });
    } else {
      return res.status(200).json({
        isAuthenticated: false,
        user: null
      });
    }
  } catch (error) {
    console.error('Session check error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
