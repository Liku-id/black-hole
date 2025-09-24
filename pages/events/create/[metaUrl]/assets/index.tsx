import { Box } from '@mui/material';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import { withAuth } from '@/components/Auth/withAuth';
import { Button, Card, H4, Breadcrumb, Overline } from '@/components/common';
import { EventAssetsForm } from '@/components/features/events/create/assets';
import { useEventDetail } from '@/hooks/features/events/useEventDetail';
import DashboardLayout from '@/layouts/dashboard';
import { assetsService } from '@/services/assets';
import { eventsService } from '@/services/events';

interface AssetFiles {
  thumbnail?: File;
  supportingImages: (File | null)[];
}

const AssetsPage = () => {
  const router = useRouter();
  const { metaUrl } = router.query;
  const [assetFiles, setAssetFiles] = useState<AssetFiles>({
    supportingImages: [null, null, null, null]
  });
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { eventDetail } = useEventDetail(metaUrl as string);

  useEffect(() => {
    if (!router.isReady) return;
    if (eventDetail && eventDetail?.eventStatus !== 'draft') {
      router.replace('/events');
    }
  }, [router.isReady, eventDetail]);

  if (!router.isReady) {
    return null;
  }

  const breadcrumbSteps = [
    { label: 'Event Detail' },
    { label: 'Ticket Detail' },
    { label: 'Asset Event', active: true }
  ];

  const handleFilesChange = (files: AssetFiles) => {
    setAssetFiles(files);
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
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmitEvent = async () => {
    if (!assetFiles.thumbnail) {
      setShowError(true);
      setErrorMessage('Thumbnail is required');
      return;
    }

    // Validate file sizes
    if (!validateFileSize(assetFiles.thumbnail)) {
      setShowError(true);
      setErrorMessage('Thumbnail file size must be less than 1MB');
      return;
    }

    for (const file of assetFiles.supportingImages) {
      if (file && !validateFileSize(file)) {
        setShowError(true);
        setErrorMessage('Supporting image file size must be less than 1MB');
        return;
      }
    }

    setLoading(true);
    setShowError(false);
    setErrorMessage('');

    try {
      const newAssetIds: { assetId: string; order: number }[] = [];

      // Upload thumbnail (order 1)
      if (assetFiles.thumbnail) {
        const base64 = await convertFileToBase64(assetFiles.thumbnail);
        const uploadResponse = await assetsService.uploadAsset({
          type: assetFiles.thumbnail.type,
          file: base64,
          filename: assetFiles.thumbnail.name,
          privacy: 'PUBLIC',
          fileGroup: 'EVENT'
        });
        newAssetIds.push({ assetId: uploadResponse.body.asset.id, order: 1 });
      }

      // Upload supporting images (orders 2..)
      let orderCounter = 2;
      for (const file of assetFiles.supportingImages) {
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
            order: orderCounter
          });
        }
        orderCounter += 1;
      }

      // Create event assets with uploaded asset IDs
      for (const { assetId, order } of newAssetIds) {
        await eventsService.createEventAsset({
          eventId: eventDetail.id,
          assetId,
          order
        });
      }

      await eventsService.submitEvent(eventDetail!.id);

      router.push(`/events/${metaUrl}`);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to submit event assets. Please try again.';
      setErrorMessage(errorMsg);
      setShowError(true);
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Box>
        <H4 color="text.primary" fontWeight={700} marginBottom="16px">
          Create Event
        </H4>

        <Box marginBottom="24px">
          <Breadcrumb steps={breadcrumbSteps} />
        </Box>

        <Card>
          <EventAssetsForm
            showError={showError}
            onFilesChange={handleFilesChange}
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
            <Button
              disabled={loading}
              variant="primary"
              onClick={handleSubmitEvent}
            >
              {loading ? 'Submitting...' : 'Submit Event'}
            </Button>
          </Box>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default withAuth(AssetsPage, { requireAuth: true });
