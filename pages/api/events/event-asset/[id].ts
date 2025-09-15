import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === 'DELETE') {
    return apiRouteUtils.createDeleteHandler({
      endpoint: `/event-asset/${id}`,
      timeout: 30000
    })(req, res);
  }

  if (req.method === 'PUT') {
    return apiRouteUtils.createPutHandler({
      endpoint: `/event-asset/${id}`,
      timeout: 30000
    })(req, res);
  }

  res.setHeader('Allow', ['DELETE', 'PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
