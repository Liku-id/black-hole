import { Autocomplete, Box, Divider } from '@mui/material';

import { Button, Card, H4, TextField } from '@/components/common';

interface EventOption {
  value: string;
  label: string;
}

interface SearchFieldProps {
  eventOptions: EventOption[];
  selectedEvent: string;
  onEventChange: (value: string) => void;
  onScanTicket: () => void;
}

export const SearchField = ({
  eventOptions,
  selectedEvent,
  onEventChange,
  onScanTicket
}: SearchFieldProps) => {
  return (
    <Card>
      <Box display="flex" flexDirection="column" gap={3}>
        {/* Header row with Select Event title and Scan Ticket button */}
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          gap={1}
        >
          <H4 sx={{ color: 'text.primary', minWidth: 0 }}>
            Select Event
          </H4>

          <Button
            id="scan_ticket_button"
            onClick={onScanTicket}
            sx={{
              flexShrink: 0,
              whiteSpace: 'nowrap',
              width: { xs: '100%', sm: '130px' },
              height: '46px',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: '4px',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none'
              }
            }}
          >
            Scan Ticket
          </Button>
        </Box>

        {/* Full width searchable event field */}
        <Autocomplete
          fullWidth
          getOptionLabel={(option) => option.label}
          options={eventOptions}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Select Event"
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: '40px',
                  fontSize: '14px',
                  alignItems: 'center',
                  paddingTop: 0,
                  paddingBottom: 0,
                  '& fieldset': {
                    borderColor: '#E2E8F0',
                    borderRadius: '8px'
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main'
                  }
                },
                '& .MuiInputBase-input': {
                  py: 0,
                  fontSize: '14px',
                  lineHeight: '40px',
                  height: '40px',
                  boxSizing: 'border-box',
                  '&::placeholder': {
                    fontSize: '14px',
                    opacity: 1
                  }
                }
              }}
            />
          )}
          renderOption={(props, option, { index }) => (
            <Box key={option.value}>
              <Box
                component="li"
                {...props}
                sx={{
                  fontSize: '14px !important',
                  fontWeight: '400 !important',
                  color: 'text.primary !important',
                  padding: '16px 20px !important',
                  minHeight: 'auto !important',
                  '&:hover': {
                    backgroundColor: 'primary.light !important'
                  },
                  '&.MuiAutocomplete-option': {
                    padding: '16px 20px !important'
                  }
                }}
              >
                {option.label}
              </Box>
              {index < eventOptions.length - 1 && <Divider sx={{ mx: 2 }} />}
            </Box>
          )}
          sx={{
            '& .MuiAutocomplete-inputRoot': {
              height: '40px',
              alignItems: 'center',
              paddingTop: '0 !important',
              paddingBottom: '0 !important'
            },
            '& .MuiAutocomplete-input': {
              padding: '0 !important',
              minWidth: 0
            },
            '& .MuiAutocomplete-listbox': {
              padding: 0
            }
          }}
          value={
            eventOptions.find((option) => option.value === selectedEvent) ||
            null
          }
          onChange={(_, newValue) => {
            onEventChange(newValue ? newValue.value : '');
          }}
        />
      </Box>
    </Card>
  );
};

export default SearchField;
