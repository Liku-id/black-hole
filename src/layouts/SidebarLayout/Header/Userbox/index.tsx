import { useRef, useState } from 'react';

import NextLink from 'next/link';

import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Hidden,
  lighten,
  List,
  ListItem,
  ListItemText,
  Popover,
  Typography
} from '@mui/material';

import { useAuth } from '@/contexts/AuthContext';
import AccountBoxTwoToneIcon from '@mui/icons-material/AccountBoxTwoTone';
import AccountTreeTwoToneIcon from '@mui/icons-material/AccountTreeTwoTone';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ExpandMoreTwoToneIcon from '@mui/icons-material/ExpandMoreTwoTone';
import InboxTwoToneIcon from '@mui/icons-material/InboxTwoTone';
import LockOpenTwoToneIcon from '@mui/icons-material/LockOpenTwoTone';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/router';

const UserBoxButton = styled(Button)(
  ({ theme }) => `
        padding-left: ${theme.spacing(1)};
        padding-right: ${theme.spacing(1)};
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
        color: ${theme.palette.secondary.main};
        display: block;
`
);

const UserBoxDescription = styled(Typography)(
  ({ theme }) => `
        color: ${lighten(theme.palette.secondary.main, 0.5)}
`
);

function HeaderUserbox() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  const defaultUser = {
    name: user?.name || 'Administrator',
    email: user?.email || 'admin@example.com',
    avatar: '/static/images/avatars/1.jpg',
    jobtitle: user?.role?.name || 'System Administrator',
    role: user?.role
  };

  const ref = useRef<any>(null);
  const [isOpen, setOpen] = useState<boolean>(false);

  const handleOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  const handleLogout = (): void => {
    logout();
    handleClose();
    router.push('/login');
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return 'primary';
      case 'partner':
        return 'secondary';
      case 'buyer':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <>
      <UserBoxButton color="secondary" ref={ref} onClick={handleOpen}>
        <Avatar variant="rounded" alt={defaultUser.name} src={defaultUser.avatar} />
        <Hidden mdDown>
          <UserBoxText>
            <UserBoxLabel variant="body1">{defaultUser.name}</UserBoxLabel>
            <UserBoxDescription variant="body2">
              {defaultUser.jobtitle}
            </UserBoxDescription>
          </UserBoxText>
        </Hidden>
        <Hidden smDown>
          <ExpandMoreTwoToneIcon sx={{ ml: 1 }} />
        </Hidden>
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
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <MenuUserBox sx={{ minWidth: 210 }} display="flex">
          <Avatar variant="rounded" alt={defaultUser.name} src={defaultUser.avatar} />
          <UserBoxText>
            <UserBoxLabel variant="body1">{defaultUser.name}</UserBoxLabel>
            <UserBoxDescription variant="body2">
              {defaultUser.email}
            </UserBoxDescription>
            {defaultUser.role && (
              <Chip
                icon={<AdminPanelSettingsIcon />}
                label={defaultUser.role.name.toUpperCase()}
                color={getRoleColor(defaultUser.role.name) as any}
                size="small"
                sx={{ mt: 1 }}
              />
            )}
          </UserBoxText>
        </MenuUserBox>
        <Divider sx={{ mb: 0 }} />
        <List sx={{ p: 1 }} component="nav">
          <NextLink href="/management/profile" passHref>
            <ListItem button>
              <AccountBoxTwoToneIcon fontSize="small" />
              <ListItemText primary="My Profile" />
            </ListItem>
          </NextLink>
          <NextLink href="/applications/messenger" passHref>
            <ListItem button>
              <InboxTwoToneIcon fontSize="small" />
              <ListItemText primary="Messenger" />
            </ListItem>
          </NextLink>
          <NextLink href="/management/profile/settings" passHref>
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
    </>
  );
}

export default HeaderUserbox;
