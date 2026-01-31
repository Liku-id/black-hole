import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

/**
 * API route for group ticket operations by ID
 * GET /api/group-tickets/[id] - Get a group ticket
 * PUT /api/group-tickets/[id] - Update a group ticket
 * DELETE /api/group-tickets/[id] - Delete a group ticket
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid group ticket ID' });
  }

  switch (req.method) {
    case 'GET': {
      const getHandler = apiRouteUtils.createGetHandler({
        endpoint: `/group-tickets/${id}`,
        timeout: 30000
      });
      return getHandler(req, res);
    }

    case 'PUT': {
      const putHandler = apiRouteUtils.createPutHandler({
        endpoint: `/group-tickets/${id}`,
        timeout: 30000
      });
      return putHandler(req, res);
    }

    case 'DELETE': {
      const deleteHandler = apiRouteUtils.createDeleteHandler({
        endpoint: `/group-tickets/${id}`,
        timeout: 30000
      });
      return deleteHandler(req, res);
    }

    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}
