import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Box, Divider } from '@mui/material';
import Image from 'next/image';
import { useForm, FormProvider } from 'react-hook-form';

import { withAuth } from '@/components/Auth/withAuth';
import { useToast } from '@/contexts/ToastContext';
import {
  H2,
  Button,
  Card,
  TextField,
  Select,
  Caption
} from '@/components/common';
import { AddTeamMemberModal } from '@/components/features/team-member/modal/add';
import DashboardLayout from '@/layouts/dashboard';

interface TeamMemberFormData {
  name: string;
  email: string;
  role: string;
}

function CreateTeamMember() {
  const router = useRouter();
  const { showInfo, showError } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const methods = useForm<TeamMemberFormData>({
    defaultValues: {
      name: '',
      email: '',
      role: ''
    }
  });

  const { handleSubmit, reset } = methods;

  const roleOptions = [
    { value: 'check-in-crew', label: 'Check-in Crew' }
  ];

  const handleBack = () => {
    router.push('/team');
  };

  const handleFormSubmit = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    if (!loading) {
      setModalOpen(false);
      setError(null);
    }
  };

  const handleModalConfirm = async () => {
    setLoading(true);
    setError(null);

    const formData = methods.getValues();
    console.log('Team member data:', {
      name: formData.name,
      email: formData.email,
      role: formData.role
    });

    try {
      // TODO: Implement actual API call to create team member
      console.log('Creating team member...');

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess(true);
      showInfo('Team Member Created Successfully');
    } catch (err) {
      setError('Failed to create team member');
      showError('Failed to create team member');
    } finally {
      setLoading(false);
    }
  };

  const handleModalBack = () => {
    setModalOpen(false);
    setSuccess(false);
    setError(null);
    reset();
    router.push('/team');
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Create Team Member - Black Hole Dashboard</title>
      </Head>

      <Box>
        {/* Back Button */}
        <Box
          alignItems="center"
          display="flex"
          gap={1}
          mb={1}
          sx={{ cursor: 'pointer' }}
          onClick={handleBack}
        >
          <Image alt="Back" height={24} src="/icon/back.svg" width={24} />
          <Caption color="text.secondary" component="span">
            Back To Team Member List
          </Caption>
        </Box>

        {/* Title */}
        <Box mb={4}>
          <H2 color="text.primary" fontWeight={700}>
            Team Member: Create Team Member
          </H2>
        </Box>

        {/* Card */}
        <Card sx={{ backgroundColor: 'common.white'}}>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
              {/* Form Fields */}
              <Box display="flex" gap={3} mb={3}>
                <Box flex={1}>
                  <TextField
                    name="name"
                    label="Name*"
                    placeholder="Enter team member name"
                    rules={{
                      required: 'Name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters'
                      }
                    }}
                    fullWidth
                  />
                </Box>
                <Box flex={1}>
                  <TextField
                    name="email"
                    label="Email*"
                    placeholder="Enter team member email"
                    type="email"
                    rules={{
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    }}
                    fullWidth
                  />
                </Box>
                <Box flex={1}>
                  <Select
                    name="role"
                    label="User Role*"
                    placeholder="Select role"
                    options={roleOptions}
                    rules={{
                      required: 'Role is required'
                    }}
                    fullWidth
                  />
                </Box>
              </Box>

              {/* Divider */}
              <Divider sx={{ borderColor: 'divider', mb: 3 }} />

              {/* Submit Button */}
              <Box display="flex" justifyContent="flex-end">
                <Button type="submit" variant="primary">
                  Add Team Member
                </Button>
              </Box>
            </form>
          </FormProvider>
        </Card>
      </Box>

      {/* Add Team Member Modal */}
      <AddTeamMemberModal
        open={modalOpen}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        onBack={handleModalBack}
        loading={loading}
        error={error}
        success={success}
      />
    </DashboardLayout>
  );
}

export default withAuth(CreateTeamMember, { requireAuth: true });
