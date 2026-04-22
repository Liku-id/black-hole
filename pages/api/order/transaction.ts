import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Use the standard proxy handler from apiRouteUtils
  const postHandler = apiRouteUtils.createPostHandler({
    endpoint: '/transactions',
    timeout: 30000
  });

  return await postHandler(req, res);
}
