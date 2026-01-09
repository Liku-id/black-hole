import {
  Table,
  TableCell,
  TableRow,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton
} from '@mui/material';
import Image from 'next/image';
import { FC, useState } from 'react';
// Third Party

// Components & Layouts
import {
  Body2,
  StyledTableContainer,
  StyledTableHead,
  StyledTableBody,
  Pagination
} from '@/components/common';
// Types
import { Staff } from '@/types/staff';

interface TeamMemberTableProps {
  teamMembers: Staff[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onOpenDeleteModal?: (member: Staff) => void;
}

export const TeamMemberTable: FC<TeamMemberTableProps> = ({
  teamMembers,
  loading = false,
  currentPage,
  pageSize,
  total,
  onPageChange,
  onOpenDeleteModal
}) => {
  const [anchorEl, setAnchorEl] = useState<Record<string, HTMLElement | null>>({});

  // Open options menu
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    memberId: string
  ) => {
    setAnchorEl((prev) => ({ ...prev, [memberId]: event.currentTarget }));
  };

  // Close options menu
  const handleMenuClose = (memberId: string) => {
    setAnchorEl((prev) => ({ ...prev, [memberId]: null }));
  };

  // Trigger delete action
  const handleDeleteClick = (member: Staff) => {
    if (onOpenDeleteModal) {
      onOpenDeleteModal(member);
    }
    handleMenuClose(member.id);
  };

  return (
    <>
      <StyledTableContainer>
        <Table>
          <StyledTableHead>
            <TableRow>
              <TableCell sx={{ width: '60px', minWidth: '60px' }}>
                <Body2 color="text.secondary">No.</Body2>
              </TableCell>
              <TableCell sx={{ minWidth: '200px' }}>
                <Body2 color="text.secondary">Name</Body2>
              </TableCell>
              <TableCell sx={{ minWidth: '250px' }}>
                <Body2 color="text.secondary">Email</Body2>
              </TableCell>
              <TableCell sx={{ minWidth: '150px' }}>
                <Body2 color="text.secondary">User Role</Body2>
              </TableCell>
              <TableCell sx={{ width: '80px', minWidth: '80px' }}>
                <Body2 color="text.secondary">Action</Body2>
              </TableCell>
            </TableRow>
          </StyledTableHead>
          <StyledTableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ padding: '40px' }}>
                  <Body2 color="text.secondary">Loading...</Body2>
                </TableCell>
              </TableRow>
            ) : teamMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ padding: '40px' }}>
                  <Body2 color="text.secondary">No data</Body2>
                </TableCell>
              </TableRow>
            ) : (
              teamMembers.map((member, index) => (
                <TableRow key={member.id}>
                  <TableCell sx={{ width: '60px', minWidth: '60px' }}>
                    <Body2 color="text.primary">
                      {currentPage * pageSize + index + 1}
                    </Body2>
                  </TableCell>
                  <TableCell sx={{ minWidth: '200px' }}>
                    <Body2 color="text.primary">{member.full_name}</Body2>
                  </TableCell>
                  <TableCell sx={{ minWidth: '250px' }}>
                    <Body2 color="text.primary">{member.email}</Body2>
                  </TableCell>
                  <TableCell sx={{ minWidth: '150px' }}>
                    <Body2 color="text.primary">
                      {member.role_name === 'ground_staff'
                        ? 'Ground Staff'
                        : member.role_name === 'finance'
                          ? 'Finance'
                          : member.role_name || 'Ground Staff'}
                    </Body2>
                  </TableCell>
                  <TableCell sx={{ width: '80px', minWidth: '80px' }}>
                    <Box>
                      <IconButton
                        size="small"
                        id="hamburger_icon_button"
                        sx={{ color: 'text.secondary', cursor: 'pointer' }}
                        onClick={(e) => handleMenuOpen(e, member.id)}
                      >
                        <Image
                          alt="Options"
                          height={24}
                          src="/icon/options.svg"
                          width={24}
                        />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl[member.id]}
                        open={Boolean(anchorEl[member.id])}
                        onClose={() => handleMenuClose(member.id)}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right'
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'right'
                        }}
                        slotProps={{
                          paper: {
                            sx: {
                              backgroundColor: 'common.white',
                              boxShadow: '0 4px 20px 0 rgba(40, 72, 107, 0.15)',
                              borderRadius: 1,
                              minWidth: 200,
                              mt: 1
                            }
                          }
                        }}
                      >
                        <MenuItem
                          onClick={() => handleDeleteClick(member)}
                          sx={{
                            padding: '12px 16px',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.04)'
                            }
                          }}
                        >
                          <ListItemIcon>
                            <Image
                              alt="Delete Team Member"
                              src="/icon/trash-v2.svg"
                              height={18}
                              width={18}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Body2 color="text.primary" fontWeight="400">
                                Delete Team Member
                              </Body2>
                            }
                          />
                        </MenuItem>
                      </Menu>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </StyledTableBody>
        </Table>
      </StyledTableContainer>

      {total > 0 && (
        <Pagination
          total={total}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
};
