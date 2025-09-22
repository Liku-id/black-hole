import { Box } from '@mui/material';
import Image from 'next/image';

import { Body2, H2 } from '@/components/common';

interface AnalyticCardProps {
  icon: string;
  title: string;
  value: string;
  loading?: boolean;
}

const AnalyticCard = ({
  icon,
  title,
  value,
  loading = false
}: AnalyticCardProps) => {
  return (
    <Box
      bgcolor="background.paper"
      borderRadius={0}
      display="flex"
      flexDirection="column"
      height="125px"
      justifyContent="space-between"
      padding="16px"
    >
      <Box alignItems="center" display="flex">
        {!loading && (
          <Image
            alt="icon"
            height={20}
            src={icon}
            style={{ marginRight: '8px' }}
            width={20}
          />
        )}
        <Body2 fontWeight={300}>{title}</Body2>
      </Box>

      <H2 overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
        {value}
      </H2>
    </Box>
  );
};

export default AnalyticCard;
