import { Box } from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { CreateEventForm } from '@/components/features/events/create/info';
import { H4, Breadcrumb } from '@/components/common';
import { useAuth } from '@/contexts/AuthContext';
import { withAuth } from '@/components/Auth/withAuth';
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
}

function CreateEvent() {
  const [error, setError] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const breadcrumbSteps = [
    { label: 'Event Detail', active: true },
    { label: 'Ticket Detail' },
    { label: 'Asset Event' }
  ];

  const onSubmit = async (data: FormData, isDraft: boolean = false) => {
    setError('');

    try {
      const payload: CreateEventRequest = {
        cityId: data.city,
        eventOrganizerId: user?.id || '',
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
        adminFee:
          data.adminFeeType === '%'
            ? (parseInt(data.adminFee) || 0) / 100
            : parseInt(data.adminFee) || 0,
        tax: data.tax === 'true' ? parseInt(data.taxNominal) || 0 : 0
      };
      console.log(payload);
      const response = await eventsService.createEvent(payload);

      if (isDraft) {
        router.push('/events');
      } else {
        router.push(`/events/${response.body.metaUrl}/ticket`);
      }
    } catch (error: any) {
      console.error('Failed to create event:', error);
      setError(error.message || 'Failed to create event. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Create New Event - Black Hole Dashboard</title>
      </Head>

      <Box>
        <H4 color="text.primary" fontWeight={700} marginBottom="16px">
          Create New Event
        </H4>

        {/* Breadcrumb */}
        <Box marginBottom="24px">
          <Breadcrumb steps={breadcrumbSteps} />
        </Box>

        {/* Form Component */}
        <CreateEventForm onSubmit={onSubmit} error={error} />
      </Box>
    </DashboardLayout>
  );
}

// Export with authentication wrapper that requires authentication
export default withAuth(CreateEvent, { requireAuth: true });
