export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';

    // Extract query parameters for filtering
    const { show, page, cityId, name, startDate, endDate } = req.query;

    // Build query string for backend
    const queryParams = new URLSearchParams();
    if (show) queryParams.append('show', show.toString());
    if (page) queryParams.append('page', page.toString());
    if (name) queryParams.append('name', name.toString());
    if (startDate) queryParams.append('startDate', startDate.toString());
    if (endDate) queryParams.append('endDate', endDate.toString());
    if (cityId) queryParams.append('cityId', cityId.toString());

    const queryString = queryParams.toString();
    const backendEndpoint = `${backendUrl}/events${
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
    console.error('Error fetching events from backend:', error);
    return res.status(500).json({
      message: 'Failed to fetch events from backend API',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
