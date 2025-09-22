import type { NextApiRequest, NextApiResponse } from 'next/types';
import { getSession, isAuthenticated } from '@/lib/sessionHelpers';

interface UpdateLegalRequest {
  npwp_photo_id: string;
  npwp_number: string;
  npwp_address: string;
  full_name: string;
  ktp_photo_id?: string;
  ktp_number?: string;
  ktp_address?: string;
  pic_name?: string;
  pic_title?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getSession(req, res);

    if (!isAuthenticated(session) || !session.accessToken) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { eo_id } = req.query;
    const {
      npwp_photo_id,
      npwp_number,
      npwp_address,
      full_name,
      ktp_photo_id,
      ktp_number,
      ktp_address,
      pic_name,
      pic_title
    }: UpdateLegalRequest = req.body;

    // Validate required fields
    if (!npwp_photo_id || !npwp_number || !npwp_address || !full_name) {
      return res.status(400).json({
        message:
          'Missing required fields: npwp_photo_id, npwp_number, npwp_address, full_name'
      });
    }

    const payload: any = {
      npwp_photo_id,
      npwp_number,
      npwp_address,
      full_name
    };

    // Add optional fields if provided
    if (ktp_photo_id) payload.ktp_photo_id = ktp_photo_id;
    if (ktp_number) payload.ktp_number = ktp_number;
    if (ktp_address) payload.ktp_address = ktp_address;
    if (pic_name) payload.pic_name = pic_name;
    if (pic_title) payload.pic_title = pic_title;

    const response = await fetch(
      `${process.env.BACKEND_URL}/event-organizers/${eo_id}/legal`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend error:', errorData);
      return res.status(response.status).json({
        message: 'Failed to update legal information',
        error: errorData
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
