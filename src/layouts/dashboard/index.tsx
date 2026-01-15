// Main dashboard layout component - provides header bar, sidebar menu, and main content area
import { Menu as MenuIcon } from '@mui/icons-material';
import { Box, Container, IconButton } from '@mui/material';
import { useAtom } from 'jotai';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import {
  selectedEOIdAtom,
  selectedEONameAtom
} from '@/atoms/eventOrganizerAtom';
import { useAuth } from '@/contexts/AuthContext';
import { eventOrganizerService } from '@/services/event-organizer';
import { isEventOrganizer, User } from '@/types/auth';
import { EventOrganizer } from '@/types/organizer';

import { DrawerContent } from './drawer-content';
import { EventOrganizerDropdown } from './event-organizer-dropdown';
import {
  drawerWidth,
  StyledAppBar,
  StyledToolbar,
  StyledDrawer,
  StyledPermanentDrawer,
  StyledMainBox
} from './styles';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [eventOrganizers, setEventOrganizers] = useState<EventOrganizer[]>([]);
  const [loadingOrganizers, setLoadingOrganizers] = useState(false);
  const [selectedEOId, setSelectedEOId] = useAtom(selectedEOIdAtom);
  const [selectedEOName, setSelectedEOName] = useAtom(selectedEONameAtom);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  // Calculate user role and admin status
  const userRole =
    user && !isEventOrganizer(user) ? (user as User).role?.name : undefined;
  const sessionRole =
    user && isEventOrganizer(user) ? 'event_organizer_pic' : userRole;
  const isAdmin =
    sessionRole === 'admin' ||
    (process.env.NEXT_PUBLIC_PREVILAGE_ROLE || '').includes(sessionRole || '');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch event organizers when dropdown is open
  useEffect(() => {
    const fetchEventOrganizers = async () => {
      if (!isAdmin || !dropdownOpen) return;

      try {
        setLoadingOrganizers(true);
        const params = searchQuery.trim() ? { name: searchQuery.trim() } : {};
        const response =
          await eventOrganizerService.getAllEventOrganizers(params);
        setEventOrganizers(response.body.eventOrganizers);
      } catch (error) {
        console.error('Failed to fetch event organizers:', error);
      } finally {
        setLoadingOrganizers(false);
      }
    };

    fetchEventOrganizers();
  }, [isAdmin, searchQuery, dropdownOpen]);

  // Reset search when dropdown closes
  useEffect(() => {
    if (!dropdownOpen) {
      setSearchInput('');
      setSearchQuery('');
    }
  }, [dropdownOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const container = document.querySelector('[data-dropdown-container]');
      if (dropdownOpen && container && !container.contains(target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const getDisplayValue = () => {
    if (selectedEOId === '' || selectedEOId === '0') {
      return 'All Event Organizer';
    }
    if (selectedEOName) {
      return selectedEOName;
    }
    const foundEO = eventOrganizers.find((eo) => eo.id === selectedEOId);
    return foundEO?.name || 'All Event Organizer';
  };

  const handleSelectOrganizer = (eoId: string) => {
    if (eoId === '0') {
      setSelectedEOId('');
      setSelectedEOName('');
    } else {
      setSelectedEOId(eoId);
      const eo = eventOrganizers.find((item) => item.id === eoId);
      setSelectedEOName(eo?.name || '');
    }
    setDropdownOpen(false);
  };

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
      setSelectedEOId('');
      setSelectedEOName('');
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setDropdownOpen(true);
  };

  const handleSearchFocus = () => {
    if (!dropdownOpen) {
      setSearchInput('');
    }
    setDropdownOpen(true);
  };

  return (
    <Box display="flex">
      {/* Header bar - top navigation with menu toggle and event organizer dropdown */}
      <StyledAppBar position="fixed">
        <StyledToolbar>
          <IconButton
            aria-label="open drawer"
            color="inherit"
            edge="start"
            sx={{ mr: 2, display: { sm: 'none' } }}
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>

          <EventOrganizerDropdown
            isAdmin={isAdmin}
            pathname={router.pathname}
            loadingOrganizers={loadingOrganizers}
            selectedEOId={selectedEOId}
            selectedEOName={selectedEOName}
            eventOrganizers={eventOrganizers}
            searchQuery={searchQuery}
            dropdownOpen={dropdownOpen}
            searchInput={searchInput}
            displayValue={getDisplayValue()}
            onSearchChange={handleSearchChange}
            onSearchFocus={handleSearchFocus}
            onSelectOrganizer={handleSelectOrganizer}
          />
        </StyledToolbar>
      </StyledAppBar>

      {/* Sidebar menu - left navigation drawer with menu items and user profile */}
      <Box component="nav" flexShrink={{ sm: 0 }} width={{ sm: drawerWidth }}>
        <StyledDrawer
          ModalProps={{ keepMounted: true }}
          open={mobileOpen}
          variant="temporary"
          onClose={handleDrawerToggle}
        >
          <DrawerContent
            sessionRole={sessionRole}
            user={user}
            anchorEl={anchorEl}
            onProfileMenuOpen={handleProfileMenuOpen}
            onProfileMenuClose={handleProfileMenuClose}
            onLogout={handleLogout}
          />
        </StyledDrawer>
        <StyledPermanentDrawer open variant="permanent">
          <DrawerContent
            sessionRole={sessionRole}
            user={user}
            anchorEl={anchorEl}
            onProfileMenuOpen={handleProfileMenuOpen}
            onProfileMenuClose={handleProfileMenuClose}
            onLogout={handleLogout}
          />
        </StyledPermanentDrawer>
      </Box>

      {/* Main content area - page content container */}
      <StyledMainBox component="main">
        <Container maxWidth="lg" sx={{ padding: '0px !important' }}>
          {children}
        </Container>
      </StyledMainBox>
    </Box>
  );
}
