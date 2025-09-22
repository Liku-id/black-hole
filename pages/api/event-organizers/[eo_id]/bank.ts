import type { NextApiRequest, NextApiResponse } from 'next/types';
import { getSession, isAuthenticated } from '@/lib/sessionHelpers';

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

    if (!eo_id || typeof eo_id !== 'string') {
      return res.status(400).json({ message: 'Event organizer ID is required' });
    }

    const { bank_id, account_number, account_holder_name } = req.body;

    if (!bank_id || !account_number || !account_holder_name) {
      return res.status(400).json({
        message: 'bank_id, account_number, and account_holder_name are required'
      });
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/event-organizers/${eo_id}/bank`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`
        },
        body: JSON.stringify({
          bank_id,
          account_number,
          account_holder_name
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({
        message: errorData.message || 'Failed to update bank information'
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Bank update API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
