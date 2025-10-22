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
        <Box alignItems="center" display="flex" justifyContent="space-between">
          <H4
            sx={{
              color: 'text.primary'
            }}
          >
            Select Event
          </H4>

          <Button
            id="scan_ticket_button"
            sx={{
              width: '130px',
              height: '46px',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: '4px',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none'
              }
            }}
            onClick={onScanTicket}
          >
            Scan Ticket
          </Button>
        </Box>

        {/* Full width searchable event field */}
        <Autocomplete
          id="auto_select_event_field"
          fullWidth
          getOptionLabel={(option) => option.label}
          options={eventOptions}
          renderInput={(params) => (
            <TextField
              id="select_event_field"
              {...params}
              placeholder="Select Event"
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: '40px',
                  fontSize: '16px',
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
                  py: 0
                }
              }}
            />
          )}
          renderOption={(props, option, { index }) => (
            <Box key={option.value}>
              <Box
                id={`event_option_${option.value}`}
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
              height: '40px'
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
