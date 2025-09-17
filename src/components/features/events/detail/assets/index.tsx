import { Box, Grid } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { Button, H3 } from '@/components/common';
import { EventDetail } from '@/types/event';

interface EventDetailAssetsProps {
  eventDetail: EventDetail;
}

export const EventDetailAssets = ({ eventDetail }: EventDetailAssetsProps) => {
  const router = useRouter();
  const eventAssets = eventDetail.eventAssets?.slice(0, 5) || [];
  const assets = eventAssets.map((eventAsset) => eventAsset.asset);
  const mainAsset = assets[0];
  const sideAssets = assets.slice(1, 5);

  const handleEditAssets = () => {
    router.push(`/events/edit/${eventDetail.metaUrl}/assets`);
  };

  return (
    <Box>
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

      {/* Assets Grid */}
      {assets.length > 0 ? (
        <Grid container spacing={4}>
          {/* Left Grid - Main Asset */}
          {mainAsset && (
            <Grid item md={6} xs={12}>
              <Box
                bgcolor="grey.100"
                overflow="hidden"
                position="relative"
                sx={{ aspectRatio: '16 / 9' }}
                width="100%"
              >
                <Image
                  fill
                  unoptimized
                  alt={mainAsset.key || 'Event asset'}
                  src={mainAsset.url}
                  style={{ objectFit: 'cover' }}
                />
              </Box>
            </Grid>
          )}

          {/* Right Grid - Side Assets */}
          {sideAssets.length > 0 && (
            <Grid item md={6} xs={12}>
              <Grid container spacing={2}>
                {sideAssets.map((asset, index) => (
                  <Grid key={asset.id || index} item xs={6}>
                    <Box
                      bgcolor="grey.100"
                      overflow="hidden"
                      position="relative"
                      sx={{ aspectRatio: '16 / 9' }}
                      width="100%"
                    >
                      <Image
                        fill
                        unoptimized
                        alt={asset.key || `Event asset ${index + 2}`}
                        src={asset.url}
                        style={{ objectFit: 'cover' }}
                      />
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
