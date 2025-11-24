import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

// Transform query parameters for the backend API (for GET)
const transformQuery = (query: any) => {
  const { limit = '10', page = '0', search, event_organizer_id } = query;

  // Validate required parameters for GET
  if (!event_organizer_id || typeof event_organizer_id !== 'string') {
    throw new Error('event_organizer_id is required');
  }

  const transformedQuery: any = {
    limit: limit.toString(),
    page: page.toString(),
    event_organizer_id: event_organizer_id.toString()
  };

  if (search && typeof search === 'string') {
    transformedQuery.search = search;
  }

  return transformedQuery;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const postHandler = apiRouteUtils.createPostHandler({
      endpoint: '/partners',
      timeout: 30000
    });
    return await postHandler(req, res);
  }

  if (req.method === 'GET') {
    const getHandler = apiRouteUtils.createGetHandler({
      endpoint: '/partners',
      transformQuery,
      timeout: 30000
    });
    return await getHandler(req, res);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
