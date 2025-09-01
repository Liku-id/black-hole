import { Box, SxProps, Theme } from '@mui/material';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { Caption, Overline } from '@/components/common/typography';

interface DropzoneProps {
  width?: string | number;
  height?: string | number;
  onFileSelect?: (file: File) => void;
  onFileRemove?: () => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  order?: number;
  error?: boolean;
  sx?: SxProps<Theme>;
}

const Dropzone = ({
  width = '100%',
  height = '200px',
  onFileSelect,
  onFileRemove,
  accept = { 'image/*': ['.png', '.jpg', '.jpeg'] },
  maxSize = 2 * 1024 * 1024, // 2MB
  order,
  error = false,
  sx = {}
}: DropzoneProps) => {
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
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
       borderColor={error ? 'error.main' : 'grey.100'}
       sx={{
         cursor: 'pointer',
         overflow: 'hidden',
         transition: 'all 0.2s ease-in-out',
         '&:hover': {
           backgroundColor: 'primary.light',
           borderColor: error ? 'error.main' : 'primary.main'
         },
         ...sx
       }}
      width={width}
    >
      <input {...getInputProps()} />

      {previewUrl ? (
        <>
          <Image
            fill
            alt="Preview"
            src={previewUrl}
            style={{ objectFit: 'cover' }}
          />
          {order && (
            <Box
              height="24px"
              left="16px"
              position="absolute"
              sx={{
                backgroundColor: 'primary.main',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              top="16px"
              width="24px"
              zIndex={2}
            >
              <Caption color="common.white" fontWeight={600}>
                {order}
              </Caption>
            </Box>
          )}
          <Box
            height="24px"
            position="absolute"
            right="16px"
            sx={{
              cursor: 'pointer'
            }}
            top="16px"
            width="24px"
            zIndex={1}
            onClick={handleRemoveFile}
          >
            <Image alt="Remove" height={24} src="/icon/close.svg" width={24} />
          </Box>
        </>
      ) : (
        <>
          {order && (
            <Box
              height="24px"
              left="16px"
              position="absolute"
              alignItems="center"
              justifyContent="center"
              borderRadius="50%"
              display="flex"
              top="16px"
              width="24px"
              zIndex={1}
              sx={{
                backgroundColor: 'primary.main'
              }}
            >
              <Caption color="common.white" fontWeight={600}>
                {order}
              </Caption>
            </Box>
          )}
          <Box
            alignItems="center"
            display="flex"
            flexDirection="column"
            height="100%"
            justifyContent="center"
            paddingX="24px"
          >
            <Box marginBottom="16px">
              <Image
                alt="Upload"
                height={24}
                src="/icon/dropzone.svg"
                width={24}
              />
            </Box>
            <Caption
              color="text.primary"
              marginBottom="16px"
              textAlign="center"
            >
              Click or drag file to this area to upload{' '}
              {order === 1 ? 'thumbnail' : 'supporting'} image
            </Caption>
            <Overline color="text.secondary" textAlign="center">
              Suggestion resolution: 630x354px, 300 DPI, size max: 2MB
            </Overline>
          </Box>
        </>
      )}
    </Box>
  );
};

export { Dropzone };
