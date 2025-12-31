// Profile menu dropdown - shows privacy policy, terms & condition, and logout options when user profile is clicked
import Image from 'next/image';
import { useRouter } from 'next/router';

import { Body2 } from '@/components/common';
import {
  StyledMenu,
  StyledMenuItemOption,
  MenuDivider,
  StyledListItemIcon
} from '../styles';

interface ProfileMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onLogout: () => void;
}

export const ProfileMenu = ({
  anchorEl,
  onClose,
  onLogout
}: ProfileMenuProps) => {
  const router = useRouter();

  const handlePrivacyPolicy = () => {
    onClose();
    router.push('/dashboard/privacy-policy');
  };

  const handleTermsCondition = () => {
    onClose();
    router.push('/dashboard/term-and-condition');
  };

  return (
    <StyledMenu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
      open={Boolean(anchorEl)}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'right'
      }}
      onClose={onClose}
    >
      <StyledMenuItemOption id="privacy_policy_menu" onClick={handlePrivacyPolicy}>
        <StyledListItemIcon>
          <Image
            alt="Privacy Policy"
            src="/icon/file.svg"
            height={18}
            width={18}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </StyledListItemIcon>
        <Body2 color="text.primary" fontSize="14px" fontWeight="400">
          Privacy Policy
        </Body2>
      </StyledMenuItemOption>

      <StyledMenuItemOption
        id="term_and_condition_menu"
        onClick={handleTermsCondition}
      >
        <StyledListItemIcon>
          <Image
            alt="Terms & Condition"
            src="/icon/file.svg"
            height={18}
            width={18}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </StyledListItemIcon>
        <Body2 color="text.primary" fontSize="14px" fontWeight="400">
          Terms & Condition
        </Body2>
      </StyledMenuItemOption>

      <MenuDivider />

      <StyledMenuItemOption id="logout" onClick={onLogout}>
        <StyledListItemIcon>
          <Image
            alt="Logout"
            src="/icon/logout.svg"
            height={18}
            width={18}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </StyledListItemIcon>
        <Body2 color="text.primary" fontSize="14px" fontWeight="400">
          Logout
        </Body2>
      </StyledMenuItemOption>
    </StyledMenu>
  );
};

