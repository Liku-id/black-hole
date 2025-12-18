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
}

export const EventDetailAssets = ({ 
  eventDetail,
  eventAssetChanges,
  rejectMode = false,
  selectedAssets = [],
  onToggleAsset,
  hideHeader = false,
  showStatus = false
}: EventDetailAssetsProps) => {
  const router = useRouter();

  // Use eventAssetChanges if provided, otherwise fall back to eventDetail.eventAssets
  let assetsSource;

  if (eventAssetChanges && eventAssetChanges.length > 0) {
    // Extract items from the first eventAssetChange and merge parent-level rejection info.
    // IMPORTANT:
    // - Do NOT overwrite item.status so per-asset statuses from BE are preserved.
    // - When rejectedFields (array of assetId) is present, treat only those assetIds
    //   as rejected and do NOT fall back to the parent status "rejected" for others.
    const firstChange = eventAssetChanges[0];
    const rejectedAssetIds = new Set(firstChange.rejectedFields || []);
    const hasRejectedFields = rejectedAssetIds.size > 0;

    assetsSource =
      firstChange.items?.map((item: any) => {
        // If BE already sends per-item status, respect it fully.
        if (item.status) {
          return {
            ...item,
            status: item.status,
            rejectedReason: item.rejectedReason ?? firstChange.rejectedReason,
            rejectedFields: item.rejectedFields ?? firstChange.rejectedFields
          };
        }

        // When we have rejectedFields, mark only those assetIds as rejected.
        if (hasRejectedFields) {
          return {
            ...item,
            status: rejectedAssetIds.has(item.assetId) ? 'rejected' : undefined,
            rejectedReason: firstChange.rejectedReason,
            rejectedFields: firstChange.rejectedFields
          };
        }

        // Fallback: no per-item status and no rejectedFields, inherit parent status.
        return {
          ...item,
          status: firstChange.status,
          rejectedReason: firstChange.rejectedReason,
          rejectedFields: firstChange.rejectedFields
        };
      }) || [];
  } else {
    assetsSource = eventDetail.eventAssets;
  }

  const eventAssets = assetsSource?.slice(0, 5) || [];
  const mainAsset = eventAssets[0];
  const sideAssets = eventAssets.slice(1, 5);

  const handleEditAssets = () => {
    router.push(`/events/edit/${eventDetail.metaUrl}/assets`);
  };

  // Selection is based on the underlying assetId so each visual asset
  // (thumbnail / supporting image) can be toggled independently
  const isAssetSelected = (assetId: string | undefined) => {
    if (!assetId) return false;
    return selectedAssets.includes(assetId);
  };

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
    if (asset.status === 'approved') {
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
          {eventDetail.eventStatus !== 'done' &&
            eventDetail.eventStatus !== 'on_review' && (
              <Button variant="primary" onClick={handleEditAssets}>
                Edit Thumbnail
              </Button>
            )}
        </Box>
      )}

      {/* Assets Grid */}
      {eventAssets.length > 0 ? (
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
                {!rejectMode && getAssetStatusChip(mainAsset)}
                <Box
                  bgcolor="grey.100"
                  overflow="hidden"
                  position="relative"
                  sx={{ 
                    aspectRatio: '16 / 9',
                    border: rejectMode && isAssetSelected(mainAsset.assetId) 
                      ? '3px solid' 
                      : showStatus && mainAsset.status === 'rejected' 
                      ? '2px solid'
                      : showStatus && mainAsset.status === 'approved'
                      ? '2px solid'
                      : 'none',
                    borderColor: rejectMode && isAssetSelected(mainAsset.assetId)
                      ? 'error.main'
                      : showStatus && mainAsset.status === 'rejected'
                      ? 'error.main'
                      : showStatus && mainAsset.status === 'approved'
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
                  <Grid key={eventAsset.id || index} item xs={6}>
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
                      {!rejectMode && getAssetStatusChip(eventAsset)}
                      <Box
                        bgcolor="grey.100"
                        overflow="hidden"
                        position="relative"
                        sx={{ 
                          aspectRatio: '16 / 9',
                          border: rejectMode && isAssetSelected(eventAsset.assetId)
                            ? '3px solid'
                            : showStatus && eventAsset.status === 'rejected'
                            ? '2px solid'
                            : showStatus && eventAsset.status === 'approved'
                            ? '2px solid'
                            : 'none',
                          borderColor: rejectMode && isAssetSelected(eventAsset.assetId)
                            ? 'error.main'
                            : showStatus && eventAsset.status === 'rejected'
                            ? 'error.main'
                            : showStatus && eventAsset.status === 'approved'
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
