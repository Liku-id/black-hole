import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid ticket type ID parameter' });
  }

  try {
    const getHandler = apiRouteUtils.createGetHandler({
      endpoint: `/ticket-types/${id}/additional-forms`,
      timeout: 10000
    });

    return await getHandler(req, res);
  } catch (error) {
    console.error('Error in additional forms by ticket type handler:', error);
    return res.status(500).json({
      message: 'Failed to process additional forms request',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
