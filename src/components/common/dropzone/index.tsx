import { Box, SxProps, Theme } from '@mui/material';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { Caption, Overline } from '@/components/common/typography';

interface DropzoneProps {
  id?: string;
  width?: string | number;
  height?: string | number;
  onFileSelect?: (file: File) => void;
  onFileRemove?: () => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  order?: number;
  error?: boolean;
  sx?: SxProps<Theme>;
  existingFileUrl?: string;
  style?: React.CSSProperties;
}

const Dropzone = ({
  id,
  width = '100%',
  height = '200px',
  onFileSelect,
  onFileRemove,
  accept = { 'image/*': ['.png', '.jpg', '.jpeg'] },
  maxSize,
  order,
  error = false,
  sx = {},
  existingFileUrl,
  style
}: DropzoneProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Use existing file URL if no new file is selected
  const displayUrl = previewUrl || existingFileUrl;

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

  const isSupportingImage = order != null && order > 1;

  return (
    <Box
      id={id}
      {...getRootProps()}
      border="1px solid"
      borderColor={error ? 'error.main' : 'grey.100'}
      height={height}
      position="relative"
      style={style}
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

      {displayUrl ? (
        <>
          <Image
            fill
            alt="Preview"
            src={displayUrl}
            style={{ objectFit: 'cover' }}
            unoptimized={!!existingFileUrl && !previewUrl}
          />
          {order && (
            <Box
              height={{ xs: '20px', sm: '24px' }}
              left={{ xs: '8px', sm: '16px' }}
              position="absolute"
              sx={{
                backgroundColor: 'primary.main',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              top={{ xs: '8px', sm: '16px' }}
              width={{ xs: '20px', sm: '24px' }}
              zIndex={2}
            >
              <Caption color="common.white" fontWeight={600} sx={{ fontSize: { xs: '10px', sm: '12px' } }}>
                {order}
              </Caption>
            </Box>
          )}
          <Box
            id="clear_icon"
            height="40px"
            position="absolute"
            right="8px"
            sx={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            top="8px"
            width="40px"
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
              alignItems="center"
              borderRadius="50%"
              display="flex"
              height={{ xs: '20px', sm: '24px' }}
              justifyContent="center"
              left={{ xs: '8px', sm: '16px' }}
              position="absolute"
              sx={{
                backgroundColor: 'primary.main'
              }}
              top={{ xs: '8px', sm: '16px' }}
              width={{ xs: '20px', sm: '24px' }}
              zIndex={1}
            >
              <Caption color="common.white" fontWeight={600} sx={{ fontSize: { xs: '10px', sm: '12px' } }}>
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
            paddingX={{ xs: '8px', sm: isSupportingImage ? '12px' : '24px', lg: '24px' }}
            paddingY={{ xs: '8px', sm: isSupportingImage ? '6px' : 0 }}
            sx={{ overflow: 'hidden' }}
          >
            <Box marginBottom={{ xs: '8px', sm: isSupportingImage ? '6px' : '16px', lg: '16px' }}>
              <Image
                alt="Upload"
                height={24}
                src="/icon/dropzone.svg"
                width={24}
              />
            </Box>
            <Caption
              color="text.primary"
              marginBottom={{ xs: '4px', sm: isSupportingImage ? '4px' : '16px', lg: '16px' }}
              textAlign="center"
              sx={{
                fontSize: { xs: '10px', sm: isSupportingImage ? '11px' : '12px' },
                lineHeight: { xs: 1.3, sm: 1.4 },
                display: '-webkit-box',
                WebkitLineClamp: { xs: 3, md: isSupportingImage ? 2 : 'unset', lg: 'unset' },
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {order === 1
                ? 'Click or drag file to upload thumbnail'
                : 'Click or drag file to upload image'}
            </Caption>
            <Overline
              color="text.secondary"
              textAlign="center"
              sx={{
                display: {
                  xs: 'none',
                  md: isSupportingImage ? 'none' : 'block',
                  lg: 'block'
                },
                fontSize: isSupportingImage ? '10px' : undefined,
                lineHeight: 1.3
              }}
            >
              Suggestion resolution: 630x354px, 300 DPI, size max: 2MB
            </Overline>
          </Box>
        </>
      )}
    </Box>
  );
};

export { Dropzone };
