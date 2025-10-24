import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const postHandler = apiRouteUtils.createPostHandler({
      endpoint: '/additional-forms'
    });
    return postHandler(req, res);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
