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
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid id parameter' });
    }

    // Use apiRouteUtils pattern but with dynamic endpoint
    const getHandler = apiRouteUtils.createGetHandler({
      endpoint: `/withdrawal/summary/${id}`,
      timeout: 10000
    });

    return await getHandler(req, res);
  } catch (error) {
    console.error('Error in withdrawal summary handler:', error);
    return res.status(500).json({
      message: 'Failed to process withdrawal summary request',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
