import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

/**
 * API route for individual discount operations
 * GET, PUT, DELETE /api/discounts/[id]
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid id parameter' });
  }

  // GET /v1/discounts/{id}
  if (req.method === 'GET') {
    return apiRouteUtils.createGetHandler({
      endpoint: `/discounts/${id}`,
      timeout: 30000
    })(req, res);
  }

  // PUT /v1/discounts/{id}
  if (req.method === 'PUT') {
    return apiRouteUtils.createPutHandler({
      endpoint: `/discounts/${id}`,
      timeout: 30000
    })(req, res);
  }

  // DELETE /v1/discounts/{id}
  if (req.method === 'DELETE') {
    return apiRouteUtils.createDeleteHandler({
      endpoint: `/discounts/${id}`,
      timeout: 30000
    })(req, res);
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
