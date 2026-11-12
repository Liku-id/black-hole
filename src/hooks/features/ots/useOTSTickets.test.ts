import { renderHook } from '@testing-library/react';

import {
  createMockEventDetail,
  createMockGroupTicket,
  createMockTicketType
} from '@/test-utils/factories';
import { EventDetail } from '@/types/event';

import { useOTSTickets } from './useOTSTickets';

describe('useOTSTickets', () => {
  it('returns empty array when eventDetail is undefined', () => {
    const { result } = renderHook(() => useOTSTickets(undefined));

    expect(result.current.tickets).toEqual([]);
  });

  it('returns eventDetail.tickets directly when already populated', () => {
    const existingTickets = [{ id: 't-1', name: 'Pre-mapped Ticket' } as any];
    const eventDetail = createMockEventDetail({
      tickets: existingTickets
    });

    const { result } = renderHook(() => useOTSTickets(eventDetail));

    expect(result.current.tickets).toBe(existingTickets);
  });

  it('maps public standard ticketTypes and group_tickets with date and description fallbacks', () => {
    const publicStandard = createMockTicketType({
      id: 'tt-1',
      name: 'VIP',
      price: 300000,
      is_public: true,
      sales_start_date: '2026-01-01',
      sales_end_date: '2026-02-01',
      ticketStartDate: '2026-03-01',
      max_order_quantity: 4,
      description: 'VIP access',
      quantity: 50,
      purchased_amount: 5
    });

    const standardWithFallbackDates = {
      ...createMockTicketType({
        id: 'tt-2',
        name: 'Early Bird',
        is_public: undefined as unknown as boolean
      }),
      sales_start_date: '',
      sales_end_date: '',
      createdAt: '2026-01-05',
      endDate: '2026-02-05'
    } as any;

    const privateStandard = createMockTicketType({
      id: 'tt-private',
      name: 'Private Ticket',
      is_public: false
    });

    const groupWithTicketStartDate = createMockGroupTicket({
      id: 'gt-1',
      name: 'Family Pack',
      description: '4 tickets pack',
      price: 400000,
      bundle_quantity: 4,
      purchased_amount: 3,
      is_public: true,
      ticket_type_id: 'tt-1',
      ticket_type: createMockTicketType({
        ticketStartDate: '2026-03-10'
      })
    });

    const groupWithFallbackFields = {
      ...createMockGroupTicket({
        id: 'gt-2',
        name: 'Squad Pack',
        description: '',
        bundle_quantity: 5,
        purchased_amount: 0,
        is_public: true,
        ticket_type_id: 'tt-2'
      }),
      ticket_type: {
        ticket_start_date: '2026-04-01'
      }
    } as any;

    const groupWithoutTicketType = {
      ...createMockGroupTicket({
        id: 'gt-3',
        name: 'Mystery Pack',
        description: '',
        bundle_quantity: 2,
        is_public: undefined as unknown as boolean
      }),
      purchased_amount: undefined,
      ticket_type: undefined
    } as any;

    const privateGroup = createMockGroupTicket({
      id: 'gt-private',
      name: 'Private Group',
      is_public: false
    });

    const eventDetail = createMockEventDetail({
      tickets: [],
      ticketTypes: [publicStandard, standardWithFallbackDates, privateStandard],
      group_tickets: [
        groupWithTicketStartDate,
        groupWithFallbackFields,
        groupWithoutTicketType,
        privateGroup
      ]
    });

    const { result } = renderHook(() => useOTSTickets(eventDetail));

    expect(result.current.tickets).toHaveLength(5);

    expect(result.current.tickets[0]).toMatchObject({
      id: 'tt-1',
      name: 'VIP',
      price: 300000,
      count: 0,
      sales_start_date: '2026-01-01',
      sales_end_date: '2026-02-01',
      ticket_start_date: '2026-03-01',
      partnership_info: null
    });

    expect(result.current.tickets[1]).toMatchObject({
      id: 'tt-2',
      count: 0,
      sales_start_date: '2026-01-05',
      sales_end_date: '2026-02-05',
      partnership_info: null
    });

    expect(result.current.tickets[2]).toMatchObject({
      id: 'gt-1',
      group_ticket_id: 'gt-1',
      ticket_type_id: 'tt-1',
      description: '4 tickets pack',
      ticket_start_date: '2026-03-10',
      purchased_amount: 3,
      count: 0,
      partnership_info: null
    });

    expect(result.current.tickets[3]).toMatchObject({
      id: 'gt-2',
      description: 'Bundle of 5 tickets',
      ticket_start_date: '2026-04-01',
      purchased_amount: 0,
      partnership_info: null
    });

    expect(result.current.tickets[4]).toMatchObject({
      id: 'gt-3',
      description: 'Bundle of 2 tickets',
      ticket_start_date: undefined,
      purchased_amount: 0,
      partnership_info: null
    });
  });

  it('handles missing ticketTypes and group_tickets arrays', () => {
    const eventDetail = createMockEventDetail({
      tickets: undefined,
      ticketTypes: undefined as unknown as any[],
      group_tickets: undefined as unknown as any[]
    });

    const { result } = renderHook(() => useOTSTickets(eventDetail));

    expect(result.current.tickets).toEqual([]);
  });

  it('memoizes result when eventDetail reference is unchanged and updates on change', () => {
    const initialDetail = createMockEventDetail({
      ticketTypes: [createMockTicketType({ id: 'tt-1' })],
      group_tickets: []
    });

    const { result, rerender } = renderHook(
      ({ detail }: { detail: EventDetail | undefined }) =>
        useOTSTickets(detail),
      { initialProps: { detail: initialDetail } }
    );

    const firstResult = result.current.tickets;
    rerender({ detail: initialDetail });
    expect(result.current.tickets).toBe(firstResult);

    const updatedDetail = createMockEventDetail({
      ticketTypes: [createMockTicketType({ id: 'tt-2', name: 'Updated' })],
      group_tickets: []
    });
    rerender({ detail: updatedDetail });
    expect(result.current.tickets).not.toBe(firstResult);
    expect(result.current.tickets[0]).toMatchObject({
      id: 'tt-2',
      name: 'Updated'
    });
  });
});
