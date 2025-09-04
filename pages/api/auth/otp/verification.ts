import type { NextApiRequest, NextApiResponse } from 'next/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { phoneNumber, code } = req.body;

    if (!phoneNumber || !code) {
      return res.status(400).json({
        code: 400,
        message: 'Phone number and OTP code are required',
        details: []
      });
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/auth/otp/verification`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phoneNumber, code })
      }
    );

    const data = await response.json();
    console.log('OTP Verification Response:', data);

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('OTP verification API error:', error);
    return res.status(500).json({
      code: 500,
      message: 'Internal server error',
      details: []
    });
  }
}
