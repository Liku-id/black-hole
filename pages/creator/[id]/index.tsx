
import { Box, Card, CardContent } from '@mui/material';
import Head from 'next/head';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import { withAuth } from '@/components/Auth/withAuth';
import { Tabs, Button, H2, Body2, Caption, H4 } from '@/components/common';
import BankForm from '@/components/features/account/bank-form';
import { CreatorTypeModal } from '@/components/features/account/creator-type-modal';
import GeneralForm from '@/components/features/account/general-form';
import LegalForm from '@/components/features/account/legal-form';
import { UnverifiedModal } from '@/components/features/account/unverified-modal';
import { useAuth } from '@/contexts/AuthContext';
import {
  useEventOrganizerById,
  useUpdateEventOrganizerType
} from '@/hooks/features/organizers';
import DashboardLayout from '@/layouts/dashboard';
import { User } from '@/types/auth';

function CreatorDetail() {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = router.query;
  const searchParams = useSearchParams();
  const tab = searchParams.get('doc');

  // Initialize state
  const [activeTab, setActiveTab] = useState(tab || 'general');
  const [activeLable, setActiveLable] = useState('General Information');
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showUnverifiedModal, setShowUnverifiedModal] = useState(false);
  const [showCreatorModal, setShowCreatorModal] = useState(false);
  const [hasProceeded, setHasProceeded] = useState(false);

  const eoId = typeof id === 'string' ? id : null;

  // Fetch organizer data by ID
  const {
    mutate: refetchOrganizer,
    data: eventOrganizer,
    loading: organizerLoading,
    error: organizerError
  } = useEventOrganizerById(eoId, !!eoId);

  // Update organizer type hook
  const {
    mutate: updateOrganizerType,
    isPending: updateLoading,
    error: updateError
  } = useUpdateEventOrganizerType();

  const tabs = [
    {
      id: 'general',
      title: 'General Information'
    },
    {
      id: 'legal',
      title: 'Legal Document'
    },
    {
      id: 'bank',
      title: 'Bank Account'
    }
  ];

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setActiveLable(tabs.find((tab) => tab.id === newTab)?.title || '');
    setIsEditing(false); // Reset edit mode when switching tabs
  };

  const handleUnverifiedModalClose = () => {
    setShowUnverifiedModal(false);
    router.push('/creator');
  };

  const handleUnverifiedModalProceed = () => {
    setShowUnverifiedModal(false);
    setShowCreatorModal(true);
    setHasProceeded(true);
  };

  const handleCreatorModalClose = () => {
    setShowCreatorModal(false);
    router.push('/creator');
  };

  const handleCreatorModalContinue = async (creatorType: string) => {
    try {
      if (eventOrganizer?.id) {
        await updateOrganizerType({
          eoId: eventOrganizer.id,
          payload: {
            organizer_type: creatorType as 'individual' | 'institutional'
          }
        });

        setShowCreatorModal(false);
        refetchOrganizer();
      }
    } catch (error) {
      console.error('Failed to update organizer type:', error);
      setError('Failed to update creator type. Please try again.');
    }
  };

  const onRefresh = () => {
    setIsEditing(false);
    refetchOrganizer();
  };

  const showContent = () => {
    const commonProps = {
      eventOrganizer,
      loading: organizerLoading,
      error: organizerError
    };

    switch (activeTab) {
      case 'general':
        return (
          <GeneralForm
            {...commonProps}
            mode={isEditing ? 'edit' : 'view'}
            onRefresh={onRefresh}
          />
        );
      case 'legal':
        return (
          <LegalForm
            mode={isEditing ? 'edit' : 'view'}
            onRefresh={onRefresh}
            {...commonProps}
          />
        );
      default:
        return (
          <BankForm
            mode={isEditing ? 'edit' : 'view'}
            onRefresh={onRefresh}
            {...commonProps}
          />
        );
    }
  };

  useEffect(() => {
    if (
      !organizerLoading &&
      eventOrganizer &&
      !eventOrganizer.organizer_type &&
      !hasProceeded &&
      !showCreatorModal
    ) {
      setShowUnverifiedModal(true);
    }
  }, [eventOrganizer, organizerLoading, hasProceeded, showCreatorModal]);

  useEffect(() => {
    if (user) {
      const userRole = (user as User).role?.name;
      if (userRole !== 'admin' && userRole !== 'business_development') {
        router.push('/events');
      }
    }
  }, [user, router]);

  return (
    <DashboardLayout>
      <Head>
        <title>Creator Detail - Black Hole Dashboard</title>
      </Head>

      <Box>
        {/* Header */}
        <Box
          alignItems="center"
          display="flex"
          justifyContent="space-between"
          marginBottom="24px"
        >
          <H2 color="text.primary" fontWeight={700}>
            Creator Detail
          </H2>
        </Box>

        {/* Tabs Card */}
        <Card sx={{ backgroundColor: 'common.white', borderRadius: 0 }}>
          <CardContent sx={{ padding: '16px 24px' }}>
            <Box
              alignItems="center"
              display="flex"
              justifyContent="space-between"
              mb={2}
            >
              <Box flex="1">
                <Tabs
                  activeTab={activeTab}
                  tabs={tabs}
                  onTabChange={handleTabChange}
                />
              </Box>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                my: 3
              }}
            >
              <H4 gutterBottom color="text.primary">
                {isEditing ? 'Edit Account: ' : ''}
                {activeLable}
              </H4>
              <Button
                id={isEditing ? 'cancel_button' : `edit_${activeTab}_button`}
                variant={isEditing ? 'secondary' : 'primary'}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : `Edit ${activeLable}`}
              </Button>
            </Box>

            {/* Content */}
            {showContent()}

            {/* Error Alert */}
            {(error || organizerError || updateError) && (
              <Box py={4} textAlign="center">
                <Body2 gutterBottom>Failed to load data</Body2>
                <Body2>{error || organizerError || updateError}</Body2>
                <Caption color="text.secondary" sx={{ mt: 1 }}>
                  Please check your backend connection and try again.
                </Caption>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Unverified Modal */}
        <UnverifiedModal
          open={showUnverifiedModal}
          onClose={handleUnverifiedModalClose}
          onProceed={handleUnverifiedModalProceed}
        />

        {/* Creator Type Modal */}
        <CreatorTypeModal
          open={showCreatorModal}
          onClose={handleCreatorModalClose}
          onContinue={handleCreatorModalContinue}
          loading={updateLoading}
        />
      </Box>
    </DashboardLayout>
  );
}

export default withAuth(CreatorDetail, { requireAuth: true });

