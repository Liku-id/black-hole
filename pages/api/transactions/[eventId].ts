import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { eventId } = req.query;

    if (!eventId || typeof eventId !== 'string') {
      return res.status(400).json({ message: 'Invalid eventId parameter' });
    }

    // Use apiRouteUtils pattern but with dynamic endpoint
    const getHandler = apiRouteUtils.createGetHandler({
      endpoint: `/events/${eventId}/transactions`,
      timeout: 10000
    });

    return await getHandler(req, res);
  } catch (error) {
    console.error('Error in event transactions handler:', error);
    return res.status(500).json({
      message: 'Failed to process event transactions request',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
