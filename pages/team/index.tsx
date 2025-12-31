import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Box, Divider } from '@mui/material';
import Image from 'next/image';

import { withAuth } from '@/components/Auth/withAuth';
import { useToast } from '@/contexts/ToastContext';
import { H2, Button, Card, Body1, TextField } from '@/components/common';
import { TeamMemberTable } from '@/components/features/team-member/table';
import { DeleteTeamMemberModal } from '@/components/features/team-member/modal/delete';
import DashboardLayout from '@/layouts/dashboard';
import { useAtom } from 'jotai';
import { selectedEOIdAtom } from '@/atoms/eventOrganizerAtom';
import { useStaff } from '@/hooks/useStaff';
import { useAuth } from '@/contexts/AuthContext';
import { isEventOrganizer } from '@/types/auth';

function TeamMember() {
  const router = useRouter();
  const { showInfo } = useToast();
  const [searchName, setSearchName] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
  } | null>(null);

  const { user } = useAuth();
  const [selectedEOId] = useAtom(selectedEOIdAtom);

  // Determine Event Organizer ID based on user role
  const eoId = user && isEventOrganizer(user) ? user.id : selectedEOId;

  const { staffList, pagination, isLoading } = useStaff(eoId, {
    page: currentPage + 1, // API is 1-based
    show: pageSize,
    name: searchName
  });

  const handleAddTeamMember = () => {
    router.push('/team/create');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleOpenDeleteModal = (member: {
    id: string;
    name: string;
    email: string;
    role: string;
  }) => {
    setSelectedMember(member);
    setDeleteModalOpen(true);
    setDeleteError(null);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedMember(null);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMember) return;

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      // TODO: Implement actual delete API call
      console.log('Deleting team member:', selectedMember.id);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      showInfo('Team Member Deleted');
      handleCloseDeleteModal();
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
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
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
