import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const backendUrl =
      process.env.BACKEND_URL || 'http://localhost:8080';
    const backendEndpoint = `${backendUrl}/city`;

    const response = await axios.get(backendEndpoint);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching cities from backend:', error);

    if (axios.isAxiosError(error)) {
      return res.status(error.response?.status || 500).json({
        message: `Backend API error: ${error.response?.statusText || 'Unknown error'}`,
        ...error.response?.data
      });
    }

    return res.status(500).json({
      message: 'Failed to fetch cities from backend API',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
