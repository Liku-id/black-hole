import type { NextApiRequest, NextApiResponse } from 'next/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    // Mock logout for development/testing
    if (!process.env.BACKEND_URL) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockResponse = {
        message: 'Logout successful'
      };
      
      return res.status(200).json(mockResponse);
    }

    // Real backend call
    const response = await fetch(`${process.env.BACKEND_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Logout API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
