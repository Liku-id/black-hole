'use client';

import { Box, styled, keyframes } from '@mui/material';
import React from 'react';

import { H1 } from '../typography';

interface StripeTextProps {
  direction?: 'vertical' | 'horizontal';
  scrollDirection?:
    | 'top-to-bottom'
    | 'bottom-to-top'
    | 'left-to-right'
    | 'right-to-left';
}

const defaultTexts = [
  "Let's collaborate",
  "Let's create",
  "Let's connect",
  "Let's Play",
  "Let's fun",
  "Let's learn"
];

const scrollVerticalDown = keyframes`
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-50%);
  }
`;

const scrollVerticalUp = keyframes`
  from {
    transform: translateY(-50%);
  }
  to {
    transform: translateY(0);
  }
`;

const scrollHorizontalLeft = keyframes`
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
`;

const scrollHorizontalRight = keyframes`
  from {
    transform: translateX(-50%);
  }
  to {
    transform: translateX(0);
  }
`;

const StripeContainer = styled(Box)<{ isVertical: boolean }>(({ isVertical }) => ({
  height: isVertical ? '100%' : '64px',
  overflow: 'hidden',
  backgroundColor: 'white',
  borderColor: 'black',
  width: '100%',
  ...(isVertical
    ? {
        borderLeft: '1px solid black',
        borderRight: '1px solid black'
      }
    : {
        borderTop: '1px solid black',
        borderBottom: '1px solid black'
      })
}));

const StripeWrapper = styled(Box)<{
  isVertical: boolean;
  animationClass: string;
}>(({ isVertical, animationClass }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  ...(isVertical
    ? {
        flexDirection: 'column-reverse',
        padding: '0 10px'
      }
    : {
        minWidth: '100%',
        flexShrink: 0,
        alignItems: 'center',
        gap: '32px',
        padding: '8px 0',
        whiteSpace: 'nowrap'
      }),
  animation: animationClass
}));

const StripeItem = styled(Box)<{ isVertical: boolean }>(({ isVertical }) => ({
  display: 'flex',
  alignItems: 'center',
  ...(isVertical && {
    flexDirection: 'column'
  })
}));

const Dot = styled(Box)({
  width: '16px',
  height: '16px',
  borderRadius: '50%',
  border: '1px solid black'
});

export default function StripeText({
  direction = 'vertical',
  scrollDirection = direction === 'vertical'
    ? 'bottom-to-top'
    : 'right-to-left'
}: StripeTextProps) {
  const isVertical = direction === 'vertical';
  const texts = defaultTexts;

  let animationClass = '';
  if (isVertical) {
    animationClass =
      scrollDirection === 'top-to-bottom'
        ? `${scrollVerticalDown} 20s linear infinite`
        : `${scrollVerticalUp} 20s linear infinite`;
  } else {
    animationClass =
      scrollDirection === 'right-to-left'
        ? `${scrollHorizontalLeft} 20s linear infinite`
        : `${scrollHorizontalRight} 20s linear infinite`;
  }

  return (
    <StripeContainer isVertical={isVertical}>
      <Box
        sx={{
          display: 'flex',
          ...(isVertical ? { flexDirection: 'column' } : { gap: '32px', overflow: 'hidden' })
        }}
      >
        {[1, 2].map((_, idx) => (
          <StripeWrapper
            key={`wrap-stripe-${idx}`}
            isVertical={isVertical}
            animationClass={animationClass}
            aria-hidden={idx === 1}
          >
            {texts.map((txt, textIdx) => (
              <StripeItem key={`stripe-${textIdx}`} isVertical={isVertical}>
                {!isVertical && <Dot sx={{ mr: 2 }} />}
                <H1
                  sx={{
                    fontSize: '40px',
                    fontWeight: 400,
                    fontFamily: '"Bebas Neue", sans-serif',
                    color: 'black',
                    ...(isVertical && {
                      rotate: '180deg',
                      writingMode: 'vertical-rl'
                    }),
                    ...(!isVertical && {
                      whiteSpace: 'nowrap'
                    })
                  }}
                >
                  {txt}
                </H1>
                {isVertical && <Dot sx={{ my: 2 }} />}
              </StripeItem>
            ))}
          </StripeWrapper>
        ))}
      </Box>
    </StripeContainer>
  );
}
