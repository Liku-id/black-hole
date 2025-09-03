import { Box, Grid } from '@mui/material';
import Image from 'next/image';

import { Button, H3 } from '@/components/common';
import { EventDetail } from '@/types/event';

interface EventDetailAssetsProps {
  eventDetail: EventDetail;
}

export const EventDetailAssets = ({ eventDetail }: EventDetailAssetsProps) => {
  const eventAssets = eventDetail.eventAssets?.slice(0, 5) || [];
  const assets = eventAssets.map((eventAsset) => eventAsset.asset);
  const mainAsset = assets[0];
  const sideAssets = assets.slice(1, 5);

  return (
    <Box>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <H3 color="text.primary" fontWeight={700}>
          Event Assets
        </H3>
        <Button variant="primary">Edit Thumbnail</Button>
      </Box>

      {/* Assets Grid */}
      {assets.length > 0 ? (
        <Grid container spacing={4}>
          {/* Left Grid - Main Asset */}
          {mainAsset && (
            <Grid item md={6} xs={12}>
              <Box
                width="100%"
                height="278px"
                overflow="hidden"
                bgcolor="grey.100"
                position="relative"
              >
                <Image
                  src={mainAsset.url}
                  alt={mainAsset.key || 'Event asset'}
                  fill
                  style={{ objectFit: 'cover' }}
                  unoptimized
                />
              </Box>
            </Grid>
          )}

          {/* Right Grid - Side Assets */}
          {sideAssets.length > 0 && (
            <Grid item md={6} xs={12}>
              <Grid container spacing={2}>
                {sideAssets.map((asset, index) => (
                  <Grid item xs={6} key={asset.id || index}>
                    <Box
                      width="100%"
                      overflow="hidden"
                      bgcolor="grey.100"
                      position="relative"
                    >
                      <Image
                        src={asset.url}
                        alt={asset.key || `Event asset ${index + 2}`}
                        fill
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
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="380px"
          border="2px dashed"
          borderColor="grey.100"
          bgcolor="background.paper"
        >
          <H3 color="text.secondary">No assets available</H3>
        </Box>
      )}
    </Box>
  );
};
