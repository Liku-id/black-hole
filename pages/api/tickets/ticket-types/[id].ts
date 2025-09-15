import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  // PUT /v1/ticket-types/{id}
  if (req.method === 'PUT') {
    return apiRouteUtils.createPutHandler({
      endpoint: `/ticket-types/${id}`,
      timeout: 30000
    })(req, res);
  }

  // DELETE /v1/ticket-types/{id}
  if (req.method === 'DELETE') {
    return apiRouteUtils.createDeleteHandler({
      endpoint: `/ticket-types/${id}`,
      timeout: 30000
    })(req, res);
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
