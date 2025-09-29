import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid withdrawal id parameter' });
  }

  return apiRouteUtils.createPutHandler({
    endpoint: `/withdrawal/${id}/action`,
    requireAuth: true
  })(req, res);
}
