import { useMemo } from 'react';

import { EventDetail } from '@/types/event';

export function useOTSTickets(eventDetail: EventDetail | undefined) {
  const tickets = useMemo(() => {
    if (!eventDetail) return [];

    if (eventDetail.tickets && eventDetail.tickets.length > 0) {
      return eventDetail.tickets;
    }

    const standardTickets = (eventDetail.ticketTypes || [])
      .filter((t: any) => t.is_public !== false)
      .map((t: any) => ({
        ...t,
        id: t.id,
        name: t.name,
        price: t.price,
        count: 0,
        max_order_quantity: t.max_order_quantity,
        description: t.description,
        sales_start_date: t.sales_start_date || t.createdAt,
        sales_end_date: t.sales_end_date || t.endDate,
        ticket_start_date: t.ticketStartDate,
        quantity: t.quantity,
        purchased_amount: t.purchased_amount,
        partnership_info: null,
      }));

    const groupTickets = (eventDetail.group_tickets || [])
      .filter((gt: any) => gt.is_public !== false)
      .map((gt: any) => {
      const ticketType = gt.ticket_type;
      const ticketStartDate = ticketType
        ? ticketType.ticketStartDate || ticketType.ticket_start_date
        : undefined;

      return {
        ...gt,
        id: gt.id,
        name: gt.name,
        price: gt.price,
        count: 0,
        max_order_quantity: gt.max_order_quantity,
        description: gt.description || `Bundle of ${gt.bundle_quantity} tickets`,
        sales_start_date: gt.sales_start_date,
        sales_end_date: gt.sales_end_date,
        ticket_start_date: ticketStartDate,
        quantity: gt.quantity,
        purchased_amount: gt.purchased_amount || 0,
        partnership_info: null,
        group_ticket_id: gt.id,
        ticket_type_id: gt.ticket_type_id,
      };
    });

    return [...standardTickets, ...groupTickets];
  }, [eventDetail]);

  return { tickets };
}
