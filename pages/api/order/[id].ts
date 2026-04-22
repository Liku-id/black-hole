import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid order ID' });
  }

  // Create handler dynamically to pass the specific endpoint ID
  const getHandler = apiRouteUtils.createGetHandler({
    endpoint: `/orders/${id}`,
    timeout: 30000,
    transformResponse: (data) => {
      // Extract the order object based on standard Likuid backend envelope
      const order = data.order || data.data || data;

      // Restructure according to black-void frontend expectations
      // specifically mapping ticketType to a tickets array
      const tickets = [
        {
          id: order.ticketType?.id || order.ticket_type_id || '',
          name: order.ticketType?.name || '',
          price: order.group_ticket?.price || order.ticketType?.price || 0,
          count: order.quantity || 0,
          partnership_info: order.ticketType?.partnership_info || null,
          group_ticket_id: order.group_ticket_id || '',
          ticket_type_id: order.ticket_type_id || order.ticketType?.id || '',
        },
      ];

      return {
        ...data, // Keep envelope (statusCode, message)
        order: undefined, // Replace the raw order root with merged properties if returned flattened
        ...order,
        tickets,
      };
    }
  });

  return await getHandler(req, res);
}
