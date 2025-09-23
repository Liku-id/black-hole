import { Box, Divider, styled } from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { withAuth } from '@/components/Auth/withAuth';
import { Card, Caption, H3, Button } from '@/components/common';
import { StatusBadge } from '@/components/features/events/status-badge';
import { ApprovalModal } from '@/components/features/events-submissions/detail/approval-modal';
import { EventsSubmissionsInfo } from '@/components/features/events-submissions/detail/info';
import { RejectModal } from '@/components/features/events-submissions/detail/reject-modal';
import { useAuth } from '@/contexts/AuthContext';
import { useEventsSubmissionDetail } from '@/hooks';
import DashboardLayout from '@/layouts/dashboard';
import { eventSubmissionsService } from '@/services/events-submissions';
import { User } from '@/types/auth';

const StyledDivider = styled(Divider)({
  margin: '24px 0px',
  borderColor: 'grey.100',
  borderWidth: '1px'
});

// Using shared StatusBadge component
function ApprovalDetail() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectedFields, setRejectedFields] = useState<string[]>([]);

  const { submission, loading, error } = useEventsSubmissionDetail(
    id as string
  );

  useEffect(() => {
    if (user) {
      const userRole = (user as User).role?.name;
      if (userRole !== 'admin' && userRole !== 'business_development') {
        router.push('/events');
      }
    }
  }, [user, router]);

  if (loading) {
    return (
      <DashboardLayout>
        <Head>
          <title>Loading Event - Black Hole Dashboard</title>
        </Head>
        <Box>Loading...</Box>
      </DashboardLayout>
    );
  }

  if (error || !submission) {
    return (
      <DashboardLayout>
        <Head>
          <title>Event Not Found - Black Hole Dashboard</title>
        </Head>
        <Box>Failed to load event: {error}</Box>
      </DashboardLayout>
    );
  }

  const handleApprove = async () => {
    setApproveError(null);
    setApproveLoading(true);
    try {
      await eventSubmissionsService.approveOrRejectSubmission(
        submission?.event?.id,
        {
          rejectedFields: [],
          rejectedReason: '',
          status: 'approved'
        }
      );
      setIsApproveOpen(false);
      router.push('/events');
    } catch (e) {
      setApproveLoading(false);
      const msg =
        (e as any)?.response?.data?.message ||
        (e as Error)?.message ||
        'Failed to approve submission';
      setApproveError(msg);
    }
  };

  const handleReject = async (reason: string) => {
    setRejectError(null);
    setRejectLoading(true);
    try {
      const payload = {
        rejectedFields,
        rejectedReason: reason,
        status: 'rejected' as const
      };
      await eventSubmissionsService.approveOrRejectSubmission(
        submission?.event?.id,
        payload
      );
      setIsRejectOpen(false);
      setRejectMode(false);
      setRejectedFields([]);
      router.push(submission.type === 'new' ? '/events' : '/approval');
    } catch (e) {
      const msg =
        (e as any)?.response?.data?.message ||
        (e as Error)?.message ||
        'Failed to reject submission';
      setRejectError(msg);
      setRejectLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Head>
        <title>
          {submission.event?.name} - Approval - Black Hole Dashboard
        </title>
      </Head>

      {/* Back Button */}
      <Box
        alignItems="center"
        display="flex"
        gap={1}
        mb={2}
        sx={{ cursor: 'pointer' }}
        onClick={() => router.push(`/approval`)}
      >
        <Image alt="Back" height={24} src="/icon/back.svg" width={24} />
        <Caption color="text.secondary" component="span">
          Back To Approval List
        </Caption>
      </Box>

      {/* Event Name */}
      <Box
        alignItems="center"
        display="flex"
        gap={2}
        justifyContent="space-between"
        mb="16px"
      >
        <Box alignItems="center" display="flex" gap={2}>
          <H3 color="text.primary" fontWeight={700}>
            Event Name: {submission.event?.name}
          </H3>
          <StatusBadge
            status={
              submission.type === 'new'
                ? submission.event?.eventStatus
                : submission.eventUpdateRequest?.status
            }
          />
        </Box>
        {!rejectMode && submission.eventUpdateRequest?.status !== 'rejected' ? (
          <Box display="flex" gap={1}>
            <Button
              variant="secondary"
              onClick={() => {
                setRejectMode(true);
                setRejectedFields([]);
              }}
            >
              Reject
            </Button>
            <Button onClick={() => setIsApproveOpen(true)}>Approve</Button>
          </Box>
        ) : null}
      </Box>

      {/* Main Card */}
      <Card sx={{ mb: 3 }}>
        <EventsSubmissionsInfo
          eventDetail={submission.event}
          eventUpdateRequest={submission.eventUpdateRequest}
          rejectMode={rejectMode}
          selectedFields={rejectedFields}
          onToggleField={(key, checked) => {
            setRejectedFields((prev) => {
              const next = new Set(prev);
              if (checked) next.add(key);
              else next.delete(key);
              return Array.from(next);
            });
          }}
        />
        <StyledDivider />
      </Card>

      {rejectMode ? (
        <Box
          bottom={24}
          display="flex"
          justifyContent="center"
          position="sticky"
          zIndex={100}
        >
          <Box
            bgcolor="common.white"
            borderRadius={1}
            boxShadow={2}
            display="flex"
            gap={1}
            p={1}
          >
            <Button
              variant="secondary"
              onClick={() => {
                setRejectMode(false);
                setRejectedFields([]);
                setRejectError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={rejectedFields.length === 0}
              onClick={() => setIsRejectOpen(true)}
            >
              Submit
            </Button>
          </Box>
        </Box>
      ) : null}

      <ApprovalModal
        error={approveError}
        eventName={submission.event?.name}
        loading={approveLoading}
        open={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        onConfirm={handleApprove}
      />

      <RejectModal
        error={rejectError}
        loading={rejectLoading}
        open={isRejectOpen}
        rejectedFields={rejectedFields}
        onClose={() => setIsRejectOpen(false)}
        onConfirm={handleReject}
      />
    </DashboardLayout>
  );
}

export default withAuth(ApprovalDetail, { requireAuth: true });
