import type { NextApiRequest, NextApiResponse } from 'next/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Simple test response first
  if (req.method === 'GET') {
    return res.status(200).json({ message: 'Login API is working' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    console.log('Login attempt:', {
      email,
      password: password ? '***' : 'missing'
    });

    // For now, return mock response to test
    const mockUser = {
      id: '1',
      email: email || 'test@example.com',
      fullName: 'John Doe',
      role: 'admin',
      avatar: null
    };

    const mockResponse = {
      body: {
        user: mockUser,
        accessToken: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now()
      },
      message: 'Login successful'
    };

    return res.status(200).json(mockResponse);
  } catch (error) {
    console.error('Login API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
