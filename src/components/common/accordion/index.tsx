import {
  Accordion as MuiAccordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import Image from 'next/image';
import { useState } from 'react';

import { Body2 } from '../typography';

interface CustomAccordionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  id?: string;
  disabled?: boolean;
  expanded?: boolean;
  onChange?: (event: React.SyntheticEvent, isExpanded: boolean) => void;
}

export const CustomAccordion = ({
  title,
  children,
  defaultExpanded = false,
  id,
  disabled = false,
  expanded: controlledExpanded,
  onChange
}: CustomAccordionProps) => {
  const [localExpanded, setLocalExpanded] = useState(defaultExpanded);

  const isControlled = controlledExpanded !== undefined;
  const isExpanded = isControlled ? controlledExpanded : localExpanded;

  const handleChange = (event: React.SyntheticEvent, nextExpanded: boolean) => {
    if (disabled) return;
    if (onChange) {
      onChange(event, nextExpanded);
    }
    if (!isControlled) {
      setLocalExpanded(nextExpanded);
    }
  };

  return (
    <MuiAccordion
      disabled={disabled}
      expanded={isExpanded}
      id={id}
      sx={{
        boxShadow: 'none',
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:before': {
          display: 'none'
        },
        '&:last-child': {
          borderBottom: 'none'
        },
        '&.Mui-expanded': {
          margin: 0
        }
      }}
      onChange={handleChange}
    >
      <AccordionSummary
        expandIcon={
          <Image
            alt="expand"
            height={16}
            src="/icon/accordion-arrow.svg"
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}
            width={16}
          />
        }
        sx={{
          '& .MuiAccordionSummary-content': {
            margin: 0
          },
          '&.Mui-expanded': {
            minHeight: '48px'
          }
        }}
      >
        <Body2
          color="text.primary"
          fontSize="14px"
          fontWeight={600}
          textTransform="capitalize"
        >
          {title}
        </Body2>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0, pb: 2 }}>{children}</AccordionDetails>
    </MuiAccordion>
  );
};

export default CustomAccordion;
