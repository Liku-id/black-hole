import { Box } from '@mui/material';

import { Overline } from '@/components/common';

interface StatusBadgeProps {
  status: string;
}

const getStatusStyle = (value: string) => {
  const statusLower = (value || '').toLowerCase();

  switch (statusLower) {
    case 'on_going':
      return {
        backgroundColor: 'success.light',
        color: 'success.main',
        displayName: 'Ongoing'
      };
    case 'approved':
      return {
        backgroundColor: 'info.light',
        color: 'info.main',
        displayName: 'Upcoming'
      };
    case 'rejected':
      return {
        backgroundColor: 'warning.light',
        color: 'warning.main',
        displayName: 'Rejected'
      };
    case 'on_review':
      return {
        backgroundColor: 'error.light',
        color: 'error.main',
        displayName: 'On Review'
      };
    case 'pending':
      return {
        backgroundColor: 'warning.light',
        color: 'warning.main',
        displayName: 'Pending'
      };
    default:
      return {
        backgroundColor: 'info.dark',
        color: 'info.contrastText',
        displayName: 'Draft'
      };
  }
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusConfig = getStatusStyle(status);

  return (
    <Box
      bgcolor={statusConfig.backgroundColor}
      borderRadius="10px"
      color={statusConfig.color}
      component="span"
      display="inline-flex"
      padding="3px 7px"
    >
      <Overline>{statusConfig.displayName}</Overline>
    </Box>
  );
};
