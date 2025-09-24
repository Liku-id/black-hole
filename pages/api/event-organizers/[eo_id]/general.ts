import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

interface UpdateGeneralRequest {
  name: string;
  description: string;
  social_media_url: string;
  address: string;
  asset_id: string;
  organizer_type?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { eo_id } = req.query;

    if (!eo_id || typeof eo_id !== 'string') {
      return res
        .status(400)
        .json({ message: 'Event organizer ID is required' });
    }

    // Validate request body
    const {
      name,
      description,
      social_media_url,
      address,
      asset_id,
      organizer_type
    }: UpdateGeneralRequest = req.body;

    if (!name || !description || !address) {
      return res.status(400).json({
        message: 'Missing required fields: name, description, address'
      });
    }

    // Prepare payload for backend
    const payload = {
      name,
      description,
      social_media_url,
      address,
      asset_id,
      ...(organizer_type && { organizer_type })
    };

    // Update the request body with the prepared payload
    req.body = payload;

    // Use apiRouteUtils with dynamic endpoint
    const postHandler = apiRouteUtils.createPostHandler({
      endpoint: `/event-organizers/${eo_id}/general`,
      timeout: 30000
    });

    return await postHandler(req, res);
  } catch (error) {
    console.error('Event organizer general update API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
