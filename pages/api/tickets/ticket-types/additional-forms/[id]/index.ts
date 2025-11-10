import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

/**
 * API route for updating and deleting additional forms
 * PUT /api/tickets/ticket-types/additional-forms/[id]
 * DELETE /api/tickets/ticket-types/additional-forms/[id]
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  // PUT /v1/additional-forms/{id}
  if (req.method === 'PUT') {
    const putHandler = apiRouteUtils.createPutHandler({
      endpoint: `/additional-forms/${id}`,
      timeout: 30000
    });
    return putHandler(req, res);
  }

  // DELETE /v1/additional-forms/{id}
  if (req.method === 'DELETE') {
    const deleteHandler = apiRouteUtils.createDeleteHandler({
      endpoint: `/additional-forms/${id}`,
      timeout: 30000
    });
    return deleteHandler(req, res);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
