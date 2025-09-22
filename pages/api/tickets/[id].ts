import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid ticket id parameter' });
    }

    // Validate request body for PUT requests
    if (req.method === 'PUT') {
      const { ticketStatus } = req.body;
      if (!ticketStatus || typeof ticketStatus !== 'string') {
        return res.status(400).json({
          message: 'ticketStatus is required in request body'
        });
      }
    }

    const putHandler = apiRouteUtils.createPutHandler({
      endpoint: `/tickets/${id}`,
      timeout: 30000
    });

    // Let the putHandler handle the method checking and request
    return await putHandler(req, res);
  } catch (error) {
    console.error('Error in ticket redeem handler:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
