import type { NextApiRequest, NextApiResponse } from 'next/types';

import { getSession, isAuthenticated } from '@/lib/sessionHelpers';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get session for authentication
    const session = await getSession(req, res);
    if (!isAuthenticated(session) || !session.accessToken) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const eventId = req.query.event_id as string;

    if (!eventId) {
      return res.status(400).json({ message: 'event_id is required' });
    }

    const params = new URLSearchParams();
    params.append('event_id', eventId);

    const url = `${process.env.BACKEND_URL}/tickets/export?${params.toString()}`;

    // Make request to backend gateway
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.accessToken}`
      }
    });

    if (!response.ok) {
      // Handle auth errors
      if (response.status === 401) {
        try {
          await session.destroy();
        } catch (sessionError) {
          console.error('Session clear error:', sessionError);
        }
      }
      const errorText = await response.text();
      return res
        .status(response.status)
        .json({ message: errorText || 'Export failed' });
    }

    // Get CSV content directly (backend returns CSV file)
    const csvContent = await response.text();

    // Get filename from Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'tickets_export.csv';

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename=(.+)/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    // Set proper headers for CSV file download
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    // Return CSV content directly
    return res.status(200).send(csvContent);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}
