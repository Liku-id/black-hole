import { Box, SxProps, Theme } from '@mui/material';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { Body2 } from '@/components/common/typography';

interface DropzoneLiteProps {
  width?: string | number;
  height?: string | number;
  onFileSelect?: (file: File) => void;
  onFileRemove?: () => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  error?: boolean;
  sx?: SxProps<Theme>;
}

const DropzoneLite = ({
  width = '100%',
  height = '60px',
  onFileSelect,
  onFileRemove,
  accept = { 'image/*': ['.png', '.jpg', '.jpeg'] },
  maxSize = 2 * 1024 * 1024, // 2MB
  error = false,
  sx = {}
}: DropzoneLiteProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        onFileSelect?.(file);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false
  });

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onFileRemove?.();
  };

  return (
    <Box
      {...getRootProps()}
      height={height}
      position="relative"
      border="1px solid"
      borderColor={error ? 'error.main' : 'grey.300'}
      borderRadius="4px"
      sx={{
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'all 0.2s ease-in-out',
        backgroundColor: 'common.white',
        '&:hover': {
          backgroundColor: 'grey.50',
          borderColor: error ? 'error.main' : 'primary.main'
        },
        ...sx
      }}
      width={width}
    >
      <input {...getInputProps()} />

      {previewUrl ? (
        <Box
          alignItems="center"
          display="flex"
          height="100%"
          justifyContent="space-between"
          paddingX="16px"
        >
          <Body2 color="text.PRIMARY">Profilepicture.png</Body2>

          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="24px"
            width="24px"
            sx={{
              '& img': {
                filter: 'brightness(0) saturate(100%)',
                opacity: 0.6
              }
            }}
            onClick={handleRemoveFile}
          >
            <Image alt="Remove" height={24} src="/icon/close.svg" width={24} />
          </Box>
        </Box>
      ) : (
        <Box
          alignItems="center"
          display="flex"
          height="100%"
          justifyContent="space-between"
          paddingX="16px"
        >
          <Body2 color="text.secondary">
            max 2 MB. File type: .jpeg / .jpg / .png
          </Body2>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="24px"
            width="24px"
            sx={{
              '& img': {
                filter: 'brightness(0) saturate(100%)',
                opacity: 0.6
              }
            }}
          >
            <Image
              alt="Upload"
              height={20}
              src="/icon/dropzone.svg"
              width={20}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export { DropzoneLite };
