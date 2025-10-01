import { Box } from '@mui/material';

import { Select } from '@/components/common';

interface WithdrawalFilterProps {
  status: string;
  onStatusChange: (status: string) => void;
}

const WithdrawalFilter = ({
  status,
  onStatusChange
}: WithdrawalFilterProps) => {
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' }
  ];

  return (
    <Box display="flex" gap={2} alignItems="center">
      <Select
        options={statusOptions}
        value={status}
        onChange={(value) => onStatusChange(value)}
        sx={{ minWidth: 300 }}
      />
    </Box>
  );
};

export default WithdrawalFilter;
