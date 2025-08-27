import { useCities } from '@/hooks';
import { EventsFilters } from '@/types/event';
import SearchIcon from '@mui/icons-material/Search';
import {
  Card,
  CardContent,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';
import { FC } from 'react';

interface EventsFilterProps {
  filters: EventsFilters;
  onFiltersChange: (filters: EventsFilters) => void;
}

const EventsFilter: FC<EventsFilterProps> = ({ filters, onFiltersChange }) => {
  const { cities, loading: citiesLoading } = useCities();

  const handleFilterChange = (
    key: keyof EventsFilters,
    value: string | number
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      page: 1 // Reset to first page when filters change
    });
  };

  // Convert local datetime to ISO string with timezone
  const formatDateTimeForBackend = (localDateTime: string): string => {
    if (!localDateTime) return '';

    // Create a Date object from the local datetime string
    const date = new Date(localDateTime);

    // Convert to ISO string with timezone offset
    return date.toISOString();
  };

  const handleDateChange = (key: 'startDate' | 'endDate', value: string) => {
    const formattedDate = formatDateTimeForBackend(value);
    handleFilterChange(key, formattedDate);
  };

  // Convert ISO string back to local datetime for display
  const formatDateTimeForDisplay = (isoString: string): string => {
    if (!isoString) return '';

    try {
      const date = new Date(isoString);
      // Format as local datetime string for input field
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error('Error parsing date:', error);
      return '';
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Filter Events
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Search Event Name"
              placeholder="Enter event name..."
              value={filters.name || ''}
              onChange={(e) => handleFilterChange('name', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>City</InputLabel>
              <Select
                value={filters.cityId || ''}
                label="City"
                onChange={(e) => handleFilterChange('cityId', e.target.value)}
                disabled={citiesLoading}
              >
                <MenuItem value="">
                  <em>All Cities</em>
                </MenuItem>
                {cities.map((city) => (
                  <MenuItem key={city.id} value={city.id}>
                    {city.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Start Date"
              type="datetime-local"
              value={formatDateTimeForDisplay(filters.startDate || '')}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              InputLabelProps={{
                shrink: true
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="End Date"
              type="datetime-local"
              value={formatDateTimeForDisplay(filters.endDate || '')}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              InputLabelProps={{
                shrink: true
              }}
              size="small"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default EventsFilter;
