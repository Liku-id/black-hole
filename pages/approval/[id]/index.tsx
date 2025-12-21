import { Box } from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { withAuth } from '@/components/Auth/withAuth';
import { Card, Caption, H3, Button, Tabs, Body2 } from '@/components/common';
import { EventDetailAssets } from '@/components/features/events/detail/assets';
import { EventDetailTicket } from '@/components/features/events/detail/ticket';
import { StatusBadge } from '@/components/features/events/status-badge';
import { ApprovalModal } from '@/components/features/approval/events/modal/approval';
import { EventsSubmissionsInfo } from '@/components/features/approval/events/detail';
import { RejectModal } from '@/components/features/approval/events/modal/reject';
import { useAuth } from '@/contexts/AuthContext';
import { useEventsSubmissionDetail } from '@/hooks';
import { useToast } from '@/contexts/ToastContext';
import DashboardLayout from '@/layouts/dashboard';
import { eventSubmissionsService } from '@/services/events-submissions';
import { eventsService } from '@/services/events';
import { ticketsService } from '@/services/tickets';
import { User } from '@/types/auth';

function ApprovalDetail() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('detail');

  // Event Detail Tab State
  const [detailRejectMode, setDetailRejectMode] = useState(false);
  const [detailRejectedFields, setDetailRejectedFields] = useState<string[]>(
    []
  );
  const [detailApproveLoading, setDetailApproveLoading] = useState(false);
  const [detailRejectLoading, setDetailRejectLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isDetailApproveOpen, setIsDetailApproveOpen] = useState(false);
  const [isDetailRejectOpen, setIsDetailRejectOpen] = useState(false);

  // Assets Tab State
  const [assetsRejectMode, setAssetsRejectMode] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [assetsApproveLoading, setAssetsApproveLoading] = useState(false);
  const [assetsRejectLoading, setAssetsRejectLoading] = useState(false);
  const [assetsError, setAssetsError] = useState<string | null>(null);
  const [isAssetsApproveOpen, setIsAssetsApproveOpen] = useState(false);
  const [isAssetsRejectOpen, setIsAssetsRejectOpen] = useState(false);

  // Tickets Tab State (handled per-ticket via modal)
  const [ticketApprovalLoading, setTicketApprovalLoading] = useState(false);
  const [ticketApprovalError, setTicketApprovalError] = useState<string | null>(
    null
  );
  const [isTicketRejectOpen, setIsTicketRejectOpen] = useState(false);
  const [pendingTicketReject, setPendingTicketReject] = useState<{
    ticketId: string;
    rejectedFields: string[];
  } | null>(null);

  // Global Event Approval State
  const [globalApprovalLoading, setGlobalApprovalLoading] = useState(false);
  const [isSubmitReviewConfirmOpen, setIsSubmitReviewConfirmOpen] =
    useState(false);

  const { submission, loading, error, mutate } = useEventsSubmissionDetail(
    id as string
  );

  // Calculate tab statuses for indicators
  const getTabStatus = () => {
    if (!submission?.event)
      return { detail: undefined, assets: undefined, tickets: undefined };

    const event = submission.event;

    // Event Detail Status
    // For approved or ongoing events, check eventUpdateRequest instead
    let detailStatus: 'rejected' | 'approved' | 'pending' | undefined;

    if (event.eventStatus === 'approved' || event.eventStatus === 'on_going') {
      // Check eventUpdateRequest for event detail status
      if (submission.eventUpdateRequest) {
        const eventDetailStatus =
          submission.eventUpdateRequest.eventDetailStatus;
        if (eventDetailStatus === 'rejected') {
          detailStatus = 'rejected';
        } else if (eventDetailStatus === 'approved') {
          detailStatus = 'approved';
        } else if (eventDetailStatus === 'pending') {
          detailStatus = 'pending';
        }
      }
      // If no eventUpdateRequest, no changes requested, so no status to show
    } else {
      // For other statuses, use regular eventDetailStatus
      if (event.eventDetailStatus === 'rejected') {
        detailStatus = 'rejected';
      } else if (event.eventDetailStatus === 'approved') {
        detailStatus = 'approved';
      } else if (event.eventDetailStatus === 'pending') {
        detailStatus = 'pending';
      }
    }

    // Event Asset Status - Priority: rejected > pending > approved
    // Read from eventAssetChanges[0].status (firstChange) if available, otherwise fall back to eventAssets
    let assetStatus: 'rejected' | 'approved' | 'pending' | undefined;

    // For on_going events, if eventAssetChanges is empty, don't show tab status
    if (event.eventStatus === 'on_going') {
      if (event.eventAssetChanges && event.eventAssetChanges.length > 0) {
        // Read status directly from firstChange
        const firstChange = event.eventAssetChanges[0];
        const firstChangeStatus = firstChange.status;

        if (firstChangeStatus === 'rejected') {
          assetStatus = 'rejected';
        } else if (firstChangeStatus === 'pending' || !firstChangeStatus) {
          assetStatus = 'pending';
        } else if (firstChangeStatus === 'approved') {
          assetStatus = 'approved';
        }
      } else {
        // If eventAssetChanges is empty for on_going events, show as approved
        assetStatus = 'approved';
      }
    } else if (event.eventAssetChanges && event.eventAssetChanges.length > 0) {
      // Read status directly from firstChange
      const firstChange = event.eventAssetChanges[0];
      const firstChangeStatus = firstChange.status;

      if (firstChangeStatus === 'rejected') {
        assetStatus = 'rejected';
      } else if (firstChangeStatus === 'pending' || !firstChangeStatus) {
        assetStatus = 'pending';
      } else if (firstChangeStatus === 'approved') {
        assetStatus = 'approved';
      }
    } else {
      // Fall back to eventAssets when eventAssetChanges is null
      const assetsToCheck = event.eventAssets || [];

      const hasRejectedAsset = assetsToCheck.some(
        (ea: any) => ea.status === 'rejected'
      );
      const hasPendingAsset = assetsToCheck.some(
        (ea: any) => !ea.status || ea.status === 'pending'
      );
      const allAssetsApproved =
        assetsToCheck.length > 0 &&
        assetsToCheck.every((ea: any) => ea.status === 'approved');

      if (hasRejectedAsset) {
        assetStatus = 'rejected';
      } else if (hasPendingAsset) {
        assetStatus = 'pending';
      } else if (allAssetsApproved) {
        assetStatus = 'approved';
      }
    }

    // Ticket Status - Priority: pending > rejected > approved
    let ticketStatus: 'rejected' | 'approved' | 'pending' | undefined;
    const hasPendingTicket = event.ticketTypes?.some(
      (tt: any) => !tt.status || tt.status === 'pending'
    );
    const hasRejectedTicket = event.ticketTypes?.some(
      (tt: any) => tt.status === 'rejected'
    );
    const allApproved =
      event.ticketTypes?.length > 0 &&
      event.ticketTypes?.every((tt: any) => tt.status === 'approved');

    if (hasPendingTicket) {
      ticketStatus = 'pending';
    } else if (hasRejectedTicket) {
      ticketStatus = 'rejected';
    } else if (allApproved) {
      ticketStatus = 'approved';
    }

    return {
      detail: detailStatus,
      assets: assetStatus,
      tickets: ticketStatus
    };
  };

  const tabStatuses = getTabStatus();

  // Check if all sections are reviewed (no pending sections)
  const areAllSectionsReviewed = (): boolean => {
    if (!submission?.event) return false;

    const statuses = [
      tabStatuses.detail,
      tabStatuses.assets,
      tabStatuses.tickets
    ].filter((status) => status !== undefined); // Filter out undefined (unrequested sections)

    // If no sections need review, return true
    if (statuses.length === 0) return true;

    // All sections must be either approved or rejected (no pending)
    return statuses.every(
      (status) => status === 'approved' || status === 'rejected'
    );
  };

  // Determine if the final action should be approve or reject
  const getFinalAction = (): 'approve' | 'reject' => {
    const statuses = [
      tabStatuses.detail,
      tabStatuses.assets,
      tabStatuses.tickets
    ].filter((status) => status !== undefined); // Filter out undefined (unrequested sections)

    // If any section is rejected, the final action is reject
    if (statuses.some((status) => status === 'rejected')) {
      return 'reject';
    }

    // Otherwise, approve (all sections are approved)
    return 'approve';
  };

  const allSectionsReviewed = areAllSectionsReviewed();
  const finalAction = getFinalAction();

  useEffect(() => {
    if (user) {
      const userRole = (user as User).role?.name;
      if (userRole !== 'admin' && userRole !== 'business_development') {
        router.push('/events');
      }
    }
  }, [user, router]);

  // Event Detail Tab Handlers
  const handleDetailApprove = async () => {
    setDetailError(null);
    setDetailApproveLoading(true);
    try {
      await eventsService.approveOrRejectEventDetail(submission?.event?.id, {
        status: 'approved'
      });
      setIsDetailApproveOpen(false);
      showSuccess('Event detail approved successfully');
      await mutate();
    } catch (e) {
      const msg =
        (e as any)?.response?.data?.message ||
        (e as Error)?.message ||
        'Failed to approve event detail';
      setDetailError(msg);
      showError(msg);
    } finally {
      setDetailApproveLoading(false);
    }
  };

  const handleDetailReject = async (reason: string) => {
    setDetailError(null);
    setDetailRejectLoading(true);
    try {
      await eventsService.approveOrRejectEventDetail(submission?.event?.id, {
        rejectedFields: detailRejectedFields,
        rejectedReason: reason,
        status: 'rejected'
      });
      setIsDetailRejectOpen(false);
      setDetailRejectMode(false);
      setDetailRejectedFields([]);
      showSuccess('Event detail rejected');
      await mutate();
    } catch (e) {
      const msg =
        (e as any)?.response?.data?.message ||
        (e as Error)?.message ||
        'Failed to reject event detail';
      setDetailError(msg);
      showError(msg);
    } finally {
      setDetailRejectLoading(false);
    }
  };

  // Assets Tab Handlers
  const handleAssetsApprove = async () => {
    if (
      !submission?.event?.eventAssetChanges ||
      submission.event.eventAssetChanges.length === 0
    ) {
      showError('No assets to approve');
      return;
    }

    if (!submission?.event?.id) {
      showError('Event ID not found');
      return;
    }

    // Filter only pending assets
    const pendingAssets = submission.event.eventAssetChanges.filter(
      (ea: any) => !ea.status || ea.status === 'pending'
    );

    if (pendingAssets.length === 0) {
      showError('No pending assets to approve');
      return;
    }

    setAssetsError(null);
    setAssetsApproveLoading(true);
    try {
      await eventsService.batchApproveAssets(submission.event.id);
      setIsAssetsApproveOpen(false);
      showSuccess('Assets approved successfully');
      await mutate();
    } catch (e) {
      const msg =
        (e as any)?.response?.data?.message ||
        (e as Error)?.message ||
        'Failed to approve assets';
      setAssetsError(msg);
      showError(msg);
    } finally {
      setAssetsApproveLoading(false);
    }
  };

  const handleAssetsReject = async (reason: string) => {
    if (selectedAssets.length === 0) {
      showError('Please select at least one asset to reject');
      return;
    }

    if (!submission?.event?.id) {
      showError('Event ID not found');
      return;
    }

    setAssetsError(null);
    setAssetsRejectLoading(true);
    try {
      await eventsService.batchRejectAssets(
        submission.event.id,
        selectedAssets,
        reason
      );
      setIsAssetsRejectOpen(false);
      setAssetsRejectMode(false);
      setSelectedAssets([]);
      showSuccess('Assets rejected');
      await mutate();
    } catch (e) {
      const msg =
        (e as any)?.response?.data?.message ||
        (e as Error)?.message ||
        'Failed to reject assets';
      setAssetsError(msg);
      showError(msg);
    } finally {
      setAssetsRejectLoading(false);
    }
  };

  // Global Event Approval/Rejection Handlers
  const handleSubmitReviewConfirm = async () => {
    if (!id || !submission?.event) return;

    setGlobalApprovalLoading(true);
    try {
      // Determine the action based on section statuses
      const action = finalAction === 'approve' ? 'approved' : 'rejected';

      // Use submission.event.id when event status is on_going, otherwise use event-submission id from router
      const eventIdToUse =
        submission.event.eventStatus === 'on_going'
          ? submission.event.id
          : (id as string);

      await eventSubmissionsService.approveOrRejectEvent(eventIdToUse, action);

      setIsSubmitReviewConfirmOpen(false);
      showSuccess(
        `Event ${action === 'approved' ? 'approved' : 'rejected'} successfully`
      );
      await mutate();
      // Redirect to approval list
      router.push('/approval');
    } catch (e) {
      const msg =
        (e as any)?.response?.data?.message ||
        (e as Error)?.message ||
        'Failed to submit review';
      showError(msg);
    } finally {
      setGlobalApprovalLoading(false);
    }
  };

  // Ticket Handlers (per-ticket)
  const handleTicketApprove = async (ticketId: string) => {
    setTicketApprovalError(null);
    setTicketApprovalLoading(true);
    try {
      await ticketsService.approveTicketType(ticketId);
      showSuccess('Ticket approved successfully');
      await mutate();
    } catch (e) {
      const msg =
        (e as any)?.response?.data?.message ||
        (e as Error)?.message ||
        'Failed to approve ticket';
      setTicketApprovalError(msg);
      showError(msg);
    } finally {
      setTicketApprovalLoading(false);
    }
  };

  const handleTicketReject = (ticketId: string, rejectedFields: string[]) => {
    // Store the pending rejection data and open the reject modal
    setPendingTicketReject({
      ticketId,
      rejectedFields
    });
    setIsTicketRejectOpen(true);
  };

  const handleTicketRejectConfirm = async (rejectedReason: string) => {
    if (!pendingTicketReject) return;

    setTicketApprovalError(null);
    setTicketApprovalLoading(true);
    try {
      await ticketsService.rejectTicketType(pendingTicketReject.ticketId, {
        rejected_fields: pendingTicketReject.rejectedFields,
        rejected_reason: rejectedReason
      });
      setIsTicketRejectOpen(false);
      setPendingTicketReject(null);
      showSuccess('Ticket rejected');
      await mutate();
    } catch (e) {
      const msg =
        (e as any)?.response?.data?.message ||
        (e as Error)?.message ||
        'Failed to reject ticket';
      setTicketApprovalError(msg);
      showError(msg);
    } finally {
      setTicketApprovalLoading(false);
    }
  };

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

        {/* Global Submit Review Button */}
        {!(
          submission.event?.eventStatus === 'on_going' &&
          submission.eventUpdateRequest?.status === 'rejected'
        ) && (
          <Button
            variant="primary"
            onClick={() => setIsSubmitReviewConfirmOpen(true)}
            disabled={
              !allSectionsReviewed ||
              globalApprovalLoading ||
              submission.eventUpdateRequest?.status === 'rejected'
            }
          >
            Submit Review
          </Button>
        )}
      </Box>

      {/* Tabs */}
      <Box mb={3}>
        <Tabs
          activeTab={activeTab}
          tabs={[
            {
              id: 'detail',
              title: 'Event Detail',
              status: tabStatuses.detail
            },
            {
              id: 'assets',
              title: 'Event Assets',
              status: tabStatuses.assets
            },
            {
              id: 'tickets',
              title: 'Event Tickets',
              status: tabStatuses.tickets
            }
          ]}
          onTabChange={setActiveTab}
        />
      </Box>

      {/* Tab Content Card */}
      <Card sx={{ mb: 3 }}>
        {activeTab === 'detail' && (
          <>
            {/* Event Detail Header with Title and Actions */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <H3 color="text.primary" fontWeight={700}>
                Event Detail
              </H3>
              {/* Hide buttons if status is already rejected or approved */}
              {tabStatuses.detail !== 'rejected' &&
                tabStatuses.detail !== 'approved' && (
                  <Box display="flex" gap={2}>
                    {!detailRejectMode ? (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => setDetailRejectMode(true)}
                          disabled={detailApproveLoading}
                        >
                          Reject
                        </Button>
                        <Button
                          onClick={() => setIsDetailApproveOpen(true)}
                          disabled={detailApproveLoading}
                        >
                          Approve
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setDetailRejectMode(false);
                            setDetailRejectedFields([]);
                          }}
                          disabled={detailRejectLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => setIsDetailRejectOpen(true)}
                          disabled={
                            detailRejectedFields.length === 0 ||
                            detailRejectLoading
                          }
                        >
                          Submit Rejection
                        </Button>
                      </>
                    )}
                  </Box>
                )}
            </Box>

            <EventsSubmissionsInfo
              eventDetail={submission.event}
              eventUpdateRequest={submission.eventUpdateRequest}
              rejectMode={detailRejectMode}
              selectedFields={detailRejectedFields}
              onToggleField={(key, checked) => {
                setDetailRejectedFields((prev) => {
                  const next = new Set(prev);
                  if (checked) next.add(key);
                  else next.delete(key);
                  return Array.from(next);
                });
              }}
            />
          </>
        )}

        {activeTab === 'assets' && (
          <>
            {/* Event Assets Header with Title and Actions */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <H3 color="text.primary" fontWeight={700}>
                Event Assets
              </H3>
              {(() => {
                // For on_going events, if eventAssetChanges is empty, don't show buttons
                if (
                  submission.event?.eventStatus === 'on_going' &&
                  (!submission.event?.eventAssetChanges ||
                    submission.event.eventAssetChanges.length === 0)
                ) {
                  return null;
                }

                // If eventAssetChanges is null, fall back to eventAssets
                const hasAssetChanges =
                  submission.event?.eventAssetChanges &&
                  submission.event.eventAssetChanges.length > 0;
                const eventAssets = submission.event?.eventAssets || [];

                let hasRejectedAsset = false;
                let allAssetsApproved = false;

                if (hasAssetChanges) {
                  // Read status from firstChange
                  const firstChange = submission.event.eventAssetChanges[0];
                  const firstChangeStatus = firstChange.status;

                  hasRejectedAsset = firstChangeStatus === 'rejected';
                  allAssetsApproved = firstChangeStatus === 'approved';
                } else {
                  // Fall back to eventAssets
                  hasRejectedAsset = eventAssets.some(
                    (ea: any) => ea.status === 'rejected'
                  );
                  allAssetsApproved =
                    eventAssets.length > 0 &&
                    eventAssets.every((ea: any) => ea.status === 'approved');
                }

                // Hide buttons if any rejected assets OR all assets approved
                if (hasRejectedAsset || allAssetsApproved) {
                  return null;
                }

                return (
                  <Box display="flex" gap={2}>
                    {!assetsRejectMode ? (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => setAssetsRejectMode(true)}
                          disabled={assetsApproveLoading}
                        >
                          Reject
                        </Button>
                        <Button
                          onClick={() => setIsAssetsApproveOpen(true)}
                          disabled={assetsApproveLoading}
                        >
                          Approve
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setAssetsRejectMode(false);
                            setSelectedAssets([]);
                          }}
                          disabled={assetsRejectLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => setIsAssetsRejectOpen(true)}
                          disabled={
                            selectedAssets.length === 0 || assetsRejectLoading
                          }
                        >
                          Submit Rejection
                        </Button>
                      </>
                    )}
                  </Box>
                );
              })()}
            </Box>

            {/* Rejected Reason from firstChange */}
            {(() => {
              // If eventAssetChanges is null, fall back to eventAssets
              const hasAssetChanges =
                submission.event?.eventAssetChanges &&
                submission.event.eventAssetChanges.length > 0;

              let firstRejectedAsset;
              if (hasAssetChanges) {
                // Read rejection info from firstChange
                const firstChange = submission.event.eventAssetChanges[0];
                if (
                  firstChange.status === 'rejected' &&
                  firstChange.rejectedReason
                ) {
                  firstRejectedAsset = firstChange;
                }
              } else {
                // Fall back to eventAssets
                firstRejectedAsset = submission.event?.eventAssets?.find(
                  (ea: any) => ea.status === 'rejected' && ea.rejectedReason
                );
              }

              if (!firstRejectedAsset?.rejectedReason) return null;

              return (
                <Box mb={2}>
                  <Box
                    border="1px solid"
                    borderColor="error.main"
                    borderRadius={1}
                    p="12px 16px"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      backgroundColor: 'error.light',
                      borderLeft: '4px solid',
                      borderLeftColor: 'error.main'
                    }}
                  >
                    <Body2 color="error.dark" fontWeight={500}>
                      Rejection Reason:
                    </Body2>
                    <Body2 color="text.primary">
                      {firstRejectedAsset.rejectedReason}
                    </Body2>
                  </Box>
                </Box>
              );
            })()}

            <EventDetailAssets
              eventDetail={submission.event}
              eventAssetChanges={submission.event?.eventAssetChanges}
              rejectMode={assetsRejectMode}
              selectedAssets={selectedAssets}
              onToggleAsset={(assetId, checked) => {
                setSelectedAssets((prev) =>
                  checked
                    ? [...prev, assetId]
                    : prev.filter((id) => id !== assetId)
                );
              }}
              hideHeader={true}
              hideOriginalAssets={true}
              showStatus={true}
            />
          </>
        )}

        {activeTab === 'tickets' && (
          <>
            {/* Event Tickets Header with Title */}
            <Box mb={3}>
              <H3 color="text.primary" fontWeight={700}>
                Event Tickets
              </H3>
            </Box>

            <EventDetailTicket
              eventDetail={submission.event}
              approvalMode={true}
              onApproveTicket={handleTicketApprove}
              onRejectTicket={handleTicketReject}
              ticketApprovalLoading={ticketApprovalLoading}
              ticketApprovalError={ticketApprovalError}
              hideHeader={true}
              showStatus={true}
            />
          </>
        )}
      </Card>

      {/* Event Detail Modals */}
      <ApprovalModal
        error={detailError}
        eventName={submission.event?.name}
        loading={detailApproveLoading}
        open={isDetailApproveOpen}
        onClose={() => setIsDetailApproveOpen(false)}
        onConfirm={handleDetailApprove}
        title="Approve Event Detail Section"
        message="Are you sure you want to approve the Event Detail section?"
      />

      <RejectModal
        error={detailError}
        loading={detailRejectLoading}
        open={isDetailRejectOpen}
        rejectedFields={detailRejectedFields}
        onClose={() => setIsDetailRejectOpen(false)}
        onConfirm={handleDetailReject}
        title="Reject Event Detail Section"
        message="Are you sure you want to reject the selected fields in the Event Detail section?"
      />

      {/* Assets Modals */}
      <ApprovalModal
        error={assetsError}
        eventName={`${submission.event?.name} - Assets`}
        loading={assetsApproveLoading}
        open={isAssetsApproveOpen}
        onClose={() => setIsAssetsApproveOpen(false)}
        onConfirm={handleAssetsApprove}
        title="Approve Event Assets"
        message="Are you sure you want to approve all Event Assets?"
      />

      <RejectModal
        error={assetsError}
        loading={assetsRejectLoading}
        open={isAssetsRejectOpen}
        rejectedFields={selectedAssets}
        onClose={() => setIsAssetsRejectOpen(false)}
        onConfirm={handleAssetsReject}
        title="Reject Event Assets"
        message="Are you sure you want to reject the selected assets?"
        fieldDisplayMap={(() => {
          const firstChange = submission?.event?.eventAssetChanges?.[0];
          if (!firstChange?.items) return {};

          return firstChange.items.reduce(
            (acc: Record<string, string>, item: any) => {
              // Key by assetId (what we send in rejectedFields)
              acc[item.assetId] = `Asset ${item.order}`;
              return acc;
            },
            {} as Record<string, string>
          );
        })()}
      />

      {/* Ticket Rejection Modal */}
      <RejectModal
        error={ticketApprovalError}
        loading={ticketApprovalLoading}
        open={isTicketRejectOpen}
        rejectedFields={pendingTicketReject?.rejectedFields || []}
        onClose={() => {
          setIsTicketRejectOpen(false);
          setPendingTicketReject(null);
        }}
        onConfirm={handleTicketRejectConfirm}
        title="Reject Ticket"
        message="Please provide a reason for rejecting the selected ticket fields."
        fieldDisplayMap={{
          name: 'Ticket Name',
          description: 'Description',
          price: 'Price',
          quantity: 'Quantity',
          max_order_quantity: 'Max Order Quantity',
          sales_start_date: 'Sales Start Date',
          sales_end_date: 'Sales End Date',
          ticketStartDate: 'Ticket Start Date',
          ticketEndDate: 'Ticket End Date'
        }}
      />

      {/* Submit Review Confirmation Modal */}
      <ApprovalModal
        error={null}
        eventName={submission.event?.name}
        loading={globalApprovalLoading}
        open={isSubmitReviewConfirmOpen}
        onClose={() => setIsSubmitReviewConfirmOpen(false)}
        onConfirm={handleSubmitReviewConfirm}
        title="Submit Review"
        message={`You are about to submit your review for "${submission.event?.name || 'this event'}". ${
          finalAction === 'approve'
            ? 'All sections have been approved.'
            : 'One or more sections have been rejected.'
        } Do you want to continue?`}
      />
    </DashboardLayout>
  );
}

export default withAuth(ApprovalDetail, { requireAuth: true });
