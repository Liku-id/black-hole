import { FC, ChangeEvent, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Divider,
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableContainer,
  Typography,
  CardHeader
} from '@mui/material';

import { EventOrganizer } from '@/models/organizer';

interface OrganizersListTabelProps {
  className?: string;
  eventOrganizers: EventOrganizer[];
}

const getFormattedDate = (rawDate: string): string => {
  try {
    // Parse the date string manually to handle the timezone offset
    const match = rawDate.match(
      /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/
    );
    if (!match) {
      return 'Invalid Date';
    }

    const [, year, month, day, hour, minute, second] = match;
    const parsedDate = new Date(
      parseInt(year),
      parseInt(month) - 1, // Month is 0-indexed
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second)
    );

    // Check if date is valid
    if (isNaN(parsedDate.getTime())) {
      return 'Invalid Date';
    }

    const formattedDate = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    }).format(parsedDate);

    return formattedDate.replace(',', '');
  } catch (error) {
    return 'Invalid Date';
  }
};

const getFormattedTime = (rawDate: string): string => {
  try {
    // Parse the date string manually to handle the timezone offset
    const match = rawDate.match(
      /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/
    );
    if (!match) {
      return 'Invalid Time';
    }

    const [, year, month, day, hour, minute, second] = match;
    const parsedDate = new Date(
      parseInt(year),
      parseInt(month) - 1, // Month is 0-indexed
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second)
    );

    // Check if date is valid
    if (isNaN(parsedDate.getTime())) {
      return 'Invalid Time';
    }

    return parsedDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    return 'Invalid Time';
  }
};

const applyPagination = (
  eventOrganizers: EventOrganizer[],
  page: number,
  limit: number
): EventOrganizer[] => {
  return eventOrganizers.slice(page * limit, page * limit + limit);
};

const OrganizersListTabel: FC<OrganizersListTabelProps> = ({
  eventOrganizers
}) => {
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(5);

  const handlePageChange = (_event: any, newPage: number): void => {
    setPage(newPage);
  };

  const handleLimitChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setLimit(parseInt(event.target.value));
  };

  const paginatedEventOrganizers = applyPagination(
    eventOrganizers,
    page,
    limit
  );

  return (
    <Card>
      {<CardHeader title="Event Organizers" />}
      <Divider />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone Number</TableCell>
              <TableCell align="right">Created At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedEventOrganizers.map((eventOrganizer) => {
              return (
                <TableRow hover key={eventOrganizer.id}>
                  <TableCell>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color="text.primary"
                      gutterBottom
                      noWrap
                    >
                      {eventOrganizer.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      ID: {eventOrganizer.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color="text.primary"
                      gutterBottom
                      noWrap
                    >
                      {eventOrganizer.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color="text.primary"
                      gutterBottom
                      noWrap
                    >
                      {eventOrganizer.phone_number}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color="text.primary"
                      gutterBottom
                      noWrap
                    >
                      {getFormattedDate(eventOrganizer.created_at)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {getFormattedTime(eventOrganizer.created_at)}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Box p={2}>
        <TablePagination
          component="div"
          count={eventOrganizers.length}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleLimitChange}
          page={page}
          rowsPerPage={limit}
          rowsPerPageOptions={[5, 10, 25, 30]}
        />
      </Box>
    </Card>
  );
};

OrganizersListTabel.propTypes = {
  eventOrganizers: PropTypes.array.isRequired
};

OrganizersListTabel.defaultProps = {
  eventOrganizers: []
};

export default OrganizersListTabel;
