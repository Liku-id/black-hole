import { Box } from '@mui/material';
import { useAtom } from 'jotai';
import { useState, useMemo } from 'react';

import { activeOtsOrderAtom } from '@/atoms/otsOrderAtom';
import { Body2 } from '@/components/common';
import { useToast } from '@/contexts/ToastContext';
import { ordersService } from '@/services/orders';
import { EventDetail } from '@/types/event';

import { OrderSummary } from '../summary';

import { TicketTypeCard } from './card';

interface TicketSellingSectionProps {
  tickets: any[];
  eventDetail: EventDetail | undefined;
  isLoading: boolean;
}

export function TicketSellingSection({ tickets, eventDetail, isLoading }: TicketSellingSectionProps) {
  const { showInfo, showError } = useToast();
  const [, setActiveOrder] = useAtom(activeOtsOrderAtom);

  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Memoized derived values
  const orderItems = useMemo(() =>
    tickets
      .filter(t => selectedQuantities[t.id] > 0)
      .map((t) => ({
        ticketType: t,
        quantity: selectedQuantities[t.id]
      })),
    [tickets, selectedQuantities]
  );

  // Handlers
  const handleQtyChange = (id: string, qty: number) => {
    setSelectedQuantities(qty > 0 ? { [id]: qty } : {});
  };

  const handleCheckout = async () => {
    const selectedTicketId = Object.keys(selectedQuantities)[0];
    const qty = selectedQuantities[selectedTicketId];
    const selectedTicket = tickets.find(t => t.id === selectedTicketId);

    if (!selectedTicket || qty <= 0) {
      showError('Please select at least one ticket.');
      return;
    }

    try {
      setIsCheckingOut(true);

      const payload = {
        tickets: [
          {
            id: selectedTicket.group_ticket_id ? selectedTicket.ticket_type_id : selectedTicket.id,
            groupTicketId: selectedTicket.group_ticket_id || null,
            quantity: qty,
          }
        ]
      };

      const response = await ordersService.createOrder(payload as any);

      if (response && response.statusCode === 0) {
        showInfo('Order created successfully!');
        setActiveOrder({ id: response.order.id, expiredAt: response.order.expiredAt });
      } else {
        showError(response.message || 'Failed to create order');
      }
    } catch (err: any) {
      showError(err?.message || 'Failed to create order');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <Box display="flex" gap="24px" width="100%">
      {/* Left Column: List */}
      <Box sx={{ flex: '0 0 calc(65% - 12px)', width: 'calc(65% - 12px)' }}>
        {isLoading ? (
          <Box bgcolor="background.paper" p="24px" borderRadius="4px">
            <Body2 color="text.secondary" fontSize="14px">Loading tickets...</Body2>
          </Box>
        ) : tickets.length === 0 ? (
          <Box bgcolor="background.paper" p="24px" borderRadius="4px">
            <Body2 color="text.secondary" fontSize="14px">No ticket types found for this event.</Body2>
          </Box>
        ) : (
          <>
            {tickets.map((t, idx) => (
              <TicketTypeCard
                key={t.id}
                index={idx}
                ticketType={t}
                qty={selectedQuantities[t.id] || 0}
                onQtyChange={(newQty) => handleQtyChange(t.id, newQty)}
              />
            ))}
          </>
        )}
      </Box>

      {/* Right Column: Summary */}
      <Box sx={{ flex: '0 0 calc(35% - 12px)', width: 'calc(35% - 12px)' }}>
        <OrderSummary
          items={orderItems}
          eventDetail={eventDetail}
          loading={isLoading || isCheckingOut}
          onCheckout={handleCheckout}
        />
      </Box>
    </Box>
  );
}
