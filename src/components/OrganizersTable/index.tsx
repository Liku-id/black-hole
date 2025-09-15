import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessIcon from '@mui/icons-material/Business';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardHeader,
  Checkbox,
  Chip,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { ChangeEvent, FC, useState } from 'react';

import { EventOrganizer } from '@/types/organizer';
import { formatPhoneNumber, truncate } from '@/utils';
import { dateUtils } from '@/utils';

interface OrganizersTableProps {
  organizers: EventOrganizer[];
  loading?: boolean;
  onRefresh?: () => void;
}

const OrganizersTable: FC<OrganizersTableProps> = ({
  organizers,
  loading = false,
  onRefresh
}) => {
  const [selectedOrganizers, setSelectedOrganizers] = useState<string[]>([]);
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const theme = useTheme();

  const handleSelectAllOrganizers = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setSelectedOrganizers(
      event.target.checked ? organizers.map((organizer) => organizer.id) : []
    );
  };

  const handleSelectOneOrganizer = (
    _event: ChangeEvent<HTMLInputElement>,
    organizerId: string
  ): void => {
    if (!selectedOrganizers.includes(organizerId)) {
      setSelectedOrganizers((prevSelected) => [...prevSelected, organizerId]);
    } else {
      setSelectedOrganizers((prevSelected) =>
        prevSelected.filter((id) => id !== organizerId)
      );
    }
  };

  const handlePageChange = (_event: any, newPage: number): void => {
    setPage(newPage);
  };

  const handleLimitChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setLimit(parseInt(event.target.value));
    setPage(0);
  };

  const paginatedOrganizers = organizers.slice(
    page * limit,
    page * limit + limit
  );
  const selectedSomeOrganizers =
    selectedOrganizers.length > 0 &&
    selectedOrganizers.length < organizers.length;
  const selectedAllOrganizers = selectedOrganizers.length === organizers.length;

  if (loading) {
    return (
      <Card>
        <CardHeader title="Event Organizers" />
        <Divider />
        <Box display="flex" justifyContent="center" p={3}>
          <Typography>Loading organizers...</Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <CardHeader
        action={
          <Button
            disabled={loading}
            size="small"
            startIcon={<RefreshIcon />}
            sx={{ borderRadius: 2 }}
            variant="outlined"
            onClick={onRefresh}
          >
            Refresh
          </Button>
        }
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main}08, ${theme.palette.primary.main}04)`,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
        title={
          <Typography color="text.secondary" variant="body2">
            Total: {organizers.length} organizers
          </Typography>
        }
      />
      <TableContainer sx={{ maxHeight: 800 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                padding="checkbox"
                sx={{
                  backgroundColor: theme.palette.grey[50],
                  fontWeight: 600
                }}
              >
                <Checkbox
                  checked={selectedAllOrganizers}
                  color="primary"
                  indeterminate={selectedSomeOrganizers}
                  onChange={handleSelectAllOrganizers}
                />
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: theme.palette.grey[50],
                  fontWeight: 600,
                  minWidth: 280
                }}
              >
                <Typography fontWeight="bold" variant="subtitle2">
                  Organizer Details
                </Typography>
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: theme.palette.grey[50],
                  fontWeight: 600,
                  minWidth: 200
                }}
              >
                <Typography fontWeight="bold" variant="subtitle2">
                  Contact Information
                </Typography>
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: theme.palette.grey[50],
                  fontWeight: 600,
                  minWidth: 200
                }}
              >
                <Typography fontWeight="bold" variant="subtitle2">
                  Banking Details
                </Typography>
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: theme.palette.grey[50],
                  fontWeight: 600,
                  minWidth: 180
                }}
              >
                <Typography fontWeight="bold" variant="subtitle2">
                  Registration
                </Typography>
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: theme.palette.grey[50],
                  fontWeight: 600,
                  minWidth: 120
                }}
              >
                <Typography fontWeight="bold" variant="subtitle2">
                  Created
                </Typography>
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  backgroundColor: theme.palette.grey[50],
                  fontWeight: 600,
                  minWidth: 120
                }}
              >
                <Typography fontWeight="bold" variant="subtitle2">
                  Actions
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedOrganizers.map((organizer) => {
              const isOrganizerSelected = selectedOrganizers.includes(
                organizer.id
              );
              return (
                <TableRow
                  key={organizer.id}
                  hover
                  selected={isOrganizerSelected}
                  sx={{
                    '&:hover': {
                      backgroundColor: `${theme.palette.primary.main}08`,
                      transform: 'translateY(-1px)',
                      transition: 'all 0.2s ease-in-out'
                    },
                    '&.Mui-selected': {
                      backgroundColor: `${theme.palette.primary.main}12`
                    },
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isOrganizerSelected}
                      color="primary"
                      value={isOrganizerSelected}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        handleSelectOneOrganizer(event, organizer.id)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Box alignItems="center" display="flex">
                      <Avatar
                        sx={{
                          mr: 2,
                          width: 48,
                          height: 48,
                          bgcolor: theme.palette.primary.main,
                          boxShadow: theme.shadows[2]
                        }}
                      >
                        <BusinessIcon />
                      </Avatar>
                      <Box>
                        <Typography
                          noWrap
                          fontWeight="bold"
                          variant="subtitle2"
                        >
                          {organizer.name}
                        </Typography>
                        <Box
                          alignItems="center"
                          display="flex"
                          gap={0.5}
                          mt={0.5}
                        >
                          <PersonIcon
                            sx={{
                              fontSize: 14,
                              color: theme.palette.text.secondary
                            }}
                          />
                          <Typography
                            noWrap
                            color="text.secondary"
                            variant="caption"
                          >
                            {organizer.pic_title || 'No title specified'}
                          </Typography>
                        </Box>
                        {organizer.description && (
                          <Typography
                            noWrap
                            color="text.secondary"
                            variant="caption"
                          >
                            {truncate(organizer.description, 30)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Box alignItems="center" display="flex" gap={1} mb={1}>
                        <EmailIcon
                          sx={{ fontSize: 16, color: theme.palette.info.main }}
                        />
                        <Typography noWrap variant="body2">
                          {organizer.email}
                        </Typography>
                      </Box>{' '}
                      <Box alignItems="center" display="flex" gap={1}>
                        <PhoneIcon
                          sx={{
                            fontSize: 16,
                            color: theme.palette.success.main
                          }}
                        />
                        <Typography
                          noWrap
                          color="text.secondary"
                          variant="body2"
                        >
                          {formatPhoneNumber(organizer.phone_number)}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {organizer.bank_information ? (
                      <Box>
                        <Box alignItems="center" display="flex" gap={1} mb={1}>
                          <AccountBalanceIcon
                            sx={{
                              fontSize: 16,
                              color: theme.palette.primary.main
                            }}
                          />
                          <Typography
                            noWrap
                            fontWeight="medium"
                            variant="body2"
                          >
                            {organizer.bank_information.bank.name.toUpperCase()}
                          </Typography>
                        </Box>
                        <Box alignItems="center" display="flex" gap={1}>
                          <BadgeIcon
                            sx={{
                              fontSize: 14,
                              color: theme.palette.text.secondary
                            }}
                          />
                          <Typography
                            noWrap
                            color="text.secondary"
                            variant="caption"
                          >
                            {organizer.bank_information.accountNumber}
                          </Typography>
                        </Box>
                        <Typography
                          noWrap
                          color="text.secondary"
                          variant="caption"
                        >
                          {organizer.bank_information.accountHolderName}
                        </Typography>
                      </Box>
                    ) : (
                      <Chip
                        color="warning"
                        label="No Bank Info"
                        size="small"
                        sx={{ borderRadius: 1 }}
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Box alignItems="center" display="flex" gap={1} mb={1}>
                        <BadgeIcon
                          sx={{
                            fontSize: 16,
                            color: theme.palette.secondary.main
                          }}
                        />
                        <Typography noWrap fontWeight="medium" variant="body2">
                          NIK: {organizer.nik || '-'}
                        </Typography>
                      </Box>
                      <Typography noWrap color="text.secondary" variant="body2">
                        NPWP: {organizer.npwp || '-'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography noWrap fontWeight="medium" variant="body2">
                        {dateUtils.formatDateTimeWIB(organizer.created_at)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" gap={0.5} justifyContent="flex-end">
                      <Tooltip arrow title="View Details">
                        <IconButton
                          size="small"
                          sx={{
                            '&:hover': {
                              background: theme.palette.info.light,
                              transform: 'scale(1.1)'
                            },
                            color: theme.palette.info.main,
                            transition: 'all 0.2s ease-in-out'
                          }}
                        >
                          <VisibilityTwoToneIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip arrow title="Edit Organizer">
                        <IconButton
                          size="small"
                          sx={{
                            '&:hover': {
                              background: theme.palette.primary.light,
                              transform: 'scale(1.1)'
                            },
                            color: theme.palette.primary.main,
                            transition: 'all 0.2s ease-in-out'
                          }}
                        >
                          <EditTwoToneIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip arrow title="Delete Organizer">
                        <IconButton
                          size="small"
                          sx={{
                            '&:hover': {
                              background: theme.palette.error.light,
                              transform: 'scale(1.1)'
                            },
                            color: theme.palette.error.main,
                            transition: 'all 0.2s ease-in-out'
                          }}
                        >
                          <DeleteTwoToneIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Box
        p={2}
        sx={{
          backgroundColor: theme.palette.grey[50],
          borderTop: `1px solid ${theme.palette.divider}`
        }}
      >
        <TablePagination
          component="div"
          count={organizers.length}
          page={page}
          rowsPerPage={limit}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows':
              {
                fontWeight: 500
              }
          }}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleLimitChange}
        />
      </Box>
    </Card>
  );
};

export default OrganizersTable;
