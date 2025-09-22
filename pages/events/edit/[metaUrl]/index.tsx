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

  // Helper function to compare values and check if they've changed
  const hasChanged = (newValue: any, originalValue: any) => {
    // Handle null/undefined cases
    if (newValue == null && originalValue == null) return false;
    if (newValue == null || originalValue == null) return true;

    // For arrays, compare stringified versions
    if (Array.isArray(newValue) && Array.isArray(originalValue)) {
      return (
        JSON.stringify(newValue.sort()) !== JSON.stringify(originalValue.sort())
      );
    }

    // Convert both to string for comparison to handle type differences
    return String(newValue) !== String(originalValue);
  };

  // Special function to compare dates (ISO strings)
  const hasDateChanged = (newDateISO: string, originalDateISO: string) => {
    // Handle empty/null cases
    if (!newDateISO && !originalDateISO) return false;
    if (!newDateISO || !originalDateISO) return true;

    // Compare as Date objects to handle timezone differences
    try {
      const newDate = new Date(newDateISO);
      const originalDate = new Date(originalDateISO);
      return newDate.getTime() !== originalDate.getTime();
    } catch {
      // Fallback to string comparison if date parsing fails
      return newDateISO !== originalDateISO;
    }
  };

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

      // Process Google Maps URL
      const processedGoogleMapsUrl = formData.googleMapsLink?.startsWith('http')
        ? formData.googleMapsLink
        : `https://${formData.googleMapsLink}`;

      // Calculate admin fee and tax
      const calculatedAdminFee =
        formData.adminFeeType === '%'
          ? parseInt(formData.adminFee)
          : parseInt(formData.adminFee);
      const calculatedTax =
        formData.tax === 'true' ? parseInt(formData.taxNominal || '0') : 0;

      // Build payload with only changed fields
      const payload: any = {};

      // Always include required fields
      payload.eventOrganizerId = eventDetail?.eventOrganizer?.id || '';

      // Check each field for changes and only add to payload if changed
      if (hasChanged(formData.city, eventDetail?.city?.id)) {
        payload.cityId = formData.city;
      }

      if (
        hasChanged(
          formData.paymentMethod,
          eventDetail?.paymentMethods.map((pm: any) => pm.id)
        )
      ) {
        payload.paymentMethodIds = formData.paymentMethod;
      }

      if (hasChanged(formData.eventName, eventDetail?.name)) {
        payload.name = formData.eventName;
      }

      if (hasChanged(formData.eventType, eventDetail?.eventType)) {
        payload.eventType = formData.eventType;
      }

      if (hasChanged(formData.eventDescription, eventDetail?.description)) {
        payload.description = formData.eventDescription;
      }

      if (hasChanged(formData.address, eventDetail?.address)) {
        payload.address = formData.address;
      }

      if (hasChanged(processedGoogleMapsUrl, eventDetail?.mapLocationUrl)) {
        payload.mapLocationUrl = processedGoogleMapsUrl;
      }

      // Only include dates if they actually changed
      if (hasDateChanged(startDateISO, eventDetail?.startDate || '')) {
        payload.startDate = startDateISO;
      }

      if (hasDateChanged(endDateISO, eventDetail?.endDate || '')) {
        payload.endDate = endDateISO;
      }

      if (
        hasChanged(formData.termsAndConditions, eventDetail?.termAndConditions)
      ) {
        payload.termAndConditions = formData.termsAndConditions;
      }

      if (hasChanged(formData.websiteUrl, eventDetail?.websiteUrl)) {
        payload.websiteUrl = formData.websiteUrl;
      }

      if (hasChanged(calculatedAdminFee, eventDetail?.adminFee)) {
        payload.adminFee = calculatedAdminFee;
      }

      if (hasChanged(calculatedTax, eventDetail?.tax)) {
        payload.tax = calculatedTax;
      }

      // Check if there are any actual changes (excluding required fields)
      const requiredFields = ['eventOrganizerId', 'metaUrl'];
      const changedFields = Object.keys(payload).filter(
        (key) => !requiredFields.includes(key)
      );

      if (changedFields.length === 0) {
        setIsUpdating(false);
        return;
      }

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
