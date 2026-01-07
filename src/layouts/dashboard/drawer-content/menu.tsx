// Menu list component - renders sidebar menu items with role-based visibility and active state
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Box, ListItemText } from '@mui/material';

import { Body2 } from '@/components/common';
import {
  StyledList,
  StyledMenuItem,
  StyledSubMenuItem,
  StyledListItemIcon
} from '../styles';

interface SubMenuItem {
  text: string;
  path: string;
  id: string;
}

interface MenuItem {
  text: string;
  icon: string;
  path: string;
  id: string;
  subMenu?: SubMenuItem[];
}

interface MenuListProps {
  menuItems: MenuItem[];
  sessionRole?: string;
  accountMenuOpen: boolean;
  onAccountMenuToggle: () => void;
  isMenuItemActive: (path: string) => boolean;
  isSubMenuItemActive: (path: string) => boolean;
}


export const MenuList = ({
  menuItems,
  accountMenuOpen,
  onAccountMenuToggle,
  isMenuItemActive,
  isSubMenuItemActive
}: MenuListProps) => {
  const router = useRouter();

  const renderMenuItem = (item: MenuItem) => {

    const isActive = isMenuItemActive(item.path);

    // Handle Account menu with sub menu
    if (item.text === 'Account' && item.subMenu) {
      const hasActiveSubMenu = item.subMenu.some((subItem) =>
        isSubMenuItemActive(subItem.path)
      );
      const isAccountActive = isActive || hasActiveSubMenu;

      return (
        <Box key={item.text}>
          <StyledMenuItem
            id={item.id}
            alignItems="center"
            isActive={isAccountActive}
            onClick={onAccountMenuToggle}
          >
            <StyledListItemIcon>
              <Image alt={item.text} height={24} src={item.icon} width={24} />
            </StyledListItemIcon>
            <ListItemText
              primary={
                <Body2
                  color="text.secondary"
                  fontSize="14px"
                  fontWeight={isAccountActive ? '600' : '400'}
                >
                  {item.text}
                </Body2>
              }
            />
            <Image
              alt="Arrow"
              height={16}
              src="/icon/accordion-arrow.svg"
              style={{
                opacity: 0.7,
                transform: accountMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease',
                marginLeft: 'auto'
              }}
              width={16}
            />
          </StyledMenuItem>
          {accountMenuOpen && (
            <Box>
              {item.subMenu.map((subItem) => {
                const isSubActive = isSubMenuItemActive(subItem.path);
                return (
                  <StyledSubMenuItem
                    id={subItem.id}
                    key={subItem.id}
                    alignItems="center"
                    isActive={isSubActive}
                    onClick={() => router.push(subItem.path)}
                  >
                    <StyledListItemIcon>
                      <Image
                        alt={subItem.text}
                        height={24}
                        src="/icon/account.svg"
                        width={24}
                      />
                    </StyledListItemIcon>
                    <ListItemText
                      primary={
                        <Body2
                          color="text.secondary"
                          fontSize="14px"
                          fontWeight={isSubActive ? '600' : '400'}
                        >
                          {subItem.text}
                        </Body2>
                      }
                    />
                  </StyledSubMenuItem>
                );
              })}
            </Box>
          )}
        </Box>
      );
    }

    return (
      <StyledMenuItem
        id={item.id}
        key={item.text}
        alignItems="center"
        isActive={isActive}
        onClick={() => router.push(item.path)}
      >
        <StyledListItemIcon>
          <Image alt={item.text} height={24} src={item.icon} width={24} />
        </StyledListItemIcon>
        <ListItemText
          primary={
            <Body2
              color="text.secondary"
              fontSize="14px"
              fontWeight={isActive ? '600' : '400'}
            >
              {item.text}
            </Body2>
          }
        />
      </StyledMenuItem>
    );
  };

  return <StyledList>{menuItems.map(renderMenuItem)}</StyledList>;
};

