import { Breadcrumbs, Typography } from '@mui/material';

interface BreadcrumbProps {
  steps: Array<{
    label: string;
    active?: boolean;
  }>;
}

export default function Breadcrumb({ steps }: BreadcrumbProps) {
  return (
    <Breadcrumbs aria-label="Event creation steps" separator="›">
      {steps.map((step, index) => (
        <Typography
          key={index}
          color={step.active ? 'text.primary' : 'text.secondary'}
          variant="body2"
        >
          {step.label}
        </Typography>
      ))}
    </Breadcrumbs>
  );
}
