import type { NextApiRequest, NextApiResponse } from 'next/types';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      name,
      email,
      phone_number,
      password,
      social_media_url: _social_media_url,
      address,
      description
    } = req.body;

    if (
      !name ||
      !email ||
      !phone_number ||
      !password ||
      !address ||
      !description
    ) {
      return res.status(400).json({
        code: 400,
        message: 'Required fields are missing',
        details: []
      });
    }

    const response = await axios.post(
      `${process.env.BACKEND_URL}/event-organizers`,
      {
        name,
        email,
        phone_number,
        password,
        social_media_url: _social_media_url,
        address,
        description
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const data = response.data;
    console.log('Event Organizer Creation Response:', data);

    return res.status(200).json(data);
  } catch (error) {
    console.error('Create event organizer API error:', error);

    if (axios.isAxiosError(error) && error.response) {
      // Handle axios error with response (4xx, 5xx status codes)
      return res.status(error.response.status).json(error.response.data);
    }

    // Handle other errors (network issues, etc.)
    return res.status(500).json({
      code: 500,
      message: 'Internal server error',
      details: []
    });
  }
}
