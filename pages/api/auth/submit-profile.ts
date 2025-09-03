import type { NextApiRequest, NextApiResponse } from 'next/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      profilePicture,
      socialMedia,
      address,
      aboutOrganizer,
      termsAccepted
    } = req.body;
    console.log('Profile submission:', {
      hasProfilePicture: !!profilePicture,
      socialMediaCount: socialMedia?.length || 0,
      address: address ? 'provided' : 'missing',
      aboutOrganizer: aboutOrganizer ? 'provided' : 'missing',
      termsAccepted
    });

    // For now, return mock response to test
    // In production, this would save the profile data and send OTP
    const mockResponse = {
      body: {
        profileSaved: true,
        otpSent: true,
        expiresIn: 300 // 5 minutes in seconds
      },
      message: 'Profile saved successfully. OTP sent to your phone number.'
    };

    return res.status(200).json(mockResponse);
  } catch (error) {
    console.error('Profile submission API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
