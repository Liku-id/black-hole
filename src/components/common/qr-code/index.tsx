'use client';
import { Box } from '@mui/material';
import Image from 'next/image';
import { toDataURL } from 'qrcode';
import React, { useEffect, useState } from 'react';

import { Body2 } from '../typography';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export const QRCode: React.FC<QRCodeProps> = ({
  value,
  size = 160,
  className = '',
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        setIsLoading(true);
        setError('');

        const qrCodeDataUrl = await toDataURL(value, {
          width: size,
          margin: 0,
        });
        setQrCodeUrl(qrCodeDataUrl);
      } catch (err) {
        setError('Failed to generate QR code');
      } finally {
        setIsLoading(false);
      }
    };

    if (value && value.trim() !== '') {
      generateQRCode();
    } else {
      setIsLoading(false);
      setError('No QR data available');
    }
  }, [value, size]);

  if (isLoading) {
    return (
      <Box
        sx={{ 
          width: size, 
          height: size, 
          bgcolor: 'grey.200',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'pulse 1.5s infinite ease-in-out',
          '@keyframes pulse': {
            '0%': { opacity: 0.6 },
            '50%': { opacity: 1 },
            '100%': { opacity: 0.6 },
          }
        }}
        className={className}
      />
    );
  }

  if (error) {
    return (
      <Box
        sx={{ 
          width: size, 
          height: size, 
          bgcolor: 'grey.50',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        className={className}
      >
        <Body2 color="text.secondary" textAlign="center" fontSize="12px">
          QR code not available
        </Body2>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        width: size,
        height: size
      }} 
      className={className}
    >
      <Image
        src={qrCodeUrl}
        alt="QR Code"
        width={size}
        height={size}
        style={{ height: '100%', width: '100%' }}
      />
    </Box>
  );
};

export default QRCode;
