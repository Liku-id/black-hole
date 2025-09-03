import type { NextApiRequest, NextApiResponse } from 'next/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { organizerName, email, phoneNumber, password } = req.body;
    console.log('Registration attempt:', {
      organizerName,
      email,
      phoneNumber: phoneNumber ? '***' : 'missing',
      password: password ? '***' : 'missing'
    });

    // For now, return mock response to test
    const mockUser = {
      id: '2',
      email: email || 'test@example.com',
      fullName: organizerName || 'New Organizer',
      role: 'event_organizer_pic',
      phoneNumber: phoneNumber || '+6281234567890',
      avatar: null
    };

    const mockResponse = {
      body: {
        user: mockUser,
        accessToken: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now()
      },
      message: 'Registration successful'
    };

    return res.status(200).json(mockResponse);
  } catch (error) {
    console.error('Registration API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
