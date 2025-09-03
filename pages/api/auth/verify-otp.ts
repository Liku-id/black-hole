import type { NextApiRequest, NextApiResponse } from 'next/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { phoneNumber, otp } = req.body;
    console.log('OTP verification attempt:', {
      phoneNumber,
      otp: otp ? '***' : 'missing'
    });

    // For now, return mock response to test
    // In production, this would verify the OTP against the stored value
    const mockResponse = {
      body: {
        verified: true,
        user: {
          id: '2',
          fullName: 'New Organizer',
          email: 'test@example.com',
          role: 'event_organizer_pic',
          phoneNumber: phoneNumber || '+6281234567890',
          avatar: null
        }
      },
      message: 'OTP verified successfully'
    };

    return res.status(200).json(mockResponse);
  } catch (error) {
    console.error('OTP verification API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
