import { ErrorOutline } from '@mui/icons-material';
import { Box, Chip, Grid } from '@mui/material';
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

  // Sort assets by order
  const sortedAssets = assetsSource.sort(
    (a, b) => Number(a.order) - Number(b.order)
  );

  // Get thumbnail (order 1)
  const mainEventAsset = sortedAssets.find((ea) => Number(ea.order) === 1);

  // Get all supporting images from assets (order >= 2), take first 4
  // This handles cases where there are multiple items with same order
  const supportingImagesFromAssets = sortedAssets
    .filter((ea) => Number(ea.order) >= 2)
    .slice(0, 4);

  // Create an array with 4 slots (for orders 2, 3, 4, 5)
  // Fill slots sequentially with available supporting images
  const sideEventAssetsArray: ((typeof sortedAssets)[number] | null)[] = [];
  for (let i = 0; i < 4; i++) {
    sideEventAssetsArray.push(supportingImagesFromAssets[i] || null);
  }

  // Helper to check if a given asset (by assetId) was rejected
  const isAssetRejected = (assetId?: string) =>
    !!assetId && rejectedAssetIds.includes(assetId);

  const getSectionStatusChip = () => {
    return (
      <Chip
        icon={<ErrorOutline />}
        label="Rejected"
        size="small"
        color="error"
      />
    );
  };

  // Get status chip for individual assets based on assetId
  const getAssetStatusChip = (assetId?: string) => {
    if (!assetId || !isAssetRejected(assetId)) return null;
    return getSectionStatusChip();
  };

  // Check if we should use .id instead of .eventAssetId
  // If eventStatus is 'on_going' and eventAssetChanges[0].status is 'rejected', use .id
  const shouldUseIdForOperations =
    (eventDetail?.eventStatus === 'on_going' ||
      eventDetail?.eventStatus === 'approved') &&
    eventAssetChanges &&
    eventAssetChanges.length > 0 &&
    eventAssetChanges[0].status === 'rejected';

  // Build existing assets info
  // Store event asset record IDs (join table IDs) for update operations
  // For eventAssets: use .id (event asset record ID)
  // For eventAssetChanges.items:
  //   - If on_going + rejected: use .id (event asset change item ID)
  //   - Otherwise: use .eventAssetId (event asset record ID)
  // Note: If eventAssetId is empty string, treat as new asset (will use POST, not PUT)
  // supportingImages array indices: 0=order2, 1=order3, 2=order4, 3=order5
  const existingAssets = {
    thumbnail: mainEventAsset
      ? {
          id: mainEventAsset.assetId, // Keep assetId for comparison purposes
          eventAssetId: shouldUseIdForOperations
            ? (mainEventAsset as any).id // Use .id for on_going + rejected
            : eventAssetChanges && eventAssetChanges.length > 0
              ? mainEventAsset.eventAssetId || (mainEventAsset as any).id // From eventAssetChanges.items, fallback to .id if empty
              : (mainEventAsset as any).id, // From eventAssets - use .id (event asset record ID)
          order: 1
        }
      : undefined,
    supportingImages: sideEventAssetsArray.map((ea, index) =>
      ea
        ? {
            id: ea.assetId, // Keep assetId for comparison purposes
            eventAssetId: shouldUseIdForOperations
              ? (ea as any).id // Use .id for on_going + rejected
              : eventAssetChanges && eventAssetChanges.length > 0
                ? ea.eventAssetId || (ea as any).id // From eventAssetChanges.items, fallback to .id if empty
                : (ea as any).id, // From eventAssets - use .id (event asset record ID)
            order: index + 2 // Position index maps to order: index 0 = order 2, index 1 = order 3, etc.
          }
        : null
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
      // Use .id if on_going + rejected, otherwise use .eventAssetId or .id
      const eventAssetIdToDelete = shouldUseIdForOperations
        ? (mainEventAsset as any).id // Use .id for on_going + rejected
        : eventAssetChanges && eventAssetChanges.length > 0
          ? mainEventAsset.eventAssetId // From eventAssetChanges.items
          : (mainEventAsset as any).id; // From eventAssets - use .id (event asset record ID)
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
      // Use .id if on_going + rejected, otherwise use .eventAssetId or .id
      const eventAssetIdToDelete = shouldUseIdForOperations
        ? (existingEventAsset as any).id // Use .id for on_going + rejected
        : eventAssetChanges && eventAssetChanges.length > 0
          ? existingEventAsset.eventAssetId // From eventAssetChanges.items
          : (existingEventAsset as any).id; // From eventAssets - use .id (event asset record ID)
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
          <Box marginBottom="8px">
            {getAssetStatusChip(mainEventAsset?.assetId)}
          </Box>
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
                  <Box marginTop="4px">
                    {getAssetStatusChip(existingEventAsset?.assetId)}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};
