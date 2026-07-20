import { Breadcrumbs, Typography } from '@mui/material';

interface BreadcrumbProps {
  steps: Array<{
    label: string;
    active?: boolean;
  }>;
}

export default function Breadcrumb({ steps }: BreadcrumbProps) {
  return (
    <Breadcrumbs
      aria-label="Event creation steps"
      separator="›"
      sx={{
        overflowX: 'auto',
        flexWrap: 'nowrap',
        whiteSpace: 'nowrap',
        width: '100%',
        pb: 0.5,
        '&::-webkit-scrollbar': { display: 'none' },
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
        '& .MuiBreadcrumbs-ol': {
          flexWrap: 'nowrap'
        }
      }}
    >
      {steps.map((step, index) => (
        <Typography
          key={index}
          color={step.active ? 'text.primary' : 'text.secondary'}
          variant="body2"
          sx={{ whiteSpace: 'nowrap' }}
        >
          {step.label}
        </Typography>
      ))}
    </Breadcrumbs>
  );
}
