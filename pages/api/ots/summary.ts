import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { eventId } = req.query;

  if (!eventId) {
    return res.status(400).json({ message: 'eventId is required' });
  }

  const getHandler = apiRouteUtils.createGetHandler({
    endpoint: `/events/${eventId}/ots-summary`,
    timeout: 30000
  });

  return await getHandler(req, res);
}
