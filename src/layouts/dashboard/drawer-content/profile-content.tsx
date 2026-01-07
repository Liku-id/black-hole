// Profile content - displays user avatar, name, and role in sidebar footer (clickable to open menu)
import Image from 'next/image';
import { Box } from '@mui/material';

import { Body2 } from '@/components/common';
import { formatRoleName, isEventOrganizer, User } from '@/types/auth';
import { EventOrganizer } from '@/types/organizer';
import { AvatarBox, ProfileMenuBox } from '../styles';

interface ProfileContentProps {
  user: User | EventOrganizer | null;
  anchorEl: HTMLElement | null;
  onProfileMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
}

const renderUserContent = (user: User | EventOrganizer | null) => {
  if (!user) {
    return (
      <>
        <AvatarBox>
          <Body2 color="text.secondary" fontSize="16px" fontWeight="600">
            U
          </Body2>
        </AvatarBox>
        <Box>
          <Body2 color="common.white" fontSize="14px" fontWeight="500">
            EKUID Creative Organizer
          </Body2>
          <Body2
            color="text.secondary"
            fontSize="12px"
            sx={{ marginTop: '4px', opacity: 0.7 }}
          >
            Admin
          </Body2>
        </Box>
      </>
    );
  }

  if (isEventOrganizer(user)) {
    const organizer = user as EventOrganizer;
    const profilePictureUrl = organizer.asset?.url;
    const displayName = organizer.name;
    const userRole = 'Event Organizer PIC';

    return (
      <>
        {profilePictureUrl ? (
          <Box
            alignItems="center"
            bgcolor="common.white"
            borderRadius={2}
            display="flex"
            height={40}
            justifyContent="center"
            mr={1}
            width={40}
          >
            <Box
              alt="Profile Picture"
              component="img"
              height="100%"
              src={profilePictureUrl}
              style={{ borderRadius: 8 }}
              width="100%"
            />
          </Box>
        ) : (
          <AvatarBox>
            <Body2 color="text.secondary" fontSize="16px" fontWeight="600">
              {displayName?.charAt(0)?.toUpperCase() || 'U'}
            </Body2>
          </AvatarBox>
        )}
        <Box>
          <Body2 color="common.white" fontSize="14px" fontWeight="500">
            {displayName || 'EKUID Creative Organizer'}
          </Body2>
          <Body2
            color="text.secondary"
            fontSize="12px"
            sx={{ marginTop: '4px', opacity: 0.7 }}
          >
            {userRole}
          </Body2>
        </Box>
      </>
    );
  }

  const regularUser = user as User;
  const profilePictureUrl = regularUser.profilePicture?.url;
  const displayName = regularUser.fullName;
  const userRole = regularUser.role?.name
    ? formatRoleName(regularUser.role.name)
    : 'Admin';

  return (
    <>
      {profilePictureUrl ? (
        <Box
          alignItems="center"
          bgcolor="common.white"
          borderRadius={2}
          display="flex"
          height={40}
          justifyContent="center"
          mr={1}
          width={40}
        >
          <Box
            alt="Profile Picture"
            component="img"
            height="100%"
            src={profilePictureUrl}
            style={{ borderRadius: 8 }}
            width="100%"
          />
        </Box>
      ) : (
        <AvatarBox>
          <Body2 color="text.secondary" fontSize="16px" fontWeight="600">
            {displayName?.charAt(0)?.toUpperCase() || 'U'}
          </Body2>
        </AvatarBox>
      )}
      <Box>
        <Body2 color="common.white" fontSize="14px" fontWeight="500">
          {displayName || 'EKUID Creative Organizer'}
        </Body2>
        <Body2
          color="text.secondary"
          fontSize="12px"
          sx={{ marginTop: '4px', opacity: 0.7 }}
        >
          {userRole}
        </Body2>
      </Box>
    </>
  );
};

export const ProfileContent = ({
  user,
  anchorEl,
  onProfileMenuOpen
}: ProfileContentProps) => {
  return (
    <ProfileMenuBox
      id="profile_menu"
      alignItems="center"
      display="flex"
      onClick={onProfileMenuOpen}
    >
      <Box alignItems="center" display="flex">
        {renderUserContent(user)}
      </Box>
      <Image
        alt="Arrow"
        height={16}
        src="/icon/accordion-arrow.svg"
        style={{
          opacity: 0.7,
          transform: Boolean(anchorEl) ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s ease'
        }}
        width={16}
      />
    </ProfileMenuBox>
  );
};

