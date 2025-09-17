import { Box } from '@mui/material';
import { format as formatDateFns, parse } from 'date-fns';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { Card, Caption, H2 } from '@/components/common';
import { EventEditInfo } from '@/components/features/events/edit/info';
import { useEventDetail } from '@/hooks';
import DashboardLayout from '@/layouts/dashboard';
import { eventsService } from '@/services';

function EditEvent() {
  const router = useRouter();
  const { metaUrl } = router.query;
  const { eventDetail, loading, error } = useEventDetail(metaUrl as string);

  // Initialize State
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string>('');

  // Handle form submission
  const handleSubmit = async (formData: any) => {
    if (isUpdating) return;

    setIsUpdating(true);
    setUpdateError('');

    try {
      const timezone = formData.timeZone as string;
      const [rawStartDate, rawEndDate] = (formData.dateRange || '')
        .split(' - ')
        .map((s: string) => s?.trim());

      // timeRange example: "HH:mm - HH:mm WIB/WITA/WIT" or "HH:mm - HH:mm"
      const cleanedTimeRange = (formData.timeRange || '')
        .replace(/\s*(WIB|WITA|WIT)\s*$/i, '')
        .trim();
      const [rawStartTime, rawEndTime] = cleanedTimeRange
        .split(' - ')
        .map((s: string) => s?.trim());

      // Fallbacks
      const startTime = rawStartTime || formData.startTime || '00:00';
      const endTime = rawEndTime || formData.endTime || '00:00';

      // Parse dates from "MMM d, yyyy" then format to yyyy-MM-dd
      const startDateObj = rawStartDate
        ? parse(rawStartDate, 'MMM d, yyyy', new Date())
        : null;
      const endDateObj = rawEndDate
        ? parse(rawEndDate, 'MMM d, yyyy', new Date())
        : null;

      const startDateISO = startDateObj
        ? `${formatDateFns(startDateObj, 'yyyy-MM-dd')}T${startTime}:00${timezone}`
        : eventDetail?.startDate || '';
      const endDateISO = endDateObj
        ? `${formatDateFns(endDateObj, 'yyyy-MM-dd')}T${endTime}:00${timezone}`
        : eventDetail?.endDate || '';

      const payload = {
        cityId: formData.city,
        eventOrganizerId: eventDetail?.eventOrganizer?.id || '',
        paymentMethodIds: formData.paymentMethod,
        name: formData.eventName,
        eventType: formData.eventType,
        description: formData.eventDescription,
        address: formData.address,
        mapLocationUrl: formData.googleMapsLink.startsWith('http')
          ? formData.googleMapsLink
          : `https://${formData.googleMapsLink}`,
        startDate: startDateISO,
        endDate: endDateISO,
        termAndConditions: formData.termsAndConditions,
        websiteUrl: formData.websiteUrl,
        metaUrl: metaUrl as string,
        adminFee:
          formData.adminFeeType === '%'
            ? parseInt(formData.adminFee)
            : parseInt(formData.adminFee),
        tax: formData.tax === 'true' ? parseInt(formData.taxNominal || '0') : 0
      };

      const result = await eventsService.updateEvent({
        metaUrl: eventDetail?.id || '',
        data: payload
      });

      if (result && result.body && result.body.id) {
        router.push(`/events/${metaUrl}`);
      }
    } catch (error) {
      console.error('Error updating event:', error);
      setUpdateError(
        error instanceof Error
          ? error.message
          : 'Failed to update event. Please try again.'
      );
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;
    const status = eventDetail?.eventStatus;
    if (
      status === 'draft' ||
      status === 'on_review' ||
      status === 'done' ||
      eventDetail?.is_requested
    ) {
      router.replace(`/events`);
    }
  }, [router.isReady, eventDetail]);

  if (loading || isUpdating) {
    return (
      <DashboardLayout>
        <Head>
          <title>Loading Event - Black Hole Dashboard</title>
        </Head>
        <div>{isUpdating ? 'Updating event...' : 'Loading...'}</div>
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
        Edit Event Detail
      </H2>

      {/* Main Card */}
      <Card sx={{ mb: 3 }}>
        <EventEditInfo
          error={updateError}
          eventDetail={eventDetail}
          onSubmit={handleSubmit}
        />
      </Card>
    </DashboardLayout>
  );
}

export default EditEvent;
