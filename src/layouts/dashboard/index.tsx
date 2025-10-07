import { Menu as MenuIcon } from '@mui/icons-material';
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
import { formatRoleName, isEventOrganizer, User } from '@/types/auth';
import { EventOrganizer } from '@/types/organizer';

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

  // Function to check if a menu item is active based on current path
  const isMenuItemActive = (itemPath: string) => {
    if (router.pathname === itemPath) {
      return true;
    }

    if (router.pathname.startsWith(itemPath) && router.pathname !== itemPath) {
      // Special handling for /events path to avoid matching /events-submissions
      if (itemPath === '/events' && router.pathname.startsWith('/events/')) {
        return true;
      }
      // Special handling for /finance path to include all finance sub-pages
      if (itemPath === '/finance' && router.pathname.startsWith('/finance/')) {
        return true;
      }
      // For other paths, only match direct children
      const pathSegments = router.pathname.split('/');
      const menuSegments = itemPath.split('/');
      return pathSegments.length === menuSegments.length + 1;
    }

    return false;
  };

  // Get user role for menu access control
  const userRole =
    user && !isEventOrganizer(user) ? (user as User).role?.name : undefined;

  // Get role from session for event organizer users
  const sessionRole =
    user && isEventOrganizer(user) ? 'event_organizer_pic' : userRole;

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

      <Body1 color="text.secondary" padding="16px">
        Menu
      </Body1>
      <List sx={{ padding: 0 }}>
        {menuItems.map((item) => {
          if (
            item.text === 'Approval' &&
            sessionRole !== 'admin' &&
            sessionRole !== 'business_development'
          ) {
            return null;
          }

          // Hide Account menu if user is not event_organizer_pic
          if (
            item.text === 'Account' &&
            sessionRole !== 'event_organizer_pic'
          ) {
            return null;
          }

          const isActive = isMenuItemActive(item.path);

          return (
            <ListItem
              key={item.text}
              selected={isActive}
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
                  <Body2
                    color="text.secondary"
                    fontSize="14px"
                    fontWeight={isActive ? '600' : '400'}
                  >
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
        sx={{
          borderTop: '1px solid',
          borderColor: 'text.secondary',
          marginTop: 'auto',
          padding: '16px'
        }}
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
              transition: 'opacity 0.2s ease',
              justifyContent: 'space-between'
            }}
            onClick={handleProfileMenuOpen}
          >
            <Box alignItems="center" display="flex">
              {(() => {
                if (!user) {
                  return (
                    <>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '8px',
                          marginRight: '8px',
                          backgroundColor: 'secondary.dark',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Body2
                          color="text.secondary"
                          fontSize="16px"
                          fontWeight="600"
                        >
                          U
                        </Body2>
                      </Box>
                      <Box>
                        <Body2
                          color="common.white"
                          fontSize="14px"
                          fontWeight="500"
                        >
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

                // Handle event organizer user type
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
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '8px',
                            marginRight: '8px',
                            backgroundColor: 'secondary.dark',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Body2
                            color="text.secondary"
                            fontSize="16px"
                            fontWeight="600"
                          >
                            {displayName?.charAt(0)?.toUpperCase() || 'U'}
                          </Body2>
                        </Box>
                      )}
                      <Box>
                        <Body2
                          color="common.white"
                          fontSize="14px"
                          fontWeight="500"
                        >
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

                // Handle regular user type
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
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '8px',
                          marginRight: '8px',
                          backgroundColor: 'secondary.dark',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Body2
                          color="text.secondary"
                          fontSize="16px"
                          fontWeight="600"
                        >
                          {displayName?.charAt(0)?.toUpperCase() || 'U'}
                        </Body2>
                      </Box>
                    )}
                    <Box>
                      <Body2
                        color="common.white"
                        fontSize="14px"
                        fontWeight="500"
                      >
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
              })()}
            </Box>
            <Image
              alt="Arrow"
              height={16}
              src="/icon/accordion-arrow.svg"
              style={{
                opacity: 0.7,
                transform: Boolean(anchorEl)
                  ? 'rotate(180deg)'
                  : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }}
              width={16}
            />
          </Box>
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
          slotProps={{
            paper: {
              sx: {
                backgroundColor: 'common.white',
                boxShadow: '0 4px 20px 0 rgba(40, 72, 107, 0.15)',
                borderRadius: 0,
                minWidth: 259
              }
            }
          }}
        >
          <MenuItem
            onClick={() => {
              handleProfileMenuClose();
              router.push('/dashboard/privacy-policy');
            }}
            sx={{
              padding: '12px 16px',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 'auto' }}>
              <Image
                alt="Privacy Policy"
                src="/icon/file.svg"
                height={18}
                width={18}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </ListItemIcon>
            <ListItemText
              primary={
                <Body2 color="text.primary" fontSize="14px" fontWeight="400">
                  Privacy Policy
                </Body2>
              }
            />
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleProfileMenuClose();
              router.push('/dashboard/term-and-condition');
            }}
            sx={{
              padding: '12px 16px',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 'auto' }}>
              <Image
                alt="Terms & Condition"
                src="/icon/file.svg"
                height={18}
                width={18}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </ListItemIcon>
            <ListItemText
              primary={
                <Body2 color="text.primary" fontSize="14px" fontWeight="400">
                  Terms & Condition
                </Body2>
              }
            />
          </MenuItem>

          <Box
            sx={{
              height: '1px',
              backgroundColor: 'grey.200',
              margin: '4px 0'
            }}
          />

          <MenuItem
            onClick={handleLogout}
            sx={{
              padding: '12px 16px',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 'auto' }}>
              <Image
                alt="Logout"
                src="/icon/logout.svg"
                height={18}
                width={18}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </ListItemIcon>
            <ListItemText
              primary={
                <Body2 color="text.primary" fontSize="14px" fontWeight="400">
                  Logout
                </Body2>
              }
            />
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
