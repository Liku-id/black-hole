import type { NextApiRequest, NextApiResponse } from 'next/types';

import { getSession } from '@/lib/sessionHelpers';
import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Get session to retrieve cashierId
    const session = await getSession(req, res);

    const body = req.body;
    const ticket = body.tickets?.[0] || body;

    if (!ticket.id && !ticket.ticketTypeId) {
      return res.status(400).json({ message: 'No tickets selected' });
    }

    const payload: Record<string, any> = {
      ticketTypeId: ticket.id || ticket.ticketTypeId,
      groupTicketId: ticket.groupTicketId,
      quantity: ticket.quantity,
      cashierId: session?.user?.id,
    };

    req.body = payload;
  } catch (error) {
    console.error('[ERROR] Order custom handler failed:', error);
  }

  const postHandler = apiRouteUtils.createPostHandler({
    endpoint: '/orders',
    timeout: 30000
  });

  return await postHandler(req, res);
}
