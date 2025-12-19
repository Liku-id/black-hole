import { Box, Grid, Checkbox, Chip } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { CheckCircleOutline, ErrorOutline } from '@mui/icons-material';

import { Button, H3, Body2 } from '@/components/common';
import { EventDetail, EventAssetChange } from '@/types/event';

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
  const isOnGoingWithChanges = eventDetail.eventStatus === 'on_going' && eventAssetChanges && eventAssetChanges.length > 0;
  const firstChange = eventAssetChanges && eventAssetChanges.length > 0 ? eventAssetChanges[0] : null;
  const assetChangeStatus = firstChange?.status; // pending, rejected, approved
  
  let assetsSource;
  let changedItemsSource: any[] = [];

  if (eventAssetChanges && eventAssetChanges.length > 0) {
    const rejectedAssetIds = new Set(firstChange.rejectedFields || []);

    // Extract items from eventAssetChanges
    // For on_going events, apply rejection mapping only if status is "rejected"
    if (isOnGoingWithChanges && assetChangeStatus === 'rejected') {
      // Map rejectedFields IDs to assets and mark them as rejected
      changedItemsSource = firstChange.items?.map((item: any) => {
        return {
          ...item,
          status: rejectedAssetIds.has(item.assetId) ? 'rejected' : undefined,
          rejectedReason: firstChange.rejectedReason,
          rejectedFields: firstChange.rejectedFields
        };
      }) || [];
    } else if (isOnGoingWithChanges && assetChangeStatus === 'pending') {
      // For pending status, don't mark individual assets, just keep the items
      changedItemsSource = firstChange.items || [];
    } else {
      // For rejected/on_review events (non on_going), use existing logic
      const hasRejectedFields = rejectedAssetIds.size > 0;
      changedItemsSource = firstChange.items?.map((item: any) => {
        if (item.status) {
          return {
            ...item,
            status: item.status,
            rejectedReason: item.rejectedReason ?? firstChange.rejectedReason,
            rejectedFields: item.rejectedFields ?? firstChange.rejectedFields
          };
        }

        if (hasRejectedFields) {
          return {
            ...item,
            status: rejectedAssetIds.has(item.assetId) ? 'rejected' : undefined,
            rejectedReason: firstChange.rejectedReason,
            rejectedFields: firstChange.rejectedFields
          };
        }

        return {
          ...item,
          status: firstChange.status,
          rejectedReason: firstChange.rejectedReason,
          rejectedFields: firstChange.rejectedFields
        };
      }) || [];
    }

    if (!isOnGoingWithChanges) {
      // For rejected/on_review, just use eventAssetChanges items
      assetsSource = changedItemsSource;
    }
  }

  // For on_going with changes, original assets will be rendered separately
  if (!isOnGoingWithChanges) {
    if (!assetsSource) {
      assetsSource = eventDetail.eventAssets;
    }
  }

  const eventAssets = assetsSource?.slice(0, 5) || [];
  const mainAsset = eventAssets[0];
  const sideAssets = eventAssets.slice(1, 5);

  // For on_going events with changes, prepare changed assets separately
  // Also prepare changed assets when hideOriginalAssets is true (for approval page)
  const changedAssets = (isOnGoingWithChanges || (hideOriginalAssets && eventAssetChanges && eventAssetChanges.length > 0)) 
    ? changedItemsSource?.slice(0, 5) || [] 
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
  const isOnGoingWithEventAssets = eventDetail.eventStatus === 'on_going' && 
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

  // Helper function to render asset grid
  const renderAssetGrid = (assets: any[], mainAsset: any, sideAssets: any[], showStatusBadges: boolean = true) => {
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
                    disabled={mainAsset.status === 'approved' || mainAsset.status === 'rejected'}
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
                  border: rejectMode && isAssetSelected(mainAsset.assetId) 
                    ? '3px solid' 
                    : showStatusBadges && showStatus && mainAsset.status === 'rejected' 
                    ? '2px solid'
                    : showStatusBadges && showStatus && mainAsset.status === 'approved' && !isOnGoingWithEventAssets
                    ? '2px solid'
                    : 'none',
                  borderColor: rejectMode && isAssetSelected(mainAsset.assetId)
                    ? 'error.main'
                    : showStatusBadges && showStatus && mainAsset.status === 'rejected'
                    ? 'error.main'
                    : showStatusBadges && showStatus && mainAsset.status === 'approved' && !isOnGoingWithEventAssets
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
                <Grid key={eventAsset.id || eventAsset.assetId || index} item xs={6}>
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
                            onToggleAsset?.(eventAsset.assetId, e.target.checked)
                          }
                          disabled={eventAsset.status === 'approved' || eventAsset.status === 'rejected'}
                          sx={{
                            '& .MuiSvgIcon-root': { fontSize: 28 }
                          }}
                        />
                      </Box>
                    )}
                      {!rejectMode && showStatusBadges && getAssetStatusChip(eventAsset)}
                      <Box
                        bgcolor="grey.100"
                        overflow="hidden"
                        position="relative"
                        sx={{ 
                          aspectRatio: '16 / 9',
                          border: rejectMode && isAssetSelected(eventAsset.assetId)
                            ? '3px solid'
                            : showStatusBadges && showStatus && eventAsset.status === 'rejected'
                            ? '2px solid'
                            : showStatusBadges && showStatus && eventAsset.status === 'approved' && !isOnGoingWithEventAssets
                            ? '2px solid'
                            : 'none',
                          borderColor: rejectMode && isAssetSelected(eventAsset.assetId)
                            ? 'error.main'
                            : showStatusBadges && showStatus && eventAsset.status === 'rejected'
                            ? 'error.main'
                            : showStatusBadges && showStatus && eventAsset.status === 'approved' && !isOnGoingWithEventAssets
                            ? 'success.main'
                            : 'transparent'
                        }}
                        width="100%"
                      >
                      <Image
                        fill
                        unoptimized
                        alt={eventAsset.asset?.key || `Event asset ${index + 2}`}
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

  return (
    <Box>
      {!hideHeader && (
        <Box
          alignItems="center"
          display="flex"
          justifyContent="space-between"
          mb={2}
        >
          <H3 color="text.primary" fontWeight={700}>
            Event Assets
          </H3>
          {/* Hide Edit Thumbnail button if on_going with pending asset changes */}
          {eventDetail.eventStatus !== 'done' &&
            eventDetail.eventStatus !== 'on_review' &&
            !(isOnGoingWithChanges && assetChangeStatus === 'pending') && (
              <Button variant="primary" onClick={handleEditAssets}>
                Edit Thumbnail
              </Button>
            )}
        </Box>
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
                {assetChangeStatus === 'pending' && (
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
                )}
              </Box>
              {renderAssetGrid(
                changedAssets, 
                changedMainAsset, 
                changedSideAssets, 
                assetChangeStatus === 'rejected' // Only show status badges if status is rejected
              )}
            </>
          )}
        </>
      ) : hideOriginalAssets && eventAssetChanges && eventAssetChanges.length > 0 ? (
        /* Only show Updated Assets when hideOriginalAssets is true (for approval page) */
        changedAssets.length > 0 ? (
          <>
            <Box alignItems="center" display="flex" gap={1} mb={2}>
              <H3 color="text.primary" fontWeight={700}>
                Updated Assets
              </H3>
              {assetChangeStatus === 'pending' && (
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
              )}
            </Box>
            {renderAssetGrid(
              changedAssets, 
              changedMainAsset, 
              changedSideAssets, 
              assetChangeStatus === 'rejected' // Only show status badges if status is rejected
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
      ) : (
        /* Regular Assets Grid */
        eventAssets.length > 0 ? (
          renderAssetGrid(eventAssets, mainAsset, sideAssets)
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
      )}
    </Box>
  );
};
