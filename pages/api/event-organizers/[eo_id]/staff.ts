import { apiRouteUtils } from '@/utils/apiRouteUtils';
import type { NextApiRequest, NextApiResponse } from 'next/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { eo_id } = req.query;
    console.log("TEST", eo_id);

    if (!eo_id || typeof eo_id !== 'string') {
      return res.status(400).json({ message: 'Event organizer ID is required' });
    }

    const getHandler = apiRouteUtils.createGetHandler({
      endpoint: `/event-organizers/${eo_id}/staff`,
      timeout: 10000
    });

    return await getHandler(req, res);
  } catch (error) {
    console.error('Error in event organizer staff handler:', error);
    return res.status(500).json({
      message: 'Failed to process event organizer staff request',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
