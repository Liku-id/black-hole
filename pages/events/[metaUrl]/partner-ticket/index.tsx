import { Box, Card, CardContent } from '@mui/material';
import { useSetAtom } from 'jotai';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { pendingPartnerAtom } from '@/atoms/pendingPartnerAtom';
import { withAuth } from '@/components/Auth/withAuth';
import { Button, Caption, H2, H4 } from '@/components/common';
import { ChoosePartnerModal } from '@/components/features/events/partner-ticket/choose-partner-modal';
import { CreatePartnerModal } from '@/components/features/events/partner-ticket/create-modal';
import { EditPartnerModal } from '@/components/features/events/partner-ticket/edit-modal';
import PartnerEventTable from '@/components/features/events/partner-ticket/table';
import {
  useEventDetail,
  usePartnerTicketTypes,
  useUpdatePartner
} from '@/hooks';
import DashboardLayout from '@/layouts/dashboard';

interface PartnerFormData {
  partnerName: string;
  picName: string;
  picPhoneNumber: string;
  tiktokLink: string;
  instagramLink: string;
  twitterLink: string;
}

function PartnerTicket() {
  const router = useRouter();
  const { metaUrl } = router.query;
  const setPendingPartner = useSetAtom(pendingPartnerAtom);
  const {
    eventDetail,
    loading: eventLoading,
    error: eventError
  } = useEventDetail(metaUrl as string);

  const [filters, setFilters] = useState({
    page: 0,
    show: 10,
    search: ''
  });
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [choosePartnerModalOpen, setChoosePartnerModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<any | null>(null);

  // Get event ID and event organizer ID
  const eventId = eventDetail?.id;
  const eventOrganizerId = eventDetail?.eventOrganizer?.id;

  // Fetch partner ticket types
  const {
    partnerTicketTypes: partnerTicketTypesData,
    loading: partnerTicketTypesLoading,
    mutate: mutatePartnerTicketTypes,
    pagination
  } = usePartnerTicketTypes(
    eventId
      ? {
          event_id: eventId,
          page: filters.page,
          limit: filters.show
        }
      : null
  );

  const { updatePartner, loading: updateLoading } = useUpdatePartner();

  // Helper function to parse social media link
  const parseSocialMediaLink = (link: string | any): any => {
    if (typeof link === 'string') {
      try {
        return JSON.parse(link);
      } catch {
        // If parsing fails, return empty object
        return {};
      }
    }
    return link || {};
  };

  // Helper function to build private link
  const buildPrivateLink = (code: string, metaUrl: string): string => {
    return `${process.env.NEXT_PUBLIC_WUKONG_URL || 'https://wukong.co.id'}/event/${metaUrl}?partner_code=${code}`;
  };

  // Transform partner ticket types data to match table format
  const partners = partnerTicketTypesData
    .map((partnerTicketType) => {
      const partner = partnerTicketType.partner;
      if (!partner) {
        return null;
      }

      return {
        id: partner.id,
        partnerName: partner.partner_name,
        socialMediaLink: parseSocialMediaLink(partner.social_media_link),
        picName: partner.pic_name,
        picPhoneNumber: partner.pic_phone_number,
        totalRevenue: '0', // TODO: Calculate from actual revenue data if available
        linkExpiredDate: partnerTicketType.expired_at || undefined,
        privateLink: partnerTicketType.code
          ? buildPrivateLink(partnerTicketType.code, metaUrl as string)
          : undefined
      };
    })
    .filter(
      (partner): partner is NonNullable<typeof partner> => partner !== null
    );

  const loading = eventLoading || partnerTicketTypesLoading;

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleAddPartner = () => {
    setCreateModalOpen(true);
  };

  const handleChooseExistingPartner = () => {
    setChoosePartnerModalOpen(true);
  };

  const handleCreatePartner = async (data: PartnerFormData) => {
    if (!eventOrganizerId) {
      console.error('Event organizer ID is missing');
      return;
    }

    // Save partner data to atom instead of creating immediately
    setPendingPartner({
      partnerName: data.partnerName,
      picName: data.picName,
      picPhoneNumber: data.picPhoneNumber,
      tiktokLink: data.tiktokLink,
      instagramLink: data.instagramLink,
      twitterLink: data.twitterLink,
      eventOrganizerId: eventOrganizerId
    });

    // Close modal and redirect to create private link
    setCreateModalOpen(false);
    router.push(`/events/${metaUrl}/partner-ticket/create-private-link`);
  };

  const handleCreatePrivateLink = (partner: any) => {
    router.push(
      `/events/${metaUrl}/partner-ticket/create-private-link?partnerId=${partner.id}`
    );
  };

  const handleTransactionList = (partner: any) => {
    router.push(`/events/${metaUrl}/partner-ticket/transactions/${partner.id}`);
  };

  const handleEditPartner = (partner: any) => {
    setSelectedPartner(partner);
    setEditModalOpen(true);
  };

  const handleUpdatePartner = async (data: PartnerFormData) => {
    if (!eventOrganizerId || !selectedPartner) {
      console.error('Event organizer ID or partner is missing');
      return;
    }

    try {
      // Build social media links object
      const socialMediaLinks: any = {};
      if (data.tiktokLink) socialMediaLinks.tiktok = data.tiktokLink;
      if (data.instagramLink) socialMediaLinks.instagram = data.instagramLink;
      if (data.twitterLink) socialMediaLinks.twitter = data.twitterLink;

      // Convert to JSON string for API
      const socialMediaLinkString = JSON.stringify(socialMediaLinks);

      // Call update partner API
      await updatePartner(selectedPartner.id, {
        partner_name: data.partnerName,
        pic_name: data.picName,
        pic_phone_number: data.picPhoneNumber,
        social_media_link: socialMediaLinkString
      });

      // Refresh partner ticket types list
      await mutatePartnerTicketTypes();
      setEditModalOpen(false);
      setSelectedPartner(null);
    } catch (error) {
      console.error('Failed to update partner:', error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Head>
          <title>Loading Partner Ticket - Black Hole Dashboard</title>
        </Head>
        <Box>Loading...</Box>
      </DashboardLayout>
    );
  }

  if (eventError || !eventDetail) {
    return (
      <DashboardLayout>
        <Head>
          <title>Event Not Found - Black Hole Dashboard</title>
        </Head>
        <Box>Failed to load event: {eventError}</Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>
          Partner Ticket - {eventDetail.name} - Black Hole Dashboard
        </title>
      </Head>

      {/* Event Name with Action Buttons */}
      <Box
        alignItems="flex-start"
        display="flex"
        justifyContent="space-between"
        mb="24px"
        gap={2}
      >
        <Box flex={1} minWidth={0}>
          {/* Back Button */}
          <Box
            alignItems="center"
            display="flex"
            gap={1}
            mb={1}
            sx={{ cursor: 'pointer' }}
            onClick={() => router.push('/events')}
          >
            <Image alt="Back" height={24} src="/icon/back.svg" width={24} />
            <Caption color="text.secondary" component="span">
              Back To Event List
            </Caption>
          </Box>

          <H2 color="text.primary" fontWeight={700}>
            Event Name: {eventDetail.name}
          </H2>
        </Box>
        <Box
          display="flex"
          gap={2}
          flexShrink={0}
          alignItems="flex-start"
          pt={0.5}
        >
          <Button
            id="choose_existing_partner_button"
            variant="secondary"
            onClick={handleChooseExistingPartner}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Choose Existing Partner
          </Button>
          <Button
            id="add_new_partner_button"
            variant="primary"
            onClick={handleAddPartner}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Add New Partner
          </Button>
        </Box>
      </Box>

      {/* Partner Event Section */}
      <Card sx={{ backgroundColor: 'common.white', borderRadius: 0 }}>
        <CardContent sx={{ padding: '24px' }}>
          <Box mb="24px">
            <H4 color="text.primary" fontWeight={700}>
              Partner Event
            </H4>
          </Box>

          {/* Partner Table */}
          <PartnerEventTable
            partners={partners}
            loading={partnerTicketTypesLoading}
            total={pagination?.totalRecords || 0}
            currentPage={filters.page}
            pageSize={filters.show}
            metaUrl={metaUrl as string}
            onPageChange={handlePageChange}
            onCreatePrivateLink={handleCreatePrivateLink}
            onTransactionList={handleTransactionList}
            onEdit={handleEditPartner}
          />
        </CardContent>
      </Card>

      {/* Create Partner Modal */}
      <CreatePartnerModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreatePartner}
        loading={false}
      />

      {/* Choose Existing Partner Modal */}
      {eventOrganizerId && eventId && (
        <ChoosePartnerModal
          open={choosePartnerModalOpen}
          onClose={() => setChoosePartnerModalOpen(false)}
          eventOrganizerId={eventOrganizerId}
          eventId={eventId}
          metaUrl={metaUrl as string}
        />
      )}

      {/* Edit Partner Modal */}
      <EditPartnerModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedPartner(null);
        }}
        onSubmit={handleUpdatePartner}
        partner={selectedPartner}
        loading={updateLoading}
      />
    </DashboardLayout>
  );
}

export default withAuth(PartnerTicket, { requireAuth: true });
