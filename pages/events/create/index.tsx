import { Box } from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { withAuth } from '@/components/Auth/withAuth';
import { Breadcrumb, H3 } from '@/components/common';
import { CreateEventForm } from '@/components/features/events/info';
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
  paymentMethod: string[];
  tax: string;
  taxNominal: string;
  eventDescription: string;
  termsAndConditions: string;
  websiteLink: string;
}

function CreateEvent() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const breadcrumbSteps = [
    { label: 'Event Detail', active: true },
    { label: 'Ticket Detail' },
    { label: 'Asset Event' }
  ];

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      // Transform form data to API payload
      const payload: CreateEventRequest = {
        cityId: data.city,
        eventOrganizerId: 'KOSONG',
        paymentMethodIds: data.paymentMethod,
        name: data.eventName,
        eventType: data.eventType,
        description: data.eventDescription,
        address: data.address,
        mapLocationUrl: data.googleMapsLink,
        startDate: `${data.startDate}T${data.startTime}:00${data.timeZone}`,
        endDate: `${data.endDate}T${data.endTime}:00${data.timeZone}`,
        termAndConditions: data.termsAndConditions,
        websiteUrl: data.websiteLink,
        metaUrl: data.eventName
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, ''),
        adminFee: parseInt(data.adminFee) || 0,
        tax: data.tax === 'yes' ? parseInt(data.taxNominal) || 0 : 0
      };

      console.log('Create Event Payload:', payload);
      const response = await eventsService.createEvent(payload);

      console.log('Event created successfully:', response);
    } catch (error) {
      console.error('Failed to create event:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Create New Event - Black Hole Dashboard</title>
      </Head>

      <Box>
        <H3 color="text.primary" fontWeight={700} marginBottom="16px">
          Create New Event
        </H3>

        {/* Breadcrumb */}
        <Box marginBottom="24px">
          <Breadcrumb steps={breadcrumbSteps} />
        </Box>

        {/* Form Component */}
        <CreateEventForm onSubmit={onSubmit} />
      </Box>
    </DashboardLayout>
  );
}

// Export with authentication wrapper that requires authentication
export default withAuth(CreateEvent, { requireAuth: true });
