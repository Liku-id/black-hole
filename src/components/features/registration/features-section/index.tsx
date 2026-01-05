import { Box, Grid, styled } from '@mui/material';
import Image from 'next/image';
import React from 'react';

import { Body2 } from '@/components/common';

const FeatureBox = styled(Box)({
  padding: '56px 24px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center'
});

const IconWrapper = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: '56px',
  width: '80px',
  height: '80px'
});

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

const features: FeatureItem[] = [
  {
    icon: '/icon/seamless.svg',
    title: 'Seamless empowerment',
    description:
      'We handle payments, ticketing, e-delivery, so you focus on creation.'
  },
  {
    icon: '/icon/clarity.svg',
    title: 'Clarity & support',
    description:
      'A single dashboard, transparent fees, and a team that stands with you.'
  },
  {
    icon: '/icon/local.svg',
    title: 'From local roots to global reach',
    description:
      'Whether your gathering is next door or everywhere, we give it space to breathe, grow, connect.'
  },
  {
    icon: '/icon/presence.svg',
    title: 'Purpose with presence',
    description:
      'We see your event as part of something bigger: building community, sharing stories, awakening change.'
  }
];

const FeaturesSection: React.FC = () => {
  return (
    <Box>
      <Box
        textAlign="center"
        mb="55px"
        sx={{
          fontFamily: '"Bebas Neue", sans-serif',
          fontSize: '26px',
          color: 'common.white'
        }}
      >
        Creating together, one event at a time
      </Box>

        <Grid container>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <FeatureBox>
              <IconWrapper>
                <Image
                  alt={feature.title}
                  height={80}
                  src={feature.icon}
                  width={80}
                />
              </IconWrapper>
              <Box
                color="common.white"
                sx={{
                  fontFamily: '"Bebas Neue", sans-serif',
                  fontSize: '18px',
                  mb: '16px',
                  color: 'common.white'
                }}
              >
                {feature.title}
              </Box>
              <Body2
                color="common.white"
                sx={{
                  fontSize: '14px',
                  fontFamily: '"Onest", sans-serif'
                }}
              >
                {feature.description}
              </Body2>
            </FeatureBox>
          </Grid>
        ))}
        </Grid>
    </Box>
  );
};

export default FeaturesSection;

