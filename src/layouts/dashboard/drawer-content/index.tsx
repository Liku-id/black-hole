// Drawer content component - wrapper for sidebar content including logo, menu list, and user profile
import Image from 'next/image';
import { Box } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { Body1 } from '@/components/common';
import { LogoContainer, UserMenuContainer } from '../styles';
import { MenuList } from './menu';
import { ProfileContent } from './profile-content';
import { ProfileMenu } from './profile-menu';

interface MenuItem {
  text: string;
  icon: string;
  path: string;
  id: string;
  subMenu?: Array<{
    text: string;
    path: string;
    id: string;
  }>;
}

const menuItems: MenuItem[] = [
  {
    text: 'Dashboard',
    icon: '/icon/dashboard.svg',
    path: '/dashboard',
    id: 'dashboard_menu'
  },
  { text: 'Event', icon: '/icon/event.svg', path: '/events', id: 'event_menu' },
  {
    text: 'Approval',
    icon: '/icon/approval.svg',
    path: '/approval',
    id: 'approval_menu'
  },
  {
    text: 'Finance',
    icon: '/icon/finance.svg',
    path: '/finance',
    id: 'finance_menu'
  },
  {
    text: 'Ticket',
    icon: '/icon/ticket.svg',
    path: '/tickets',
    id: 'ticket_menu'
  },
  {
    text: 'Account',
    icon: '/icon/account.svg',
    path: '/account',
    id: 'account_menu',
    subMenu: [
      {
        text: 'General Setting',
        path: '/account',
        id: 'general_setting_menu'
      },
      {
        text: 'Team Member',
        path: '/team',
        id: 'team_member_menu'
      }
    ]
  },
  {
    text: 'Creator',
    icon: '/icon/creator.svg',
    path: '/creator',
    id: 'creator_menu'
  }
];

interface DrawerContentProps {
  sessionRole?: string;
  user: any;
  anchorEl: HTMLElement | null;
  onProfileMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
  onProfileMenuClose: () => void;
  onLogout: () => void;
}

export const DrawerContent = ({
  sessionRole,
  user,
  anchorEl,
  onProfileMenuOpen,
  onProfileMenuClose,
  onLogout
}: DrawerContentProps) => {
  const router = useRouter();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const isMenuItemActive = (itemPath: string) => {
    if (router.pathname === itemPath) {
      return true;
    }

    if (router.pathname.startsWith(itemPath) && router.pathname !== itemPath) {
      if (itemPath === '/events' && router.pathname.startsWith('/events/')) {
        return true;
      }
      if (itemPath === '/finance' && router.pathname.startsWith('/finance/')) {
        return true;
      }
      const pathSegments = router.pathname.split('/');
      const menuSegments = itemPath.split('/');
      return pathSegments.length === menuSegments.length + 1;
    }

    return false;
  };

  const isSubMenuItemActive = (subMenuPath: string) => {
    return router.pathname === subMenuPath;
  };

  useEffect(() => {
    const accountMenuItem = menuItems.find((item) => item.text === 'Account');
    if (accountMenuItem?.subMenu) {
      const hasActiveSubMenu = accountMenuItem.subMenu.some(
        (subItem) => router.pathname === subItem.path
      );
      if (hasActiveSubMenu) {
        setAccountMenuOpen(true);
      }
    }
  }, [router.pathname]);

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <LogoContainer>
        <Image
          alt="Wukong Logo"
          height={48}
          src="/logo/wukong.svg"
          width={176}
        />
      </LogoContainer>

      <Body1 color="text.secondary" padding="16px">
        Menu
      </Body1>

      <MenuList
        menuItems={menuItems}
        sessionRole={sessionRole}
        accountMenuOpen={accountMenuOpen}
        onAccountMenuToggle={() => setAccountMenuOpen(!accountMenuOpen)}
        isMenuItemActive={isMenuItemActive}
        isSubMenuItemActive={isSubMenuItemActive}
      />

      <UserMenuContainer>
        <Box alignItems="center" display="flex" justifyContent="space-between">
          <ProfileContent
            user={user}
            anchorEl={anchorEl}
            onProfileMenuOpen={onProfileMenuOpen}
          />
        </Box>

        <ProfileMenu
          anchorEl={anchorEl}
          onClose={onProfileMenuClose}
          onLogout={onLogout}
        />
      </UserMenuContainer>
    </Box>
  );
};
