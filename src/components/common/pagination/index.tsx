import ArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import ArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { Box, IconButton } from '@mui/material';

import Select from '@/components/common/select';
import { Body2, Caption } from '@/components/common/typography';

interface PaginationProps {
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
  loading?: boolean;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export const Pagination = ({
  total,
  currentPage,
  pageSize,
  onPageChange,
  showInfo = true,
  loading = false,
  onPageSizeChange,
  pageSizeOptions
}: PaginationProps) => {
  const totalPages = Math.ceil(total / pageSize);
  const startItem = total === 0 ? 0 : currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, total);

  if (loading) {
    return null;
  }

  return (
    <Box
      display="flex"
      flexDirection={{ xs: 'column', sm: 'row' }}
      alignItems="center"
      justifyContent="space-between"
      gap={{ xs: 2, sm: 0 }}
      sx={{
        mt: 2,
        pt: 2,
        borderTop: '1px solid #E2E8F0',
        width: '100%'
      }}
    >
      {showInfo && (
        <Body2 color="text.secondary" sx={{ fontSize: { xs: '12px', sm: '14px' } }}>
          Showing {startItem} to {endItem} of {total} entries
        </Body2>
      )}

      <Box alignItems="center" display="flex" gap={2}>
        {onPageSizeChange && (
          <Box alignItems="center" display={{ xs: 'none', sm: 'flex' }} gap={1}>
            <Body2 color="text.secondary">Rows per page:</Body2>
            <Select
              options={
                pageSizeOptions?.map((size) => ({
                  value: size.toString(),
                  label: size.toString()
                })) || [
                  { value: '10', label: '10' },
                  { value: '25', label: '25' },
                  { value: '50', label: '50' },
                  { value: '100', label: '100' }
                ]
              }
              value={pageSize.toString()}
              onChange={(value) => onPageSizeChange(Number(value))}
              sx={{
                width: '85px',
                '& .MuiOutlinedInput-root': {
                  height: '32px',
                  fontSize: '12px',
                  '&:has(input:not(:placeholder-shown))': {
                    borderColor: 'grey.100',
                    backgroundColor: 'background.paper'
                  },
                  '&.Mui-focused:has(input:not(:placeholder-shown))': {
                    borderColor: 'primary.main',
                    backgroundColor: 'background.default'
                  }
                }
              }}
            />
          </Box>
        )}

        <Box alignItems="center" display="flex" gap={0.5}>
          <IconButton
            disabled={currentPage === 0}
            sx={{
              width: 40,
              height: 40,
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
              minWidth: 32,
              height: 32,
              px: 1,
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
              width: 40,
              height: 40,
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
    </Box>
  );
};

export default Pagination;
