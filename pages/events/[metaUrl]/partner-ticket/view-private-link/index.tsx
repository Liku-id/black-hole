import {
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  InputAdornment
} from '@mui/material';
import { format } from 'date-fns';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { withAuth } from '@/components/Auth/withAuth';
import { Caption, H2, H3, TextField, Body2 } from '@/components/common';
import { useEventDetail, usePartnerTicketTypes } from '@/hooks';
import DashboardLayout from '@/layouts/dashboard';

interface ViewPrivateLinkFormData {
  ticketCategories: Array<{
    ticketCategoryId: string;
    maxTicketPerUser: string;
    ticketQuantity: string;
    ticketPrice: string;
  }>;
  privateLink: string;
  linkExpiredDate: string;
}

function ViewPrivateLink() {
  const router = useRouter();
  const { metaUrl, partnerId } = router.query;

  const {
    eventDetail,
    loading: eventLoading,
    error: eventError
  } = useEventDetail(metaUrl as string);

  const eventId = eventDetail?.id;

  // Fetch partner ticket types
  const {
    partnerTicketTypes: partnerTicketTypesData,
    loading: partnerTicketTypesLoading
  } = usePartnerTicketTypes(
    eventId
      ? {
          event_id: eventId
          // TODO: Add pagination and limit
          // page: 0,
          // limit: 100
        }
      : null
  );

  // Find partner ticket type for this partner
  const partnerTicketType = useMemo(() => {
    if (!partnerId || !partnerTicketTypesData) return null;
    return partnerTicketTypesData.find(
      (ptt) => ptt.partner_id === (partnerId as string)
    );
  }, [partnerId, partnerTicketTypesData]);

  const selectedPartner = partnerTicketType?.partner;

  // Build private link
  const privateLink = useMemo(() => {
    if (!partnerTicketType?.code || !metaUrl) return '';
    return `https://wukong.co.id/event/${metaUrl}?partner_code=${partnerTicketType.code}`;
  }, [partnerTicketType?.code, metaUrl]);

  // Prepare form data from partner ticket type
  const formData = useMemo(() => {
    if (!partnerTicketType || !eventDetail) {
      return {
        ticketCategories: [],
        privateLink: '',
        linkExpiredDate: ''
      };
    }

    const ticketCategories = partnerTicketType.ticket_type_ids.map(
      (ticketTypeId) => {
        const ticketType = eventDetail.ticketTypes?.find(
          (t) => t.id === ticketTypeId
        );
        const discountInfo = partnerTicketType.discount[ticketTypeId];

        // Calculate ticket price from original price and discount
        const originalPrice = ticketType?.price || 0;
        const discountAmount = discountInfo?.discount || 0;
        const ticketPrice = Math.max(0, originalPrice - discountAmount);

        return {
          ticketCategoryId: ticketTypeId,
          maxTicketPerUser: (discountInfo?.max_order_quantity || 0).toString(),
          ticketQuantity: (discountInfo?.quota || 0).toString(),
          ticketPrice: ticketPrice.toString()
        };
      }
    );

    return {
      ticketCategories,
      privateLink,
      linkExpiredDate: partnerTicketType.expired_at
        ? new Date(partnerTicketType.expired_at).toISOString().split('T')[0]
        : ''
    };
  }, [partnerTicketType, eventDetail, privateLink]);

  const methods = useForm<ViewPrivateLinkFormData>({
    defaultValues: formData,
    mode: 'onChange'
  });

  const { reset } = methods;

  // Reset form when data is loaded
  useEffect(() => {
    if (formData.ticketCategories.length > 0) {
      reset(formData);
    }
  }, [formData, reset]);

  const handleCopyLink = () => {
    if (privateLink) {
      navigator.clipboard.writeText(privateLink);
      // TODO: Show toast notification
    }
  };

  const handleBack = () => {
    router.push(`/events/${metaUrl}/partner-ticket`);
  };

  const loading = eventLoading || partnerTicketTypesLoading;

  if (loading) {
    return (
      <DashboardLayout>
        <Head>
          <title>Loading View Private Link - Black Hole Dashboard</title>
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

  if (!selectedPartner || !partnerTicketType) {
    return (
      <DashboardLayout>
        <Head>
          <title>Private Link Not Found - Black Hole Dashboard</title>
        </Head>
        <Box>Private link not found for this partner</Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>
          View Private Link - {selectedPartner.partner_name} - Black Hole
          Dashboard
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
          Partner Name: {selectedPartner.partner_name}
        </H3>
      </Box>

      <FormProvider {...methods}>
        <Box>
          {/* Combined Card: Ticket Category and Private Link */}
          <Card
            sx={{ backgroundColor: 'common.white', borderRadius: 0, mb: 3 }}
          >
            <CardContent sx={{ padding: '24px' }}>
              {/* Ticket Category Section */}
              {formData.ticketCategories.map((category, index) => {
                const ticketType = eventDetail.ticketTypes?.find(
                  (t) => t.id === category.ticketCategoryId
                );
                const ticketTypeName = ticketType?.name || 'Unknown';

                return (
                  <Box
                    key={category.ticketCategoryId}
                    mb={index < formData.ticketCategories.length - 1 ? 4 : 3}
                  >
                    <H2 color="text.primary" fontWeight={700} mb={2}>
                      Ticket Category {index + 1}
                    </H2>

                    <Grid container spacing={2}>
                      {/* Ticket Category (Read-only) */}
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="Ticket Category"
                          name={`ticketCategories.${index}.ticketCategoryId`}
                          value={ticketTypeName}
                          disabled
                        />
                      </Grid>

                      {/* Max. Ticket Per User (Read-only) */}
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="Max. Ticket Per User"
                          name={`ticketCategories.${index}.maxTicketPerUser`}
                          value={category.maxTicketPerUser}
                          disabled
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <Body2 color="text.secondary">/User</Body2>
                              </InputAdornment>
                            )
                          }}
                        />
                      </Grid>

                      {/* Ticket Quantity (Read-only) */}
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="Ticket Quantity"
                          name={`ticketCategories.${index}.ticketQuantity`}
                          value={category.ticketQuantity}
                          disabled
                        />
                      </Grid>

                      {/* Ticket Price (Read-only) */}
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="Ticket Price"
                          name={`ticketCategories.${index}.ticketPrice`}
                          value={category.ticketPrice}
                          disabled
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Body2 color="text.secondary">Rp</Body2>
                              </InputAdornment>
                            )
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                );
              })}

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
                            {privateLink}
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

                  {/* Link Expired Date (Read-only) */}
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Body2
                        color="text.secondary"
                        component="label"
                        display="block"
                        mb={1}
                      >
                        Link Expired Date
                      </Body2>
                      <Box
                        alignItems="center"
                        border="1px solid"
                        borderColor="divider"
                        borderRadius={1}
                        display="flex"
                        gap={1}
                        justifyContent="space-between"
                        px={2}
                        py={1.5}
                        sx={{
                          backgroundColor: 'background.paper'
                        }}
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
                              partnerTicketType.expired_at
                                ? 'text.primary'
                                : 'text.secondary'
                            }
                            fontSize="14px"
                          >
                            {(() => {
                              if (!partnerTicketType.expired_at) return '-';

                              try {
                                const date = new Date(
                                  partnerTicketType.expired_at
                                );
                                if (isNaN(date.getTime())) return '-';

                                // Extract timezone from ISO string
                                const timezoneMatch =
                                  partnerTicketType.expired_at.match(
                                    /([+-]\d{2}):(\d{2})$/
                                  );
                                const timezone = timezoneMatch
                                  ? timezoneMatch[0]
                                  : '+07:00';

                                // Get timezone label
                                const timezoneLabels: {
                                  [key: string]: string;
                                } = {
                                  '+07:00': 'WIB',
                                  '+08:00': 'WITA',
                                  '+09:00': 'WIT'
                                };
                                const timezoneLabel =
                                  timezoneLabels[timezone] || 'WIB';

                                // Format date: "15 January 2026"
                                const dateFormatted = format(
                                  date,
                                  'd MMMM yyyy'
                                );

                                // Format time: "12.00" (with dot instead of colon)
                                const hours = String(date.getHours()).padStart(
                                  2,
                                  '0'
                                );
                                const minutes = String(
                                  date.getMinutes()
                                ).padStart(2, '0');
                                const timeFormatted = `${hours}.${minutes}`;

                                return `${dateFormatted}, ${timeFormatted} ${timezoneLabel}`;
                              } catch {
                                return '-';
                              }
                            })()}
                          </Body2>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </FormProvider>
    </DashboardLayout>
  );
}

export default withAuth(ViewPrivateLink, { requireAuth: true });
