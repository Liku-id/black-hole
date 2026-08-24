import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { eo_id } = req.query;
  if (!eo_id || typeof eo_id !== 'string') {
    return res.status(400).json({ message: 'Invalid event organizer ID' });
  }

  const putHandler = apiRouteUtils.createPutHandler({
    endpoint: `/event-organizers/${eo_id}/payment-gateways/nicepay`,
    timeout: 30000
  });

  return putHandler(req, res);
}
