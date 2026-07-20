import { Box, IconButton, Table, TableCell, TableRow, Menu, MenuItem } from '@mui/material';
import Image from 'next/image';
import { FC, useState } from 'react';

import {
  Body2,
  CollapsibleCardList,
  StyledTableContainer,
  StyledTableHead,
  StyledTableBody
} from '@/components/common';
import { formatPrice, dateUtils } from '@/utils';

import { StatusBadge } from '../../../status-badge';

interface TicketCategory {
  id: string;
  name: string;
  description: string;
  colorHex: string;
  price: number;
  quantity: number;
  maxPerUser: number;
  salesStartDate: string;
  salesEndDate: string;
  ticketStartDate: string;
  ticketEndDate: string;
  status?: string;
  rejectedFields?: string[];
  rejectedReason?: string;
}

interface TicketTableProps {
  tickets: TicketCategory[];
  loading?: boolean;
  eventStatus?: string;
  onEdit?: (ticket: TicketCategory) => void;
  onDelete?: (ticketId: string) => void;
  onEditAdditionalForm?: (ticket: TicketCategory) => void;
}

const TicketTable: FC<TicketTableProps> = ({
  tickets,
  loading = false,
  eventStatus,
  onEdit,
  onDelete,
  onEditAdditionalForm
}) => {
  const statusMap = {
    approved: 'on_going',
    rejected: 'rejected',
    pending: 'pending'
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeTicket, setActiveTicket] = useState<TicketCategory | null>(null);

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLElement>,
    ticket: TicketCategory
  ) => {
    setAnchorEl(event.currentTarget);
    setActiveTicket(ticket);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setActiveTicket(null);
  };

  const shouldShowActions = (ticket: TicketCategory) => {
    if (
      (eventStatus === 'approved' || eventStatus === 'on_going') &&
      ticket.status === 'approved'
    ) {
      return false;
    }
    return true;
  };

  const renderRowActions = (ticket: TicketCategory) =>
    shouldShowActions(ticket) ? (
      <IconButton
        onClick={(e) => handleOpenMenu(e, ticket)}
        sx={{ color: 'text.secondary' }}
      >
        <Image alt="Actions" height={24} src="/icon/options.svg" width={24} />
      </IconButton>
    ) : (
      <Body2 color="text.secondary" fontSize="14px">
        -
      </Body2>
    );

  const actionMenu = (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleCloseMenu}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      PaperProps={{
        elevation: 1,
        sx: {
          mt: 1,
          '& .MuiMenuItem-root': {
            px: 2,
            py: 1,
            gap: 1.5
          }
        }
      }}
    >
      <MenuItem
        onClick={() => {
          if (activeTicket) onEdit?.(activeTicket);
          handleCloseMenu();
        }}
      >
        <Image alt="Edit" height={20} src="/icon/edit.svg" width={20} />
        <Body2>Edit Ticket</Body2>
      </MenuItem>
      <MenuItem
        onClick={() => {
          if (activeTicket) onEditAdditionalForm?.(activeTicket);
          handleCloseMenu();
        }}
      >
        <Image
          alt="Edit Additional Form"
          height={20}
          src="/icon/file.svg"
          width={20}
        />
        <Body2>Edit Additional Form</Body2>
      </MenuItem>
      <MenuItem
        onClick={() => {
          if (activeTicket) onDelete?.(activeTicket.id);
          handleCloseMenu();
        }}
      >
        <Image alt="Delete" height={20} src="/icon/trash.svg" width={20} />
        <Body2 color="error.main">Delete</Body2>
      </MenuItem>
    </Menu>
  );

  return (
    <>
      <StyledTableContainer sx={{ display: { xs: 'block', lg: 'none' } }}>
        <CollapsibleCardList
          items={tickets}
          getKey={(ticket) => ticket.id}
          loading={loading}
          loadingMessage="Loading tickets..."
          emptyMessage="No tickets found. Add your first ticket category."
          renderTitle={(ticket, index) => `${index + 1}. ${ticket.name}`}
          renderSubtitle={(ticket) => formatPrice(ticket.price)}
          renderTitleMeta={(ticket) =>
            ticket.status ? (
              <StatusBadge
                status={statusMap[ticket.status as keyof typeof statusMap]}
                displayName={ticket.status}
              />
            ) : null
          }
          renderDetails={(ticket) => [
            { label: 'Ticket Name', value: ticket.name },
            {
              label: 'Ticket Price',
              value: (
                <Body2 color="primary.main" fontSize="12px" fontWeight={700}>
                  {formatPrice(ticket.price)}
                </Body2>
              )
            },
            { label: 'Quantity', value: ticket.quantity },
            { label: 'Max. Per User', value: ticket.maxPerUser },
            {
              label: 'Sale Start Date',
              value: dateUtils.formatDateTimeWIB(ticket.salesStartDate)
            },
            {
              label: 'Sale End Date',
              value: dateUtils.formatDateTimeWIB(ticket.salesEndDate)
            },
            ...(ticket.status
              ? [
                  {
                    label: 'Status',
                    value: (
                      <StatusBadge
                        status={
                          statusMap[ticket.status as keyof typeof statusMap]
                        }
                        displayName={ticket.status}
                      />
                    )
                  }
                ]
              : [])
          ]}
          renderActions={renderRowActions}
        />
      </StyledTableContainer>

      <StyledTableContainer sx={{ display: { xs: 'none', lg: 'block' } }}>
        <Table>
          <StyledTableHead>
            <TableRow>
              <TableCell sx={{ width: '4%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  No.
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '24%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Ticket Name
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '12%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Ticket Price
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '8%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Quantity
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '10%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Max. Per User
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '13%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Sale Start Date
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '13%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Sale End Date
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '10%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Status
                </Body2>
              </TableCell>
              <TableCell align="right" sx={{ width: '6%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Action
                </Body2>
              </TableCell>
            </TableRow>
          </StyledTableHead>
          <StyledTableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <Box display="flex" justifyContent="center" padding="40px">
                    <Body2 color="text.secondary">Loading tickets...</Body2>
                  </Box>
                </TableCell>
              </TableRow>
            ) : tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <Box display="flex" justifyContent="center" padding="40px">
                    <Body2 color="text.secondary">
                      No tickets found. Add your first ticket category.
                    </Body2>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket, index) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <Body2 color="text.primary" fontSize="14px">
                      {index + 1}.
                    </Body2>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 0 }}>
                    <Body2
                      color="text.primary"
                      fontSize="14px"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {ticket.name}
                    </Body2>
                  </TableCell>
                  <TableCell>
                    <Body2 color="primary.main" fontSize="14px" fontWeight={700}>
                      {formatPrice(ticket.price)}
                    </Body2>
                  </TableCell>
                  <TableCell>
                    <Body2 color="text.primary" fontSize="14px">
                      {ticket.quantity}
                    </Body2>
                  </TableCell>
                  <TableCell>
                    <Body2 color="text.primary" fontSize="14px">
                      {ticket.maxPerUser}
                    </Body2>
                  </TableCell>
                  <TableCell>
                    <Body2 color="text.primary" fontSize="14px">
                      {dateUtils.formatDateTimeWIB(ticket.salesStartDate)}
                    </Body2>
                  </TableCell>
                  <TableCell>
                    <Body2 color="text.primary" fontSize="14px">
                      {dateUtils.formatDateTimeWIB(ticket.salesEndDate)}
                    </Body2>
                  </TableCell>
                  <TableCell>
                    {ticket?.status ? (
                      <StatusBadge
                        status={statusMap[ticket.status as keyof typeof statusMap]}
                        displayName={ticket.status}
                      />
                    ) : (
                      <Body2 color="text.primary" fontSize="14px">
                        -
                      </Body2>
                    )}
                  </TableCell>
                  <TableCell align="right">{renderRowActions(ticket)}</TableCell>
                </TableRow>
              ))
            )}
          </StyledTableBody>
        </Table>
      </StyledTableContainer>

      {actionMenu}
    </>
  );
};

export default TicketTable;
