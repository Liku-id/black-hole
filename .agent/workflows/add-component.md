---
description: Create a reusable UI component in black-hole — folder structure, TypeScript props, MUI + Emotion styling, barrel export, and tests.
---

# /add-component — Add a Reusable UI Component

Use this workflow when adding a shared or feature-specific React component.

> **This project uses Material-UI v5 + Emotion — not Tailwind or shadcn/ui.**
> Styling: MUI `sx` prop, `styled()` from `@emotion/styled`, and theme tokens from `src/theme/base.ts`.

> **Reference:** `.gemini/rules.md` §2 (structure), §4 (naming)

---

## 0. Decide component location

| Type | Location | Export via `@/components/common`? |
|---|---|---|
| Shared UI primitive (Button, Modal, …) | `src/components/common/<name>/` | **Yes** — add to `src/components/common/index.ts` |
| Feature-specific (events, finance, …) | `src/components/features/<domain>/<name>/` | **No** — import directly |
| Auth components | `src/components/Auth/` | **No** |
| Legacy top-level | `src/components/<PascalCase>/` | **No** — avoid for new code |

Folder name: **kebab-case**. Main file: **`index.tsx`**.

---

## 1. Create the folder structure

```
src/components/common/my-component/
├── index.tsx              # Component implementation
└── index.test.tsx         # Co-located test
```

Or for feature components:

```
src/components/features/events/my-section/
├── index.tsx
└── index.test.tsx
```

Reference examples:

- Common primitive: `src/components/common/button/index.tsx`
- Form field with react-hook-form: `src/components/common/text-field/index.tsx`
- Feature section: `src/components/features/events/list/table/index.tsx`
- Modal: `src/components/features/events/create/ticket/create-modal/index.tsx`

---

## 2. Define TypeScript interfaces

Place props interface **above** the component in `index.tsx`.

```tsx
// src/components/common/my-component/index.tsx

import { Box, BoxProps } from '@mui/material';
import React from 'react';

export interface MyComponentProps {
  /** Visible label text */
  label: string;
  /** Optional click handler */
  onClick?: () => void;
  /** Disable interaction */
  disabled?: boolean;
  children?: React.ReactNode;
}
```

Rules:

- Export the props interface if consumed elsewhere
- Use explicit types — avoid `any` in new code
- Extend MUI component props when wrapping MUI elements:

```tsx
export interface MyComponentProps extends BoxProps {
  variant?: 'default' | 'outlined';
  label: string;
}
```

---

## 3. Implement the component

### Simple presentational component

No special directive needed in Pages Router (no `'use client'` required).

Reference: `src/components/common/typography/index.tsx`

```tsx
import { Box, Typography } from '@mui/material';
import React from 'react';

export interface InfoCardProps {
  title: string;
  description: string;
  sx?: object;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, description, sx }) => {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        p: 2,
        ...sx
      }}
    >
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Box>
  );
};

export default InfoCard;
```

### Interactive component (hooks, events)

Reference: `src/components/common/button/index.tsx`

```tsx
import { Button as MuiButton, ButtonProps } from '@mui/material';
import React from 'react';

export interface MyButtonProps extends ButtonProps {
  loading?: boolean;
}

const MyButton: React.FC<MyButtonProps> = ({
  loading = false,
  disabled,
  children,
  ...props
}) => {
  return (
    <MuiButton
      disabled={disabled || loading}
      variant="contained"
      {...props}
    >
      {loading ? 'Loading…' : children}
    </MuiButton>
  );
};

export default MyButton;
```

### Styled component with Emotion

Reference: `src/components/Auth/LoginForm.tsx`

```tsx
import { Card, styled, alpha } from '@mui/material';

const MyCard = styled(Card)(
  ({ theme }) => `
    width: 100%;
    max-width: 420px;
    padding: ${theme.spacing(3)};
    background: ${alpha(theme.palette.background.paper, 1)};
    border-radius: 0;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  `
);
```

---

## 4. Styling conventions

### Prefer MUI `sx` prop

```tsx
<Box
  sx={{
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    p: 2,
    bgcolor: 'background.paper',
    borderRadius: 1
  }}
>
```

### Use theme tokens

Reference: `src/theme/base.ts`

| Token | Usage |
|---|---|
| `theme.palette.primary.main` | Primary blue (`#1976d2`) |
| `theme.palette.secondary.main` | Secondary red (`#dc004e`) |
| `theme.palette.success/error/warning` | Status colors |
| `theme.spacing(n)` | Consistent spacing |
| `theme.typography.h6`, `.body2` | Typography variants |

### Compose from existing primitives

Import shared UI from the common barrel:

```tsx
import {
  Button,
  TextField,
  Modal,
  H2,
  Body1,
  Body2
} from '@/components/common';
```

Do **not** recreate Button, TextField, Modal, etc. — extend or compose them.

### Icons

```tsx
import { Add, Delete, Edit } from '@mui/icons-material';
```

---

## 5. Export from barrel (common components only)

If the component lives in `src/components/common/`, add to `src/components/common/index.ts`:

```ts
// src/components/common/index.ts
export { default as MyComponent } from './my-component';
```

Feature components are imported directly:

```tsx
import EventsTable from '@/components/features/events/list/table';
import CreateTicketModal from '@/components/features/events/create/ticket/create-modal';
```

---

## 6. Integrate with forms (if applicable)

For form inputs, integrate with **react-hook-form** via `useFormContext` or `Controller`.

Reference: `src/components/common/text-field/index.tsx`

```tsx
import { useFormContext, Controller, RegisterOptions } from 'react-hook-form';
import { TextField as MuiTextField } from '@mui/material';

interface FormTextFieldProps {
  name: string;
  label: string;
  rules?: RegisterOptions;
}

const FormTextField: React.FC<FormTextFieldProps> = ({ name, label, rules }) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => (
        <MuiTextField
          {...field}
          label={label}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          fullWidth
        />
      )}
    />
  );
};
```

Validators from `src/utils/validationUtils.ts` — not Zod:

```tsx
import { validationUtils } from '@/utils';

<TextField
  name="email"
  rules={{ validate: validationUtils.emailValidator }}
/>
```

Wrap forms with `FormProvider`:

```tsx
import { FormProvider, useForm } from 'react-hook-form';

const methods = useForm({ mode: 'onChange' });

return (
  <FormProvider {...methods}>
    <form onSubmit={methods.handleSubmit(onSubmit)}>
      {/* fields */}
    </form>
  </FormProvider>
);
```

---

## 7. Integrate with data hooks (if applicable)

Feature components typically receive data via props from the page, or call domain hooks directly:

```tsx
import { useEvents } from '@/hooks';
import { CircularProgress, Box } from '@mui/material';
import { Body1 } from '@/components/common';

const MyFeatureSection = ({ eventOrganizerId }: { eventOrganizerId: string }) => {
  const { events, loading, error } = useEvents({ event_organizer_id: eventOrganizerId });

  if (loading) return <CircularProgress />;
  if (error) return <Body1 color="error">{error}</Body1>;

  return (/* render events */);
};
```

Use `useToast()` for mutation feedback:

```tsx
import { useToast } from '@/contexts/ToastContext';

const { showSuccess, showError } = useToast();
```

---

## 8. Add tests

Co-locate `index.test.tsx` next to the component.

Reference: `src/components/common/button/index.test.tsx`

```tsx
// src/components/common/my-component/index.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';

import MyComponent from './index';

describe('MyComponent', () => {
  it('renders label', () => {
    render(<MyComponent label="Click me" />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<MyComponent label="Click me" onClick={handleClick} />);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

Run: `npm test -- src/components/common/my-component/index.test.tsx`

### Test environment notes

- `jest.setup.js` already mocks `next/router` and `next/image` — use `useRouter` from `next/router` in components under test
- If testing components that use `next/navigation`, add an explicit `jest.mock('next/navigation', …)` (see `src/components/features/dashboard/event-latest/index.test.tsx`)
- Jest config: `jest.config.js` with `@/` alias mapping to `src/`

### External images

If the component uses `next/image` with S3 URLs, the hostname must be listed in `next.config.js` → `images.remotePatterns` (Wukong S3 buckets are pre-configured).

---

## 9. Verify

Checklist:

- [ ] Folder is kebab-case under the correct `components/` subtree
- [ ] Props interface exported with explicit types (no `any`)
- [ ] Styled with MUI `sx` / `styled()` — no Tailwind classes
- [ ] Common component added to `src/components/common/index.ts`
- [ ] Form fields use react-hook-form + `validationUtils` validators
- [ ] Co-located test passes
- [ ] No shadcn/ui or Tailwind imports

```bash
npm test -- src/components/common/my-component/index.test.tsx
npm run lint
npm run build
```
