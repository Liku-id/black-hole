import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

// Custom handler for event detail since we need dynamic endpoint with metaUrl
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { metaUrl } = req.query;

    if (!metaUrl || typeof metaUrl !== 'string') {
      return res.status(400).json({ message: 'Invalid metaUrl parameter' });
    }

    const safeMetaUrl = encodeURIComponent(metaUrl);

    // Use apiRouteUtils pattern with dynamic endpoint and clean query transform
    const getHandler = apiRouteUtils.createGetHandler({
      endpoint: `/events/${safeMetaUrl}`,
      transformQuery: (query) => {
        const { metaUrl: _removedMetaUrl, ...restQuery } = query;
        return restQuery;
      },
      timeout: 10000
    });

    return await getHandler(req, res);
  } catch (error) {
    console.error('Error in event detail handler:', error);
    return res.status(500).json({
      message: 'Failed to process event detail request',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
