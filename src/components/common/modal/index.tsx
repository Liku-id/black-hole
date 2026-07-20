import { Box, IconButton, Modal, styled } from '@mui/material';
import Image from 'next/image';

import { Body1, H3 } from '../typography';

const StyledModal = styled(Modal)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1300
});

const ModalContent = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: '#FFFFFF',
  outline: 'none',
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '100%',
  maxHeight: '90vh',
  [theme.breakpoints.down('md')]: {
    width: '80% !important',
    maxWidth: '600px',
    height: 'auto !important',
    borderRadius: '8px'
  },
  [theme.breakpoints.down('sm')]: {
    width: '95% !important',
    maxWidth: '400px',
    height: 'auto !important',
    borderRadius: '8px'
  }
}));

const ModalHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
  gap: '12px',
  flexShrink: 0,
  minWidth: 0
});

const ModalBody = styled(Box)({
  flex: 1,
  overflowY: 'auto',
  minHeight: 0
});

const ModalFooter = styled(Box)({
  marginTop: '16px',
  flexShrink: 0
});

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title: string;
  titleSize?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
  height?: number | string;
}

export default function CustomModal({
  open,
  onClose,
  title,
  titleSize = '22px',
  children,
  footer,
  width = 443,
  height = 332
}: ModalProps) {
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <StyledModal
      aria-labelledby="modal-title"
      open={open}
      onClose={handleClose}
    >
      <ModalContent
        display="flex"
        flexDirection="column"
        height={height}
        padding={{ xs: '16px 16px', sm: '16px 24px' }}
        width={width}
      >
        <ModalHeader>
          <Box minWidth={0} flex={1} overflow="hidden">
            {titleSize === '22px' ? (
              <H3
                color="text.primary"
                fontWeight={700}
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {title}
              </H3>
            ) : (
              <Body1
                color="text.primary"
                fontSize={titleSize}
                fontWeight={700}
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {title}
              </Body1>
            )}
          </Box>
          {onClose && (
            <IconButton
              aria-label="Close"
              onClick={onClose}
              sx={{ width: 40, height: 40, flexShrink: 0 }}
            >
              <Image alt="Close" height={24} src="/icon/close.svg" width={24} />
            </IconButton>
          )}
        </ModalHeader>

        <ModalBody>{children}</ModalBody>

        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </StyledModal>
  );
}
