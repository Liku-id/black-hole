import type { NextApiRequest, NextApiResponse } from 'next/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { eventId } = req.query;
    const { page, limit } = req.query;

    if (!eventId || typeof eventId !== 'string') {
      return res.status(400).json({ message: 'Invalid eventId parameter' });
    }

    const backendUrl = process.env.BACKEND_URL || 'http://172.16.1.33:8080';

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page as string);
    if (limit) queryParams.append('limit', limit as string);

    const queryString = queryParams.toString();
    const backendEndpoint = `${backendUrl}/events/${eventId}/transactions${
      queryString ? `?${queryString}` : ''
    }`;

    const response = await fetch(backendEndpoint, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // Forward any auth headers if needed
        ...(req.headers.authorization && {
          Authorization: req.headers.authorization
        })
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        message: `Backend API error: ${response.statusText}`,
        ...errorData
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching event transactions from backend:', error);
    return res.status(500).json({
      message: 'Failed to fetch event transactions from backend API',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
