import { Card, Alert, CircularProgress, Box, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useEventOrganizers } from '@/hooks/useEventOrganizers';
import OrganizersListTabel from './OrganizersListTabel';

function OrganizersList() {
  const { eventOrganizers, loading, error, refresh } = useEventOrganizers();

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
        <h2>Event Organizers</h2>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={refresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>
      <OrganizersListTabel eventOrganizers={eventOrganizers} />
    </Card>
  );
}

export default OrganizersList;
