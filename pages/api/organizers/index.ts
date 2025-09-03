import type { NextApiRequest, NextApiResponse } from 'next/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';

    const response = await fetch(`${backendUrl}/event-organizers`, {
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
      return res.status(response.status).json({
        message: `Backend API error: ${response.statusText}`
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching organizers from backend:', error);
    return res.status(500).json({
      message: 'Failed to fetch organizers from backend API',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
