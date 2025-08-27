import { Typography, TypographyProps } from '@mui/material';
import { styled } from '@mui/material/styles';

// Base Typography component with Onest font and fontWeight support
const BaseTypography = styled(Typography)<TypographyProps & { fontWeight?: number | string }>(({ fontWeight }) => ({
  fontFamily: '"Onest", sans-serif',
  lineHeight: 'normal',
  ...(fontWeight && { fontWeight }),
}));

// H1 - 40px
export const H1 = styled(BaseTypography)<TypographyProps & { fontWeight?: number | string }>(({ fontWeight }) => ({
  fontSize: '40px',
  fontWeight: fontWeight || 600,
})) as typeof Typography;

// H2 - 22px
export const H2 = styled(BaseTypography)<TypographyProps & { fontWeight?: number | string }>(({ fontWeight }) => ({
  fontSize: '22px',
  fontWeight: fontWeight || 600,
})) as typeof Typography;

// H3 - 18px
export const H3 = styled(BaseTypography)<TypographyProps & { fontWeight?: number | string }>(({ fontWeight }) => ({
  fontSize: '18px',
  fontWeight: fontWeight || 600,
})) as typeof Typography;

// Body1 - 16px
export const Body1 = styled(BaseTypography)<TypographyProps & { fontWeight?: number | string }>(({ fontWeight }) => ({
  fontSize: '16px',
  fontWeight: fontWeight || 400,
})) as typeof Typography;

// Body2 - 14px
export const Body2 = styled(BaseTypography)<TypographyProps & { fontWeight?: number | string }>(({ fontWeight }) => ({
  fontSize: '14px',
  fontWeight: fontWeight || 400,
})) as typeof Typography;

// Caption - 12px
export const Caption = styled(BaseTypography)<TypographyProps & { fontWeight?: number | string }>(({ fontWeight }) => ({
  fontSize: '12px',
  fontWeight: fontWeight || 400,
})) as typeof Typography;

// Overline - 10px
export const Overline = styled(BaseTypography)<TypographyProps & { fontWeight?: number | string }>(({ fontWeight }) => ({
  fontSize: '10px',
  fontWeight: fontWeight || 400,
})) as typeof Typography;

// Export all components
export default {
  H1,
  H2,
  H3,
  Body1,
  Body2,
  Caption,
  Overline,
};
