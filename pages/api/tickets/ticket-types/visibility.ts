import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'PATCH') {
    return apiRouteUtils.createPatchHandler({
      endpoint: '/ticket-types/visibility',
      timeout: 30000
    })(req, res);
  }

  res.setHeader('Allow', ['PATCH']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
