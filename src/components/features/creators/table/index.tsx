import {
  Box,
  IconButton,
  Table,
  TableCell,
  TableRow,
  Tooltip
} from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FC } from 'react';

import {
  Body2,
  Pagination,
  StyledTableBody,
  StyledTableContainer,
  StyledTableHead
} from '@/components/common';
import { EventOrganizer } from '@/types/organizer';

interface CreatorsTableProps {
  creators: EventOrganizer[];
  loading?: boolean;
  onRefresh?: () => void;
  total?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

const CreatorsTable: FC<CreatorsTableProps> = ({
  creators,
  loading = false,
  total = 0,
  currentPage = 0,
  pageSize = 10,
  onPageChange
}) => {
  const router = useRouter();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" padding="40px">
        <Body2 color="text.secondary">Loading creators...</Body2>
      </Box>
    );
  }

  const handleAccountClick = (creatorId: string) => {
    router.push(`/creator/${creatorId}`);
  };

  const handleCalendarClick = (creatorId: string) => {
    router.push(`/creator/${creatorId}/events`);
  };

  return (
    <StyledTableContainer>
      <Table>
        <StyledTableHead>
          <TableRow>
            <TableCell sx={{ width: '5%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                No.
              </Body2>
            </TableCell>
            <TableCell sx={{ width: '20%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Creators Name
              </Body2>
            </TableCell>
            <TableCell sx={{ width: '18%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                PIC Name
              </Body2>
            </TableCell>
            <TableCell sx={{ width: '22%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Email
              </Body2>
            </TableCell>
            <TableCell align={'left'} sx={{ width: '10%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Action
              </Body2>
            </TableCell>
          </TableRow>
        </StyledTableHead>
        <StyledTableBody>
          {creators.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>
                <Box display="flex" justifyContent="center" padding="40px">
                  <Body2 color="text.secondary">No creators found</Body2>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            creators.map((creator, index) => (
              <TableRow key={creator.id}>
                <TableCell>
                  <Body2 color="text.primary" fontSize="14px">
                    {index + 1 + currentPage * pageSize}.
                  </Body2>
                </TableCell>
                <TableCell>
                  <Body2 color="text.primary" fontSize="14px">
                    {creator.name || '-'}
                  </Body2>
                </TableCell>
                <TableCell>
                  <Body2 color="text.primary" fontSize="14px">
                    {creator.pic_name ||
                      creator.event_organizer_pic?.name ||
                      creator.full_name ||
                      '-'}
                  </Body2>
                </TableCell>
                <TableCell>
                  <Body2 color="text.primary" fontSize="14px">
                    {creator.email || '-'}
                  </Body2>
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title="Event List" arrow>
                      <IconButton
                        size="small"
                        sx={{ color: 'text.secondary', cursor: 'pointer' }}
                        onClick={() => handleCalendarClick(creator.id)}
                      >
                        <Image
                          alt="Calendar"
                          height={24}
                          src="/icon/calendar-v4.svg"
                          width={24}
                        />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Profile" arrow>
                      <IconButton
                        size="small"
                        sx={{ color: 'text.secondary', cursor: 'pointer' }}
                        onClick={() => handleAccountClick(creator.id)}
                      >
                        <Image
                          alt="Account"
                          height={24}
                          src="/icon/account-v2.svg"
                          width={24}
                        />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </StyledTableBody>
      </Table>

      {/* Pagination */}
      {creators.length > 0 && (
        <Pagination
          total={total}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={(page) => onPageChange && onPageChange(page)}
          loading={loading}
        />
      )}
    </StyledTableContainer>
  );
};

export default CreatorsTable;
