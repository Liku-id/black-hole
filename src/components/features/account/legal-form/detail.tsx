import Image from 'next/image';
import { Box, Grid, Avatar } from '@mui/material';

import { Body2 } from '@/components/common';

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
  rejectedFields?: string[];
  rejectedReason?: string;
}

interface OrganizerDetailProps {
  organizerDetail: OrganizerDetail;
}

// OrganizerField component
const OrganizerField = ({
  label,
  value,
  isTextArea = false,
  icon
}: {
  label: string;
  value: string;
  isTextArea?: boolean;
  isRejected?: boolean;
  icon?: React.ReactNode;
}) => (
  <Box>
    <Body2 color="text.primary" mb={1}>
      {label}
    </Body2>
    <Box
      border="1px solid"
      borderColor="primary.main"
      borderRadius={1}
      overflow="scroll"
      sx={{
        display: 'flex',
        alignItems: isTextArea ? 'flex-start' : 'center',
        backgroundColor: 'primary.light',
        padding: icon ? '0' : isTextArea ? '14px 16px' : '0px 16px',
        height: '46px',
        ...(isTextArea && { height: '156px' })
      }}
    >
      {icon && (
        <Box
          borderRight="1px solid"
          borderColor="primary.main"
          padding="0px 11px 0px 16px"
          height="100%"
          display="flex"
          alignItems="center"
          marginRight="10px"
        >
          {icon}
        </Box>
      )}
      <Body2 color="text.primary">{value}</Body2>
    </Box>
  </Box>
);




// ProfilePictureField component
const ProfilePictureField = ({
  profilePicture,
  pictName
}: {
  profilePicture?: string;
  pictName?: string;
}) => (
  <Box>
    <Body2 color="text.primary" mb={1}>
      Profile Picture{' '}
    </Body2>
    <Box
      border="1px solid"
      borderColor="primary.main"
      borderRadius={1}
      p="12px 16px"
      sx={{ backgroundColor: 'primary.light' }}
    >
      <Body2 color="text.primary">
        {pictName || 'No profile picture uploaded'}
      </Body2>
    </Box>
    {profilePicture && (
      <Image
        src={profilePicture}
        alt="Profile Picture"
        width={84}
        height={84}
        style={{
          maxHeight: '100px',
          height: 'auto',
          width: 'auto',
          maxWidth: '100%',
          objectFit: 'contain',
          display: 'block'
        }}
      />
    )}
  </Box>
);

export const LegelFormDetailInfo = ({
  organizerDetail
}: OrganizerDetailProps) => {
  return (
    <>
      <Grid container spacing={3}>
        {/* Left Grid */}
        <Grid item md={6} xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <OrganizerField
                label="Organizer Name*"
                value={organizerDetail.name}
              />
            </Grid>
            <Grid item xs={12}>
              <OrganizerField
                label="Phone Number*"
                value={organizerDetail.phoneNumber}
                icon={<Body2>+62</Body2>}
              />
            </Grid>
            <Grid item xs={12}>
              {organizerDetail.socialMedia &&
              organizerDetail.socialMedia.length > 0 ? (
                organizerDetail.socialMedia.map((social, index) => (
                  <Box
                    key={index}
                    mb={index < organizerDetail.socialMedia.length - 1 ? 1 : 0}
                  >
                    <OrganizerField
                      label={index === 0 ? 'Social Media' : ''}
                      value={social.url}
                      icon={
                        <Image
                          src={`/icon/${social.platform.toLowerCase()}.svg`}
                          alt={social.platform.toLowerCase()}
                          width={24}
                          height={24}
                        />
                      }
                    />
                  </Box>
                ))
              ) : (
                <OrganizerField
                  label="Social Media"
                  value="No social media links"
                />
              )}
            </Grid>
            <Grid item xs={12}>
              <OrganizerField
                label="About Organizer"
                value={organizerDetail.aboutOrganizer}
                isTextArea
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Right Grid */}
        <Grid item md={6} xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <OrganizerField
                label="Email Address*"
                value={organizerDetail.email}
              />
            </Grid>
            <Grid item xs={12}>
              <OrganizerField label="Address" value={organizerDetail.address} />
            </Grid>
            <Grid item xs={12}>
              <ProfilePictureField
                profilePicture={organizerDetail.profilePicture}
                pictName={organizerDetail.pictName}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
