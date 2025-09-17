import { Box, Divider, styled } from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { withAuth } from '@/components/Auth/withAuth';
import { Card, Caption, H3, Button } from '@/components/common';
import { EventsSubmissionsInfo } from '@/components/features/events-submissions/detail/info';
import { StatusBadge } from '@/components/features/events/status-badge';
import { ApprovalModal } from '@/components/features/events-submissions/detail/approval-modal';
import { RejectModal } from '@/components/features/events-submissions/detail/reject-modal';
import { useEventsSubmissionDetail } from '@/hooks';
import { eventSubmissionsService } from '@/services/events-submissions';
import DashboardLayout from '@/layouts/dashboard';

const StyledDivider = styled(Divider)({
  margin: '24px 0px',
  borderColor: 'grey.100',
  borderWidth: '1px'
});

// Using shared StatusBadge component
function ApprovalDetail() {
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
      await eventSubmissionsService.approveOrRejectSubmission(submission.id, {
        rejectedFields: [],
        rejectedReason: '',
        status: 'approved'
      });
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
        submission.id,
        payload
      );
      setIsRejectOpen(false);
      setRejectMode(false);
      setRejectedFields([]);
      // router.push('/events');
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
        mb="16px"
        justifyContent="space-between"
      >
        <Box alignItems="center" display="flex" gap={2}>
          <H3 color="text.primary" fontWeight={700}>
            Event Name: {submission.event?.name}
          </H3>
          <StatusBadge status={submission.event?.eventStatus} />
        </Box>
        {!rejectMode ? (
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
          position="sticky"
          bottom={24}
          display="flex"
          justifyContent="center"
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
              onClick={() => setIsRejectOpen(true)}
              disabled={rejectedFields.length === 0}
            >
              Submit
            </Button>
          </Box>
        </Box>
      ) : null}

      <ApprovalModal
        open={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        onConfirm={handleApprove}
        eventName={submission.event?.name}
        loading={approveLoading}
        error={approveError}
      />

      <RejectModal
        open={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        loading={rejectLoading}
        error={rejectError}
        rejectedFields={rejectedFields}
        onConfirm={handleReject}
      />
    </DashboardLayout>
  );
}

export default withAuth(ApprovalDetail, { requireAuth: true });
