import { Box, Grid } from '@mui/material';
import { useState, useEffect } from 'react';

import { Body2, Dropzone } from '@/components/common';
import { EventDetail } from '@/types/event';

interface AssetFiles {
  thumbnail?: File;
  supportingImages: (File | null)[];
}

interface AssetChangeInfo {
  files: AssetFiles;
  deletedAssetIds: string[];
  existingAssets: {
    thumbnail?: { id: string; order: number };
    supportingImages: Array<{ id: string; order: number } | null>;
  };
}

interface EventAssetsEditFormProps {
  eventDetail?: EventDetail;
  onFilesChange?: (changeInfo: AssetChangeInfo) => void;
  showError?: boolean;
}

export const EventAssetsEditForm = ({
  eventDetail,
  onFilesChange,
  showError = false
}: EventAssetsEditFormProps) => {
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [supportingImages, setSupportingImages] = useState<(File | null)[]>([
    null,
    null,
    null,
    null
  ]);
  const [deletedAssetIds, setDeletedAssetIds] = useState<string[]>([]);
  const [removedFromDisplay, setRemovedFromDisplay] = useState<{
    thumbnail: boolean;
    supportingImages: boolean[];
  }>({
    thumbnail: false,
    supportingImages: [false, false, false, false]
  });

  // Pre-fill existing images honoring order from backend
  const eventAssets = (eventDetail?.eventAssets || [])
    .slice(0, 5)
    .sort((a, b) => Number(a.order) - Number(b.order));

  const mainEventAsset = eventAssets.find((ea) => Number(ea.order) === 1);
  const sideEventAssets: ((typeof eventAssets)[number] | null)[] = [
    0, 1, 2, 3
  ].map((i) => eventAssets.find((ea) => Number(ea.order) === i + 2) || null);

  // Build existing assets info
  const existingAssets = {
    thumbnail: mainEventAsset ? { id: mainEventAsset.id, order: 1 } : undefined,
    supportingImages: sideEventAssets.map((ea, index) =>
      ea ? { id: ea.id, order: index + 2 } : null
    )
  };

  const notifyChanges = (
    newThumbnail?: File | null,
    newSupportingImages?: (File | null)[],
    newDeletedIds?: string[]
  ) => {
    const currentThumbnail =
      newThumbnail !== undefined ? newThumbnail : thumbnail;
    const currentSupportingImages = newSupportingImages || supportingImages;
    const currentDeletedIds = newDeletedIds || deletedAssetIds;

    onFilesChange?.({
      files: {
        thumbnail: currentThumbnail || undefined,
        supportingImages: currentSupportingImages
      },
      deletedAssetIds: currentDeletedIds,
      existingAssets
    });
  };

  const handleThumbnailSelect = (file: File) => {
    setThumbnail(file);
    // Reset removed state when new file is selected
    if (removedFromDisplay.thumbnail) {
      setRemovedFromDisplay((prev) => ({ ...prev, thumbnail: false }));
    }
    notifyChanges(file);
  };

  const handleThumbnailRemove = () => {
    // If there's an existing thumbnail and we're removing it (not replacing), mark for deletion
    let newDeletedIds = deletedAssetIds;
    let newRemovedFromDisplay = { ...removedFromDisplay };

    if (mainEventAsset && !thumbnail) {
      newDeletedIds = [...deletedAssetIds, mainEventAsset.id];
      setDeletedAssetIds(newDeletedIds);
      newRemovedFromDisplay.thumbnail = true;
      setRemovedFromDisplay(newRemovedFromDisplay);
    }

    setThumbnail(null);
    notifyChanges(null, undefined, newDeletedIds);
  };

  const handleSupportingImageSelect = (index: number, file: File) => {
    const newSupportingImages = [...supportingImages];
    newSupportingImages[index] = file;
    setSupportingImages(newSupportingImages);

    // Reset removed state when new file is selected
    if (removedFromDisplay.supportingImages[index]) {
      const newRemovedFromDisplay = { ...removedFromDisplay };
      newRemovedFromDisplay.supportingImages[index] = false;
      setRemovedFromDisplay(newRemovedFromDisplay);
    }

    notifyChanges(undefined, newSupportingImages);
  };

  const handleSupportingImageRemove = (index: number) => {
    // If there's an existing asset and we're removing it, mark for deletion
    let newDeletedIds = deletedAssetIds;
    let newRemovedFromDisplay = { ...removedFromDisplay };
    const existingEventAsset = sideEventAssets[index];

    if (existingEventAsset && !supportingImages[index]) {
      newDeletedIds = [...deletedAssetIds, existingEventAsset.id];
      setDeletedAssetIds(newDeletedIds);
      newRemovedFromDisplay.supportingImages[index] = true;
      setRemovedFromDisplay(newRemovedFromDisplay);
    }

    const newSupportingImages = [...supportingImages];
    newSupportingImages[index] = null;
    setSupportingImages(newSupportingImages);
    notifyChanges(undefined, newSupportingImages, newDeletedIds);
  };

  // Initialize form with existing assets
  useEffect(() => {
    if (eventDetail) {
      notifyChanges();
    }
  }, [eventDetail]);

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
            error={showError}
            existingFileUrl={
              !thumbnail && !removedFromDisplay.thumbnail
                ? mainEventAsset?.asset.url
                : undefined
            }
            height="354px"
            maxSize={2 * 1024 * 1024} // 2MB
            order={1}
            width="100%"
            onFileRemove={handleThumbnailRemove}
            onFileSelect={handleThumbnailSelect}
          />
        </Grid>

        {/* Four Small Dropzones - Right Side */}
        <Grid item md={6} xs={12}>
          <Grid container spacing="16px">
            {Array.from({ length: 4 }).map((_, index) => {
              const existingEventAsset = sideEventAssets[index];
              const hasNewFile = supportingImages[index];

              return (
                <Grid key={index} item xs={6}>
                  <Dropzone
                    accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
                    existingFileUrl={
                      !hasNewFile && !removedFromDisplay.supportingImages[index]
                        ? existingEventAsset?.asset.url
                        : undefined
                    }
                    height="169px"
                    maxSize={2 * 1024 * 1024} // 2MB
                    order={index + 2}
                    width="100%"
                    onFileRemove={() => handleSupportingImageRemove(index)}
                    onFileSelect={(file) =>
                      handleSupportingImageSelect(index, file)
                    }
                  />
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};
