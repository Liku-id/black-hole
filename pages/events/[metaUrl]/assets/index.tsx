import { Box } from '@mui/material';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { Button, Card, H3, Breadcrumb } from '@/components/common';
import { EventAssetsForm } from '@/components/features/events/assets';
import DashboardLayout from '@/layouts/dashboard';

interface AssetFiles {
  thumbnail?: File;
  supportingImages: (File | null)[];
}

interface AssetPayload {
  eventId: string;
  assetId: string;
  order: number;
}

const AssetsPage = () => {
  const router = useRouter();
  const { metaUrl } = router.query;
  const [assetFiles, setAssetFiles] = useState<AssetFiles>({
    supportingImages: [null, null, null, null]
  });
  const [showError, setShowError] = useState(false);

  // Prevent hydration error by checking if router is ready
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

  const generateAssetId = (file: File, order: number): string => {
    return `asset_${metaUrl}_${order}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, '')}`;
  };

  const handleSubmitEvent = async () => {
    if (!metaUrl) {
      alert('Event ID not found');
      return;
    }

    // Check if thumbnail (order 1) is required
    if (!assetFiles.thumbnail) {
      setShowError(true);
      return;
    }

    const payload: AssetPayload[] = [];
    const allFiles = [assetFiles.thumbnail, ...assetFiles.supportingImages];
    const validFiles = allFiles.filter((file): file is File => file !== null);
    
    validFiles.forEach((file, index) => {
      payload.push({
        eventId: metaUrl as string,
        assetId: generateAssetId(file, index + 1),
        order: index + 1 
      });
    });

    // Clear error state when submission is successful
    setShowError(false);

    try {
      console.log('Submitting event assets:', payload);

      // TODO: Replace with actual API call
      // const response = await assetsService.createEventAssets(payload);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // TODO: Navigate to next step or event detail page
      // router.push(`/events/${metaUrl}`);
    } catch (error: any) {
      console.error('Failed to submit event assets:', error);
    }
  };

  return (
    <DashboardLayout>
      <Box>
        <H3 color="text.primary" fontWeight={700} marginBottom="16px">
          Create Event
        </H3>

        <Box marginBottom="24px">
          <Breadcrumb steps={breadcrumbSteps} />
        </Box>

        <Card>
          <EventAssetsForm onFilesChange={handleFilesChange} showError={showError} />

          <Box display="flex" gap="24px" justifyContent="flex-end">
            <Button variant="primary" onClick={handleSubmitEvent}>
              Submit Event
            </Button>
          </Box>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default AssetsPage;
