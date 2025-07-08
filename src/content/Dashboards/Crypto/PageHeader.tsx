import { useAuth } from '@/contexts/AuthContext';
import { Avatar, Card, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const AvatarWrapper = styled(Avatar)(
  ({ theme }) => `
    width: ${theme.spacing(8)};
    height: ${theme.spacing(8)};
    margin: 0 auto ${theme.spacing(2)};
`
);

const CardWrapper = styled(Card)(
  ({ theme }) => `
    background: ${theme.colors.gradients.blue1};
    color: ${theme.palette.primary.contrastText};
    overflow: visible;
    
    &:after {
      border-radius: 50%;
      content: '';
      height: 100%;
      left: 0;
      position: absolute;
      top: 0;
      transform: scale(2);
      transform-origin: center 1rem;
      transition: .5s ease-in-out;
      width: 100%;
      z-index: 0;
    }
`
);

function PageHeader() {
  const { user } = useAuth();

  return (
    <CardWrapper sx={{ py: 3, px: 3, textAlign: 'center', alignItems: 'center' }}>
      <AvatarWrapper alt={user?.fullName} src="/static/images/avatars/1.jpg" />
      <Typography variant="h3" component="h3" gutterBottom>
        Welcome, {user?.fullName}!
      </Typography>
      <Typography variant="subtitle2">
        Here's what's happening with your projects today
      </Typography>
    </CardWrapper>
  );
}

export default PageHeader;
