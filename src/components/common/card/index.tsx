import {
  Card as MuiCard,
  CardContent,
  CardProps as MuiCardProps
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(MuiCard)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  borderRadius: 0
}));

const StyledCardContent = styled(CardContent)({
  padding: '16px 24px'
});

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
