import {
  AppBar,
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar
} from '@mui/material';
import { styled } from '@mui/material/styles';

export const drawerWidth = 290;

export const StyledAppBar = styled(AppBar)(({ theme }) => ({
  width: `calc(100% - ${drawerWidth}px)`,
  marginLeft: drawerWidth,
  backgroundColor: theme.palette.primary.dark,
  boxShadow: '0 4px 20px 0 rgba(40, 72, 107, 0.05)',
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginLeft: 0
  }
}));

export const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  height: '80px'
}));

export const StyledDrawer = styled(Drawer)(({ theme }) => ({
  display: 'block',
  '& .MuiDrawer-paper': {
    boxSizing: 'border-box',
    width: drawerWidth,
    backgroundColor: theme.palette.primary.dark
  },
  [theme.breakpoints.up('sm')]: {
    display: 'none'
  }
}));

export const StyledPermanentDrawer = styled(Drawer)(({ theme }) => ({
  display: 'none',
  '& .MuiDrawer-paper': {
    boxSizing: 'border-box',
    width: drawerWidth,
    backgroundColor: theme.palette.primary.dark
  },
  [theme.breakpoints.up('sm')]: {
    display: 'block'
  }
}));

export const StyledMainBox = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  minHeight: '100vh',
  padding: '115px 40px',
  backgroundColor: theme.palette.primary.light,
  width: `calc(100% - ${drawerWidth}px)`,
  [theme.breakpoints.down('sm')]: {
    width: '100%'
  }
}));

export const LogoContainer = styled(Box)(({ theme }) => ({
  marginBottom: '48px',
  padding: '16px 16px 0px',
  backgroundColor: theme.palette.primary.dark
}));

export const StyledList = styled(List)({
  padding: 0
});

export const StyledMenuItem = styled(ListItem)<{ isActive?: boolean }>(
  ({ theme, isActive }) => ({
    alignItems: 'center',
    padding: '16px',
    margin: 0,
    cursor: 'pointer',
    backgroundColor: isActive
      ? theme.palette.secondary.dark
      : 'transparent',
    '&:hover': {
      backgroundColor: theme.palette.secondary.dark
    }
  })
);

export const StyledSubMenuItem = styled(ListItem)<{ isActive?: boolean }>(
  ({ theme, isActive }) => ({
    alignItems: 'center',
    padding: '16px 16px 16px 40px',
    margin: 0,
    cursor: 'pointer',
    backgroundColor: isActive
      ? theme.palette.secondary.dark
      : 'transparent',
    '&:hover': {
      backgroundColor: theme.palette.secondary.dark
    }
  })
);

export const StyledListItemIcon = styled(ListItemIcon)({
  minWidth: 'auto',
  marginRight: '8px'
});

export const UserMenuContainer = styled(Box)(({ theme }) => ({
  borderTop: '1px solid',
  borderColor: theme.palette.text.secondary,
  marginTop: 'auto',
  padding: '16px'
}));

export const ProfileMenuBox = styled(Box)({
  cursor: 'pointer',
  flex: 1,
  '&:hover': {
    opacity: 0.8
  },
  transition: 'opacity 0.2s ease',
  justifyContent: 'space-between'
});

export const AvatarBox = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: '8px',
  marginRight: '8px',
  backgroundColor: theme.palette.secondary.dark,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}));

export const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    backgroundColor: theme.palette.common.white,
    boxShadow: '0 4px 20px 0 rgba(40, 72, 107, 0.15)',
    borderRadius: 0,
    minWidth: 259
  }
}));

export const StyledMenuItemOption = styled(MenuItem)({
  padding: '12px 16px',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)'
  }
});

export const MenuDivider = styled(Box)(({ theme }) => ({
  height: '1px',
  backgroundColor: theme.palette.grey[200],
  margin: '4px 0'
}));

export const DropdownContainer = styled(Box)({
  width: '220px',
  marginLeft: '12px',
  position: 'relative'
});

export const DropdownBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  marginTop: '4px',
  backgroundColor: theme.palette.common.white,
  borderRadius: '4px',
  boxShadow: '0 4px 20px 0 rgba(40, 72, 107, 0.15)',
  zIndex: 1300,
  maxHeight: '300px',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '8px'
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1'
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#888',
    borderRadius: '4px'
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: '#555'
  }
}));

export const DropdownItem = styled(Box)<{ isSelected?: boolean }>(
  ({ isSelected }) => ({
    padding: '12px 16px',
    cursor: 'pointer',
    backgroundColor: isSelected ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)'
    }
  })
);

export const StyledDivider = styled(Divider)(({ theme }) => ({
  borderColor: theme.palette.divider
}));

