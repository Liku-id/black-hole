import type { NextApiRequest, NextApiResponse } from 'next/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { phoneNumber } = req.body;
    console.log('Resend OTP request:', {
      phoneNumber
    });

    // For now, return mock response to test
    // In production, this would generate and send a new OTP
    const mockResponse = {
      body: {
        sent: true,
        expiresIn: 300 // 5 minutes in seconds
      },
      message: 'OTP sent successfully'
    };

    return res.status(200).json(mockResponse);
  } catch (error) {
    console.error('Resend OTP API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
