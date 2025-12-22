import { Box, styled, Tooltip } from '@mui/material';
import { useRef, useState } from 'react';
import { ErrorOutline, CheckCircleOutline } from '@mui/icons-material';

import { Body2 } from '@/components/common';

type TabStatus = 'rejected' | 'approved' | 'pending';

interface TabItem {
  id: string;
  title: string;
  quantity?: number;
  status?: TabStatus;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  borderless?: boolean;
  fullWidth?: boolean;
}

const TabsContainer = styled(Box)<{
  borderless?: boolean;
  fullWidth?: boolean;
}>(({ theme, borderless, fullWidth }) => ({
  display: 'flex',
  gap: fullWidth ? '0px' : '40px',
  borderBottom: borderless ? 'none' : `1px solid ${theme.palette.divider}`,
  overflowX: 'auto',
  cursor: 'grab',
  userSelect: 'none',
  '&:active': {
    cursor: 'grabbing'
  },
  '&::-webkit-scrollbar': {
    height: '0px'
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.grey[100]
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.grey[300],
    borderRadius: '2px'
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: theme.palette.grey[400]
  }
}));

const TabItem = styled(Box)<{ active: boolean; fullWidth?: boolean }>(
  ({ active, theme, fullWidth }) => ({
    padding: '16px 0',
    cursor: 'pointer',
    borderBottom: active
      ? `2px solid ${theme.palette.primary.main}`
      : '2px solid transparent',
    transition: 'all 0.2s ease',
    flexShrink: 0,
    flex: fullWidth ? 1 : 'none',
    textAlign: fullWidth ? 'center' : 'left',
    '&:hover': {
      color: active ? theme.palette.primary.main : theme.palette.primary.main
    }
  })
);

export default function Tabs({
  tabs,
  activeTab,
  onTabChange,
  borderless = false,
  fullWidth = false
}: TabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX);
    setScrollLeft(containerRef.current?.scrollLeft || 0);
    setDragDistance(0);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX;
    const walk = x - startX;
    setDragDistance(Math.abs(walk));

    if (containerRef.current) {
      containerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const getStatusIcon = (status?: TabStatus) => {
    if (!status) return null;

    const getStatusLabel = (status: TabStatus): string => {
      switch (status) {
        case 'rejected':
          return 'Rejected';
        case 'approved':
          return 'Approved';
        case 'pending':
          return 'Pending';
        default:
          return '';
      }
    };

    const getStatusTooltipConfig = (status: TabStatus) => {
      switch (status) {
        case 'rejected':
          return {
            backgroundColor: 'error.dark',
            color: 'common.white'
          };
        case 'approved':
          return {
            backgroundColor: 'success.dark',
            color: 'common.white'
          };
        case 'pending':
          return {
            backgroundColor: 'grey.800',
            color: 'common.white'
          };
        default:
          return {
            backgroundColor: 'grey.800',
            color: 'common.white'
          };
      }
    };

    const icon = (() => {
      switch (status) {
        case 'rejected':
          return <ErrorOutline fontSize="small" sx={{ color: 'error.main' }} />;
        case 'approved':
          return (
            <CheckCircleOutline
              fontSize="small"
              sx={{ color: 'success.main' }}
            />
          );
        case 'pending':
          return <ErrorOutline fontSize="small" sx={{ color: 'grey.500' }} />;
        default:
          return null;
      }
    })();

    if (!icon) return null;

    const tooltipConfig = getStatusTooltipConfig(status);

    return (
      <Tooltip
        title={getStatusLabel(status)}
        arrow
        slotProps={{
          tooltip: {
            sx: {
              backgroundColor: tooltipConfig.backgroundColor,
              color: tooltipConfig.color,
              fontSize: '12px',
              padding: '8px 12px'
            }
          },
          arrow: {
            sx: {
              color: tooltipConfig.backgroundColor
            }
          }
        }}
      >
        <Box component="span" display="inline-flex" alignItems="center">
          {icon}
        </Box>
      </Tooltip>
    );
  };

  return (
    <TabsContainer
      ref={containerRef}
      borderless={borderless}
      fullWidth={fullWidth}
      sx={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {tabs.map((tab) => (
        <TabItem
          key={tab.id}
          active={activeTab === tab.id}
          fullWidth={fullWidth}
          onClick={() => {
            if (dragDistance < 5) {
              onTabChange(tab.id);
            }
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Body2
              color={activeTab === tab.id ? 'primary.main' : 'text.secondary'}
              fontFamily="Onest"
              fontSize="14px"
            >
              {tab.title}
              {tab.quantity !== undefined && ` (${tab.quantity})`}
            </Body2>
            {tab.status && getStatusIcon(tab.status)}
          </Box>
        </TabItem>
      ))}
    </TabsContainer>
  );
}
