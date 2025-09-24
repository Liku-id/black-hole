import { apiRouteUtils } from '@/utils/apiRouteUtils';
import type { NextApiRequest, NextApiResponse } from 'next/types';

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
    const { eo_id } = req.query;

    if (!eo_id || typeof eo_id !== 'string') {
      return res
        .status(400)
        .json({ message: 'Event organizer ID is required' });
    }

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

    // Update the request body with the prepared payload
    req.body = payload;

    // Use apiRouteUtils with dynamic endpoint
    const postHandler = apiRouteUtils.createPostHandler({
      endpoint: `/event-organizers/${eo_id}/legal`,
      timeout: 30000
    });

    return await postHandler(req, res);
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
