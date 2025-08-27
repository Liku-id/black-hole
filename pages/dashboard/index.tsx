import { useState } from 'react';
import { Box, Grid, Card, CardContent } from '@mui/material';
import DashboardLayout from '@/layouts/dashboard';
import { 
  H2, H3, Body1, H1, Body2, Caption, Overline,
  Button,
  TextField,
  PhoneField,
  Select,
  DateField,
  TimeField,
  Modal
} from '@/components/common';
import { Search, Visibility } from '@mui/icons-material';
import { useForm, FormProvider } from 'react-hook-form';

export default function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  
  const methods = useForm({
    defaultValues: {
      email: '',
      password: '',
      search: '',
      phone: '',
      category: '',
      eventDate: '',
      eventTime: '',
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
    { value: 'education', label: 'Education' },
  ];

  return (
    <DashboardLayout>
      <Box>
        <H2 color="text.primary" fontWeight={300} marginBottom="64px">
          COMPONENTS
        </H2>

        <Box sx={{ mb: 8 }}>
          <H3 color="text.primary" gutterBottom>
            Typography
          </H3>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2}}>
            <H1 color="text.primary" fontWeight={300}>
              H1: Lorem ipsum dolor sit.
            </H1>
            <H2 color="text.secondary" fontWeight={700}>
              H2: Lorem ipsum dolor sit.
            </H2>
            <H3 color="common.black" fontWeight={300}>
              H3: Lorem ipsum dolor sit.
            </H3>
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
          <H3 color="text.primary" gutterBottom>
            Fields
          </H3>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
            <TextField 
              label="Search Events" 
              placeholder="Type to search..."
              startComponent={<Search />}
            />
            <TextField 
              label="Email" 
              type="email"
              placeholder="Enter your email"
            />
             <TextField 
              label="Name" 
              type="text"
              placeholder="Enter your name"
            />
            <TimeField 
              label="Meeting Time" 
              onChange={(value) => console.log('Time changed:', value)}
            />
          </Box>
        </Box>

        {/* React Hook Form Text Fields */}
        <Box sx={{ mb: 8 }}>
          <H3 color="text.primary" gutterBottom>
          Fields With React Hook Form 
          </H3>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
                <TextField 
                  name="email"
                  label="Email" 
                  type="email"
                  placeholder="Enter your email"
                  rules={{
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  }}
                />
                
                <TextField 
                  name="password"
                  label="Password" 
                  type="password"
                  placeholder="Enter your password"
                  endComponent={<Visibility />}
                  rules={{
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  }}
                />
                
                <PhoneField 
                  name="phone"
                  label="Phone Number"
                  placeholder="Enter phone number"
                  defaultCountryCode="+62"
                  rules={{
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[0-9]{8,15}$/,
                      message: 'Please enter a valid phone number'
                    }
                  }}
                />

                <Select
                  name="category"
                  label="Event Category"
                  placeholder="Select category"
                  options={categoryOptions}
                  rules={{
                    required: 'Category is required'
                  }}
                />
                <DateField
                  name="eventDate"
                  label="Event Date"
                  placeholder="Select date"
                  rules={{
                    required: 'Event date is required'
                  }}
                />
                <TimeField
                  name="eventTime"
                  label="Event Time"
                  placeholder="Select time"
                  rules={{
                    required: 'Event time is required'
                  }}
                />
                <TextField 
                  name="search"
                  label="Search" 
                  placeholder="Search something..."
                  startComponent={<Search />}
                  rules={{
                    required: 'Search term is required'
                  }}
                />
                <Button type="submit">Submit Form</Button>
              </Box>
            </form>
          </FormProvider>
        </Box>
        
        {/* Button Examples */}
        <H3 color="text.primary" gutterBottom>
          Button
        </H3>
        <Box sx={{ mb: 8, display: 'flex', gap: 2 }}>
          <Button>Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
        </Box>
        
        <H3 color="text.primary" gutterBottom>
          Modal
        </H3>
        <Button onClick={() => setModalOpen(true)}>Open Modal</Button>


        <Box marginBottom="64px"/>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: 'background.paper' }}>
              <CardContent>
                <Body1 color="text.secondary" gutterBottom>
                  Total Events
                </Body1>
                <H2 color="text.primary">
                  24
                </H2>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: 'background.paper' }}>
              <CardContent>
                <Body1 color="text.secondary" gutterBottom>
                  Active Events
                </Body1>
                <H2 color="text.primary">
                  12
                </H2>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: 'background.paper' }}>
              <CardContent>
                <Body1 color="text.secondary" gutterBottom>
                  Total Tickets
                </Body1>
                <H2 color="text.primary">
                  1,234
                </H2>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: 'background.paper' }}>
              <CardContent>
                <Body1 color="text.secondary" gutterBottom>
                  Revenue
                </Body1>
                <H2 color="text.primary">
                  $12,345
                </H2>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Modal Example */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Example Modal"
        titleSize="18px"
        footer={
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setModalOpen(false)}>
              Confirm
            </Button>
          </Box>
        }
      >
        <Body1>
          This is an example modal content. You can put any content here including forms, text, or other components.
        </Body1>
      </Modal>
    </DashboardLayout>
  );
}
