import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { Body2, H3 } from '@/components/common';
import { WithdrawalHistoryItem } from '@/services/withdrawal';
import { formatUtils } from '@/utils/formatUtils';
import { dateUtils } from '@/utils/dateUtils';

interface WithdrawalDetailModalProps {
  open: boolean;
  onClose: () => void;
  withdrawal: WithdrawalHistoryItem | null;
}

const WithdrawalDetailModal: React.FC<WithdrawalDetailModalProps> = ({
  open,
  onClose,
  withdrawal
}) => {
  if (!withdrawal) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 0,
          padding: 0
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 24px 0 24px'
        }}
        marginBottom={3}
      >
        <H3>Detail Withdrawal</H3>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              color: 'text.primary',
              backgroundColor: 'grey.100'
            }
          }}
        >
          <CloseIcon fontSize="medium" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: '24px' }}>
        <Box display="flex" flexDirection="column" gap={2}>
          {/* Request ID */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            marginBottom={1}
          >
            <Body2 color="text.secondary" fontSize="14px">
              Request ID:
            </Body2>
            <Body2 fontSize="14px">{withdrawal.withdrawalId}</Body2>
          </Box>

          {/* Event Organizer */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            marginBottom={1}
          >
            <Body2 color="text.secondary" fontSize="14px">
              Event Organizer:
            </Body2>
            <Body2 fontSize="14px">{withdrawal.createdBy}</Body2>
          </Box>

          {/* Event Name */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            marginBottom={1}
          >
            <Body2 color="text.secondary" fontSize="14px">
              Event Name:
            </Body2>
            <Body2 fontSize="14px">{withdrawal.eventName}</Body2>
          </Box>

          {/* Withdrawal Name */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            marginBottom={1}
          >
            <Body2 color="text.secondary" fontSize="14px">
              Withdrawal Name:
            </Body2>
            <Body2 fontSize="14px">{withdrawal.accountHolderName}</Body2>
          </Box>

          {/* Submission Date */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            marginBottom={1}
          >
            <Body2 color="text.secondary" fontSize="14px">
              Submission Date:
            </Body2>
            <Body2 fontSize="14px">
              {dateUtils.formatDateDDMMYYYY(withdrawal.createdAt)}
            </Body2>
          </Box>

          {/* Amount Requested */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            marginBottom={1}
          >
            <Body2 color="text.secondary" fontSize="14px">
              Amount Requested:
            </Body2>
            <Body2 fontSize="14px" color="primary.main">
              {formatUtils.formatPrice(parseFloat(withdrawal.requestedAmount))}
            </Body2>
          </Box>

          {/* Bank Name */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            marginBottom={1}
          >
            <Body2 color="text.secondary" fontSize="14px">
              Bank Name:
            </Body2>
            <Body2 fontSize="14px">{withdrawal.bankName}</Body2>
          </Box>

          {/* Bank Account Number */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            marginBottom={1}
          >
            <Body2 color="text.secondary" fontSize="14px">
              Bank Account Number:
            </Body2>
            <Body2 fontSize="14px">{withdrawal.accountNumber}</Body2>
          </Box>

          {/* Bank Account Name Holder */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            marginBottom={1}
          >
            <Body2 color="text.secondary" fontSize="14px">
              Bank Account Name Holder:
            </Body2>
            <Body2 fontSize="14px">{withdrawal.accountHolderName}</Body2>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ padding: '0 24px 24px 24px' }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark'
            }
          }}
        >
          Back
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default WithdrawalDetailModal;
