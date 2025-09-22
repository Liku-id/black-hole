import type { NextApiRequest, NextApiResponse } from 'next/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      eventId,
      page = '0',
      show = '10',
      search,
      ticketTypeIds
    } = req.query;

    // Validate required parameters
    if (!eventId || typeof eventId !== 'string') {
      return res.status(400).json({
        statusCode: 400,
        message: 'eventId is required',
        body: null
      });
    }

    // Build query parameters
    const params = new URLSearchParams();
    params.append('eventId', eventId);
    params.append('page', page.toString());
    params.append('show', show.toString());

    if (search && typeof search === 'string') {
      params.append('search', search);
    }

    if (ticketTypeIds) {
      const typeIds = Array.isArray(ticketTypeIds)
        ? ticketTypeIds
        : [ticketTypeIds];
      typeIds.forEach((id, index) => {
        params.append(`ticketTypeIds[${index}]`, id.toString());
      });
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    const backendEndpoint = `${backendUrl}/tickets?${params.toString()}`;

    const response = await fetch(backendEndpoint, {
      method: 'GET',
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
        statusCode: response.status,
        message: `Backend API error: ${response.statusText}`,
        body: null,
        ...errorData
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching tickets from backend:', error);
    return res.status(500).json({
      statusCode: 500,
      message: 'Failed to fetch tickets from backend API',
      body: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
