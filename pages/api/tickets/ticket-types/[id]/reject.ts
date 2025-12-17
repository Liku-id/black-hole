import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid id parameter' });
  }

  const postHandler = apiRouteUtils.createPostHandler({
    endpoint: `/ticket-types/${id}/reject`,
    timeout: 30000,
  });

  return await postHandler(req, res);
}

