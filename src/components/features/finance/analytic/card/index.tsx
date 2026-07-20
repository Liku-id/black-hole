import { Box, Tooltip } from '@mui/material';
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
      minHeight="125px"
      justifyContent="space-between"
      padding="16px"
      minWidth={0}
      overflow="hidden"
    >
      <Box alignItems="center" display="flex" minWidth={0} gap={1}>
        {!loading && (
          <Image
            alt="icon"
            height={20}
            src={icon}
            style={{ flexShrink: 0 }}
            width={20}
          />
        )}
        <Body2
          fontWeight={300}
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0
          }}
        >
          {title}
        </Body2>
      </Box>

      <Tooltip title={value} arrow>
        <H2
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: { xs: '20px', sm: '24px', md: '28px' },
            minWidth: 0
          }}
        >
          {value}
        </H2>
      </Tooltip>
    </Box>
  );
};

export default AnalyticCard;
