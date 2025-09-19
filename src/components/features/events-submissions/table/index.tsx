import { Box, IconButton, Table, TableCell, TableRow } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FC } from 'react';

import {
  Body2,
  StyledTableContainer,
  StyledTableHead,
  StyledTableBody
} from '@/components/common';
import { StatusBadge } from '@/components/features/events/status-badge';
import { EventSubmission } from '@/types/events-submission';
import { dateUtils } from '@/utils';

// Use shared StatusBadge

interface SubmissionsTableProps {
  submissions: EventSubmission[];
  loading?: boolean;
  onRefresh?: () => void;
}

const SubmissionsTable: FC<SubmissionsTableProps> = ({
  submissions,
  loading = false
}) => {
  const router = useRouter();

  const handleViewClick = (submission: EventSubmission) => {
    const id = submission.event?.id || submission.eventUpdateRequest?.id;
    router.push(`/approval/${id}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" padding="40px">
        <Body2 color="text.secondary">Loading submissions...</Body2>
      </Box>
    );
  }

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
            <TableCell sx={{ width: '30%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Event Name
              </Body2>
            </TableCell>
            <TableCell sx={{ width: '20%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Event Date
              </Body2>
            </TableCell>
            <TableCell sx={{ width: '20%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Event Status
              </Body2>
            </TableCell>
            <TableCell sx={{ width: '20%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Submitted At
              </Body2>
            </TableCell>
            <TableCell sx={{ width: '20%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Request Status
              </Body2>
            </TableCell>
            <TableCell align="right" sx={{ width: '5%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Action
              </Body2>
            </TableCell>
          </TableRow>
        </StyledTableHead>
        <StyledTableBody>
          {submissions.map((submission, index) => (
            <TableRow key={submission.id}>
              <TableCell>
                <Body2 color="text.primary" fontSize="14px">
                  {index + 1}.
                </Body2>
              </TableCell>
              <TableCell>
                <Body2 color="text.primary" fontSize="14px">
                  {submission.event?.name || '-'}
                </Body2>
              </TableCell>
              <TableCell>
                <Body2 color="text.primary" fontSize="14px">
                  {submission.event?.startDate
                    ? `${dateUtils.formatDateDDMMYYYY(submission.event.startDate)}`
                    : '-'}
                </Body2>
              </TableCell>
              <TableCell>
                {submission.event?.eventStatus ? (
                  <StatusBadge status={submission.event.eventStatus} />
                ) : (
                  <Body2 color="text.primary" fontSize="14px">
                    -
                  </Body2>
                )}
              </TableCell>
              <TableCell>
                <Body2 color="text.primary" fontSize="14px">
                  {submission.createdAt
                    ? dateUtils.formatDateDDMMYYYY(submission.createdAt)
                    : '-'}
                </Body2>
              </TableCell>
              <TableCell>
                {submission.eventUpdateRequest?.status ? (
                  <StatusBadge status={submission.eventUpdateRequest.status} />
                ) : (
                  <Body2 color="text.primary" fontSize="14px">
                    -
                  </Body2>
                )}
              </TableCell>
              <TableCell align="right">
                <IconButton
                  size="small"
                  sx={{ color: 'text.secondary', cursor: 'pointer' }}
                  onClick={() => handleViewClick(submission)}
                >
                  <Image
                    alt="View"
                    height={24}
                    src="/icon/eye.svg"
                    width={24}
                  />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </StyledTableBody>
      </Table>
    </StyledTableContainer>
  );
};

export default SubmissionsTable;
