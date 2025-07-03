import { Card, Alert, CircularProgress, Box, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useEvents } from '@/hooks/useEvents';
import EventsListTable from './EventsListTable';

function EventsList() {
  const { events, loading, error, refresh } = useEvents();

  if (loading) {
    return (
      <Card>
        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
          <CircularProgress />
        </Box>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Box p={2}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={refresh}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        </Box>
      </Card>
    );
  }

  return (
    <Card>
      <Box
        p={2}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <h2>Events</h2>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={refresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>
      <EventsListTable events={events} />
    </Card>
  );
}

export default EventsList;
