import { Search, Visibility } from '@mui/icons-material';
import { Box, Grid, Card, CardContent } from '@mui/material';
import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import {
  H3,
  H4,
  Body1,
  H1,
  Body2,
  Caption,
  Overline,
  Button,
  TextField,
  PhoneField,
  Select,
  DateField,
  TimeField,
  Modal
} from '@/components/common';
import DashboardLayout from '@/layouts/dashboard';
import { withAuth } from '@/components/Auth/withAuth';

function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);

  const methods = useForm({
    defaultValues: {
      email: '',
      password: '',
      search: '',
      phone: '',
      category: '',
      eventDate: '',
      eventTime: ''
    }
  });

  const onSubmit = (data: any) => {
    console.log('Form data:', data);
  };

  const categoryOptions = [
    { value: 'music', label: 'Music' },
    { value: 'sports', label: 'Sports' },
    { value: 'business', label: 'Business' },
    { value: 'technology', label: 'Technology' },
    { value: 'education', label: 'Education' }
  ];

  return (
    <DashboardLayout>
      <Box>
        <H3 color="text.primary" fontWeight={300} marginBottom="64px">
          COMPONENTS
        </H3>

        <Box sx={{ mb: 8 }}>
          <H4 gutterBottom color="text.primary">
            Typography
          </H4>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <H1 color="text.primary" fontWeight={300}>
              H1: Lorem ipsum dolor sit.
            </H1>
            <H3 color="text.secondary" fontWeight={700}>
              H2: Lorem ipsum dolor sit.
            </H3>
            <H4 color="common.black" fontWeight={300}>
              H3: Lorem ipsum dolor sit.
            </H4>
            <Body1 color="common.white" fontWeight={300}>
              Body1: Lorem ipsum dolor sit.
            </Body1>
            <Body2 color="error" fontWeight={300}>
              Body2: Lorem ipsum dolor sit.
            </Body2>
            <Caption color="text.primary" fontWeight={300}>
              Caption: Lorem ipsum dolor sit.
            </Caption>
            <Overline color="text.primary" fontWeight={300}>
              Overline: Lorem ipsum dolor sit.
            </Overline>
          </Box>
        </Box>

        {/* Regular Text Fields (without form) */}
        <Box sx={{ mb: 8 }}>
          <H4 gutterBottom color="text.primary">
            Fields
          </H4>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              maxWidth: 400
            }}
          >
            <TextField
              label="Search Events"
              placeholder="Type to search..."
              startComponent={<Search />}
            />
            <TextField
              label="Email"
              placeholder="Enter your email"
              type="email"
            />
            <TextField label="Name" placeholder="Enter your name" type="text" />
            <TimeField
              label="Meeting Time"
              onChange={(value) => console.log('Time changed:', value)}
            />
          </Box>
        </Box>

        {/* React Hook Form Text Fields */}
        <Box sx={{ mb: 8 }}>
          <H4 gutterBottom color="text.primary">
            Fields With React Hook Form
          </H4>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  maxWidth: 400
                }}
              >
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

                <TextField
                  endComponent={<Visibility />}
                  label="Password"
                  name="password"
                  placeholder="Enter your password"
                  rules={{
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  }}
                  type="password"
                />

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
                <TextField
                  label="Search"
                  name="search"
                  placeholder="Search something..."
                  rules={{
                    required: 'Search term is required'
                  }}
                  startComponent={<Search />}
                />
                <Button type="submit">Submit Form</Button>
              </Box>
            </form>
          </FormProvider>
        </Box>

        {/* Button Examples */}
        <H4 gutterBottom color="text.primary">
          Button
        </H4>
        <Box sx={{ mb: 8, display: 'flex', gap: 2 }}>
          <Button>Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
        </Box>

        <H4 gutterBottom color="text.primary">
          Modal
        </H4>
        <Button onClick={() => setModalOpen(true)}>Open Modal</Button>

        <Box marginBottom="64px" />
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

          <Grid item md={3} sm={6} xs={12}>
            <Card sx={{ backgroundColor: 'background.paper' }}>
              <CardContent>
                <Body1 gutterBottom color="text.secondary">
                  Total Tickets
                </Body1>
                <H3 color="text.primary">1,234</H3>
              </CardContent>
            </Card>
          </Grid>

          <Grid item md={3} sm={6} xs={12}>
            <Card sx={{ backgroundColor: 'background.paper' }}>
              <CardContent>
                <Body1 gutterBottom color="text.secondary">
                  Revenue
                </Body1>
                <H3 color="text.primary">$12,345</H3>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Modal Example */}
      <Modal
        footer={
          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setModalOpen(false)}>Confirm</Button>
          </Box>
        }
        open={modalOpen}
        title="Example Modal"
        titleSize="18px"
        onClose={() => setModalOpen(false)}
      >
        <Body1>
          This is an example modal content. You can put any content here
          including forms, text, or other components.
        </Body1>
      </Modal>
    </DashboardLayout>
  );
}

export default withAuth(Dashboard, { requireAuth: true });
