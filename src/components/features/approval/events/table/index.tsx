import {
  IconButton,
  Table,
  TableCell,
  TableRow
} from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FC } from 'react';

import {
  Body2,
  CollapsibleCardList,
  StyledTableContainer,
  StyledTableHead,
  StyledTableBody,
  Pagination
} from '@/components/common';
import { StatusBadge } from '@/components/features/events/status-badge';
import { EventSubmission } from '@/types/events-submission';
import { dateUtils } from '@/utils';

interface SubmissionsTableProps {
  activeTab: string;
  submissions: EventSubmission[];
  loading?: boolean;
  onRefresh?: () => void;
  total?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

const SubmissionsTable: FC<SubmissionsTableProps> = ({
  activeTab,
  submissions,
  loading = false,
  total = 0,
  currentPage = 0,
  pageSize = 10,
  onPageChange
}) => {
  const router = useRouter();

  const handleViewClick = (submission: EventSubmission) => {
    const id = submission.id;
    router.push(`/approval/${id}`);
  };

  const renderViewAction = (submission: EventSubmission) => (
    <IconButton
      size="small"
      sx={{ color: 'text.secondary', cursor: 'pointer' }}
      onClick={() => handleViewClick(submission)}
    >
      <Image alt="View" height={24} src="/icon/eye.svg" width={24} />
    </IconButton>
  );

  const pagination = (
    <Pagination
      total={total}
      currentPage={currentPage}
      pageSize={pageSize}
      onPageChange={(page) => onPageChange && onPageChange(page)}
      loading={loading}
    />
  );

  return (
    <>
      <StyledTableContainer sx={{ display: { xs: 'block', lg: 'none' } }}>
        <CollapsibleCardList
          items={submissions}
          getKey={(item) => item.id}
          loading={loading}
          loadingMessage="Loading submissions..."
          emptyMessage="No submissions found"
          renderTitle={(item, index) =>
            `${index + 1 + currentPage * pageSize}. ${item.event?.name || '-'}`
          }
          renderDetails={(item) => {
            const details = [
              {
                label: 'Event Date',
                value: item.event?.startDate
                  ? dateUtils.formatDateDDMMYYYY(item.event.startDate)
                  : '-'
              },
              {
                label: 'Event Status',
                value: item.event?.eventStatus ? (
                  <StatusBadge status={item.event.eventStatus} />
                ) : (
                  '-'
                )
              },
              {
                label: 'Submitted At',
                value: item.createdAt
                  ? dateUtils.formatDateDDMMYYYY(item.createdAt)
                  : '-'
              }
            ];

            if (activeTab === 'current_event') {
              details.push({
                label: 'Approval Status',
                value: item.eventUpdateRequest?.status ? (
                  <StatusBadge status={item.eventUpdateRequest.status} />
                ) : (
                  '-'
                )
              });
            }

            return details;
          }}
          renderActions={renderViewAction}
        />
        {pagination}
      </StyledTableContainer>

      <StyledTableContainer sx={{ display: { xs: 'none', lg: 'block' } }}>
      <Table>
        <StyledTableHead>
          <TableRow>
            <TableCell sx={{ width: '5%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                No.
              </Body2>
            </TableCell>
            <TableCell sx={{ width: '35%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Event Name
              </Body2>
            </TableCell>
            <TableCell sx={{ width: '12.5%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Event Date
              </Body2>
            </TableCell>
            <TableCell sx={{ width: '12.5%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Event Status
              </Body2>
            </TableCell>
            <TableCell sx={{ width: '12.5%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Submitted At
              </Body2>
            </TableCell>
            {activeTab === 'current_event' && (
              <TableCell sx={{ width: '12.5%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Approval Status
                </Body2>
              </TableCell>
            )}
            <TableCell align="right" sx={{ width: '10%' }}>
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
                  {index + 1 + currentPage * pageSize}.
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
              {activeTab === 'current_event' && (
                <TableCell>
                  {submission.eventUpdateRequest?.status ? (
                    <StatusBadge
                      status={submission.eventUpdateRequest.status}
                    />
                  ) : (
                    <Body2 color="text.primary" fontSize="14px">
                      -
                    </Body2>
                  )}
                </TableCell>
              )}
              <TableCell align="right">{renderViewAction(submission)}</TableCell>
            </TableRow>
          ))}
        </StyledTableBody>
      </Table>
      {pagination}
      </StyledTableContainer>
    </>
  );
};

export default SubmissionsTable;
