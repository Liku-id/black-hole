import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

/**
 * API route for creating discounts
 * POST /api/discounts
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const postHandler = apiRouteUtils.createPostHandler({
    endpoint: '/discounts',
    timeout: 30000
  });

  return postHandler(req, res);
}
