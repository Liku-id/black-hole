import {
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  InputAdornment
} from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FormProvider, useForm, useFieldArray } from 'react-hook-form';
import { useAtom, useSetAtom } from 'jotai';

import { withAuth } from '@/components/Auth/withAuth';
import {
  Button,
  Caption,
  H2,
  H3,
  TextField,
  Select,
  Body2
} from '@/components/common';
import { ExpiredDateModal } from '@/components/features/events/partner-ticket/expired-date-modal';
import {
  useEventDetail,
  usePartners,
  useCreatePartnerTicketType
} from '@/hooks';
import DashboardLayout from '@/layouts/dashboard';
import { pendingPartnerAtom } from '@/atoms/pendingPartnerAtom';
import { partnersService } from '@/services/partners';
import { formatUtils } from '@/utils';

interface TicketCategoryFormData {
  ticketCategoryId: string;
  maxTicketPerUser: string;
  ticketQuantity: string;
  ticketPrice: string;
}

interface CreatePrivateLinkFormData {
  ticketCategories: TicketCategoryFormData[];
  privateLink: string;
  linkExpiredDate: string;
  linkExpiredDateFormatted?: string;
}

function CreatePrivateLink() {
  const router = useRouter();
  const { metaUrl, partnerId } = router.query;
  const [pendingPartner] = useAtom(pendingPartnerAtom);
  const setPendingPartner = useSetAtom(pendingPartnerAtom);
  const [loadingStep, setLoadingStep] = useState<
    'idle' | 'creating-partner' | 'creating-link'
  >('idle');
  const [createdPartnerId, setCreatedPartnerId] = useState<string | null>(null);
  const [expiredDateModalOpen, setExpiredDateModalOpen] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const {
    eventDetail,
    loading: eventLoading,
    error: eventError
  } = useEventDetail(metaUrl as string);

  const eventOrganizerId = eventDetail?.eventOrganizer?.id;

  const { partners: partnersData, loading: partnersLoading } = usePartners(
    eventOrganizerId
      ? {
          event_organizer_id: eventOrganizerId,
          page: 0,
          limit: 100
        }
      : null
  );

  const [createPartnerLoading, setCreatePartnerLoading] = useState(false);
  const { createPartnerTicketType, loading: createLinkLoading } =
    useCreatePartnerTicketType();

  // Find selected partner (either from query or from created partner)
  const selectedPartner = createdPartnerId
    ? partnersData.find((p) => p.id === createdPartnerId)
    : partnersData.find((p) => p.id === (partnerId as string));

  const methods = useForm<CreatePrivateLinkFormData>({
    defaultValues: {
      ticketCategories: [
        {
          ticketCategoryId: '',
          maxTicketPerUser: '',
          ticketQuantity: '',
          ticketPrice: ''
        }
      ],
      privateLink: '',
      linkExpiredDate: '',
      linkExpiredDateFormatted: ''
    }
  });

  const { control, watch, setValue } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ticketCategories'
  });

  // Generate private link when partner is selected
  useEffect(() => {
    if (selectedPartner && eventDetail) {
      const privateLink = `https://wukong.co.id/event/${eventDetail.metaUrl}?partner_code=[partner code]`;
      setValue('privateLink', privateLink);
    } else if (pendingPartner && eventDetail) {
      // If we have pending partner, show placeholder link
      const privateLink = `https://wukong.co.id/event/${eventDetail.metaUrl}?partner_code=[partner code]`;
      setValue('privateLink', privateLink);
    }
  }, [selectedPartner, pendingPartner, eventDetail, setValue]);

  // Prepare ticket category options
  const allTicketCategoryOptions =
    eventDetail?.ticketTypes?.map((ticket) => ({
      value: ticket.id,
      label: ticket.name
    })) || [];

  // Watch all selected ticket category IDs
  const allTicketCategories = watch('ticketCategories');

  // Function to get filtered options for a specific index
  const getTicketCategoryOptions = (currentIndex: number) => {
    // Get all selected category IDs except the current one
    const selectedCategoryIds = allTicketCategories
      .map((category, index) =>
        index !== currentIndex ? category.ticketCategoryId : null
      )
      .filter((id): id is string => Boolean(id));

    // Filter out already selected categories
    return allTicketCategoryOptions.filter(
      (option) => !selectedCategoryIds.includes(option.value)
    );
  };

  const handleCopyLink = () => {
    const link = watch('privateLink');
    if (link) {
      navigator.clipboard.writeText(link);
      // TODO: Show toast notification
    }
  };

  const handleAddTicketCategory = () => {
    append({
      ticketCategoryId: '',
      maxTicketPerUser: '',
      ticketQuantity: '',
      ticketPrice: ''
    });
  };

  const handleSubmit = async (data: CreatePrivateLinkFormData) => {
    setSubmitAttempted(true);

    // Validate link expired date
    if (!data.linkExpiredDate) {
      return;
    }

    let partnerIdToUse: string | null = null;

    try {
      // Step 1: Create partner if we have pending partner data
      if (pendingPartner && !selectedPartner) {
        setLoadingStep('creating-partner');

        // Build social media links object
        const socialMediaLinks: any = {};
        if (pendingPartner.tiktokLink)
          socialMediaLinks.tiktok = pendingPartner.tiktokLink;
        if (pendingPartner.instagramLink)
          socialMediaLinks.instagram = pendingPartner.instagramLink;
        if (pendingPartner.twitterLink)
          socialMediaLinks.twitter = pendingPartner.twitterLink;

        // Convert to JSON string for API
        const socialMediaLinkString = JSON.stringify(socialMediaLinks);

        setCreatePartnerLoading(true);

        // Create partner using service directly to get response
        const partnerResponse = await partnersService.createPartner({
          event_organizer_id: pendingPartner.eventOrganizerId,
          partner_name: pendingPartner.partnerName,
          pic_name: pendingPartner.picName,
          pic_phone_number: pendingPartner.picPhoneNumber,
          social_media_link: socialMediaLinkString
        });

        // Get created partner ID from response
        partnerIdToUse = partnerResponse.body?.id || null;
        setCreatedPartnerId(partnerIdToUse);

        // Clear pending partner from atom
        setPendingPartner(null);
        setCreatePartnerLoading(false);
      } else if (selectedPartner) {
        partnerIdToUse = selectedPartner.id;
      } else {
        console.error('Partner not found');
        return;
      }

      if (!partnerIdToUse) {
        console.error('Partner ID is missing');
        return;
      }

      // Step 2: Create private link
      setLoadingStep('creating-link');

      // Build ticket_type_ids array
      const ticketTypeIds = data.ticketCategories
        .map((category) => category.ticketCategoryId)
        .filter((id) => id !== '');

      // Build discount object with ticket category id as key
      const discount: Record<
        string,
        {
          discount: number;
          quota: number;
          max_order_quantity: number;
        }
      > = {};

      data.ticketCategories.forEach((category) => {
        if (category.ticketCategoryId) {
          // Find original price from ticket type
          const ticketType = eventDetail?.ticketTypes?.find(
            (t) => t.id === category.ticketCategoryId
          );
          const originalPrice = ticketType?.price || 0;
          const ticketPrice = parseFloat(category.ticketPrice) || 0;

          // Calculate discount amount
          let discountAmount = 0;

          // If ticket price is between 1-100, treat it as percentage
          if (ticketPrice >= 1 && ticketPrice <= 100) {
            // Calculate discount as percentage of original price
            discountAmount = (ticketPrice / 100) * originalPrice;
          } else {
            // Calculate discount amount: original price - ticket price
            discountAmount = Math.max(0, originalPrice - ticketPrice);
          }

          discount[category.ticketCategoryId] = {
            discount: Math.round(discountAmount),
            quota: parseInt(category.ticketQuantity) || 0,
            max_order_quantity: parseInt(category.maxTicketPerUser) || 0
          };
        }
      });

      // Use ISO date from modal or convert expired date to ISO string
      const expiredAt = data.linkExpiredDate
        ? data.linkExpiredDate.includes('T')
          ? data.linkExpiredDate
          : new Date(data.linkExpiredDate).toISOString()
        : '';

      // Call API to create private link
      await createPartnerTicketType({
        partner_id: partnerIdToUse,
        ticket_type_ids: ticketTypeIds,
        discount,
        expired_at: expiredAt
      });

      // Reset loading step
      setLoadingStep('idle');

      // Redirect back to partner ticket page
      router.push(`/events/${metaUrl}/partner-ticket`);
    } catch (error) {
      console.error('Failed to create partner or private link:', error);
      setLoadingStep('idle');
    }
  };

  const handleBack = () => {
    router.push(`/events/${metaUrl}/partner-ticket`);
  };

  const loading = eventLoading || partnersLoading;

  if (loading) {
    return (
      <DashboardLayout>
        <Head>
          <title>Loading Create Private Link - Black Hole Dashboard</title>
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

  // Show partner name from pending partner if available
  const displayPartnerName = selectedPartner
    ? selectedPartner.partner_name
    : pendingPartner
      ? pendingPartner.partnerName
      : null;

  if (!selectedPartner && !pendingPartner) {
    return (
      <DashboardLayout>
        <Head>
          <title>Partner Not Found - Black Hole Dashboard</title>
        </Head>
        <Box>Partner not found</Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>
          Create Private Link - {displayPartnerName || 'New Partner'} - Black
          Hole Dashboard
        </title>
      </Head>

      {/* Back Link */}
      <Box
        alignItems="center"
        display="flex"
        gap={1}
        mb={2}
        sx={{ cursor: 'pointer' }}
        onClick={handleBack}
      >
        <Image alt="Back" height={24} src="/icon/back.svg" width={24} />
        <Caption color="text.secondary" component="span">
          Back To Partner Ticket
        </Caption>
      </Box>

      {/* Partner Name */}
      <Box alignItems="center" display="flex" gap={2} mb="24px">
        <H3 color="text.primary" fontWeight={700}>
          Partner Name: {displayPartnerName || '-'}
        </H3>
      </Box>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)}>
          {/* Combined Card: Ticket Category and Private Link */}
          <Card
            sx={{ backgroundColor: 'common.white', borderRadius: 0, mb: 3 }}
          >
            <CardContent sx={{ padding: '24px' }}>
              {/* Ticket Category Section */}
              {fields.map((field, index) => (
                <Box key={field.id} mb={index < fields.length - 1 ? 4 : 3}>
                  <Box
                    alignItems="center"
                    display="flex"
                    justifyContent="space-between"
                    mb={2}
                  >
                    <H2 color="text.primary" fontWeight={700}>
                      Ticket Category {index + 1}
                    </H2>
                    {fields.length > 1 && (
                      <IconButton
                        onClick={() => remove(index)}
                        sx={{ padding: 0 }}
                      >
                        <Image
                          alt="Remove"
                          height={24}
                          src="/icon/close.svg"
                          width={24}
                        />
                      </IconButton>
                    )}
                  </Box>

                  <Grid container spacing={2}>
                    {/* Ticket Category Dropdown */}
                    <Grid item xs={12} md={3}>
                      <Select
                        fullWidth
                        id={`ticket_category_${index}_field`}
                        label="Ticket Category*"
                        name={`ticketCategories.${index}.ticketCategoryId`}
                        options={getTicketCategoryOptions(index)}
                        placeholder="Choose Ticket Category"
                        rules={{
                          required: 'Ticket category is required'
                        }}
                      />
                    </Grid>

                    {/* Max. Ticket Per User */}
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        id={`max_ticket_per_user_${index}_field`}
                        label="Max. Ticket Per User*"
                        name={`ticketCategories.${index}.maxTicketPerUser`}
                        placeholder="ex: 6 ticket per user"
                        type="number"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Body2 color="text.secondary">/User</Body2>
                            </InputAdornment>
                          )
                        }}
                        rules={{
                          required: 'Max ticket per user is required',
                          min: {
                            value: 1,
                            message: 'Maximum must be at least 1'
                          }
                        }}
                      />
                    </Grid>

                    {/* Ticket Quantity */}
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        id={`ticket_quantity_${index}_field`}
                        label="Ticket Quantity*"
                        name={`ticketCategories.${index}.ticketQuantity`}
                        placeholder="Add Number"
                        type="number"
                        rules={{
                          required: 'Ticket quantity is required',
                          min: {
                            value: 1,
                            message: 'Quantity must be at least 1'
                          }
                        }}
                      />
                    </Grid>

                    {/* Ticket Price */}
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        id={`ticket_price_${index}_field`}
                        label="Ticket Price*"
                        name={`ticketCategories.${index}.ticketPrice`}
                        placeholder={(() => {
                          const selectedTicketCategoryId = watch(
                            `ticketCategories.${index}.ticketCategoryId`
                          );
                          if (
                            selectedTicketCategoryId &&
                            eventDetail?.ticketTypes
                          ) {
                            const ticketType = eventDetail.ticketTypes.find(
                              (t) => t.id === selectedTicketCategoryId
                            );
                            if (ticketType?.price) {
                              const formattedPrice = formatUtils.formatNumber(
                                ticketType.price
                              );
                              return `Original Price Rp ${formattedPrice}`;
                            }
                          }
                          return 'Original Price Rp xx';
                        })()}
                        type="number"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Body2 color="text.secondary">Rp</Body2>
                            </InputAdornment>
                          )
                        }}
                        rules={{
                          required: 'Ticket price is required',
                          min: {
                            value: 0,
                            message: 'Price must be at least 0'
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}

              {/* Add New Ticket Category Button */}
              <Box display="flex" justifyContent="flex-end" mb={4}>
                <Button
                  id={`add_new_ticket_category_button`}
                  type="button"
                  variant="secondary"
                  onClick={handleAddTicketCategory}
                >
                  Add New Ticket Category
                </Button>
              </Box>

              {/* Private Link Section */}
              <Box>
                <H2 color="text.primary" fontWeight={700} mb={2}>
                  Private Link
                </H2>

                <Grid container spacing={2}>
                  {/* Private Link (Read-only with Copy) */}
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Body2
                        color="text.secondary"
                        component="label"
                        display="block"
                        mb={1}
                      >
                        Private Link
                      </Body2>
                      <Box
                        alignItems="center"
                        border="1px solid"
                        borderColor="divider"
                        display="flex"
                        justifyContent="space-between"
                        px={2}
                        py={0.4}
                        sx={{
                          backgroundColor: 'background.paper',
                          borderRadius: 1
                        }}
                      >
                        <Box display="flex" alignItems="center" flex={1}>
                          <Body2 color="text.primary" fontSize="14px">
                            {(() => {
                              const link = watch('privateLink');
                              const parts = link.split('[partner code]');
                              if (parts.length === 2) {
                                return (
                                  <>
                                    {parts[0]}
                                    <Body2
                                      component="span"
                                      color="primary.main"
                                      fontSize="14px"
                                    >
                                      [partner code]
                                    </Body2>
                                    {parts[1]}
                                  </>
                                );
                              }
                              return link;
                            })()}
                          </Body2>
                        </Box>
                        <IconButton
                          onClick={handleCopyLink}
                          sx={{ cursor: 'pointer', ml: 1 }}
                        >
                          <Image
                            alt="Copy"
                            height={20}
                            src="/icon/copy.svg"
                            width={20}
                          />
                        </IconButton>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Link Expired Date */}
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Body2
                        color="text.secondary"
                        component="label"
                        display="block"
                        mb={1}
                      >
                        Link Expired Date*
                      </Body2>
                      <Box
                        id={`link_expired_date_box`}
                        alignItems="center"
                        border="1px solid"
                        borderColor={
                          submitAttempted && !watch('linkExpiredDate')
                            ? 'error.main'
                            : 'divider'
                        }
                        borderRadius={1}
                        display="flex"
                        gap={1}
                        justifyContent="space-between"
                        px={2}
                        py={1.5}
                        sx={{
                          backgroundColor: 'background.paper',
                          cursor: 'pointer',
                          '&:hover': {
                            borderColor: 'primary.main'
                          }
                        }}
                        onClick={() => setExpiredDateModalOpen(true)}
                      >
                        <Box alignItems="center" display="flex" gap={1}>
                          <Image
                            alt="Calendar"
                            height={20}
                            src="/icon/calendar.svg"
                            width={20}
                          />
                          <Body2
                            color={
                              watch('linkExpiredDateFormatted')
                                ? 'text.primary'
                                : 'text.secondary'
                            }
                            fontSize="14px"
                          >
                            {watch('linkExpiredDateFormatted') ||
                              'Link will expired after this date'}
                          </Body2>
                        </Box>
                      </Box>
                      {submitAttempted && !watch('linkExpiredDate') && (
                        <Body2 color="error.main" fontSize="12px" mt={0.5}>
                          Link expired date is required
                        </Body2>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Create Link Button */}
              <Box display="flex" justifyContent="flex-end" mt={4}>
                <Button
                  id={`create_link_button`}
                  type="submit"
                  variant="primary"
                  disabled={
                    createPartnerLoading ||
                    createLinkLoading ||
                    loadingStep !== 'idle'
                  }
                >
                  {loadingStep === 'creating-partner'
                    ? 'Creating partner...'
                    : loadingStep === 'creating-link'
                      ? 'Creating private link...'
                      : createPartnerLoading
                        ? 'Creating partner...'
                        : createLinkLoading
                          ? 'Creating private link...'
                          : 'Create link'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </form>
      </FormProvider>

      {/* Expired Date Modal */}
      <ExpiredDateModal
        open={expiredDateModalOpen}
        onClose={() => setExpiredDateModalOpen(false)}
        onSave={(data) => {
          setValue('linkExpiredDate', data.isoDate);
          setValue('linkExpiredDateFormatted', data.formattedDate);
          setExpiredDateModalOpen(false);
        }}
        initialValue={watch('linkExpiredDate')}
      />
    </DashboardLayout>
  );
}

export default withAuth(CreatePrivateLink, { requireAuth: true });
