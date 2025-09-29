import { apiRouteUtils } from '@/utils/apiRouteUtils';
import type { NextApiRequest, NextApiResponse } from 'next/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { eo_id } = req.query;

    if (!eo_id || typeof eo_id !== 'string') {
      return res
        .status(400)
        .json({ message: 'Event organizer ID is required' });
    }

    // Use apiRouteUtils with dynamic endpoint
    const postHandler = apiRouteUtils.createPostHandler({
      endpoint: `/event-organizers/${eo_id}/legal`,
      timeout: 30000
    });

    return await postHandler(req, res);
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
