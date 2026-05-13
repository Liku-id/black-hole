import { Box } from '@mui/material';

import { Select } from '@/components/common';

interface OTSFilterProps {
  status: string;
  onStatusChange: (status: string) => void;
}

const OTSFilter = ({
  status,
  onStatusChange
}: OTSFilterProps) => {
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
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

export default OTSFilter;
