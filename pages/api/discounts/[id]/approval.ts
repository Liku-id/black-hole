import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

/**
 * API route for discount approval/rejection
 * POST /api/discounts/[id]/approval
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid id parameter' });
  }

  const postHandler = apiRouteUtils.createPostHandler({
    endpoint: `/discounts/${id}/approval`,
    timeout: 30000
  });

  return postHandler(req, res);
}
