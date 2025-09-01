import type { NextApiRequest, NextApiResponse } from 'next/types';

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

    const backendUrl =
      process.env.BACKEND_URL || 'http://localhost:8080';
    const backendEndpoint = `${backendUrl}/events/${metaUrl}`;

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
    console.error('Error fetching event detail from backend:', error);
    return res.status(500).json({
      message: 'Failed to fetch event detail from backend API',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
