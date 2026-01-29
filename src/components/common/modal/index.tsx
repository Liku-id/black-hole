import { Box, Modal, styled } from '@mui/material';
import Image from 'next/image';

import { Body1 } from '@/components/common';

const StyledModal = styled(Modal)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1300
});

const ModalContent = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: '#FFFFFF',
  outline: 'none'
});

const ModalHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px'
});

const ModalBody = styled(Box)({
  flex: 1,
  overflow: 'auto'
});

const ModalFooter = styled(Box)({
  marginTop: '16px'
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
        padding="16px 24px"
        width={width}
      >
        {/* Header */}
        <ModalHeader>
          <Body1 color="text.primary" fontSize={titleSize} fontWeight={700}>
            {title}
          </Body1>
          {onClose && (
            <Image
              alt="Close"
              height={24}
              src="/icon/close.svg"
              style={{ cursor: 'pointer' }}
              width={24}
              onClick={onClose}
            />
          )}
        </ModalHeader>

        {/* Content */}
        <ModalBody>{children}</ModalBody>

        {/* Footer */}
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </StyledModal>
  );
}
