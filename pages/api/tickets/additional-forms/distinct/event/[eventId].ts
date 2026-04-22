import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { eventId } = req.query;

  if (!eventId || typeof eventId !== 'string') {
    return res.status(400).json({ message: 'eventId is required' });
  }

  const getHandler = apiRouteUtils.createGetHandler({
    endpoint: `/additional-forms/distinct/event/${eventId}`,
    requireAuth: true
  });

  return await getHandler(req, res);
}
