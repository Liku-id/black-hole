import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { metaUrl } = req.query as { metaUrl: string };

  if (req.method === 'POST') {
    return apiRouteUtils.createPostHandler({
      endpoint: `/events/${metaUrl}/submission`,
      timeout: 30000
    })(req, res);
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}


