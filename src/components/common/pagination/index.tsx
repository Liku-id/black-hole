import ArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import ArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { Box, IconButton } from '@mui/material';

import { Body2, Caption } from '@/components/common/typography';

interface PaginationProps {
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
  loading?: boolean;
}

export const Pagination = ({
  total,
  currentPage,
  pageSize,
  onPageChange,
  showInfo = true,
  loading = false
}: PaginationProps) => {
  const totalPages = Math.ceil(total / pageSize);
  const startItem = total === 0 ? 0 : currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, total);

  if (loading) {
    return null;
  }

  return (
    <Box
      alignItems="center"
      display="flex"
      justifyContent="space-between"
      sx={{
        mt: 2,
        pt: 2,
        borderTop: '1px solid #E2E8F0'
      }}
    >
      {showInfo && (
        <Body2 color="text.secondary">
          Showing {startItem} to {endItem} of {total} entries
        </Body2>
      )}

      <Box alignItems="center" display="flex" gap={0.5}>
        <IconButton
          disabled={currentPage === 0}
          sx={{
            width: 24,
            height: 24,
            fontSize: '12px',
            mr: 0.5,
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: '#F8FAFC'
            },
            '&:disabled': {
              color: '#CBD5E1'
            }
          }}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ArrowLeft />
        </IconButton>

        {/* Simple pagination - show current page and total pages */}
        <Box
          alignItems="center"
          display="flex"
          justifyContent="center"
          sx={{
            width: 24,
            height: 24,
            fontSize: '12px',
            backgroundColor: 'primary.main',
            color: 'white',
            borderRadius: '4px',
            fontWeight: 500
          }}
        >
          {currentPage + 1}
        </Box>

        {totalPages > 1 && (
          <Caption color="text.secondary" sx={{ mx: 0.5 }}>
            of {totalPages}
          </Caption>
        )}

        <IconButton
          disabled={currentPage >= totalPages - 1}
          sx={{
            width: 24,
            height: 24,
            fontSize: '12px',
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: '#F8FAFC'
            },
            '&:disabled': {
              color: '#CBD5E1'
            }
          }}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ArrowRight />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Pagination;

