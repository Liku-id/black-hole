import { Box, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Table, TableCell, TableRow } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { Body2, Pagination, StyledTableContainer, StyledTableHead, StyledTableBody } from '@/components/common';
import { StatusBadge } from '@/components/features/events/status-badge';
import { useToast } from '@/contexts/ToastContext';
import { eventsService } from '@/services/events';
import { OTSApproval } from '@/types/event';

import OTSApprovalModal from '../modal';

interface OTSTableProps {
  data: OTSApproval[];
  loading?: boolean;
  total?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onRefresh?: () => void;
}

const OTSTable = ({ data, loading, total = 0, currentPage = 0, onPageChange, onRefresh }: OTSTableProps) => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<OTSApproval | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleActionClick = (event: React.MouseEvent<HTMLButtonElement>, item: OTSApproval) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleEventDetail = () => {
    handleCloseMenu();
    if (selectedItem) {
      // Assuming event details uses the id
      router.push(`/events/${selectedItem.event.metaUrl}`);
    }
  };

  const handleApproveClick = () => {
    handleCloseMenu();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleAction = async (status: 'approved' | 'rejected') => {
    if (!selectedItem) return;

    const id = selectedItem.id;

    if (!id) {
      showError('Request ID is missing');
      return;
    }

    try {
      setIsApproving(true);
      await eventsService.updateOTSStatus(id, status);
      showSuccess(`OTS request ${status} successfully`);

      setIsModalOpen(false);
      setSelectedItem(null);
      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      const errorMessage = error?.message || `Failed to ${status} OTS request`;
      showError(errorMessage);
    } finally {
      setIsApproving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" padding={4}>
        <Body2>Loading...</Body2>
      </Box>
    );
  }

  return (
    <>
      <StyledTableContainer>
        <Table>
          <StyledTableHead>
            <TableRow>
              <TableCell sx={{ width: '10%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  No.
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '50%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Event Name
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '30%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Approval Status
                </Body2>
              </TableCell>
              <TableCell align="right" sx={{ width: '10%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Action
                </Body2>
              </TableCell>
            </TableRow>
          </StyledTableHead>
          <StyledTableBody>
            {data.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Body2 color="text.primary" fontSize="14px">
                    {index + 1}.
                  </Body2>
                </TableCell>
                <TableCell>
                  <Body2 color="text.primary" fontSize="14px">
                    {row.event?.name || row.eventName || row.event_id}
                  </Body2>
                </TableCell>
                <TableCell>
                  <StatusBadge
                    status={row.status}
                    displayName={row.status.toLowerCase() === 'approved' ? 'Approved' : undefined}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    sx={{ color: 'text.secondary', cursor: 'pointer' }}
                    onClick={(e) => handleActionClick(e, row)}
                  >
                    <Image
                      alt="Options"
                      height={24}
                      src="/icon/options.svg"
                      width={24}
                    />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </StyledTableBody>
        </Table>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          total={total}
          pageSize={10}
          onPageChange={onPageChange || (() => { })}
        />
      </StyledTableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: 'common.white',
              boxShadow: '0 4px 20px 0 rgba(40, 72, 107, 0.15)',
              borderRadius: 1,
              minWidth: 200,
              mt: 1
            }
          }
        }}
      >
        <MenuItem
          onClick={handleEventDetail}
          sx={{
            padding: '12px 16px',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 'auto', mr: 2 }}>
            <Image
              alt="Event Detail"
              src="/icon/eye.svg"
              height={18}
              width={18}
            />
          </ListItemIcon>
          <ListItemText
            primary={
              <Body2 color="text.primary" fontSize="14px" fontWeight="400">
                Event Detail
              </Body2>
            }
          />
        </MenuItem>
        {selectedItem?.status !== 'approved' && selectedItem?.status !== 'rejected' && (
          <MenuItem
            onClick={handleApproveClick}
            sx={{
              padding: '12px 16px',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 'auto', mr: 2 }}>
              <Image
                alt="Review Request"
                src="/icon/edit.svg"
                height={18}
                width={18}
              />
            </ListItemIcon>
            <ListItemText
              primary={
                <Body2 color="text.primary" fontSize="14px" fontWeight="400">
                  Review Request
                </Body2>
              }
            />
          </MenuItem>
        )}
      </Menu>

      <OTSApprovalModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onApprove={() => handleAction('approved')}
        onReject={() => handleAction('rejected')}
        eventName={selectedItem?.event?.name || selectedItem?.eventName || selectedItem?.event_id}
        loading={isApproving}
      />
    </>
  );
};

export default OTSTable;
