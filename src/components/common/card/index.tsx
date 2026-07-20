import {
  Card as MuiCard,
  CardContent,
  CardProps as MuiCardProps
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(MuiCard)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  borderRadius: 0,
  overflow: 'hidden',
  minWidth: 0,
  maxWidth: '100%'
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: '16px 24px',
  minWidth: 0,
  '&:last-child': {
    paddingBottom: '16px'
  },
  [theme.breakpoints.down('md')]: {
    padding: '14px 20px',
    '&:last-child': {
      paddingBottom: '14px'
    }
  },
  [theme.breakpoints.down('sm')]: {
    padding: '12px 16px',
    '&:last-child': {
      paddingBottom: '12px'
    }
  }
}));

interface CustomCardProps extends Omit<MuiCardProps, 'children'> {
  children: React.ReactNode;
}

export const Card = ({ children, ...props }: CustomCardProps) => {
  return (
    <StyledCard {...props}>
      <StyledCardContent>{children}</StyledCardContent>
    </StyledCard>
  );
};

export default Card;
