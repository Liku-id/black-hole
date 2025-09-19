import type { NextApiRequest, NextApiResponse } from 'next/types';

import { clearSessionData, getSession } from '@/lib/sessionHelpers';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getSession(req, res);

    // Clear the session
    clearSessionData(session);
    await session.save();

    return res.status(200).json({ message: 'Session cleared successfully' });
  } catch (error) {
    console.error('Session clear error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
