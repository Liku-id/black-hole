import { EventOrganizer } from '@/types/organizer';
import { formatIndonesianDateTime, formatPhoneNumber, truncate } from '@/utils';
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

interface OrganizersTableProps {
  organizers: EventOrganizer[];
  loading?: boolean;
  onRefresh?: () => void;
}

const OrganizersTable: FC<OrganizersTableProps> = ({ organizers, loading = false, onRefresh }) => {
  const [selectedOrganizers, setSelectedOrganizers] = useState<string[]>([]);
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const theme = useTheme();

  const handleSelectAllOrganizers = (event: ChangeEvent<HTMLInputElement>): void => {
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

  const paginatedOrganizers = organizers.slice(page * limit, page * limit + limit);
  const selectedSomeOrganizers =
    selectedOrganizers.length > 0 && selectedOrganizers.length < organizers.length;
  const selectedAllOrganizers = selectedOrganizers.length === organizers.length;

  if (loading) {
    return (
      <Card>
        <CardHeader title="Event Organizers" />
        <Divider />
        <Box p={3} display="flex" justifyContent="center">
          <Typography>Loading organizers...</Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <CardHeader
        title={
          <Typography variant="body2" color="text.secondary">
            Total: {organizers.length} organizers
          </Typography>
        }
        action={
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            disabled={loading}
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Refresh
          </Button>
        }
        sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.primary.main}08, ${theme.palette.primary.main}04)`,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
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
                  color="primary"
                  checked={selectedAllOrganizers}
                  indeterminate={selectedSomeOrganizers}
                  onChange={handleSelectAllOrganizers}
                />
              </TableCell>
              <TableCell sx={{ 
                backgroundColor: theme.palette.grey[50],
                fontWeight: 600,
                minWidth: 280
              }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Organizer Details
                </Typography>
              </TableCell>
              <TableCell sx={{ 
                backgroundColor: theme.palette.grey[50],
                fontWeight: 600,
                minWidth: 200
              }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Contact Information
                </Typography>
              </TableCell>
              <TableCell sx={{ 
                backgroundColor: theme.palette.grey[50],
                fontWeight: 600,
                minWidth: 200
              }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Banking Details
                </Typography>
              </TableCell>
              <TableCell sx={{ 
                backgroundColor: theme.palette.grey[50],
                fontWeight: 600,
                minWidth: 180
              }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Registration
                </Typography>
              </TableCell>
              <TableCell sx={{ 
                backgroundColor: theme.palette.grey[50],
                fontWeight: 600,
                minWidth: 120
              }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Created
                </Typography>
              </TableCell>
              <TableCell align="right" sx={{ 
                backgroundColor: theme.palette.grey[50],
                fontWeight: 600,
                minWidth: 120
              }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Actions
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedOrganizers.map((organizer) => {
              const isOrganizerSelected = selectedOrganizers.includes(organizer.id);
              return (
                <TableRow 
                  hover 
                  key={organizer.id} 
                  selected={isOrganizerSelected}
                  sx={{
                    '&:hover': {
                      backgroundColor: `${theme.palette.primary.main}08`,
                      transform: 'translateY(-1px)',
                      transition: 'all 0.2s ease-in-out'
                    },
                    '&.Mui-selected': {
                      backgroundColor: `${theme.palette.primary.main}12`,
                    },
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isOrganizerSelected}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        handleSelectOneOrganizer(event, organizer.id)
                      }
                      value={isOrganizerSelected}
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
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
                        <Typography variant="subtitle2" fontWeight="bold" noWrap>
                          {organizer.name}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                          <PersonIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {organizer.pic_title || 'No title specified'}
                          </Typography>
                        </Box>
                        {organizer.description && (
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {truncate(organizer.description, 30)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <EmailIcon sx={{ fontSize: 16, color: theme.palette.info.main }} />
                        <Typography variant="body2" noWrap>
                          {organizer.email}
                        </Typography>
                      </Box>                        <Box display="flex" alignItems="center" gap={1}>
                          <PhoneIcon sx={{ fontSize: 16, color: theme.palette.success.main }} />
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {formatPhoneNumber(organizer.phone_number)}
                          </Typography>
                        </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {organizer.bank_information ? (
                      <Box>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <AccountBalanceIcon 
                            sx={{ fontSize: 16, color: theme.palette.primary.main }} 
                          />
                          <Typography variant="body2" fontWeight="medium" noWrap>
                            {organizer.bank_information.bank.name.toUpperCase()}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <BadgeIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {organizer.bank_information.accountNumber}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {organizer.bank_information.accountHolderName}
                        </Typography>
                      </Box>
                    ) : (
                      <Chip 
                        label="No Bank Info" 
                        size="small" 
                        color="warning" 
                        variant="outlined"
                        sx={{ borderRadius: 1 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <BadgeIcon sx={{ fontSize: 16, color: theme.palette.secondary.main }} />
                        <Typography variant="body2" fontWeight="medium" noWrap>
                          NIK: {organizer.nik || '-'}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        NPWP: {organizer.npwp || '-'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium" noWrap>
                        {formatIndonesianDateTime(organizer.created_at)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" gap={0.5} justifyContent="flex-end">
                      <Tooltip title="View Details" arrow>
                        <IconButton
                          sx={{
                            '&:hover': {
                              background: theme.palette.info.light,
                              transform: 'scale(1.1)'
                            },
                            color: theme.palette.info.main,
                            transition: 'all 0.2s ease-in-out'
                          }}
                          size="small"
                        >
                          <VisibilityTwoToneIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Organizer" arrow>
                        <IconButton
                          sx={{
                            '&:hover': {
                              background: theme.palette.primary.lighter,
                              transform: 'scale(1.1)'
                            },
                            color: theme.palette.primary.main,
                            transition: 'all 0.2s ease-in-out'
                          }}
                          size="small"
                        >
                          <EditTwoToneIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Organizer" arrow>
                        <IconButton
                          sx={{
                            '&:hover': { 
                              background: theme.palette.error.lighter,
                              transform: 'scale(1.1)'
                            },
                            color: theme.palette.error.main,
                            transition: 'all 0.2s ease-in-out'
                          }}
                          size="small"
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
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleLimitChange}
          page={page}
          rowsPerPage={limit}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontWeight: 500
            }
          }}
        />
      </Box>
    </Card>
  );
};

export default OrganizersTable;
