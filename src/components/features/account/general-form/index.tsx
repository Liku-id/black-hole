import { OrganizerDetailInfo } from './detail';
import { OrganizerEditForm } from './edit';
import { EventOrganizer } from '@/types/organizer';
import { Box } from '@mui/material';
import { Body2 } from '@/components/common';
import { useUpdateEventOrganizerGeneral, useEventOrganizerMe } from '@/hooks';
import { useState } from 'react';

interface SocialMedia {
  platform: string;
  url: string;
}

interface OrganizerDetail {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
  socialMedia: SocialMedia[];
  aboutOrganizer: string;
  profilePicture?: string;
  pictName?: string;
}

interface GeneralFormProps {
  organizerDetail?: OrganizerDetail;
  eventOrganizer?: EventOrganizer | null;
  loading?: boolean;
  error?: string | null;
  mode?: 'view' | 'edit';
  onCancel?: () => void;
}

// Helper function to convert API data to component format
const convertEventOrganizerToDetail = (
  organizer: EventOrganizer
): OrganizerDetail => {
  // Parse social media URLs from JSON string format
  let socialMedia: SocialMedia[] = [];

  if (organizer.social_media_url) {
    try {
      // Parse JSON string to object
      const socialMediaObj = JSON.parse(organizer.social_media_url);
      
      // Convert object to array format
      socialMedia = Object.entries(socialMediaObj).map(([platform, url]) => ({
        platform: platform.charAt(0).toUpperCase() + platform.slice(1), // Capitalize first letter
        url: url as string
      }));
    } catch (error) {
      console.warn('Failed to parse social_media_url:', error);
      
      // Fallback: try to parse as comma-separated URLs
      try {
        const urls = organizer.social_media_url
          .split(',')
          .map((url) => url.trim());
        socialMedia = urls.map((url, index) => ({
          platform: ['TikTok', 'Instagram', 'Twitter'][index] || 'Other',
          url: url
        }));
      } catch (fallbackError) {
        console.warn('Failed to parse social_media_url as comma-separated:', fallbackError);
        socialMedia = [];
      }
    }
  }

  return {
    id: organizer.id,
    name: organizer.name,
    phoneNumber: organizer.phone_number,
    email: organizer.email,
    address: organizer.address,
    socialMedia: socialMedia,
    aboutOrganizer: organizer.description,
    profilePicture: organizer.asset?.url,
    pictName: organizer.asset?.key.split('USER/')[1] || ''
  };
};

const GeneralForm = ({
  organizerDetail,
  eventOrganizer,
  loading,
  error,
  mode = 'view',
  onCancel
}: GeneralFormProps) => {
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <Body2>Loading organizer data...</Body2>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <Body2 color="error.main">Failed to load organizer data: {error}</Body2>
      </Box>
    );
  }

  if (!eventOrganizer) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <Body2>No organizer data found</Body2>
      </Box>
    );
  }

  // Convert API data to component format
  const organizerDetailData = convertEventOrganizerToDetail(eventOrganizer);

  // Use provided organizerDetail if available, otherwise use fetched data
  const finalOrganizerDetail = organizerDetail || organizerDetailData;

  const [isEditing, setIsEditing] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const { updateOrganizer, loading: updateLoading, error: updateErrorState } = useUpdateEventOrganizerGeneral();
  const { mutate: refetchOrganizer } = useEventOrganizerMe();

  const handleEdit = () => {
    setIsEditing(true);
    setUpdateError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setUpdateError(null);
    if (onCancel) {
      onCancel();
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      await updateOrganizer(eventOrganizer.id, data);
      setIsEditing(false);
      setUpdateError(null);
      // Refetch organizer data to get updated information
      refetchOrganizer();
      // Call parent cancel to exit edit mode
      if (onCancel) {
        onCancel();
      }
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Failed to update organizer');
    }
  };

  if (mode === 'view' && !isEditing) {
    return <OrganizerDetailInfo organizerDetail={finalOrganizerDetail} />;
  }

  if (mode === 'edit' || isEditing) {
    return (
      <OrganizerEditForm
        eventOrganizer={eventOrganizer}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        error={updateError || updateErrorState}
        loading={updateLoading}
      />
    );
  }

  return <div>Invalid mode</div>;
};

export default GeneralForm;
