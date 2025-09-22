import type { NextApiRequest, NextApiResponse } from 'next/types';

import { getSession, isAuthenticated } from '@/lib/sessionHelpers';

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
    const session = await getSession(req, res);

    if (!isAuthenticated(session) || !session.accessToken) {
      return res.status(401).json({ message: 'Authentication required' });
    }

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

    // Call the backend endpoint
    const response = await fetch(
      `${process.env.BACKEND_URL}/event-organizers/${eo_id}/general`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // If it's an auth error, clear the session
      if (response.status === 401) {
        session.destroy();
        await session.save();
      }
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Event organizer general update API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
