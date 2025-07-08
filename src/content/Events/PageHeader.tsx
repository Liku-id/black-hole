import { Grid, Typography } from '@mui/material';

function PageHeader() {
  const user = {
    name: 'Admin',
    avatar: '/static/images/avatars/1.jpg'
  };
  return (
    <Grid container justifyContent="space-between" alignItems="center">
      <Grid item>
        <Typography variant="h3" component="h3" gutterBottom>
          Events
        </Typography>
        <Typography variant="subtitle2">
          {user.name}, these are list of events
        </Typography>
      </Grid>
    </Grid>
  );
}

export default PageHeader;
