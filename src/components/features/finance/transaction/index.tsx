import { Box, useTheme } from '@mui/material';
import { useState } from 'react';

import { Body1, Button } from '@/components/common';

import { ExportModal } from './export-modal';
import { FinanceTransactionTable } from './table';

const FinanceTransaction = () => {
  const theme = useTheme();

  const [openExportModal, setOpenExportModal] = useState<boolean>(false);

  return (
    <Box bgcolor="background.paper" padding="16px 20px">
      <Box
        borderBottom={`1px solid ${theme.palette.grey[100]}`}
        paddingBottom="16px"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Body1 fontWeight={600}>Event Transaction Detail</Body1>
        <Button
          id="export_button"
          sx={{ fontSize: '12px', padding: '12px 18px' }}
          onClick={() => setOpenExportModal(true)}
        >
          Export
        </Button>
      </Box>
      <FinanceTransactionTable />

      {/* Export Modal */}
      <ExportModal
        open={openExportModal}
        onClose={() => setOpenExportModal(false)}
      />
    </Box>
  );
};

export default FinanceTransaction;
