import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

/**
 * API route for fetching discounts by event
 * GET /api/events/[metaUrl]/discounts
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { metaUrl } = req.query;

  if (!metaUrl || typeof metaUrl !== 'string') {
    return res.status(400).json({ message: 'Invalid event parameter' });
  }

  const getHandler = apiRouteUtils.createGetHandler({
    endpoint: `/events/${metaUrl}/discounts`,
    timeout: 30000
  });

  return getHandler(req, res);
}
