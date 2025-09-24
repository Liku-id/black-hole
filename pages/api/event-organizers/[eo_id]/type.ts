import type { NextApiRequest, NextApiResponse } from 'next/types';

import { getSession, isAuthenticated } from '@/lib/sessionHelpers';

interface UpdateOrganizerTypeRequest {
  organizer_type: 'individual' | 'institutional';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check authentication
    const session = await getSession(req, res);
    if (!isAuthenticated(session)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { eo_id } = req.query;
    const { organizer_type } = req.body as UpdateOrganizerTypeRequest;

    if (!eo_id || typeof eo_id !== 'string') {
      return res.status(400).json({ message: 'Invalid organizer ID' });
    }

    if (!organizer_type || !['individual', 'institutional'].includes(organizer_type)) {
      return res.status(400).json({ message: 'Invalid organizer type' });
    }

    // Call backend API
    const response = await fetch(
      `${process.env.BACKEND_URL}/event-organizers/${eo_id}/type`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`
        },
        body: JSON.stringify({ organizer_type })
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend error:', errorData);
      
      // Try to parse error data as JSON
      let parsedError;
      try {
        parsedError = JSON.parse(errorData);
      } catch {
        parsedError = { message: errorData };
      }
      
      return res.status(response.status).json({
        message: parsedError.message || 'Failed to update organizer type',
        code: parsedError.code,
        details: parsedError.details
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error updating organizer type:', error);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
}
