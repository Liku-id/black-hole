import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid transaction ID' });
  }

  // Use the standard proxy handler from apiRouteUtils
  const getHandler = apiRouteUtils.createGetHandler({
    endpoint: `/transactions/${id}`,
    timeout: 30000
  });

  return await getHandler(req, res);
}
