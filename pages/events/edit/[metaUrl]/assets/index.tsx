import { Box } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import { withAuth } from '@/components/Auth/withAuth';
import { Button, Card, Caption, H2, Overline, Body2 } from '@/components/common';
import { EventAssetsEditForm } from '@/components/features/events/edit/assets';
import { useEventDetail } from '@/hooks/features/events/useEventDetail';
import DashboardLayout from '@/layouts/dashboard';
import { assetsService, eventsService } from '@/services';

interface AssetFiles {
  thumbnail?: File;
  supportingImages: (File | null)[];
}

interface AssetChangeInfo {
  files: AssetFiles;
  deletedAssetIds: string[];
  existingAssets: {
    thumbnail?: { id: string; eventAssetId: string; order: number };
    supportingImages: Array<{
      id: string;
      eventAssetId: string;
      order: number;
    } | null>;
  };
}

const EditAssetsPage = () => {
  const router = useRouter();
  const { metaUrl } = router.query;
  const { eventDetail } = useEventDetail(metaUrl as string);
  const [assetChangeInfo, setAssetChangeInfo] =
    useState<AssetChangeInfo | null>(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [progress, setProgress] = useState<string>('');

  // Ensure hooks are not called conditionally; redirect when ready
  useEffect(() => {
    if (!router.isReady) return;
  }, [router.isReady]);

  // Prevent hydration error by checking if router is ready
  if (!router.isReady) {
    return null;
  }

  const handleFilesChange = (changeInfo: AssetChangeInfo) => {
    setAssetChangeInfo(changeInfo);
  };

  const validateFileSize = (file: File): boolean => {
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    return file.size <= maxSize;
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:image/jpeg;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmitEvent = async () => {
    if (!metaUrl || !eventDetail || !assetChangeInfo) {
      return;
    }

    // Validate rejected assets for on_going/approved events with rejected Updated Assets or rejected events
    const hasRejectedUpdates =
      (eventDetail.eventStatus === 'on_going' ||
        eventDetail.eventStatus === 'approved') &&
      eventDetail.eventAssetChanges &&
      eventDetail.eventAssetChanges.length > 0 &&
      eventDetail.eventAssetChanges[0].status === 'rejected';
    
    const isRejectedEvent = eventDetail.eventStatus === 'rejected';
    
    if (hasRejectedUpdates || isRejectedEvent) {
      let firstAssetChange;
      let rejectedAssetIds: string[] = [];
      
      if (isRejectedEvent) {
        // For rejected events, get rejected info from eventAssetChanges[0]
        firstAssetChange = eventDetail.eventAssetChanges?.[0];
        rejectedAssetIds = firstAssetChange?.rejectedFields || [];
      } else {
        // For on_going events with rejected Updated Assets
        firstAssetChange = eventDetail.eventAssetChanges[0];
        rejectedAssetIds = firstAssetChange.rejectedFields || [];
      }
      
      if (rejectedAssetIds.length > 0) {
        // Map rejected assetIds to their order positions
        const rejectedAssetPositions = new Map<number, string>(); // order -> assetId
        
        // Try to map from eventAssetChanges.items first
        if (firstAssetChange && firstAssetChange.items) {
          firstAssetChange.items.forEach((item: any) => {
            const itemAssetId = item.assetId || item.id;
            if (rejectedAssetIds.includes(itemAssetId)) {
              rejectedAssetPositions.set(Number(item.order), itemAssetId);
            }
          });
        }
        // Fallback to eventAssets if eventAssetChanges.items is not available
        else if (eventDetail.eventAssets) {
          eventDetail.eventAssets.forEach((ea: any) => {
            const assetId = ea.asset?.id || ea.assetId;
            if (assetId && rejectedAssetIds.includes(assetId)) {
              rejectedAssetPositions.set(Number(ea.order), assetId);
            }
          });
        }

        // Check if all rejected assets have been changed
        const unchangedRejectedAssets: number[] = [];
        
        rejectedAssetPositions.forEach((rejectedAssetId, order) => {
          let hasChanged = false;
          
          if (order === 1) {
            // Thumbnail position
            // Check if new thumbnail was uploaded (replacing the rejected asset)
            if (assetChangeInfo.files.thumbnail) {
              hasChanged = true;
            }
            // Check if existing thumbnail was deleted
            else if (
              assetChangeInfo.existingAssets.thumbnail &&
              assetChangeInfo.existingAssets.thumbnail.id === rejectedAssetId &&
              assetChangeInfo.deletedAssetIds.includes(
                assetChangeInfo.existingAssets.thumbnail.eventAssetId
              )
            ) {
              hasChanged = true;
            }
          } else {
            // Supporting image position (order 2-5)
            const supportingImageIndex = order - 2;
            
            // Check if new supporting image was uploaded at this position (replacing the rejected asset)
            if (
              supportingImageIndex >= 0 &&
              supportingImageIndex < assetChangeInfo.files.supportingImages.length &&
              assetChangeInfo.files.supportingImages[supportingImageIndex]
            ) {
              hasChanged = true;
            }
            // Check if existing supporting image was deleted
            else if (
              supportingImageIndex >= 0 &&
              supportingImageIndex < assetChangeInfo.existingAssets.supportingImages.length &&
              assetChangeInfo.existingAssets.supportingImages[supportingImageIndex] &&
              assetChangeInfo.existingAssets.supportingImages[supportingImageIndex]!.id ===
                rejectedAssetId &&
              assetChangeInfo.deletedAssetIds.includes(
                assetChangeInfo.existingAssets.supportingImages[supportingImageIndex]!
                  .eventAssetId
              )
            ) {
              hasChanged = true;
            }
          }
          
          if (!hasChanged) {
            unchangedRejectedAssets.push(order);
          }
        });

        // If there are unchanged rejected assets, show error
        if (unchangedRejectedAssets.length > 0) {
          setShowError(true);
          setErrorMessage(
            'Please fix all rejected assets before updating. Rejected assets must be replaced or removed.'
          );
          return;
        }
      }
    }

    // Check if thumbnail is required (either existing or new)
    const hasThumbnail =
      assetChangeInfo.files.thumbnail ||
      (assetChangeInfo.existingAssets.thumbnail &&
        !assetChangeInfo.deletedAssetIds.includes(
          assetChangeInfo.existingAssets.thumbnail.id
        ));

    if (!hasThumbnail) {
      setShowError(true);
      setErrorMessage('Thumbnail is required');
      return;
    }

    // Validate file sizes for new files
    if (
      assetChangeInfo.files.thumbnail &&
      !validateFileSize(assetChangeInfo.files.thumbnail)
    ) {
      setShowError(true);
      setErrorMessage('Thumbnail file size must be less than 2MB');
      return;
    }

    for (const file of assetChangeInfo.files.supportingImages) {
      if (file && !validateFileSize(file)) {
        setShowError(true);
        setErrorMessage('Supporting image file size must be less than 2MB');
        return;
      }
    }

    setIsLoading(true);
    setShowError(false);
    setErrorMessage('');
    setProgress('Preparing updates...');

    try {
      // Step 1: Delete removed event assets
      if (assetChangeInfo.deletedAssetIds.length > 0) {
        setProgress(
          `Deleting ${assetChangeInfo.deletedAssetIds.length} removed asset(s)...`
        );
        for (const eventAssetId of assetChangeInfo.deletedAssetIds) {
          await eventsService.deleteEventAsset(eventAssetId);
        }
      }

      // Step 2: Upload new files and get asset IDs
      const newAssetIds: { assetId: string; order: number }[] = [];
      const filesToUpload = [
        ...(assetChangeInfo.files.thumbnail
          ? [{ file: assetChangeInfo.files.thumbnail, order: 1 }]
          : []),
        ...assetChangeInfo.files.supportingImages
          .map((file, index) => ({ file, order: index + 2 }))
          .filter((item) => item.file !== null)
      ];

      if (filesToUpload.length > 0) {
        setProgress(`Uploading 0/${filesToUpload.length} new assets...`);
        let uploadedCount = 0;

        for (const { file, order } of filesToUpload) {
          if (file) {
            const base64 = await convertFileToBase64(file);
            const uploadResponse = await assetsService.uploadAsset({
              type: file.type,
              file: base64,
              filename: file.name,
              privacy: 'PUBLIC',
              fileGroup: 'EVENT'
            });
            newAssetIds.push({
              assetId: uploadResponse.body.asset.id,
              order
            });
            uploadedCount++;
            setProgress(
              `Uploading ${uploadedCount}/${filesToUpload.length} new assets...`
            );
          }
        }
      }

      // Step 4: Create or update event assets for uploaded files
      if (newAssetIds.length > 0) {
        setProgress('Finalizing asset updates...');
        for (const { assetId, order } of newAssetIds) {
          // Find if there's an existing asset at this order position that wasn't deleted
          let existingEventAssetId: string | undefined;

          if (order === 1) {
            // Thumbnail (order 1)
            const existingThumbnail = assetChangeInfo.existingAssets.thumbnail;
            if (existingThumbnail && existingThumbnail.eventAssetId) {
              // Check if this asset was deleted - compare eventAssetId (not id/assetId)
              const wasDeleted = assetChangeInfo.deletedAssetIds.includes(
                existingThumbnail.eventAssetId
              );
              if (!wasDeleted) {
                // Asset exists and wasn't deleted, so UPDATE it (PUT)
                existingEventAssetId = existingThumbnail.eventAssetId;
              }
            }
          } else {
            // Supporting images (order 2-5)
            const supportingImageIndex = order - 2;
            const existingSupporting =
              assetChangeInfo.existingAssets.supportingImages[
                supportingImageIndex
              ];
            if (existingSupporting && existingSupporting.eventAssetId) {
              // Check if this asset was deleted - compare eventAssetId (not id/assetId)
              const wasDeleted = assetChangeInfo.deletedAssetIds.includes(
                existingSupporting.eventAssetId
              );
              if (!wasDeleted) {
                // Asset exists and wasn't deleted, so UPDATE it (PUT)
                existingEventAssetId = existingSupporting.eventAssetId;
              }
            }
          }

          if (existingEventAssetId) {
            // Update existing event asset with new assetId (PUT)
            await eventsService.updateEventAsset(existingEventAssetId, {
              eventId: eventDetail.id,
              assetId,
              order
            });
          } else {
            // Create new event asset (POST) - no existing asset at this order position
            await eventsService.createEventAsset({
              eventId: eventDetail.id,
              assetId,
              order
            });
          }
        }
      }

      setProgress('Completed!');
      // Navigate back to event detail page
      router.push(`/events/${metaUrl}?tab=assets`);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update event assets. Please try again.';
      setErrorMessage(errorMsg);
      setShowError(true);
      setIsLoading(false);
      setProgress('');
    }
  };

  const handleCancel = () => {
    router.push(`/events/${metaUrl}?tab=assets`);
  };

  // Derive rejected assets info from eventAssetChanges for on_review/on_going (with changes) events
  // For rejected events, use eventAssets instead of eventAssetChanges
  const firstAssetChange =
    eventDetail &&
    (eventDetail.eventStatus === 'on_review' ||
      (eventDetail.eventStatus === 'on_going' &&
        eventDetail.eventAssetChanges &&
        eventDetail.eventAssetChanges.length > 0)) &&
    eventDetail.eventAssetChanges &&
    eventDetail.eventAssetChanges.length > 0
      ? eventDetail.eventAssetChanges[0]
      : undefined;

  // For rejected events, read rejected info from eventAssets
  // For on_review/on_going events, read from eventAssetChanges
  let rejectedAssetIds: string[] = [];
  let rejectionReason: string | undefined = undefined;

  if (eventDetail?.eventStatus === 'rejected') {
    const rejectedAssets = eventDetail.eventAssetChanges?.[0];
    rejectedAssetIds = rejectedAssets?.rejectedFields || [];
    rejectionReason = rejectedAssets?.rejectedReason || undefined;
  } else if (firstAssetChange && firstAssetChange.status === 'rejected') {
    // For on_review/on_going events, read from eventAssetChanges
    rejectedAssetIds = firstAssetChange.rejectedFields ?? [];
    rejectionReason = firstAssetChange.rejectedReason || undefined;
  }

  // Determine if we should use eventAssetChanges for populating data
  // If eventStatus is 'on_going' and eventAssetChanges[0].status is 'rejected', use eventAssetChanges
  const shouldUseEventAssetChanges =
    (eventDetail?.eventStatus === 'on_going' ||
      eventDetail?.eventStatus === 'approved') &&
    eventDetail?.eventAssetChanges &&
    eventDetail.eventAssetChanges.length > 0 &&
    eventDetail.eventAssetChanges[0].status === 'rejected';

  return (
    <DashboardLayout>
      <Box>
        {/* Back Button */}
        <Box
          alignItems="center"
          display="flex"
          gap={1}
          mb={2}
          sx={{ cursor: 'pointer' }}
          onClick={() => router.back()}
        >
          <Image alt="Back" height={24} src="/icon/back.svg" width={24} />
          <Caption color="text.secondary" component="span">
            Back To Event Detail
          </Caption>
        </Box>

        {/* Title */}
        <H2 color="text.primary" fontWeight={700} mb="21px">
          Edit Assets
        </H2>

        <Card>
          <EventAssetsEditForm
            eventDetail={eventDetail}
            eventAssetChanges={
              eventDetail?.eventAssetChanges &&
              (eventDetail.eventStatus === 'on_review' ||
                shouldUseEventAssetChanges)
                ? eventDetail.eventAssetChanges
                : undefined
            }
            showError={showError}
            onFilesChange={handleFilesChange}
            rejectedAssetIds={rejectedAssetIds}
            rejectionReason={rejectionReason}
          />

          <Box
            display="flex"
            gap="8px"
            justifyContent="flex-end"
            flexDirection="column"
            alignItems="flex-end"
          >
            {showError && errorMessage && (
              <Overline color="error.main" fontWeight={500}>
                {errorMessage}
              </Overline>
            )}
            {isLoading && progress && (
              <Body2 color="primary.main" fontWeight={500} mb={1}>
                {progress}
              </Body2>
            )}
            <Box display="flex" gap="24px">
              <Button
                disabled={isLoading}
                variant="secondary"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                disabled={isLoading}
                variant="primary"
                onClick={handleSubmitEvent}
              >
                {isLoading ? 'Updating...' : 'Update Assets'}
              </Button>
            </Box>
          </Box>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default withAuth(EditAssetsPage, { requireAuth: true });
