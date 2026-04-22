import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { eventId } = req.query;
  const getHandler = apiRouteUtils.createGetHandler({
    endpoint: `/ticket-types/event/${eventId}`,
    timeout: 30000
  });

  return await getHandler(req, res);
}
