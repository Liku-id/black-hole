import { Box } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import { withAuth } from '@/components/Auth/withAuth';
import { Button, Card, Caption, H2 } from '@/components/common';
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
    thumbnail?: { id: string; order: number };
    supportingImages: Array<{ id: string; order: number } | null>;
  };
}

const EditAssetsPage = () => {
  const router = useRouter();
  const { metaUrl } = router.query;
  const { eventDetail } = useEventDetail(metaUrl as string);
  const [assetChangeInfo, setAssetChangeInfo] =
    useState<AssetChangeInfo | null>(null);
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Prevent hydration error by checking if router is ready
  if (!router.isReady) {
    return null;
  }

  const handleFilesChange = (changeInfo: AssetChangeInfo) => {
    setAssetChangeInfo(changeInfo);
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

    // Check if thumbnail is required (either existing or new)
    const hasThumbnail =
      assetChangeInfo.files.thumbnail ||
      (assetChangeInfo.existingAssets.thumbnail &&
        !assetChangeInfo.deletedAssetIds.includes(
          assetChangeInfo.existingAssets.thumbnail.id
        ));

    if (!hasThumbnail) {
      setShowError(true);
      return;
    }

    setIsLoading(true);
    setShowError(false);

    try {
      // Step 1: Delete removed event assets
      for (const eventAssetId of assetChangeInfo.deletedAssetIds) {
        await eventsService.deleteEventAsset(eventAssetId);
      }

      // Step 2: Upload new files and get asset IDs
      const newAssetIds: { assetId: string; order: number }[] = [];

      // Upload new thumbnail if exists
      if (assetChangeInfo.files.thumbnail) {
        const base64 = await convertFileToBase64(
          assetChangeInfo.files.thumbnail
        );
        const uploadResponse = await assetsService.uploadAsset({
          type: assetChangeInfo.files.thumbnail.type,
          file: base64,
          filename: assetChangeInfo.files.thumbnail.name,
          privacy: 'PUBLIC',
          fileGroup: 'EVENT'
        });
        newAssetIds.push({
          assetId: uploadResponse.body.asset.id,
          order: 1
        });
      }

      // Upload new supporting images
      await Promise.all(
        assetChangeInfo.files.supportingImages.map(async (file, index) => {
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
              order: index + 2
            });
          }
        })
      );

      // Step 4: Create new event assets for uploaded files
      for (const { assetId, order } of newAssetIds) {
        await eventsService.createEventAsset({
          eventId: eventDetail.id,
          assetId,
          order
        });
      }

      // Navigate back to event detail page
      router.push(`/events/${metaUrl}`);
    } catch (error: any) {
      console.error('Failed to update event assets:', error);
      alert('Failed to update assets. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/events/${metaUrl}`);
  };

  useEffect(() => {
    if (!router.isReady) return;
    if (eventDetail?.eventStatus === 'draft') {
      router.replace('/events');
    }
  }, [router.isReady, eventDetail]);

  return (
    <DashboardLayout>
      <Box>
        {/* Back Button */}
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          mb={2}
          onClick={() => router.back()}
          sx={{ cursor: 'pointer' }}
        >
          <Image src="/icon/back.svg" alt="Back" width={24} height={24} />
          <Caption color="text.secondary" component="span">
            Back To Event Detail
          </Caption>
        </Box>

        {/* Title */}
        <H2 color="text.primary" mb="21px" fontWeight={700}>
          Edit Assets
        </H2>

        <Card>
          <EventAssetsEditForm
            eventDetail={eventDetail}
            onFilesChange={handleFilesChange}
            showError={showError}
          />

          <Box display="flex" gap="24px" justifyContent="flex-end">
            <Button
              variant="secondary"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitEvent}
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Assets'}
            </Button>
          </Box>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default withAuth(EditAssetsPage, { requireAuth: true });
