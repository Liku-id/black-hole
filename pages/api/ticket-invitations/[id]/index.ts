
import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid invitation ID' });
    }

    const getHandler = apiRouteUtils.createGetHandler({
      endpoint: `/ticket-invitations/${id}`,
      timeout: 30000
    });

    return await getHandler(req, res);
  } catch (error) {
    console.error('Error fetching ticket invitation:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
