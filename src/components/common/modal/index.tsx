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
  onClose: () => void;
  title: string;
  titleSize?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
  height?: number;
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
  return (
    <StyledModal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
    >
      <ModalContent
        width={width}
        height={height}
        padding="16px 24px"
        display="flex"
        flexDirection="column"
      >
        {/* Header */}
        <ModalHeader>
          <Body1 fontSize={titleSize} color="text.primary" fontWeight={700}>
            {title}
          </Body1>
          <Image
            src="/icon/close.svg"
            alt="Close"
            width={24}
            height={24}
            style={{ cursor: 'pointer' }}
            onClick={onClose}
          />
        </ModalHeader>

        {/* Content */}
        <ModalBody>
          {children}
        </ModalBody>

        {/* Footer */}
        {footer && (
          <ModalFooter>
            {footer}
          </ModalFooter>
        )}
      </ModalContent>
    </StyledModal>
  );
}
