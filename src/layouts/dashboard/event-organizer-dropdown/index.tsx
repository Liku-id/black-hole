// Event organizer dropdown component - searchable dropdown in header bar for admin to filter by event organizer
import { Box } from '@mui/material';
import Image from 'next/image';

import { Body2, TextField } from '@/components/common';
import { EventOrganizer } from '@/types/organizer';
import {
  DropdownContainer,
  DropdownBox,
  DropdownItem,
  StyledDivider
} from '../styles';

interface EventOrganizerDropdownProps {
  isAdmin: boolean;
  pathname: string;
  loadingOrganizers: boolean;
  selectedEOId: string;
  selectedEOName: string;
  eventOrganizers: EventOrganizer[];
  searchQuery: string;
  dropdownOpen: boolean;
  searchInput: string;
  displayValue: string;
  onSearchChange: (value: string) => void;
  onSearchFocus: () => void;
  onSelectOrganizer: (eoId: string) => void;
}

const shouldShowDropdown = (
  isAdmin: boolean,
  pathname: string
): boolean => {
  if (!isAdmin) return false;
  return (
    pathname.includes('/events') ||
    pathname === '/dashboard' ||
    pathname === '/finance/withdrawal/history'
  );
};

export const EventOrganizerDropdown = ({
  isAdmin,
  pathname,
  loadingOrganizers,
  selectedEOId,
  selectedEOName,
  eventOrganizers,
  searchQuery,
  dropdownOpen,
  searchInput,
  displayValue,
  onSearchChange,
  onSearchFocus,
  onSelectOrganizer
}: EventOrganizerDropdownProps) => {
  if (!shouldShowDropdown(isAdmin, pathname)) {
    return null;
  }

  const shouldShowDivider = () => {
    return (
      eventOrganizers.length > 0 ||
      (selectedEOId &&
        selectedEOId !== '' &&
        selectedEOId !== '0' &&
        !eventOrganizers.find((eo) => eo.id === selectedEOId))
    );
  };

  const shouldShowSelectedEO = () => {
    return (
      selectedEOId &&
      selectedEOId !== '' &&
      selectedEOId !== '0' &&
      !eventOrganizers.find((eo) => eo.id === selectedEOId) &&
      selectedEOName
    );
  };

  const renderDropdownContent = () => {
    if (loadingOrganizers) {
      return (
        <Box display="flex" justifyContent="center" padding="20px">
          <Body2 color="text.secondary">Loading...</Body2>
        </Box>
      );
    }

    return (
      <>
        <DropdownItem
          isSelected={selectedEOId === '' || selectedEOId === '0'}
          onClick={() => onSelectOrganizer('0')}
        >
          <Body2 color="text.primary" fontSize="14px">
            All Event Organizer
          </Body2>
        </DropdownItem>

        {shouldShowDivider() && <StyledDivider />}

        {shouldShowSelectedEO() && (
          <Box>
            <DropdownItem
              isSelected
              onClick={() => onSelectOrganizer(selectedEOId)}
            >
              <Body2 color="text.primary" fontSize="14px">
                {selectedEOName}
              </Body2>
            </DropdownItem>
            {eventOrganizers.length > 0 && <StyledDivider />}
          </Box>
        )}

        {eventOrganizers.map((eo, index) => (
          <Box key={eo.id}>
            <DropdownItem
              isSelected={selectedEOId === eo.id}
              onClick={() => onSelectOrganizer(eo.id)}
            >
              <Body2 color="text.primary" fontSize="14px">
                {eo.name}
              </Body2>
            </DropdownItem>
            {index < eventOrganizers.length - 1 && <StyledDivider />}
          </Box>
        ))}

        {!loadingOrganizers &&
          eventOrganizers.length === 0 &&
          searchQuery && (
            <Box display="flex" justifyContent="center" padding="20px">
              <Body2 color="text.secondary">No event organizers found</Body2>
            </Box>
          )}
      </>
    );
  };

  return (
    <DropdownContainer data-dropdown-container>
      <TextField
        fullWidth
        placeholder={
          loadingOrganizers
            ? 'Loading...'
            : selectedEOName || 'All Event Organizer'
        }
        value={dropdownOpen ? searchInput : displayValue}
        onChange={(e) => onSearchChange(e.target.value)}
        onFocus={onSearchFocus}
        startComponent={
          <Image alt="Search" height={20} src="/icon/search.svg" width={20} />
        }
      />
      {dropdownOpen && <DropdownBox>{renderDropdownContent()}</DropdownBox>}
    </DropdownContainer>
  );
};

