import { Box, styled } from '@mui/material';
import { useRef, useState } from 'react';

import { Body2 } from '@/components/common';

interface TabItem {
  id: string;
  title: string;
  quantity?: number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  borderless?: boolean;
}

const TabsContainer = styled(Box)<{ borderless?: boolean }>(
  ({ theme, borderless }) => ({
    display: 'flex',
    gap: '40px',
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
  })
);

const TabItem = styled(Box)<{ active: boolean }>(({ active, theme }) => ({
  padding: '16px 0',
  cursor: 'pointer',
  borderBottom: active
    ? `2px solid ${theme.palette.primary.main}`
    : '2px solid transparent',
  transition: 'all 0.2s ease',
  flexShrink: 0,
  '&:hover': {
    color: active ? theme.palette.primary.main : theme.palette.primary.main
  }
}));

export default function Tabs({
  tabs,
  activeTab,
  onTabChange,
  borderless = false
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

  return (
    <TabsContainer
      ref={containerRef}
      borderless={borderless}
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
          onClick={() => {
            if (dragDistance < 5) {
              onTabChange(tab.id);
            }
          }}
        >
          <Body2
            color={activeTab === tab.id ? 'primary.main' : 'text.secondary'}
            fontFamily="Onest"
            fontSize="14px"
          >
            {tab.title}
            {tab.quantity !== undefined && `(${tab.quantity})`}
          </Body2>
        </TabItem>
      ))}
    </TabsContainer>
  );
}
