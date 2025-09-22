import type { NextApiRequest, NextApiResponse } from 'next/types';
import axios from 'axios';

interface CheckAvailabilityRequest {
  email: string;
  phoneNumber: string;
}

interface CheckAvailabilityResponse {
  statusCode: number;
  message: string;
  body: {
    isValid: boolean;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CheckAvailabilityResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      statusCode: 405,
      message: 'Method not allowed',
      body: {
        isValid: false
      }
    });
  }

  try {
    const { email, phoneNumber }: CheckAvailabilityRequest = req.body;

    // Validate required fields
    if (!email || !phoneNumber) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Email and phone number are required',
        body: {
          isValid: false
        }
      });
    }

    // Check availability by calling the backend API
    const response = await axios.post(
      `${process.env.BACKEND_URL}/users/check-availability`,
      {
        email,
        phoneNumber
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const data = response.data;
    console.log('Check Availability Response:', data);

    // Return the response from backend
    return res.status(200).json(data);
  } catch (error) {
    console.error('Check availability error:', error);

    if (axios.isAxiosError(error) && error.response) {
      // Handle axios error with response (4xx, 5xx status codes)
      const data = error.response.data;
      return res.status(error.response.status).json({
        statusCode: error.response.status,
        message: data.message || 'Availability check failed',
        body: {
          isValid: false
        }
      });
    }

    // Handle other errors (network issues, etc.)
    return res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      body: {
        isValid: false
      }
    });
  }
}
