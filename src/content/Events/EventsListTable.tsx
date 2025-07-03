import { ChangeEvent, FC, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Tooltip,
  Box,
  Card,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableContainer,
  Typography,
  useTheme
} from '@mui/material';
import { Event } from '@/models/event';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
interface EventsListTableProps {
  events: Event[];
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

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const applyPagination = (
  events: Event[],
  page: number,
  limit: number
): Event[] => {
  return events.slice(page * limit, page * limit + limit);
};

const EventsListTable: FC<EventsListTableProps> = ({ events }) => {
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(5);

  const handlePageChange = (_event: any, newPage: number): void => {
    setPage(newPage);
  };

  const handleLimitChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setLimit(parseInt(event.target.value));
  };

  const paginatedEvents = applyPagination(events, page, limit);
  const theme = useTheme();

  return (
    <Card>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Organizer</TableCell>
              <TableCell align="right">Created At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedEvents.map((event) => (
              <TableRow key={event.id} hover>
                <TableCell>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    color="text.primary"
                    gutterBottom
                    noWrap
                  >
                    {event.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    ID: {event.id}
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
                    {capitalize(event.type)}
                  </Typography>
                </TableCell>{' '}
                <TableCell>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    color="text.primary"
                    gutterBottom
                    noWrap
                  >
                    {event.event_organizer_name}{' '}
                  </Typography>
                </TableCell>{' '}
                <TableCell align="right">
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    color="text.primary"
                    gutterBottom
                    noWrap
                  >
                    {getFormattedDate(event.created_at)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {getFormattedTime(event.created_at)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Event Settings" arrow>
                    <IconButton
                      sx={{
                        '&:hover': {
                          background: theme.colors.secondary.lighter
                        },
                        color: theme.palette.primary.main
                      }}
                      color="inherit"
                      size="small"
                    >
                      <DisplaySettingsIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box p={2}>
        <TablePagination
          component="div"
          count={events.length}
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
EventsListTable.propTypes = {
  events: PropTypes.array.isRequired
};

EventsListTable.defaultProps = {
  events: []
};

export default EventsListTable;
