import { CheckCircleOutline, ErrorOutline } from '@mui/icons-material';
import { Box, Grid, Checkbox, Chip } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { Button, H3, Body2 } from '@/components/common';
import { EventDetail, EventAssetChange } from '@/types/event';

import { RejectedReason } from '../info';

interface EventDetailAssetsProps {
  eventDetail: EventDetail;
  eventAssetChanges?: EventAssetChange[];
  rejectMode?: boolean;
  selectedAssets?: string[];
  onToggleAsset?: (assetId: string, checked: boolean) => void;
  hideHeader?: boolean;
  showStatus?: boolean;
  hideOriginalAssets?: boolean; // If true, only show updated assets (for approval page)
}

export const EventDetailAssets = ({
  eventDetail,
  eventAssetChanges,
  rejectMode = false,
  selectedAssets = [],
  onToggleAsset,
  hideHeader = false,
  showStatus = false,
  hideOriginalAssets = false
}: EventDetailAssetsProps) => {
  const router = useRouter();

  // For on_going events with eventAssetChanges, we'll render two separate sections
  // For other cases, use the appropriate asset source
  const isOnGoingWithChanges =
    eventDetail.eventStatus === 'on_going' &&
    eventAssetChanges &&
    eventAssetChanges.length > 0;
  const firstChange =
    eventAssetChanges && eventAssetChanges.length > 0
      ? eventAssetChanges[0]
      : null;
  const assetChangeStatus = firstChange?.status; // pending, rejected, approved

  // Map eventAssets with status based on rejectedFields
  const rejectedAssetIds = new Set(
    eventAssetChanges && eventAssetChanges.length > 0
      ? eventAssetChanges[0]?.rejectedFields || []
      : []
  );

  // Prepare changedItemsSource for approval mode (hideOriginalAssets) or on_going with changes
  let changedItemsSource: any[] = [];

  if (eventAssetChanges && eventAssetChanges.length > 0 && firstChange) {
    if (assetChangeStatus === 'pending') {
      // For pending status, all items are pending
      changedItemsSource = (firstChange.items || []).map((item: any) => ({
        ...item,
        status: 'pending'
      }));
    } else {
      // For rejected/approved status, map based on rejectedFields
      changedItemsSource = (firstChange.items || []).map((item: any) => {
        // If assetId is in rejectedFields, mark as rejected, otherwise approved
        const status = rejectedAssetIds.has(item.assetId || item.id)
          ? 'rejected'
          : 'approved';
        return {
          ...item,
          status,
          rejectedReason: firstChange.rejectedReason,
          rejectedFields: firstChange.rejectedFields
        };
      });
    }
  }

  // Sort original assets by order and add status based on rejectedFields
  const eventAssets = (eventDetail.eventAssets || [])
    .slice(0, 5)
    .map((asset: any) => {
      // If status is pending, all assets should be pending
      if (assetChangeStatus === 'pending') {
        return {
          ...asset,
          status: 'pending'
        };
      }
      // If assetId is in rejectedFields, mark as rejected, otherwise approved
      const status = rejectedAssetIds.has(asset.assetId || asset.id)
        ? 'rejected'
        : 'approved';
      return {
        ...asset,
        status
      };
    })
    .sort((a: any, b: any) => Number(a.order) - Number(b.order));
  const mainAsset = eventAssets[0];
  const sideAssets = eventAssets.slice(1, 5);

  // For on_going events with changes, prepare changed assets separately
  // Also prepare changed assets when hideOriginalAssets is true (for approval page)
  const sortedChangedItemsSource =
    changedItemsSource && changedItemsSource.length > 0
      ? [...changedItemsSource].sort(
          (a: any, b: any) => Number(a.order) - Number(b.order)
        )
      : [];

  const changedAssets =
    isOnGoingWithChanges ||
    (hideOriginalAssets && eventAssetChanges && eventAssetChanges.length > 0)
      ? sortedChangedItemsSource.slice(0, 5)
      : [];
  const changedMainAsset = changedAssets[0];
  const changedSideAssets = changedAssets.slice(1, 5);

  const handleEditAssets = () => {
    router.push(`/events/edit/${eventDetail.metaUrl}/assets`);
  };

  // Selection is based on the underlying assetId so each visual asset
  // (thumbnail / supporting image) can be toggled independently
  const isAssetSelected = (assetId: string | undefined) => {
    if (!assetId) return false;
    return selectedAssets.includes(assetId);
  };

  // Check if assets are from eventAssets (not eventAssetChanges) and event is ongoing
  const isOnGoingWithEventAssets =
    eventDetail.eventStatus === 'on_going' &&
    (!eventAssetChanges || eventAssetChanges.length === 0);

  const getAssetStatusChip = (asset: any) => {
    if (!showStatus) return null;

    if (asset.status === 'rejected') {
      return (
        <Chip
          icon={<ErrorOutline />}
          label="Rejected"
          size="small"
          color="error"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 10,
            fontWeight: 600
          }}
        />
      );
    }
    // Hide approved badge if assets come from eventAssets and event is ongoing
    if (asset.status === 'approved' && !isOnGoingWithEventAssets) {
      return (
        <Chip
          icon={<CheckCircleOutline />}
          label="Approved"
          size="small"
          color="success"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 10,
            fontWeight: 600
          }}
        />
      );
    }
    return null;
  };

  // Get status chip for section header (Updated Assets)
  const getSectionStatusChip = (status?: string) => {
    if (!showStatus || !status) return null;

    switch (status) {
      case 'pending':
        return (
          <Chip
            icon={<ErrorOutline />}
            label="Pending"
            size="small"
            sx={{
              color: 'grey.600',
              '& .MuiChip-icon': {
                color: 'grey.500'
              }
            }}
          />
        );
      case 'rejected':
        return (
          <Chip
            icon={<ErrorOutline />}
            label="Rejected"
            size="small"
            color="error"
          />
        );
      case 'approved':
        return (
          <Chip
            icon={<CheckCircleOutline />}
            label="Approved"
            size="small"
            color="success"
          />
        );
      default:
        return null;
    }
  };

  // Helper function to render asset grid
  const renderAssetGrid = (
    assets: any[],
    mainAsset: any,
    sideAssets: any[],
    showStatusBadges: boolean = true
  ) => {
    if (assets.length === 0) return null;

    return (
      <Grid container spacing={4}>
        {/* Left Grid - Main Asset */}
        {mainAsset && (
          <Grid item md={6} xs={12}>
            <Box position="relative">
              {rejectMode && (
                <Box
                  position="absolute"
                  top={8}
                  left={8}
                  zIndex={10}
                  bgcolor="rgba(255, 255, 255, 0.9)"
                  borderRadius={1}
                  p={0.5}
                >
                  <Checkbox
                    checked={isAssetSelected(mainAsset.assetId)}
                    onChange={(e) =>
                      onToggleAsset?.(mainAsset.assetId, e.target.checked)
                    }
                    disabled={
                      mainAsset.status === 'approved' ||
                      mainAsset.status === 'rejected'
                    }
                    sx={{
                      '& .MuiSvgIcon-root': { fontSize: 28 }
                    }}
                  />
                </Box>
              )}
              {!rejectMode && showStatusBadges && getAssetStatusChip(mainAsset)}
              <Box
                bgcolor="grey.100"
                overflow="hidden"
                position="relative"
                sx={{
                  aspectRatio: '16 / 9',
                  border:
                    rejectMode && isAssetSelected(mainAsset.assetId)
                      ? '3px solid'
                      : showStatusBadges &&
                          showStatus &&
                          mainAsset.status === 'rejected'
                        ? '2px solid'
                        : showStatusBadges &&
                            showStatus &&
                            mainAsset.status === 'approved' &&
                            !isOnGoingWithEventAssets
                          ? '2px solid'
                          : 'none',
                  borderColor:
                    rejectMode && isAssetSelected(mainAsset.assetId)
                      ? 'error.main'
                      : showStatusBadges &&
                          showStatus &&
                          mainAsset.status === 'rejected'
                        ? 'error.main'
                        : showStatusBadges &&
                            showStatus &&
                            mainAsset.status === 'approved' &&
                            !isOnGoingWithEventAssets
                          ? 'success.main'
                          : 'transparent'
                }}
                width="100%"
              >
                <Image
                  fill
                  unoptimized
                  alt={mainAsset.asset?.key || 'Event asset'}
                  src={mainAsset.asset?.url}
                  style={{ objectFit: 'cover' }}
                />
              </Box>
              <Body2 color="text.secondary" mt={1}>
                Thumbnail (Main Asset)
              </Body2>
            </Box>
          </Grid>
        )}

        {/* Right Grid - Side Assets */}
        {sideAssets.length > 0 && (
          <Grid item md={6} xs={12}>
            <Grid container spacing={2}>
              {sideAssets.map((eventAsset, index) => (
                <Grid
                  key={eventAsset.id || eventAsset.assetId || index}
                  item
                  xs={6}
                >
                  <Box position="relative">
                    {rejectMode && (
                      <Box
                        position="absolute"
                        top={8}
                        left={8}
                        zIndex={10}
                        bgcolor="rgba(255, 255, 255, 0.9)"
                        borderRadius={1}
                        p={0.5}
                      >
                        <Checkbox
                          checked={isAssetSelected(eventAsset.assetId)}
                          onChange={(e) =>
                            onToggleAsset?.(
                              eventAsset.assetId,
                              e.target.checked
                            )
                          }
                          disabled={
                            eventAsset.status === 'approved' ||
                            eventAsset.status === 'rejected'
                          }
                          sx={{
                            '& .MuiSvgIcon-root': { fontSize: 28 }
                          }}
                        />
                      </Box>
                    )}
                    {!rejectMode &&
                      showStatusBadges &&
                      getAssetStatusChip(eventAsset)}
                    <Box
                      bgcolor="grey.100"
                      overflow="hidden"
                      position="relative"
                      sx={{
                        aspectRatio: '16 / 9',
                        border:
                          rejectMode && isAssetSelected(eventAsset.assetId)
                            ? '3px solid'
                            : showStatusBadges &&
                                showStatus &&
                                eventAsset.status === 'rejected'
                              ? '2px solid'
                              : showStatusBadges &&
                                  showStatus &&
                                  eventAsset.status === 'approved' &&
                                  !isOnGoingWithEventAssets
                                ? '2px solid'
                                : 'none',
                        borderColor:
                          rejectMode && isAssetSelected(eventAsset.assetId)
                            ? 'error.main'
                            : showStatusBadges &&
                                showStatus &&
                                eventAsset.status === 'rejected'
                              ? 'error.main'
                              : showStatusBadges &&
                                  showStatus &&
                                  eventAsset.status === 'approved' &&
                                  !isOnGoingWithEventAssets
                                ? 'success.main'
                                : 'transparent'
                      }}
                      width="100%"
                    >
                      <Image
                        fill
                        unoptimized
                        alt={
                          eventAsset.asset?.key || `Event asset ${index + 2}`
                        }
                        src={eventAsset.asset?.url}
                        style={{ objectFit: 'cover' }}
                      />
                    </Box>
                    <Body2 color="text.secondary" mt={1}>
                      Supporting Image {index + 1}
                    </Body2>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        )}
      </Grid>
    );
  };

  const isOnGoingOrApproved =
    eventDetail.eventStatus === 'on_going' ||
    eventDetail.eventStatus === 'approved';
  const isRejectedOrDraft =
    eventDetail.eventStatus === 'rejected' ||
    eventDetail.eventStatus === 'draft';

  // Get rejected reason for rejected events (only if status is not pending)
  const rejectedReason =
    assetChangeStatus !== 'pending' &&
    eventAssetChanges &&
    eventAssetChanges[0]?.rejectedReason
      ? eventAssetChanges[0].rejectedReason
      : null;

  return (
    <Box>
      {!hideHeader && (
        <>
          <Box
            alignItems="center"
            display="flex"
            justifyContent="space-between"
            mb={2}
          >
            <H3 color="text.primary" fontWeight={700}>
              Event Assets
            </H3>

            {(() => {
              const shouldShowForOnGoingOrApproved =
                isOnGoingOrApproved && assetChangeStatus !== 'pending';
              const shouldShowForRejectedOrDraft = isRejectedOrDraft;

              return (
                (shouldShowForOnGoingOrApproved ||
                  shouldShowForRejectedOrDraft) && (
                  <Button variant="primary" onClick={handleEditAssets}>
                    Edit Assets
                  </Button>
                )
              );
            })()}
          </Box>

          {/* Show rejected reason if event is rejected */}
          {rejectedReason && (
            <Box mb={2}>
              <RejectedReason reason={rejectedReason} />
            </Box>
          )}
        </>
      )}

      {/* Original Assets Section */}
      {isOnGoingWithChanges && !hideOriginalAssets ? (
        <>
          {/* Original Assets */}
          {eventDetail.eventAssets && eventDetail.eventAssets.length > 0 && (
            <>
              <H3 color="text.primary" fontWeight={700} mb={2}>
                Original Assets
              </H3>
              {renderAssetGrid(
                eventDetail.eventAssets.slice(0, 5),
                eventDetail.eventAssets[0],
                eventDetail.eventAssets.slice(1, 5),
                false // Don't show status badges on original assets
              )}
            </>
          )}

          {/* Updated Assets Section */}
          {changedAssets.length > 0 && (
            <>
              <Box alignItems="center" display="flex" gap={1} mb={2} mt={4}>
                <H3 color="text.primary" fontWeight={700}>
                  Updated Assets
                </H3>
                {getSectionStatusChip(assetChangeStatus)}
              </Box>
              {renderAssetGrid(
                changedAssets,
                changedMainAsset,
                changedSideAssets,
                assetChangeStatus === 'rejected'
              )}
            </>
          )}
        </>
      ) : hideOriginalAssets &&
        eventAssetChanges &&
        eventAssetChanges.length > 0 ? (
        changedAssets.length > 0 ? (
          <>
            {(eventDetail.eventStatus === 'on_going' ||
              eventDetail.eventStatus === 'approved') && (
              <Box alignItems="center" display="flex" gap={1} mb={2}>
                <H3 color="text.primary" fontWeight={700}>
                  Updated Assets
                </H3>
                {getSectionStatusChip(assetChangeStatus)}
              </Box>
            )}
            {renderAssetGrid(
              changedAssets,
              changedMainAsset,
              changedSideAssets,
              assetChangeStatus === 'rejected'
            )}
            {/* Show Original Assets below Updated Assets for on_going events in approval mode */}
            {eventDetail.eventStatus === 'on_going' &&
              eventDetail.eventAssets &&
              eventDetail.eventAssets.length > 0 && (
                <>
                  <Box alignItems="center" display="flex" gap={1} mb={2} mt={4}>
                    <H3 color="text.primary" fontWeight={700}>
                      Original Assets
                    </H3>
                  </Box>
                  {renderAssetGrid(
                    eventDetail.eventAssets.slice(0, 5),
                    eventDetail.eventAssets[0],
                    eventDetail.eventAssets.slice(1, 5),
                    false // Don't show status badges on original assets
                  )}
                </>
              )}
          </>
        ) : (
          <Box
            alignItems="center"
            bgcolor="background.paper"
            border="2px dashed"
            borderColor="grey.100"
            display="flex"
            height="380px"
            justifyContent="center"
          >
            <H3 color="text.secondary">No assets available</H3>
          </Box>
        )
      ) : /* Regular Assets Grid */
      eventAssets.length > 0 ? (
        <Box paddingTop="12px">
          {renderAssetGrid(eventAssets, mainAsset, sideAssets)}
        </Box>
      ) : (
        <Box
          alignItems="center"
          bgcolor="background.paper"
          border="2px dashed"
          borderColor="grey.100"
          display="flex"
          height="380px"
          justifyContent="center"
        >
          <H3 color="text.secondary">No assets available</H3>
        </Box>
      )}
    </Box>
  );
};
