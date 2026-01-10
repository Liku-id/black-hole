import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const postHandler = apiRouteUtils.createPostHandler({
    endpoint: '/event-asset/approval',
    timeout: 30000
  });

  return await postHandler(req, res);
}

