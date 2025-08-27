import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Box, AppBar, Toolbar, Container, Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { Body1, Body2 } from '@/components/common';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const drawerWidth = 290;

const menuItems = [
  { text: 'Dashboard', icon: '/icon/dashboard.svg', path: '/dashboard' },
  { text: 'Event', icon: '/icon/event.svg', path: '/events' },
  { text: 'Finance', icon: '/icon/finance.svg', path: '/finance' },
  { text: 'Ticket', icon: '/icon/ticket.svg', path: '/tickets' },
  { text: 'Account', icon: '/icon/account.svg', path: '/account' },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box 
      display="flex" 
      flexDirection="column" 
      height="100%"
    >
      <Box
        padding="16px"
        marginBottom="68px"
        sx={{ backgroundColor: 'primary.dark' }}
      >
        <Image
          src="/logo/wukong.svg"
          alt="Wukong Logo"
          width={176}
          height={48}
        />
      </Box>

      <Body1 padding="0px 16px" color="text.secondary">Menu</Body1>
      <List sx={{ padding: 0 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => router.push(item.path)}
            selected={router.pathname === item.path}
            sx={{
              alignItems: "center",
              padding: '16px',
              margin: 0,
              '&.Mui-selected': {
                backgroundColor: 'secondary.dark',
                '&:hover': {
                  backgroundColor: 'secondary.dark',
                },
              },
              '&:hover': {
                backgroundColor: 'secondary.dark',
              },
            }}
          >
            <ListItemIcon sx={{
              minWidth: 'auto',
              marginRight: '8px',
            }}>
              <Image
                src={item.icon}
                alt={item.text}
                width={24}
                height={24}
              />
            </ListItemIcon>
            <ListItemText
              primary={
                <Body2 color='text.secondary' fontSize="14px">
                  {item.text}
                </Body2>
              }
            />
          </ListItem>
        ))}
      </List>
      
      {/* User Menu */}
      <Box 
        borderTop="1px solid"
        borderColor="text.secondary"
        padding="16px"
        marginTop="auto"
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Box 
              width="40px" 
              height="40px" 
              borderRadius="8px"
              marginRight="8px"
              sx={{ backgroundColor: 'secondary.dark' }}
            />
            <Box>
              <Body2 color="text.secondary" fontSize="14px">
                EKUID Creative Organizer
              </Body2>
              <Body2 color="text.secondary" fontSize="12px" sx={{ marginTop: '8px' }}>
                Admin
              </Body2>
            </Box>
          </Box>
          <Image 
            src="/icon/accordion-arrow.svg" 
            alt="Arrow" 
            width={16} 
            height={16}
          />
        </Box>
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
          backgroundColor: 'primary.dark',
        }}
      >
        <Toolbar sx={{ 
          backgroundColor: 'common.white',
          height: '80px'
        }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        width={{ sm: drawerWidth }}
        flexShrink={{ sm: 0 }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: 'primary.dark',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: 'primary.dark',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        flexGrow={1}
        width={{ sm: `calc(100% - ${drawerWidth}px)` }}
        minHeight="100vh"
        padding="140px 40px"
        sx={{ backgroundColor: 'primary.light' }}
      >
        <Container maxWidth="lg" sx={{ padding: '0px !important' }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}
