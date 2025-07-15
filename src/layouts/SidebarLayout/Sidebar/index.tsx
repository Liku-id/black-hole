import Scrollbar from '@/components/Scrollbar';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarContext } from '@/contexts/SidebarContext';
import NextLink from 'next/link';
import { useContext, useRef, useState } from 'react';

import {
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Popover,
  Typography,
  alpha,
  darken,
  lighten,
  styled,
  useTheme
} from '@mui/material';

import Logo from '@/components/LogoSign';
import SidebarMenu from './SidebarMenu';

import AccountBoxTwoToneIcon from '@mui/icons-material/AccountBoxTwoTone';
import AccountTreeTwoToneIcon from '@mui/icons-material/AccountTreeTwoTone';
import ExpandMoreTwoToneIcon from '@mui/icons-material/ExpandMoreTwoTone';
import InboxTwoToneIcon from '@mui/icons-material/InboxTwoTone';
import LockOpenTwoToneIcon from '@mui/icons-material/LockOpenTwoTone';

const SidebarWrapper = styled(Box)(
  ({ theme }) => `
        width: ${theme.sidebar.width};
        min-width: ${theme.sidebar.width};
        color: ${theme.colors.alpha.trueWhite[70]};
        position: relative;
        z-index: 7;
        height: 100%;
        padding-bottom: 68px;
`
);

const UserBoxButton = styled(Button)(
  ({ theme }) => `
        padding-left: ${theme.spacing(1)};
        padding-right: ${theme.spacing(1)};
        color: ${theme.colors.alpha.trueWhite[70]};
        background-color: transparent;
        width: 100%;
        justify-content: flex-start;
        text-transform: none;
        &:hover {
            background-color: ${alpha(theme.colors.alpha.trueWhite[100], 0.06)};
            color: ${theme.colors.alpha.trueWhite[100]};
        }
`
);

const MenuUserBox = styled(Box)(
  ({ theme }) => `
        background: ${theme.colors.alpha.black[5]};
        padding: ${theme.spacing(2)};
`
);

const UserBoxText = styled(Box)(
  ({ theme }) => `
        text-align: left;
        padding-left: ${theme.spacing(1)};
`
);

const UserBoxLabel = styled(Typography)(
  ({ theme }) => `
        font-weight: ${theme.typography.fontWeightBold};
        color: ${theme.colors.alpha.trueWhite[100]};
        display: block;
        font-size: ${theme.typography.pxToRem(13)};
`
);

const UserBoxDescription = styled(Typography)(
  ({ theme }) => `
        color: ${theme.colors.alpha.trueWhite[50]};
        font-size: ${theme.typography.pxToRem(11)};
`
);

function Sidebar() {
  const { sidebarToggle, toggleSidebar } = useContext(SidebarContext);
  const { user: authUser, logout } = useAuth();
  const closeSidebar = () => toggleSidebar();
  const theme = useTheme();
  
  const user = {
    name: authUser?.fullName || 'User',
    avatar: '/static/images/avatars/1.jpg',
    jobtitle: 'Administrator'
  };

  const ref = useRef<any>(null);
  const [isOpen, setOpen] = useState<boolean>(false);

  const handleOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <SidebarWrapper
        sx={{
          display: {
            xs: 'none',
            lg: 'inline-block'
          },
          position: 'fixed',
          left: 0,
          top: 0,
          background:
            theme.palette.mode === 'dark'
              ? alpha(lighten(theme.header.background, 0.1), 0.5)
              : darken(theme.colors.alpha.black[100], 0.5),
          boxShadow:
            theme.palette.mode === 'dark' ? theme.sidebar.boxShadow : 'none'
        }}
      >
        <Scrollbar>
          <Box mt={3}>
            <Box
              mx={2}
              sx={{
                width: 52
              }}
            >
              <Logo />
            </Box>
          </Box>
          <Divider
            sx={{
              mt: theme.spacing(3),
              mx: theme.spacing(2),
              background: theme.colors.alpha.trueWhite[10]
            }}
          />
          <SidebarMenu />
        </Scrollbar>
        <Divider
          sx={{
            background: theme.colors.alpha.trueWhite[10]
          }}
        />
        <Box px={2} py={0.9}>
          <UserBoxButton color="secondary" ref={ref} onClick={handleOpen}>
            <Avatar 
              variant="rounded" 
              alt={user.name} 
              src={user.avatar}
              sx={{ width: 32, height: 32 }}
            />
            <UserBoxText>
              <UserBoxLabel variant="body1">{user.name}</UserBoxLabel>
              <UserBoxDescription variant="body2">
                {user.jobtitle}
              </UserBoxDescription>
            </UserBoxText>
            <ExpandMoreTwoToneIcon sx={{ ml: 'auto', color: theme.colors.alpha.trueWhite[50] }} />
          </UserBoxButton>
          <Popover
            anchorEl={ref.current}
            onClose={handleClose}
            open={isOpen}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
          >
            <MenuUserBox sx={{ minWidth: 210 }} display="flex">
              <Avatar variant="rounded" alt={user.name} src={user.avatar} />
              <UserBoxText>
                <UserBoxLabel variant="body1" sx={{ color: theme.palette.text.primary }}>
                  {user.name}
                </UserBoxLabel>
                <UserBoxDescription variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  {user.jobtitle}
                </UserBoxDescription>
              </UserBoxText>
            </MenuUserBox>
            <Divider sx={{ mb: 0 }} />
            <List sx={{ p: 1 }} component="nav">
              <NextLink href="/profile" passHref>
                <ListItem button>
                  <AccountBoxTwoToneIcon fontSize="small" />
                  <ListItemText primary="My Profile" />
                </ListItem>
              </NextLink>
              <NextLink href="/messages" passHref>
                <ListItem button>
                  <InboxTwoToneIcon fontSize="small" />
                  <ListItemText primary="Messages" />
                </ListItem>
              </NextLink>
              <NextLink href="/settings" passHref>
                <ListItem button>
                  <AccountTreeTwoToneIcon fontSize="small" />
                  <ListItemText primary="Account Settings" />
                </ListItem>
              </NextLink>
            </List>
            <Divider />
            <Box sx={{ m: 1 }}>
              <Button color="primary" fullWidth onClick={handleLogout}>
                <LockOpenTwoToneIcon sx={{ mr: 1 }} />
                Sign out
              </Button>
            </Box>
          </Popover>
        </Box>
      </SidebarWrapper>
      <Drawer
        sx={{
          boxShadow: `${theme.sidebar.boxShadow}`
        }}
        anchor={theme.direction === 'rtl' ? 'right' : 'left'}
        open={sidebarToggle}
        onClose={closeSidebar}
        variant="temporary"
        elevation={9}
      >
        <SidebarWrapper
          sx={{
            background:
              theme.palette.mode === 'dark'
                ? theme.colors.alpha.white[100]
                : darken(theme.colors.alpha.black[100], 0.5)
          }}
        >
          <Scrollbar>
            <Box mt={3}>
              <Box
                mx={2}
                sx={{
                  width: 52
                }}
              >
                <Logo />
              </Box>
            </Box>
            <Divider
              sx={{
                mt: theme.spacing(3),
                mx: theme.spacing(2),
                background: theme.colors.alpha.trueWhite[10]
              }}
            />
            <SidebarMenu />
          </Scrollbar>
          <Divider
            sx={{
              background: theme.colors.alpha.trueWhite[10]
            }}
          />
          <Box p={2} pb={8}>
            <UserBoxButton color="secondary" ref={ref} onClick={handleOpen}>
              <Avatar 
                variant="rounded" 
                alt={user.name} 
                src={user.avatar}
                sx={{ width: 32, height: 32 }}
              />
              <UserBoxText>
                <UserBoxLabel variant="body1">{user.name}</UserBoxLabel>
                <UserBoxDescription variant="body2">
                  {user.jobtitle}
                </UserBoxDescription>
              </UserBoxText>
              <ExpandMoreTwoToneIcon sx={{ ml: 'auto', color: theme.colors.alpha.trueWhite[50] }} />
            </UserBoxButton>
          </Box>
        </SidebarWrapper>
      </Drawer>
    </>
  );
}

export default Sidebar;
