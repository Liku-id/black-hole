import { apiRouteUtils } from '@/utils/apiRouteUtils';
import type { NextApiRequest, NextApiResponse } from 'next/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      name,
      email,
      phone_number,
      password,
      social_media_url: _social_media_url,
      address,
      description
    } = req.body;

    if (
      !name ||
      !email ||
      !phone_number ||
      !password ||
      !address ||
      !description
    ) {
      return res.status(400).json({
        code: 400,
        message: 'Required fields are missing',
        details: []
      });
    }

    // Prepare payload for backend
    const payload = {
      name,
      email,
      phone_number,
      password,
      social_media_url: _social_media_url,
      address,
      description
    };

    // Update the request body with the prepared payload
    req.body = payload;

    // Use apiRouteUtils
    const postHandler = apiRouteUtils.createPostHandler({
      endpoint: '/event-organizers',
      timeout: 30000,
      requireAuth: false
    });

    return await postHandler(req, res);
  } catch (error) {
    console.error('Create event organizer API error:', error);
    return res.status(500).json({
      code: 500,
      message: 'Internal server error',
      details: []
    });
  }
}
