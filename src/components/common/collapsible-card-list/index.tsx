import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { Box, Collapse, IconButton } from '@mui/material';
import { ReactNode, useState } from 'react';

import { Body1, Body2 } from '../typography';

export type CardDetailItem = {
  label: string;
  value: ReactNode;
};

export type CollapsibleCardListProps<T> = {
  items: T[];
  getKey: (item: T) => string;
  renderTitle: (item: T, index: number) => ReactNode;
  renderSubtitle?: (item: T, index: number) => ReactNode;
  renderTitleMeta?: (item: T, index: number) => ReactNode;
  renderDetails: (item: T, index: number) => CardDetailItem[];
  renderActions?: (item: T, index: number) => ReactNode;
  emptyMessage?: string;
  loading?: boolean;
  loadingMessage?: string;
};

function CollapsibleCardList<T>({
  items,
  getKey,
  renderTitle,
  renderSubtitle,
  renderTitleMeta,
  renderDetails,
  renderActions,
  emptyMessage = 'No data found',
  loading = false,
  loadingMessage = 'Loading...'
}: CollapsibleCardListProps<T>) {
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" padding="40px">
        <Body2 color="text.secondary">{loadingMessage}</Body2>
      </Box>
    );
  }

  if (items.length === 0) {
    return (
      <Box py={4} textAlign="center">
        <Body1 color="text.secondary">{emptyMessage}</Body1>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" width="100%" minWidth={0}>
      {items.map((item, index) => {
        const key = getKey(item);
        const isExpanded = !!expandedKeys[key];
        const details = renderDetails(item, index);
        const subtitle = renderSubtitle?.(item, index);
        const titleMeta = renderTitleMeta?.(item, index);

        return (
          <Box
            key={key}
            sx={{
              borderBottom: '1px solid',
              borderColor: 'grey.100',
              minWidth: 0,
              '&:last-child': { borderBottom: 'none' }
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              py={1.5}
              px={{ xs: 0.5, sm: 1 }}
              onClick={() => toggleExpand(key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleExpand(key);
                }
              }}
              role="button"
              tabIndex={0}
              aria-expanded={isExpanded}
              sx={{
                cursor: 'pointer',
                minWidth: 0,
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: 'primary.main',
                  borderRadius: '4px'
                }
              }}
            >
              <IconButton
                size="small"
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
                tabIndex={-1}
                sx={{ flexShrink: 0, pointerEvents: 'none', p: 0.5 }}
              >
                {isExpanded ? (
                  <KeyboardArrowUp fontSize="small" />
                ) : (
                  <KeyboardArrowDown fontSize="small" />
                )}
              </IconButton>

              <Box flex={1} minWidth={0} overflow="hidden">
                <Body2
                  color="text.primary"
                  fontSize="14px"
                  fontWeight={600}
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {renderTitle(item, index)}
                </Body2>
                {subtitle != null && subtitle !== '' && (
                  <Body2
                    color="text.secondary"
                    fontSize="12px"
                    sx={{
                      mt: 0.25,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {subtitle}
                  </Body2>
                )}
              </Box>

              {titleMeta != null && titleMeta !== '' && (
                <Box flexShrink={0} onClick={(e) => e.stopPropagation()}>
                  {titleMeta}
                </Box>
              )}

              {renderActions && (
                <Box
                  flexShrink={0}
                  onClick={(e) => e.stopPropagation()}
                  sx={{ cursor: 'default' }}
                >
                  {renderActions(item, index)}
                </Box>
              )}
            </Box>

            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Box
                display="flex"
                flexDirection="column"
                gap={1}
                px={{ xs: 1, sm: 2 }}
                pb={1.5}
                pl={{ xs: 5, sm: 6 }}
              >
                {details.map((detail, index) => (
                  <Box
                    key={`${key}-detail-${index}`}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    gap={1.5}
                    minWidth={0}
                  >
                    <Body2
                      color="text.secondary"
                      fontSize="12px"
                      sx={{ flexShrink: 0 }}
                    >
                      {detail.label}
                    </Body2>
                    <Box
                      textAlign="right"
                      minWidth={0}
                      sx={{
                        wordBreak: 'break-word',
                        '& .MuiTypography-root': {
                          fontSize: '12px'
                        }
                      }}
                    >
                      {typeof detail.value === 'string' ||
                      typeof detail.value === 'number' ? (
                        <Body2 color="text.primary" fontSize="12px">
                          {detail.value}
                        </Body2>
                      ) : (
                        detail.value
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Collapse>
          </Box>
        );
      })}
    </Box>
  );
}

export default CollapsibleCardList;
