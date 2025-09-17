import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

// Dynamic handler for event submission detail by id
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid id parameter' });
    }

    const getHandler = apiRouteUtils.createGetHandler({
      endpoint: `/events-submissions/${id}`,
      timeout: 10000
    });

    return await getHandler(req, res);
  } catch (error) {
    console.error('Error in event submission detail handler:', error);
    return res.status(500).json({
      message: 'Failed to process event submission detail request',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
