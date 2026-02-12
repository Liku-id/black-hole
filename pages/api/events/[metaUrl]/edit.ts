import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { metaUrl } = req.query;

    if (!metaUrl || typeof metaUrl !== 'string') {
      return res.status(400).json({ message: 'Invalid metaUrl parameter' });
    }

    const { eventStatus, eventOrganizerId, ...restData } = req.body;

    // Only include eventOrganizerId if event is NOT on_review
    const eventData = eventStatus === 'on_review'
      ? restData
      : { eventOrganizerId, ...restData };

    const putHandler = apiRouteUtils.createPutHandler({
      endpoint: `/events/${metaUrl}`,
      timeout: 30000
    });

    req.body = eventData;

    return await putHandler(req, res);
  } catch (error) {
    console.error('Error in event edit handler:', error);
    return res.status(500).json({
      message: 'Failed to process event update request',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
