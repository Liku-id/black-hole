import { Box, styled } from '@mui/material';
import { FC, useEffect } from 'react';

import { H3 } from '../typography';

const PopupOverlay = styled(Box)<{ open: boolean }>(({ open }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: open ? 'flex' : 'none',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1300,
  overflow: 'auto',
  padding: '20px'
}));

const PopupContent = styled(Box)(() => ({
  position: 'relative',
  backgroundColor: '#FFFFFF',
  borderRadius: 0,
  outline: 'none',
  maxWidth: '90%',
  maxHeight: '90vh',
  overflow: 'auto',
  boxShadow: '0 4px 20px 0 rgba(40, 72, 107, 0.15)'
}));

const PopupHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: '24px'
});

const PopupBody = styled(Box)({
  flex: 1,
  overflow: 'auto'
});

const PopupFooter = styled(Box)({
  marginTop: '16px'
});

interface PopupProps {
  open: boolean;
  onClose: () => void;
  title: string;
  titleSize?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
  height?: number;
}

export const Popup: FC<PopupProps> = ({
  open,
  onClose,
  title,
  titleSize = '22px',
  children,
  footer,
  width = 443,
  height = 332
}) => {
  // Prevent body scroll when popup is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <PopupOverlay open={open} onClick={onClose}>
      <PopupContent
        display="flex"
        flexDirection="column"
        height={height}
        padding="16px 24px"
        width={width}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <PopupHeader>
          <H3 color="text.primary" fontSize={titleSize} fontWeight={700}>
            {title}
          </H3>
        </PopupHeader>

        {/* Content */}
        <PopupBody>{children}</PopupBody>

        {/* Footer */}
        {footer && <PopupFooter>{footer}</PopupFooter>}
      </PopupContent>
    </PopupOverlay>
  );
};

export default Popup;
