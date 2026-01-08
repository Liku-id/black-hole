import { Box } from '@mui/material';
import { useAtom } from 'jotai';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';

import {
  selectedEOIdAtom,
  selectedEONameAtom
} from '@/atoms/eventOrganizerAtom';
import { withAuth } from '@/components/Auth/withAuth';
import { H4 } from '@/components/common';
import { CreateEventForm } from '@/components/features/events/create/info';
import DashboardLayout from '@/layouts/dashboard';
import { eventsService } from '@/services/events';
import { CreateEventRequest } from '@/types/event';

interface FormData {
  eventName: string;
  eventType: string;
  dateRange: string;
  timeRange: string;
  startTime: string;
  endTime: string;
  timeZone: string;
  startDate: string;
  endDate: string;
  address: string;
  googleMapsLink: string;
  city: string;
  adminFee: string;
  adminFeeType: string;
  paymentMethod: string[];
  tax: string;
  taxNominal: string;
  eventDescription: string;
  termsAndConditions: string;
  websiteUrl: string;
  loginRequired: number;
}

function CreateEvent() {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  // const { user } = useAuth();
  const [selectedEOId] = useAtom(selectedEOIdAtom);
  const [selectedEOName] = useAtom(selectedEONameAtom);


  const onSubmit = async (data: FormData) => {
    setError('');
    setLoading(true);

    try {
      const payload: CreateEventRequest = {
        cityId: data.city,
        eventOrganizerId: selectedEOId,
        paymentMethodIds: data.paymentMethod,
        name: data.eventName,
        eventType: data.eventType,
        description: data.eventDescription,
        address: data.address,
        mapLocationUrl: data.googleMapsLink.startsWith('http')
          ? data.googleMapsLink
          : `https://${data.googleMapsLink}`,
        startDate: `${data.startDate}T${data.startTime}:00${data.timeZone}`,
        endDate: `${data.endDate}T${data.endTime}:00${data.timeZone}`,
        termAndConditions: data.termsAndConditions,
        websiteUrl: data.websiteUrl,
        metaUrl: data.eventName
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, ''),
        adminFee: parseInt(data.adminFee) || 0,
        tax: parseInt(data.taxNominal) || 0,
        login_required: data.loginRequired === 1
      };
      const response = await eventsService.createEvent(payload);

      router.push(`/events/${response.body.metaUrl}`);
    } catch (error: any) {
      setLoading(false);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create event. Please try again.';
      setError(errorMessage);
    }
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Create New Event - Black Hole Dashboard</title>
      </Head>

      <Box>
        <H4 color="text.primary" fontWeight={700} marginBottom="16px">
          Create New Event {selectedEOName ? `for ${selectedEOName}` : ''}
        </H4>

        {/* Form Component */}
        <CreateEventForm error={error} loading={loading} onSubmit={onSubmit} />
      </Box>
    </DashboardLayout>
  );
}

// Export with authentication wrapper that requires authentication
export default withAuth(CreateEvent, { requireAuth: true });
