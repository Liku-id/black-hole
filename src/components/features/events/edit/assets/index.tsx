import { Box, Grid } from '@mui/material';
import { useState, useEffect } from 'react';

import { Body2, Dropzone } from '@/components/common';
import { EventDetail, EventAssetChange } from '@/types/event';

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
  eventAssetChanges?: EventAssetChange[];
  onFilesChange?: (changeInfo: AssetChangeInfo) => void;
  showError?: boolean;
  rejectedAssetIds?: string[];
  rejectionReason?: string;
}

export const EventAssetsEditForm = ({
  eventDetail,
  eventAssetChanges,
  onFilesChange,
  showError = false,
  rejectedAssetIds = [],
  rejectionReason
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
  // Use eventAssetChanges if provided (for rejected events), otherwise use eventAssets
  let assetsSource;
  if (eventAssetChanges && eventAssetChanges.length > 0) {
    // Extract items from eventAssetChanges structure
    const firstChange = eventAssetChanges[0];
    assetsSource = firstChange.items || [];
  } else {
    assetsSource = eventDetail?.eventAssets || [];
  }
  
  const eventAssets = assetsSource
    .slice(0, 5)
    .sort((a, b) => Number(a.order) - Number(b.order));

  const mainEventAsset = eventAssets.find((ea) => Number(ea.order) === 1);
  
  // Create an array with 4 slots (for orders 2, 3, 4, 5)
  // Place each asset at the position corresponding to its order
  // Position index 0 = order 2, index 1 = order 3, index 2 = order 4, index 3 = order 5
  const sideEventAssetsArray: ((typeof eventAssets)[number] | null)[] = [];
  for (let i = 0; i < 4; i++) {
    const targetOrder = i + 2; // orders 2, 3, 4, 5
    const asset = eventAssets.find((ea) => Number(ea.order) === targetOrder) || null;
    sideEventAssetsArray.push(asset);
  }

  // Helper to check if a given asset (by assetId) was rejected
  const isAssetRejected = (assetId?: string) =>
    !!assetId && rejectedAssetIds.includes(assetId);

  // Build existing assets info
  // Store event asset record IDs (join table IDs) for update operations
  // Handle both eventAssets (ea.assetId) and eventAssetChanges.items (ea.eventAssetId) structures
  // supportingImages array indices: 0=order2, 1=order3, 2=order4, 3=order5
  const existingAssets = {
    thumbnail: mainEventAsset ? { 
      id: mainEventAsset.assetId, 
      eventAssetId: mainEventAsset.eventAssetId || mainEventAsset.assetId, 
      order: 1 
    } : undefined,
    supportingImages: sideEventAssetsArray.map((ea, index) =>
      ea ? { 
        id: ea.assetId, 
        eventAssetId: ea.eventAssetId || ea.assetId, 
        order: index + 2 // Position index maps to order: index 0 = order 2, index 1 = order 3, etc.
      } : null
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
      // Use eventAssetId (or fall back to assetId) for both eventAssets and eventAssetChanges.items structures
      const eventAssetIdToDelete = mainEventAsset.eventAssetId || mainEventAsset.assetId;
      newDeletedIds = [...deletedAssetIds, eventAssetIdToDelete];
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
    const existingEventAsset = sideEventAssetsArray[index];

    if (existingEventAsset && !supportingImages[index]) {
      // Use eventAssetId (or fall back to assetId) for both eventAssets and eventAssetChanges.items structures
      const eventAssetIdToDelete =
        existingEventAsset.eventAssetId || existingEventAsset.assetId;
      newDeletedIds = [...deletedAssetIds, eventAssetIdToDelete];
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
      {/* Rejection banner */}
      {rejectionReason && (
        <Box mb={2}>
          <Box
            border="1px solid"
            borderColor="error.main"
            borderRadius={1}
            p="12px 16px"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              backgroundColor: 'error.light',
              borderLeft: '4px solid',
              borderLeftColor: 'error.main'
            }}
          >
            <Body2 color="error.dark" fontWeight={500}>
              Rejection Reason:
            </Body2>
            <Body2 color="text.primary">{rejectionReason}</Body2>
          </Box>
        </Box>
      )}

      {/* Event Thumbnail Section */}
      <Body2 color="text.primary" marginBottom="16px">
        Event Thumbnail*
      </Body2>
      {isAssetRejected(mainEventAsset?.assetId) && (
        <Body2 color="error.main" marginBottom="8px">
          Rejected
        </Body2>
      )}

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
              const existingEventAsset = sideEventAssetsArray[index];
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
                    order={index + 2}
                    width="100%"
                    onFileRemove={() => handleSupportingImageRemove(index)}
                    onFileSelect={(file) =>
                      handleSupportingImageSelect(index, file)
                    }
                  />
                  {isAssetRejected(existingEventAsset?.assetId) && (
                    <Body2 color="error.main" marginTop="4px">
                      Rejected
                    </Body2>
                  )}
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};
