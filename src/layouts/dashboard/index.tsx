import { Logout as LogoutIcon, Menu as MenuIcon } from '@mui/icons-material';
import {
  AppBar,
  Box,
  Container,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar
} from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { Body1, Body2 } from '@/components/common';
import { useAuth } from '@/contexts/AuthContext';
import { formatRoleName } from '@/types/auth';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const drawerWidth = 290;

const menuItems = [
  { text: 'Dashboard', icon: '/icon/dashboard.svg', path: '/dashboard' },
  { text: 'Event', icon: '/icon/event.svg', path: '/events' },
  { text: 'Approval', icon: '/icon/approval.svg', path: '/approval' },
  { text: 'Finance', icon: '/icon/finance.svg', path: '/finance' },
  { text: 'Ticket', icon: '/icon/ticket.svg', path: '/tickets' },
  { text: 'Account', icon: '/icon/account.svg', path: '/account' }
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const drawer = (
    <Box display="flex" flexDirection="column" height="100%">
      <Box
        marginBottom="68px"
        padding="16px"
        sx={{ backgroundColor: 'primary.dark' }}
      >
        <Image
          alt="Wukong Logo"
          height={48}
          src="/logo/wukong.svg"
          width={176}
        />
      </Box>

      <Body1 color="text.secondary" padding="0px 16px">
        Menu
      </Body1>
      <List sx={{ padding: 0 }}>
        {menuItems.map((item) => {
          return (
            <ListItem
              key={item.text}
              button
              selected={router.pathname === item.path}
              sx={{
                alignItems: 'center',
                padding: '16px',
                margin: 0,
                '&.Mui-selected': {
                  backgroundColor: 'secondary.dark',
                  '&:hover': {
                    backgroundColor: 'secondary.dark'
                  }
                },
                '&:hover': {
                  backgroundColor: 'secondary.dark'
                }
              }}
              onClick={() => router.push(item.path)}
            >
              <ListItemIcon
                sx={{
                  minWidth: 'auto',
                  marginRight: '8px'
                }}
              >
                <Image alt={item.text} height={24} src={item.icon} width={24} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Body2 color="text.secondary" fontSize="14px">
                    {item.text}
                  </Body2>
                }
              />
            </ListItem>
          );
        })}
      </List>

      {/* User Menu */}
      <Box
        borderColor="text.secondary"
        borderTop="1px solid"
        marginTop="auto"
        padding="16px"
      >
        <Box alignItems="center" display="flex" justifyContent="space-between">
          <Box
            alignItems="center"
            display="flex"
            sx={{
              cursor: 'pointer',
              flex: 1,
              '&:hover': {
                opacity: 0.8
              },
              transition: 'opacity 0.2s ease'
            }}
            onClick={handleProfileMenuOpen}
          >
            {user?.profilePicture?.url ? (
              <Box
                alt={user.fullName || 'Profile'}
                component="img"
                src={user.profilePicture.url}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '8px', // Rounded square as per design
                  marginRight: '8px',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '8px', // Rounded square as per design
                  marginRight: '8px',
                  backgroundColor: 'secondary.dark',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Body2 color="text.secondary" fontSize="16px" fontWeight="600">
                  {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </Body2>
              </Box>
            )}
            <Box>
              <Body2 color="common.white" fontSize="14px" fontWeight="500">
                {user?.fullName || 'EKUID Creative Organizer'}
              </Body2>
              <Body2
                color="text.secondary"
                fontSize="12px"
                sx={{ marginTop: '4px', opacity: 0.7 }}
              >
                {user?.role?.name ? formatRoleName(user.role.name) : 'Admin'}
              </Body2>
            </Box>
          </Box>
          <Image
            alt="Arrow"
            height={16}
            src="/icon/accordion-arrow.svg"
            style={{ opacity: 0.7 }}
            width={16}
          />
        </Box>

        <Menu
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
          onClose={handleProfileMenuClose}
        >
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );

  return (
    <Box display="flex">
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'primary.dark'
        }}
      >
        <Toolbar
          sx={{
            backgroundColor: 'common.white',
            height: '80px'
          }}
        >
          <IconButton
            aria-label="open drawer"
            color="inherit"
            edge="start"
            sx={{ mr: 2, display: { sm: 'none' } }}
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box component="nav" flexShrink={{ sm: 0 }} width={{ sm: drawerWidth }}>
        <Drawer
          ModalProps={{
            keepMounted: true
          }}
          open={mobileOpen}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: 'primary.dark'
            }
          }}
          variant="temporary"
          onClose={handleDrawerToggle}
        >
          {drawer}
        </Drawer>
        <Drawer
          open
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: 'primary.dark'
            }
          }}
          variant="permanent"
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        flexGrow={1}
        minHeight="100vh"
        padding="115px 40px"
        sx={{ backgroundColor: 'primary.light' }}
        width={{ sm: `calc(100% - ${drawerWidth}px)` }}
      >
        <Container maxWidth="lg" sx={{ padding: '0px !important' }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}
