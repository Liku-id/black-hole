import { apiRouteUtils } from '@/utils/apiRouteUtils';
import type { NextApiRequest, NextApiResponse } from 'next/types';

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

    const { bank_id, account_number, account_holder_name } = req.body;

    if (!bank_id || !account_number || !account_holder_name) {
      return res.status(400).json({
        message: 'bank_id, account_number, and account_holder_name are required'
      });
    }

    // Use apiRouteUtils with dynamic endpoint
    const postHandler = apiRouteUtils.createPostHandler({
      endpoint: `/event-organizers/${eo_id}/bank`,
      timeout: 30000
    });

    return await postHandler(req, res);
  } catch (error) {
    console.error('Bank update API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
