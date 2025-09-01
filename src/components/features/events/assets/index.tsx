import { Box, Grid } from '@mui/material';
import { useState } from 'react';

import { Body2, Dropzone } from '@/components/common';

interface AssetFiles {
  thumbnail?: File;
  supportingImages: (File | null)[];
}

interface EventAssetsFormProps {
  onFilesChange?: (files: AssetFiles) => void;
  showError?: boolean;
}

export const EventAssetsForm = ({ onFilesChange, showError = false }: EventAssetsFormProps) => {
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [supportingImages, setSupportingImages] = useState<(File | null)[]>([
    null,
    null,
    null,
    null
  ]);

  const handleThumbnailSelect = (file: File) => {
    setThumbnail(file);
    onFilesChange?.({
      thumbnail: file,
      supportingImages
    });
  };

  const handleThumbnailRemove = () => {
    setThumbnail(null);
    onFilesChange?.({
      thumbnail: null,
      supportingImages
    });
  };

  const handleSupportingImageSelect = (index: number, file: File) => {
    const newSupportingImages = [...supportingImages];
    newSupportingImages[index] = file;
    setSupportingImages(newSupportingImages);
    onFilesChange?.({
      thumbnail,
      supportingImages: newSupportingImages
    });
  };

  const handleSupportingImageRemove = (index: number) => {
    const newSupportingImages = [...supportingImages];
    newSupportingImages[index] = null;
    setSupportingImages(newSupportingImages);
    onFilesChange?.({
      thumbnail,
      supportingImages: newSupportingImages
    });
  };

  return (
    <Box>
      {/* Event Thumbnail Section */}
      <Body2 color="text.primary" marginBottom="16px">
        Event Thumbnail*
      </Body2>

      {/* Dropzone Layout */}
      <Grid container marginBottom="24px" spacing="16px">
        {/* Large Dropzone - Left Side */}
        <Grid item md={6} xs={12}>
          <Dropzone
            accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
            height="354px"
            maxSize={2 * 1024 * 1024} // 2MB
            order={1}
            width="100%"
            onFileSelect={handleThumbnailSelect}
            onFileRemove={handleThumbnailRemove}
            error={showError && !thumbnail}
          />
        </Grid>

        {/* Four Small Dropzones - Right Side */}
        <Grid item md={6} xs={12}>
          <Grid container spacing="16px">
            {Array.from({ length: 4 }).map((_, index) => (
              <Grid key={index} item xs={6}>
                <Dropzone
                  accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
                  height="169px"
                  maxSize={2 * 1024 * 1024} // 2MB
                  order={index + 2}
                  width="100%"
                  onFileSelect={(file) =>
                    handleSupportingImageSelect(index, file)
                  }
                  onFileRemove={() => handleSupportingImageRemove(index)}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};
