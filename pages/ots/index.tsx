import InfoIcon from '@mui/icons-material/Info';
import { Box, Stack } from '@mui/material';
import { useAtom } from 'jotai';
import Head from 'next/head';
import { useState, useEffect, useMemo } from 'react';

import { activeOtsOrderAtom } from '@/atoms/otsOrderAtom';
import { withAuth } from '@/components/Auth/withAuth';
import { Body1, Body2, Select, Tabs } from '@/components/common';
import { OTSActivationSection } from '@/components/features/ots/order/activation';
import { OrderDetailStep } from '@/components/features/ots/order/detail';
import { TicketSellingSection } from '@/components/features/ots/order/ticket';
import { OTSPerformanceSection } from '@/components/features/ots/performance';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents, useOTSApprovals, useEventDetail, useOTSTickets } from '@/hooks';
import DashboardLayout from '@/layouts/dashboard';
import { UserRole, isEventOrganizer } from '@/types/auth';

function OTSPage() {
  // --- 1. Hooks & States ---
  const { user } = useAuth();
  const [activeOrder, setActiveOrder] = useAtom(activeOtsOrderAtom);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('performance');

  // Determine user role: EO PIC vs Cashier
  const userRole = user && isEventOrganizer(user) ? UserRole.EVENT_ORGANIZER_PIC : (user as any)?.role?.name;

  // --- 2. Data Fetching ---
  const { data: otsApprovalsData, loading: approvalsLoading } = useOTSApprovals(
    { event_id: selectedEventId },
    !!selectedEventId
  );

  // Get active/approved events
  const { events: allEvents, loading: eventsDataLoading } = useEvents({
    status: ['EVENT_STATUS_ON_GOING', 'EVENT_STATUS_APPROVED'],
    show: 100
  });

  // Get event details for selling
  const selectedEventMetaUrl = allEvents?.find((e) => e.id === selectedEventId)?.metaUrl || '';
  const { eventDetail, loading: eventDetailLoading } = useEventDetail(selectedEventMetaUrl);

  // Handle ticket mapping (normal/bundle)
  const { tickets } = useOTSTickets(eventDetail);

  // --- 3. Derived Values ---
  const events = useMemo(() => allEvents || [], [allEvents]);
  const liveEventOptions = useMemo(() => events.map((e) => ({ value: e.id, label: e.name })), [events]);

  const isApproved = otsApprovalsData?.[0]?.status?.toLowerCase() === 'approved';
  const isPending = otsApprovalsData?.[0]?.status?.toLowerCase() === 'pending';
  const eventsLoading = eventsDataLoading;

  // Tab config based on role
  const tabs = useMemo(() => {
    const base = [{ id: 'performance', title: 'Performance' }];
    return userRole === UserRole.EVENT_ORGANIZER_PIC ? base : [{ id: 'ticket_selling', title: 'Ticket Selling' }, ...base];
  }, [userRole]);

  // --- 4. Side Effects ---
  // Restore selected event
  useEffect(() => {
    const savedEventId = localStorage.getItem('ots_selected_event_id');
    if (savedEventId) {
      setSelectedEventId(savedEventId);
    }
  }, []);

  // Persist selected event
  useEffect(() => {
    if (selectedEventId) {
      localStorage.setItem('ots_selected_event_id', selectedEventId);
    }
  }, [selectedEventId]);

  // Set default tab by role
  useEffect(() => {
    setActiveTab(userRole !== UserRole.EVENT_ORGANIZER_PIC ? 'ticket_selling' : 'performance');
  }, [userRole]);

  // Default to first available event
  useEffect(() => {
    if (!selectedEventId && events.length > 0) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  return (
    <DashboardLayout>
      <Head>
        <title>On The Spot Ticket - Wukong Creator</title>
      </Head>

      {activeOrder ? (
        <OrderDetailStep
          activeOrder={activeOrder}
          onBack={() => setActiveOrder(null)}
          eventDetail={eventDetail}
          eventName={events?.find((e) => e.id === selectedEventId)?.name}
        />
      ) : (
        <>
          <Box mb="24px" width="100%" maxWidth="400px">
            <Select
              label="Select Event"
              placeholder="Select Event"
              options={liveEventOptions}
              value={selectedEventId}
              onChange={(val: string) => setSelectedEventId(val)}
              fullWidth
            />
          </Box>

          {eventsLoading || (selectedEventId && approvalsLoading) ? (
            <Body2 color="text.secondary">Loading...</Body2>
          ) : (
            <Box>
              {/* Card 1: Header / Top Section */}
              <Box bgcolor="background.paper" p="16px 24px" mb="24px">
                <Box display="flex" justifyContent="space-between" alignItems="center" mb="16px">
                  <Body1 color="text.primary" fontWeight={600}>
                    {isApproved && selectedEventId
                      ? `On The Spot Ticket: ${events?.find(e => e.id === selectedEventId)?.name || 'Event'}`
                      : 'On The Spot Ticket'}
                  </Body1>
                  {userRole === UserRole.CASHIER && (
                    <Body1 color="text.primary" fontSize="16px">
                      Cashier Name:{' '}
                      <Box component="span" fontWeight={700}>
                        {(user as any)?.fullName || (user as any)?.full_name || ''}
                      </Box>
                    </Body1>
                  )}
                </Box>

                {isApproved ? (
                  <>
                    <Tabs activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />
                    {activeTab === 'ticket_selling' && (
                      <>
                        <Stack alignItems="center" direction="row" gap="8px" mt="24px" mb="24px">
                          <InfoIcon sx={{ color: 'text.secondary', fontSize: '24px' }} />
                          <Body2 color="text.secondary" fontSize="14px">
                            You can only purchase one ticket type per transaction.
                          </Body2>
                        </Stack>

                        <Box borderBottom="1px solid" borderColor="grey.100">
                          <Box display="flex" pb="12px" width="calc(65% - 12px)">
                            <Box sx={{ width: '5%' }}><Body2 color="text.secondary">No</Body2></Box>
                            <Box sx={{ width: '24%' }}><Body2 color="text.secondary">Ticket Type</Body2></Box>
                            <Box sx={{ width: '23%' }}><Body2 color="text.secondary">Price</Body2></Box>
                            <Box sx={{ width: '15%' }}><Body2 color="text.secondary">Stock</Body2></Box>
                            <Box sx={{ width: '14%' }}><Body2 color="text.secondary">Max Buy</Body2></Box>
                            <Box sx={{ width: '19%' }}><Body2 color="text.secondary">Buy Ticket</Body2></Box>
                          </Box>
                        </Box>
                      </>
                    )}
                  </>
                ) : (
                  <OTSActivationSection
                    selectedEventId={selectedEventId}
                    isPending={isPending}
                    userRole={userRole}
                  />
                )}
              </Box>

              {/* Step 2: Content Area (List of Ticket Cards + Summary) */}
              {isApproved && activeTab === 'ticket_selling' && (
                <TicketSellingSection
                  tickets={tickets}
                  eventDetail={eventDetail}
                  isLoading={eventDetailLoading}
                />
              )}

              {/* Step 3: Performance Tab Content */}
              {isApproved && selectedEventId && activeTab === 'performance' && (
                <OTSPerformanceSection
                  eventId={selectedEventId}
                  userRole={userRole}
                  userId={user?.id}
                />
              )}
            </Box>
          )}
        </>
      )}
    </DashboardLayout>
  );
}

export default withAuth(OTSPage, { requireAuth: true });
