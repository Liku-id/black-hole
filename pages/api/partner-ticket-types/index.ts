import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

// Transform query parameters for the backend API (for GET)
const transformQuery = (query: any) => {
  const { limit = '10', page = '0', event_id } = query;

  // Validate required parameters for GET
  if (!event_id || typeof event_id !== 'string') {
    throw new Error('event_id is required');
  }

  const transformedQuery: any = {
    limit: limit.toString(),
    page: page.toString()
  };

  return transformedQuery;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const postHandler = apiRouteUtils.createPostHandler({
      endpoint: '/partner-ticket-types',
      timeout: 30000
    });
    return await postHandler(req, res);
  }

  if (req.method === 'GET') {
    try {
      const { event_id } = req.query;

      if (!event_id || typeof event_id !== 'string') {
        return res.status(400).json({ message: 'Invalid event_id parameter' });
      }

      const getHandler = apiRouteUtils.createGetHandler({
        endpoint: `/events/${event_id}/partner-ticket-types`,
        transformQuery,
        timeout: 30000
      });

      return await getHandler(req, res);
    } catch (error) {
      console.error('Error in partner ticket types handler:', error);
      return res.status(500).json({
        message: 'Failed to process partner ticket types request',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ message: 'Method not allowed' });
}
