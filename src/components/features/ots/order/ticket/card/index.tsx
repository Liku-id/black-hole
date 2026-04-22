import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import RemoveIcon from '@mui/icons-material/Remove';
import { Box, IconButton, useTheme, Divider, Collapse } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState, useMemo } from 'react';

import { Body2 } from '@/components/common';
import { TicketType } from '@/types/event';
import { formatPrice } from '@/utils';

const StyledQtyButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'isIncrement',
})<{ isIncrement?: boolean }>(({ theme, isIncrement }) => ({
  border: '1px solid',
  borderRadius: '4px',
  padding: '4px',
  borderColor: isIncrement ? theme.palette.primary.main : theme.palette.grey[400],
  backgroundColor: isIncrement ? theme.palette.primary.main : 'transparent',
  color: isIncrement ? theme.palette.common.white : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: isIncrement ? theme.palette.primary.dark : theme.palette.action.hover,
    borderColor: isIncrement ? theme.palette.primary.dark : theme.palette.grey[400],
  },
  '&.Mui-disabled': {
    borderColor: theme.palette.grey[300],
    color: theme.palette.grey[300],
    backgroundColor: 'transparent',
  },
}));

// Local helper for formatting description as HTML if not available globally
const formatStrToHTML = (str: string) => {
  if (!str) return '';
  return str.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>');
};

interface TicketTypeCardProps {
  index: number;
  ticketType: TicketType;
  qty: number;
  onQtyChange: (newQty: number) => void;
}

export function TicketTypeCard({ index, ticketType, qty, onQtyChange }: TicketTypeCardProps) {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const remaining = ticketType.quantity - ticketType.purchased_amount;
  const maxBuy = ticketType.max_order_quantity;

  const handleDecrement = () => onQtyChange(Math.max(0, qty - 1));
  const handleIncrement = () => onQtyChange(Math.min(maxBuy, remaining, qty + 1));

  const salesState = useMemo(() => {
    if (!ticketType.sales_start_date || !ticketType.sales_end_date) return 'AVAILABLE';
    const now = new Date();
    const start = new Date(ticketType.sales_start_date);
    const end = new Date(ticketType.sales_end_date);
    if (now < start) return 'SOON';
    if (now > end) return 'SOLD';
    return 'AVAILABLE';
  }, [ticketType.sales_start_date, ticketType.sales_end_date]);

  return (
    <Box
      bgcolor="common.white"
      border={1}
      borderColor={theme.palette.grey[100]}
      borderRadius="4px"
      mb="16px"
      px="24px"
      py="16px"
    >
      <Box display="flex" alignItems="center" mb={isExpanded ? '16px' : '0'}>
        {/* No */}
        <Box width="5%">
          <Body2 color="text.primary">{index + 1}.</Body2>
        </Box>

        {/* Ticket Type */}
        <Box width="24%">
          <Body2 color="text.primary" fontWeight={600}>{ticketType.name}</Body2>
        </Box>

        {/* Price */}
        <Box width="23%">
          <Body2 color="text.primary">{formatPrice(ticketType.price)}</Body2>
        </Box>

        {/* Remaining Stock */}
        <Box width="15%" display="flex" alignItems="center" gap="6px">
          <Body2 color="text.secondary" fontSize="12px">
            Remaining: {remaining}{' '}
            {remaining <= 5 && remaining > 0 && (
              <Box
                component="span"
                color="warning.light"
                whiteSpace="nowrap"
              >
                <Box component="span" color="warning.light">
                  ⚠
                </Box>{' '}
                Low Stock
              </Box>
            )}
          </Body2>
        </Box>

        {/* Max Buy */}
        <Box width="14%">
          <Body2 color="text.primary">{maxBuy}</Body2>
        </Box>

        {/* Buy Ticket — qty counter */}
        <Box width="19%" display="flex" alignItems="center" gap="8px">
          {salesState === 'AVAILABLE' ? (
            <>
              <StyledQtyButton
                size="small"
                onClick={handleDecrement}
                disabled={qty <= 0}
              >
                <RemoveIcon fontSize="inherit" style={{ fontSize: '14px' }} />
              </StyledQtyButton>

              <Box textAlign='center' minWidth="24px">
                <Body2 color="text.primary" fontSize="14px" fontWeight={600}>{qty}</Body2>
              </Box>

              <StyledQtyButton
                isIncrement
                size="small"
                onClick={handleIncrement}
                disabled={qty >= maxBuy || qty >= remaining}
              >
                <AddIcon fontSize="inherit" style={{ fontSize: '14px' }} />
              </StyledQtyButton>
            </>
          ) : (
            <Body2
              color={salesState === 'SOON' ? 'text.secondary' : 'error.main'}
              fontWeight={600}
              fontSize="14px"
            >
              {salesState}
            </Body2>
          )}
        </Box>
      </Box>

      {/* Divider and Expand Toggle */}
      <Divider sx={{ mt: isExpanded ? '0' : '16px' }} />

      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        mt="16px"
        sx={{ cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <KeyboardArrowUpIcon color="primary" sx={{ fontSize: '20px', mr: '4px' }} />
        ) : (
          <KeyboardArrowDownIcon color="primary" sx={{ fontSize: '20px', mr: '4px' }} />
        )}
        <Body2 color="primary.main" fontWeight={500} fontSize="14px">
          {isExpanded ? 'Hide Details' : 'See Details'}
        </Body2>
      </Box>

      {/* Expandable Details Box */}
      <Collapse in={isExpanded}>
        <Box mt="16px">
          <Body2
            color="text.secondary"
            dangerouslySetInnerHTML={{
              __html: formatStrToHTML(ticketType.description || ''),
            }}
          />
        </Box>
      </Collapse>
    </Box>
  );
}

