import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { eventId } = req.query;

  if (!eventId || typeof eventId !== 'string') {
    return res.status(400).json({ message: 'Event ID is required' });
  }

  const getHandler = apiRouteUtils.createGetHandler({
    endpoint: `/events/${eventId}/financial-summary`,
    timeout: 10000
  });

  return await getHandler(req, res);
}
