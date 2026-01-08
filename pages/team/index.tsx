// Core
import { Box, Divider } from '@mui/material';
import { useAtom } from 'jotai';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
// Third Party

// Components & Layouts
import { selectedEOIdAtom } from '@/atoms/eventOrganizerAtom';
import { withAuth } from '@/components/Auth/withAuth';
import { H2, Button, Card, Body1, TextField } from '@/components/common';
import { DeleteTeamMemberModal } from '@/components/features/team-member/modal/delete';
import { TeamMemberTable } from '@/components/features/team-member/table';
// Contexts & Hooks
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useStaff } from '@/hooks/features/staff/useStaff';
import DashboardLayout from '@/layouts/dashboard';
import { staffService } from '@/services/staff';
import { isEventOrganizer } from '@/types/auth';
// Services & Utils
// Types
import { Staff } from '@/types/staff';
import { useDebouncedCallback } from '@/utils';

function TeamMember() {
  const router = useRouter();
  const { showInfo } = useToast();
  const [queryName, setQueryName] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<Staff | null>(null);

  const { user } = useAuth();
  const [selectedEOId] = useAtom(selectedEOIdAtom);

  // Determine Event Organizer ID based on user role
  const eoId = user && isEventOrganizer(user) ? user.id : selectedEOId;

  const { staffList, pagination, isLoading, mutate } = useStaff(eoId, {
    page: currentPage, // API is 0-based
    limit: pageSize,
    search: queryName
  });

  // Handle search input with debounce
  const handleSearchChange = useDebouncedCallback((value: string) => {
    setQueryName(value);
  }, 500);

  // Navigate to create page
  const handleAddTeamMember = () => {
    router.push('/team/create');
  };

  // Handle pagination change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Open delete confirmation modal
  const handleOpenDeleteModal = (member: Staff) => {
    setSelectedMember(member);
    setDeleteModalOpen(true);
    setDeleteError(null);
  };

  // Close delete modal and reset state
  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedMember(null);
    setDeleteError(null);
  };

  // Execute staff deletion
  const handleDeleteConfirm = async () => {
    if (!selectedMember) return;

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      await staffService.deleteStaff({
        user_id: selectedMember.user_id,
        reason: ''
      });

      showInfo('Team Member Deleted');
      handleCloseDeleteModal();
      mutate();
    } catch (error) {
      setDeleteError('Failed to delete team member');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Team Member - Black Hole Dashboard</title>
      </Head>

      <Box>
        {/* Header */}
        <Box
          alignItems="center"
          display="flex"
          justifyContent="space-between"
          marginBottom="32px"
        >
          <H2 color="text.primary" fontWeight={700}>
            Team Member
          </H2>
          <Button onClick={handleAddTeamMember}>Add Team Member</Button>
        </Box>

        {/* Card */}
        <Card sx={{ backgroundColor: 'common.white' }}>
          {/* Card Header */}
          <Box
            alignItems="center"
            display="flex"
            justifyContent="space-between"
            paddingBottom="16px"
          >
            <Body1 color="text.primary" fontWeight={600}>
              Team Member List
            </Body1>
            <Box sx={{ width: '220px' }}>
              <TextField
                fullWidth
                placeholder="Name"
                onChange={(e) => handleSearchChange(e.target.value)}
                startComponent={
                  <Image
                    alt="Search"
                    height={20}
                    src="/icon/search.svg"
                    width={20}
                  />
                }
              />
            </Box>
          </Box>

          {/* Divider */}
          <Divider sx={{ borderColor: '#E2E8F0', marginBottom: '16px' }} />

          {/* Table */}
          <TeamMemberTable
            teamMembers={staffList}
            loading={isLoading}
            currentPage={currentPage}
            pageSize={pageSize}
            total={pagination.total}
            onPageChange={handlePageChange}
            onOpenDeleteModal={handleOpenDeleteModal}
          />
        </Card>
      </Box>

      {/* Delete Modal */}
      <DeleteTeamMemberModal
        open={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        error={deleteError}
      />
    </DashboardLayout>
  );
}

export default withAuth(TeamMember, { requireAuth: true });
