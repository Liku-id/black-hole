import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid ticket id parameter' });
  }

  const putHandler = apiRouteUtils.createPutHandler({
    endpoint: `/tickets/${id}`,
    timeout: 30000
  });

  return putHandler(req, res);
}
