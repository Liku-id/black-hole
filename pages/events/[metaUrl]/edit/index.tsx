import { Box } from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Card, Caption, H2 } from '@/components/common';
import { EventEditInfo } from '@/components/features/events/edit/info';
import { useEventDetail } from '@/hooks';
import DashboardLayout from '@/layouts/dashboard';

function EditEvent() {
  const router = useRouter();
  const { metaUrl } = router.query;

  const { eventDetail, loading, error } = useEventDetail(metaUrl as string);

  if (loading) {
    return (
      <DashboardLayout>
        <Head>
          <title>Loading Event - Black Hole Dashboard</title>
        </Head>
        <div>Loading...</div>
      </DashboardLayout>
    );
  }

  if (error || !eventDetail) {
    return (
      <DashboardLayout>
        <Head>
          <title>Event Not Found - Black Hole Dashboard</title>
        </Head>
        <div>Failed to load event: {error}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Edit {eventDetail.name} - Black Hole Dashboard</title>
      </Head>

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
        Edit Event Detail
      </H2>

      {/* Main Card */}
      <Card sx={{ mb: 3 }}>
        <EventEditInfo eventDetail={eventDetail} />
      </Card>
    </DashboardLayout>
  );
}

export default EditEvent;
