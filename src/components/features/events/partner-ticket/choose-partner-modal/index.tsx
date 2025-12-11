import { Box, Divider } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FC, useState, useMemo, useEffect } from 'react';

import { Body2, Popup, TextField } from '@/components/common';
import { usePartners, usePartnerTicketTypes } from '@/hooks';

interface ChoosePartnerModalProps {
  open: boolean;
  onClose: () => void;
  eventOrganizerId: string;
  eventId: string;
  metaUrl: string;
}

export const ChoosePartnerModal: FC<ChoosePartnerModalProps> = ({
  open,
  onClose,
  eventOrganizerId,
  eventId,
  metaUrl
}) => {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch all partners for this event organizer with search
  const { partners: partnersData, loading: partnersLoading } = usePartners(
    eventOrganizerId
      ? {
          event_organizer_id: eventOrganizerId,
          page: 0,
          limit: 100,
          search: searchQuery || undefined
        }
      : null
  );

  // Get partners that are already in the event
  const { partnerTicketTypes } = usePartnerTicketTypes(
    eventId
      ? {
          event_id: eventId,
          page: 0,
          limit: 100
        }
      : null
  );

  const existingPartnerIds = useMemo(
    () => new Set(partnerTicketTypes.map((ptt) => ptt.partner_id)),
    [partnerTicketTypes]
  );

  // Filter out partners that are already in the event
  const availablePartners = useMemo(
    () => partnersData.filter((partner) => !existingPartnerIds.has(partner.id)),
    [partnersData, existingPartnerIds]
  );

  const handlePartnerClick = (partnerId: string) => {
    router.push(
      `/events/${metaUrl}/partner-ticket/create-private-link?partnerId=${partnerId}`
    );
    onClose();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  // Reset search when modal closes
  useEffect(() => {
    if (!open) {
      setSearchInput('');
      setSearchQuery('');
    }
  }, [open]);

  return (
    <Popup
      open={open}
      onClose={onClose}
      title="Choose Partner"
      width={400}
      height={500}
    >
      <Box display="flex" flexDirection="column" gap={2}>
        {/* Search Input */}
        <TextField
          fullWidth
          id="find_partner_field"
          placeholder="Find Partner"
          value={searchInput}
          onChange={handleSearchChange}
          startComponent={
            <Image alt="Search" height={20} src="/icon/search.svg" width={20} />
          }
        />

        {/* Partners List */}
        <Box
          sx={{
            maxHeight: '350px',
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
          }}
        >
          {partnersLoading ? (
            <Box display="flex" justifyContent="center" padding="40px">
              <Body2 color="text.secondary">Loading partners...</Body2>
            </Box>
          ) : availablePartners.length === 0 ? (
            <Box display="flex" justifyContent="center" padding="40px">
              <Body2 color="text.secondary">
                {searchQuery
                  ? 'No partners found'
                  : 'No available partners. All partners are already added to this event.'}
              </Body2>
            </Box>
          ) : (
            availablePartners.map((partner, index) => (
              <Box key={partner.id}>
                <Box
                  sx={{
                    padding: '12px 0',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.02)'
                    }
                  }}
                  onClick={() => handlePartnerClick(partner.id)}
                >
                  <Body2 color="text.primary" fontSize="14px">
                    {partner.partner_name}
                  </Body2>
                </Box>
                {index < availablePartners.length - 1 && (
                  <Divider sx={{ borderColor: 'divider' }} />
                )}
              </Box>
            ))
          )}
        </Box>
      </Box>
    </Popup>
  );
};
