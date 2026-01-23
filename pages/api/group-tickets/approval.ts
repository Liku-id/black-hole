import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

/**
 * API route for group ticket approval
 * POST /api/group-tickets/approval
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Use apiRouteUtils for the actual backend call
  const postHandler = apiRouteUtils.createPostHandler({
    endpoint: '/group-tickets/approval',
    timeout: 30000
  });

  return postHandler(req, res);
}
