import {
  Box,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Alert
} from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';

import { Body1, Caption, H4 } from '@/components/common';
import { useAuth } from '@/contexts/AuthContext';
import { useFilteredEvents } from '@/hooks';
import { isEventOrganizer, User } from '@/types/auth';
import { dateUtils, formatUtils } from '@/utils';

import OrganizerRegStatus from '../organizer-status';


interface EventLatestViewProps {
  eventOrganizerId?: string;
}

const EventLatestView = ({ eventOrganizerId }: EventLatestViewProps) => {
  const router = useRouter();
  const { user } = useAuth();

  // Get user role
  const userRole =
    user && !isEventOrganizer(user) ? (user as User).role?.name : undefined;
  const sessionRole =
    user && isEventOrganizer(user) ? 'event_organizer_pic' : userRole;
  const isAdmin = sessionRole === 'admin';

  // Create filter with useMemo to make it reactive to eventOrganizerId changes
  const ongoingFilter = useMemo(
    () => ({
      status: 'EVENT_STATUS_ON_GOING',
      name: '',
      ...(eventOrganizerId && { event_organizer_id: eventOrganizerId })
    }),
    [eventOrganizerId]
  );

  const pastFilter = useMemo(
    () => ({
      status: 'EVENT_STATUS_DONE',
      name: '',
      ...(eventOrganizerId && { event_organizer_id: eventOrganizerId })
    }),
    [eventOrganizerId]
  );

  // Fetch
  const {
    events: ongoingEvents,
    loading: ongoingLoading,
    error: ongoingError,
    mutate: refetchOngoing
  } = useFilteredEvents(ongoingFilter);

  const {
    events: pastEvents,
    loading: pastLoading,
    error: pastError,
    mutate: refetchPast
  } = useFilteredEvents(pastFilter);

  // Head Section
  const HeadSection = ({ title, path }: { title: string; path: string }) => {
    const handleClick = () => {
      router.push(path);
    };

    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        marginBottom="18px"
      >
        <H4>{title}</H4>
        <Box
          onClick={handleClick}
          sx={{
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.7,
              '& .arrow-icon': {
                transform: 'translate(4px, -4px)'
              }
            }
          }}
        >
          <Box
            className="arrow-icon"
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{
              transition: 'transform 0.3s ease'
            }}
          >
            <Image
              alt="arrow"
              src="/icon/slanted-arrow.svg"
              height={20}
              width={20}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </Box>
        </Box>
      </Box>
    );
  };

  //  Detail Item
  const DetailItem = ({
    value,
    icon,
    primary,
    fullValue
  }: {
    value: string | number;
    icon: string;
    primary?: boolean;
    fullValue?: string;
  }) => {
    return (
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        marginTop="6px"
        minWidth={0}
        flex={1}
        overflow="hidden"
      >
        <Image
          alt={`${value}`}
          src={icon}
          height={20}
          width={20}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
          style={{
            flexShrink: 0,
            width: '20px',
            height: '20px'
          }}
        />
        <Caption
          component="div"
          color={primary ? 'primary.main' : 'text.secondary'}
          fontWeight={primary ? 700 : 400}
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: '1 1 auto',
            minWidth: 0,
            width: '100%'
          }}
          title={
            fullValue || (typeof value === 'string' ? value : value.toString())
          }
        >
          {value}
        </Caption>
      </Box>
    );
  };

  // Loading State Placeholder
  const LoadingStatePlaceholder = () => {
    return (
      <Box display="flex" flexDirection="column" gap={2}>
        {[1, 2].map((index) => (
          <Box key={index} display="flex" gap="18px" padding="8px">
            <Skeleton
              variant="rectangular"
              width={207}
              height={118}
              sx={{ borderRadius: '4px' }}
            />
            <Box flex={1} display="flex" flexDirection="column" gap={1.5}>
              <Skeleton variant="text" width="70%" height={24} />
              <Skeleton variant="text" width="50%" height={16} />
              <Skeleton variant="text" width="60%" height={16} />
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Skeleton variant="text" width="40%" height={16} />
                <Skeleton variant="text" width="30%" height={16} />
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    );
  };

  // Error State Placeholder
  const ErrorStatePlaceholder = ({ onRetry }: { onRetry: () => void }) => {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        padding="20px"
        gap={2}
      >
        <Alert
          severity="error"
          sx={{ width: '100%' }}
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={onRetry}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <Image
                alt="retry"
                src="/icon/refresh.svg"
                height={16}
                width={16}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </IconButton>
          }
        >
          Failed to load data. Please try again.
        </Alert>
      </Box>
    );
  };

  // Empty State Placeholder
  const EmptyStatePlaceholder = ({ message }: { message: string }) => {
    return (
      <Box
        position="absolute"
        top="50%"
        left="50%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        width="100%"
        height="100%"
        padding="20px"
        boxSizing="border-box"
        sx={{
          transform: 'translate(-50%, -50%)'
        }}
      >
        <Image
          alt="empty events"
          src="/icon/event.svg"
          height={48}
          width={48}
          style={{ opacity: 0.3, marginBottom: '16px' }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <Caption color="text.secondary">{message}</Caption>
      </Box>
    );
  };

  //  Event Card
  const EventCard = ({
    showBreak,
    event
  }: {
    showBreak?: boolean;
    event: {
      id: string;
      name: string;
      metaUrl: string;
      address: string;
      date: string;
      time: string;
      totalRevenue: number;
      thumbnail: string;
    };
  }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
      setAnchorEl(null);
    };

    const handleMenuItemClick = (path: string) => {
      router.push(path);
      handleMenuClose();
    };

    return (
      <>
        <Box
          display="flex"
          gap="18px"
          minWidth={0}
          overflow="hidden"
          sx={{
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            padding: '8px',
            margin: '-8px',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.02)'
            },
            '&:last-child': {
              marginBottom: 0
            }
          }}
        >
          <Image
            alt={event.name}
            src={event.thumbnail || '/placeholder-event.jpg'}
            width={207}
            height={118}
            style={{
              borderRadius: '4px',
              objectFit: 'cover',
              flexShrink: 0
            }}
            onError={(e) => {
              e.currentTarget.src = '/placeholder-event.jpg';
            }}
          />

          <Box
            flex={1}
            display="flex"
            flexDirection="column"
            minWidth={0}
            overflow="hidden"
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              marginBottom="12px"
              minWidth={0}
              gap={1}
              width="100%"
            >
              <Body1
                component="div"
                fontWeight={600}
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: '1 1 auto',
                  minWidth: 0,
                  maxWidth: 'calc(100% - 44px)'
                }}
                title={event.name}
              >
                {event.name}
              </Body1>
              <IconButton
                id="event_options_menu_button"
                size="small"
                onClick={handleMenuClick}
                aria-controls={open ? 'event-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                sx={{ flexShrink: 0 }}
              >
                <Image
                  alt="options"
                  src="/icon/options.svg"
                  height={20}
                  width={20}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </IconButton>
              <Menu
                id="event-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                MenuListProps={{
                  'aria-labelledby': 'event-menu-button'
                }}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right'
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right'
                }}
              >
                <MenuItem
                  id="event_detail_menu_item"
                  onClick={() =>
                    handleMenuItemClick(`/events/${event.metaUrl}`)
                  }
                >
                  <ListItemIcon>
                    <Image
                      alt="event detail"
                      src="/icon/eye.svg"
                      height={18}
                      width={18}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontSize: '12px',
                        color: 'text.secondary'
                      }
                    }}
                  >
                    Event Detail
                  </ListItemText>
                </MenuItem>
                <MenuItem
                  id="attendee_tickets_menu_item"
                  onClick={() =>
                    handleMenuItemClick(`/tickets?event=${event.id}`)
                  }
                >
                  <ListItemIcon>
                    <Image
                      alt="attendee tickets"
                      src="/icon/voucher.svg"
                      height={16}
                      width={16}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontSize: '12px',
                        color: 'text.secondary'
                      }
                    }}
                  >
                    Attendee Tickets
                  </ListItemText>
                </MenuItem>
                <MenuItem
                  id="event_transactions_menu_item"
                  onClick={() =>
                    handleMenuItemClick(
                      `/finance/event-transactions/${event.id}`
                    )
                  }
                >
                  <ListItemIcon>
                    <Image
                      alt="event transactions"
                      src="/icon/money.svg"
                      height={16}
                      width={16}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontSize: '12px',
                        color: 'text.secondary'
                      }
                    }}
                  >
                    Event Transactions
                  </ListItemText>
                </MenuItem>
              </Menu>
            </Box>

            <Box
              minWidth={0}
              flex={1}
              overflow="hidden"
              display="flex"
              flexDirection="column"
            >
              <DetailItem icon="/icon/location.svg" value={event.address} />
              <DetailItem
                icon="/icon/calendar-v2.svg"
                value={dateUtils.formatDateMMMDYYYY(event.date)}
              />

              <Box
                display="flex"
                alignItems="flex-start"
                justifyContent="space-between"
                minWidth={0}
                gap={1}
                width="100%"
              >
                <Box
                  flex="1 1 50%"
                  minWidth={0}
                  overflow="hidden"
                  maxWidth="50%"
                >
                  <DetailItem
                    icon="/icon/clock.svg"
                    value={`${dateUtils.formatTime(event.date)} WIB`}
                  />
                </Box>
                <Box
                  flex="1 1 50%"
                  minWidth={0}
                  overflow="hidden"
                  maxWidth="50%"
                >
                  <DetailItem
                    icon="/icon/pie.svg"
                    value={formatUtils.formatEventRevenue(event.totalRevenue)}
                    fullValue={formatUtils.getFullRevenueAmount(
                      event.totalRevenue
                    )}
                    primary
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Break */}
        {showBreak && (
          <Box height="1px" width="100%" bgcolor="grey.100" marginY={1.5} />
        )}
      </>
    );
  };

  // Show OrganizerRegStatus only if user is not admin and there are no events
  if (
    !isAdmin &&
    !ongoingLoading &&
    !pastLoading &&
    !ongoingError &&
    !pastError &&
    !ongoingEvents.length &&
    !pastEvents.length
  ) {
    return <OrganizerRegStatus />;
  }

  return (
    <Grid container spacing={3} marginBottom="30px">
      {/* Ongoing Events Section */}
      <Grid item xs={12} md={6}>
        <Box
          bgcolor="common.white"
          boxShadow="0 4px 20px 0 rgba(40, 72, 107, 0.05)"
          padding="20px 16px"
          height="100%"
          position="relative"
          minHeight="209px"
        >
          <HeadSection
            title="Event On Going"
            path="/events?status=EVENT_STATUS_ON_GOING"
          />

          {ongoingLoading ? (
            <LoadingStatePlaceholder />
          ) : ongoingError ? (
            <ErrorStatePlaceholder onRetry={refetchOngoing} />
          ) : ongoingEvents.length > 0 ? (
            ongoingEvents.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                showBreak={ongoingEvents.length > 1 && index === 0}
              />
            ))
          ) : (
            <EmptyStatePlaceholder message="no ongoing events" />
          )}
        </Box>
      </Grid>

      {/* Past Events Section */}
      <Grid item xs={12} md={6}>
        <Box
          bgcolor="common.white"
          boxShadow="0 4px 20px 0 rgba(40, 72, 107, 0.05)"
          padding="20px 16px"
          height="100%"
          position="relative"
          minHeight="209px"
        >
          <HeadSection
            title="Event Past"
            path="/events?status=EVENT_STATUS_DONE"
          />

          {pastLoading ? (
            <LoadingStatePlaceholder />
          ) : pastError ? (
            <ErrorStatePlaceholder onRetry={refetchPast} />
          ) : pastEvents.length > 0 ? (
            pastEvents.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                showBreak={ongoingEvents.length > 1 && index === 0}
              />
            ))
          ) : (
            <EmptyStatePlaceholder message="no past events" />
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

export default EventLatestView;
