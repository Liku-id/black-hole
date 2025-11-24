import { Box, styled } from '@mui/material';
import React from 'react';
import { H2, Body2, H3 } from '@/components/common';

const StepBoxWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginBottom: '24px',
  overflow: 'visible',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '6px',
    left: '6px',
    right: '-6px',
    bottom: '-6px',
    border: `1px solid ${theme.palette.common.white}`,
    backgroundColor: theme.palette.primary.dark,
    opacity: 0,
    transition: 'opacity 0.2s ease',
    pointerEvents: 'none',
    zIndex: 0
  },
  '&:hover::before': {
    opacity: 1
  },
  '&:hover': {
    transform: 'translate(-0.5px, -0.5px)',
    transition: 'transform 0.2s ease'
  }
}));

const StepBox = styled(Box)(({ theme }) => ({
  maxWidth: '478px',
  border: `1px solid ${theme.palette.common.white}`,
  padding: '16px',
  display: 'flex',
  alignItems: 'flex-start',
  position: 'relative',
  backgroundColor: theme.palette.primary.dark,
  zIndex: 1,
  transition: 'transform 0.2s ease'
}));

const NumberBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: '8px 18px',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: '40px',
  backgroundColor: theme.palette.common.white
}));

interface StepItem {
  number: string;
  title: string;
  description: string;
}

interface RegistrationContentProps {
  steps?: StepItem[];
}

const defaultSteps: StepItem[] = [
  {
    number: '1',
    title: 'Imagine & define your gathering',
    description:
      'Detail your dream — the name, date, place, and essence of your event. Choose ticket types that reflect your intention.'
  },
  {
    number: '2',
    title: 'Guide, celebrate, reflect',
    description: 'Track sales in real time. Manage your guest list. On show day, check in with confidence. Afterward, reflect — what worked, what could shine brighter next time.'
  },
  {
    number: '3',
    title: 'publish & open doors',
    description: 'With just a few clicks, your event joins our platform\'s gallery of stories and possibilities. We provide the tools — you provide the magic.'
  },
  {
    number: '4',
    title: 'Connect & invite',
    description: 'From friends to strangers, let your audience discover what you\'ve created.'
  }
];

const RegistrationContent: React.FC<RegistrationContentProps> = ({ steps = defaultSteps }) => {
  return (
    <Box display="flex" flexDirection="column" alignItems="flex-end" sx={{ overflow: 'visible' }}>
      {steps.map((step, index) => (
        <StepBoxWrapper key={index}>
          <StepBox>
          <NumberBox>
            <H3 fontWeight={700} sx={{ fontSize: "24px"}}>
              {step.number}
            </H3>
          </NumberBox>
          <Box>
            <H2
              color="common.white"
              fontWeight={400}
              marginBottom={2}
              textTransform="uppercase"
              sx={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '32px' }}
            >
              {step.title}
            </H2>
            <Body2 color="common.white" sx={{ fontSize: '14px' }}>
              {step.description}
            </Body2>
          </Box>
          </StepBox>
        </StepBoxWrapper>
      ))}
    </Box>
  );
};

export default RegistrationContent;

