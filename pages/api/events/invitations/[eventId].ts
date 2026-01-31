import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { eventId } = req.query;

  if (!eventId || typeof eventId !== 'string') {
    return res.status(400).json({ message: 'Invalid event ID' });
  }

  if (req.method === 'GET') {
    try {
      const getHandler = apiRouteUtils.createGetHandler({
        endpoint: `/events/${eventId}/invitations`,
        timeout: 30000
      });

      return await getHandler(req, res);
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const postHandler = apiRouteUtils.createPostHandler({
        endpoint: `/events/${eventId}/invitations`,
        timeout: 30000
      });

      return await postHandler(req, res);
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
