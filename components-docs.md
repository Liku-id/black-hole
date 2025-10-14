# Component Documentation

This document provides comprehensive documentation for all the reusable components used in the Black Hole event management platform. The components are built using Material-UI and React Hook Form for consistent styling and form handling.

## Table of Contents

1. [Typography Components](#typography-components)
2. [Form Components](#form-components)
3. [UI Components](#ui-components)
4. [Layout Components](#layout-components)
5. [Usage Examples](#usage-examples)

## Typography Components

### H1 - H4 Headers
Used for different levels of headings throughout the application.

```tsx
<H1 color="text.primary" fontWeight={300}>
  Main Title
</H1>

<H3 color="text.secondary" fontWeight={700}>
  Section Title
</H3>

<H4 color="common.black" fontWeight={300}>
  Subsection Title
</H4>
```

### Body Text Components
For paragraph and body text content.

```tsx
<Body1 color="common.white" fontWeight={300}>
  Main body text content
</Body1>

<Body2 color="error" fontWeight={300}>
  Secondary body text
</Body2>
```

### Caption and Overline
For small text and labels.

```tsx
<Caption color="text.primary" fontWeight={300}>
  Caption text
</Caption>

<Overline color="text.primary" fontWeight={300}>
  OVERLINE TEXT
</Overline>
```

## Form Components

### TextField
A versatile text input component with support for various input types and validation.

#### Basic Usage
```tsx
<TextField
  label="Email"
  placeholder="Enter your email"
  type="email"
/>
```

#### With Icons
```tsx
<TextField
  label="Search Events"
  placeholder="Type to search..."
  startComponent={<Search />}
/>

<TextField
  label="Password"
  placeholder="Enter your password"
  endComponent={<Visibility />}
  type="password"
/>
```

#### With React Hook Form
```tsx
<TextField
  label="Email"
  name="email"
  placeholder="Enter your email"
  rules={{
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email address'
    }
  }}
  type="email"
/>
```

### PhoneField
Specialized input for phone numbers with country code support.

```tsx
<PhoneField
  defaultCountryCode="+62"
  label="Phone Number"
  name="phone"
  placeholder="Enter phone number"
  rules={{
    required: 'Phone number is required',
    pattern: {
      value: /^[0-9]{8,15}$/,
      message: 'Please enter a valid phone number'
    }
  }}
/>
```

### Select
Dropdown selection component with options support.

```tsx
const categoryOptions = [
  { value: 'music', label: 'Music' },
  { value: 'sports', label: 'Sports' },
  { value: 'business', label: 'Business' }
];

<Select
  label="Event Category"
  name="category"
  options={categoryOptions}
  placeholder="Select category"
  rules={{
    required: 'Category is required'
  }}
/>
```

### DateField
Date picker component for date selection.

```tsx
<DateField
  label="Event Date"
  name="eventDate"
  placeholder="Select date"
  rules={{
    required: 'Event date is required'
  }}
/>
```

### TimeField
Time picker component for time selection.

```tsx
<TimeField
  label="Event Time"
  name="eventTime"
  placeholder="Select time"
  rules={{
    required: 'Event time is required'
  }}
/>
```

## UI Components

### Button
Primary and secondary button variants.

```tsx
// Primary Button
<Button>Primary Button</Button>

// Secondary Button
<Button variant="secondary">Secondary Button</Button>

// Submit Button
<Button type="submit">Submit Form</Button>
```

### Modal
Modal dialog component with customizable header, content, and footer.

```tsx
const [modalOpen, setModalOpen] = useState(false);

<Modal
  open={modalOpen}
  title="Example Modal"
  titleSize="18px"
  onClose={() => setModalOpen(false)}
  footer={
    <Box display="flex" gap={2} justifyContent="flex-end">
      <Button variant="secondary" onClick={() => setModalOpen(false)}>
        Cancel
      </Button>
      <Button onClick={() => setModalOpen(false)}>Confirm</Button>
    </Box>
  }
>
  <Body1>
    This is an example modal content. You can put any content here
    including forms, text, or other components.
  </Body1>
</Modal>
```

### Card
Container component for grouping related content.

```tsx
<Card sx={{ backgroundColor: 'background.paper' }}>
  <CardContent>
    <Body1 gutterBottom color="text.secondary">
      Total Events
    </Body1>
    <H3 color="text.primary">24</H3>
  </CardContent>
</Card>
```

## Layout Components

### DashboardLayout
Main layout wrapper for dashboard pages with navigation and header.

```tsx
<DashboardLayout>
  {/* Page content goes here */}
</DashboardLayout>
```

### Grid System
Material-UI Grid component for responsive layouts.

```tsx
<Grid container spacing={3}>
  <Grid item md={3} sm={6} xs={12}>
    {/* Content for different screen sizes */}
  </Grid>
</Grid>
```

## Usage Examples

### Complete Form Example
Here's a complete example of how to use multiple form components together:

```tsx
import { useForm, FormProvider } from 'react-hook-form';
import { withAuth } from '@/components/Auth/withAuth';
import {
  TextField,
  PhoneField,
  Select,
  DateField,
  TimeField,
  Button
} from '@/components/common';

function EventForm() {
  const methods = useForm({
    defaultValues: {
      email: '',
      phone: '',
      category: '',
      eventDate: '',
      eventTime: ''
    }
  });

  const onSubmit = (data) => {
    console.log('Form data:', data);
  };

  const categoryOptions = [
    { value: 'music', label: 'Music' },
    { value: 'sports', label: 'Sports' },
    { value: 'business', label: 'Business' }
  ];

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <TextField
          label="Email"
          name="email"
          placeholder="Enter your email"
          rules={{
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          }}
          type="email"
        />

        <PhoneField
          defaultCountryCode="+62"
          label="Phone Number"
          name="phone"
          placeholder="Enter phone number"
          rules={{
            required: 'Phone number is required'
          }}
        />

        <Select
          label="Event Category"
          name="category"
          options={categoryOptions}
          placeholder="Select category"
          rules={{
            required: 'Category is required'
          }}
        />

        <DateField
          label="Event Date"
          name="eventDate"
          placeholder="Select date"
          rules={{
            required: 'Event date is required'
          }}
        />

        <TimeField
          label="Event Time"
          name="eventTime"
          placeholder="Select time"
          rules={{
            required: 'Event time is required'
          }}
        />

        <Button type="submit">Submit Form</Button>
      </form>
    </FormProvider>
  );
}

export default withAuth(EventForm, { requireAuth: true });
```

### Dashboard Cards Example
Example of using cards to display statistics:

```tsx
<Grid container spacing={3}>
  <Grid item md={3} sm={6} xs={12}>
    <Card sx={{ backgroundColor: 'background.paper' }}>
      <CardContent>
        <Body1 gutterBottom color="text.secondary">
          Total Events
        </Body1>
        <H3 color="text.primary">24</H3>
      </CardContent>
    </Card>
  </Grid>

  <Grid item md={3} sm={6} xs={12}>
    <Card sx={{ backgroundColor: 'background.paper' }}>
      <CardContent>
        <Body1 gutterBottom color="text.secondary">
          Active Events
        </Body1>
        <H3 color="text.primary">12</H3>
      </CardContent>
    </Card>
  </Grid>
</Grid>
```

## Component Props

### Common Props for Form Components
- `label`: String - Label text for the input
- `name`: String - Name attribute for form handling
- `placeholder`: String - Placeholder text
- `rules`: Object - Validation rules for React Hook Form
- `type`: String - Input type (text, email, password, etc.)

### Typography Props
- `color`: String - Text color (text.primary, text.secondary, error, etc.)
- `fontWeight`: Number - Font weight (300, 400, 700, etc.)
- `gutterBottom`: Boolean - Add bottom margin

### Button Props
- `variant`: String - Button variant ('primary' or 'secondary')
- `type`: String - Button type ('button', 'submit', 'reset')
- `onClick`: Function - Click handler

### Modal Props
- `open`: Boolean - Whether modal is open
- `title`: String - Modal title
- `titleSize`: String - Title font size
- `onClose`: Function - Close handler
- `footer`: ReactNode - Footer content

## Best Practices

1. **Form Validation**: Always use React Hook Form with proper validation rules
2. **Consistent Styling**: Use the predefined color palette and typography scale
3. **Responsive Design**: Use Material-UI Grid system for responsive layouts
4. **Accessibility**: Ensure proper labeling and keyboard navigation
5. **Error Handling**: Implement proper error states for form components
6. **Authentication**: Use `withAuth` HOC for protected components

## Import Statements

```tsx
// Common components
import {
  H1, H3, H4,
  Body1, Body2, Caption, Overline,
  Button, TextField, PhoneField, Select,
  DateField, TimeField, Modal
} from '@/components/common';

// Layout components
import DashboardLayout from '@/layouts/dashboard';

// Auth components
import { withAuth } from '@/components/Auth/withAuth';

// Form handling
import { useForm, FormProvider } from 'react-hook-form';
```

This documentation covers all the main components used in the Black Hole platform. For more specific implementation details, refer to the individual component files in the `src/components/common/` directory.
