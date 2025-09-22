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
    const { type, file, filename, privacy, fileGroup } = req.body;

    if (!type || !file || !filename || !privacy || !fileGroup) {
      return res.status(400).json({
        code: 400,
        message: 'All fields are required',
        details: []
      });
    }

    const response = await axios.post(
      `${process.env.BACKEND_URL}/upload-asset`,
      { type, file, filename, privacy, fileGroup },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const data = response.data;
    console.log('Upload Asset Response:', data);

    return res.status(200).json(data);
  } catch (error) {
    console.error('Upload asset API error:', error);

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
