import {
  Table,
  TableCell,
  TableRow,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  IconButton
} from '@mui/material';
import Image from 'next/image';
import { FC, useState } from 'react';

import {
  Body2,
  CollapsibleCardList,
  StyledTableContainer,
  StyledTableHead,
  StyledTableBody,
  Pagination
} from '@/components/common';
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

const getRoleDisplay = (roleName: string) => {
  switch (roleName) {
    case 'ground_staff':
      return 'Ground Staff';
    case 'finance':
      return 'Finance';
    case 'cashier':
      return 'Cashier';
    default:
      return roleName;
  }
};

export const TeamMemberTable: FC<TeamMemberTableProps> = ({
  teamMembers,
  loading = false,
  currentPage,
  pageSize,
  total,
  onPageChange,
  onOpenDeleteModal
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedMember, setSelectedMember] = useState<Staff | null>(null);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    member: Staff
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMember(null);
  };

  const handleDeleteClick = () => {
    if (onOpenDeleteModal && selectedMember) {
      onOpenDeleteModal(selectedMember);
    }
    handleMenuClose();
  };

  const renderActionCell = (member: Staff) => (
    <IconButton
      size="small"
      id="hamburger_icon_button"
      sx={{ color: 'text.secondary', cursor: 'pointer' }}
      onClick={(e) => handleMenuOpen(e, member)}
    >
      <Image alt="Options" height={24} src="/icon/options.svg" width={24} />
    </IconButton>
  );

  const actionMenu = (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
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
        onClick={handleDeleteClick}
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
  );

  const pagination =
    total > 0 ? (
      <Pagination
        total={total}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    ) : null;

  return (
    <>
      {actionMenu}
      <StyledTableContainer sx={{ display: { xs: 'block', lg: 'none' } }}>
        <CollapsibleCardList
          items={teamMembers}
          getKey={(member) => member.id}
          loading={loading}
          loadingMessage="Loading..."
          emptyMessage="No data"
          renderTitle={(member, index) =>
            `${index + 1 + currentPage * pageSize}. ${member.full_name}`
          }
          renderSubtitle={(member) => member.email}
          renderTitleMeta={(member) => (
            <Body2 color="text.secondary" fontSize="12px">
              {getRoleDisplay(member.role.name)}
            </Body2>
          )}
          renderDetails={(member) => [
            { label: 'Name', value: member.full_name },
            { label: 'Email', value: member.email },
            { label: 'User Role', value: getRoleDisplay(member.role.name) }
          ]}
          renderActions={renderActionCell}
        />
        {pagination}
      </StyledTableContainer>

      <StyledTableContainer sx={{ display: { xs: 'none', lg: 'block' } }}>
        <Table>
          <StyledTableHead>
            <TableRow>
              <TableCell sx={{ width: '60px' }}>
                <Body2 color="text.secondary">No.</Body2>
              </TableCell>
              <TableCell>
                <Body2 color="text.secondary">Name</Body2>
              </TableCell>
              <TableCell>
                <Body2 color="text.secondary">Email</Body2>
              </TableCell>
              <TableCell>
                <Body2 color="text.secondary">User Role</Body2>
              </TableCell>
              <TableCell sx={{ width: '80px' }}>
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
                  <TableCell>
                    <Body2 color="text.primary">
                      {currentPage * pageSize + index + 1}
                    </Body2>
                  </TableCell>
                  <TableCell>
                    <Body2 color="text.primary">{member.full_name}</Body2>
                  </TableCell>
                  <TableCell>
                    <Body2 color="text.primary">{member.email}</Body2>
                  </TableCell>
                  <TableCell>
                    <Body2 color="text.primary">
                      {getRoleDisplay(member.role.name)}
                    </Body2>
                  </TableCell>
                  <TableCell>{renderActionCell(member)}</TableCell>
                </TableRow>
              ))
            )}
          </StyledTableBody>
        </Table>
        {pagination}
      </StyledTableContainer>
    </>
  );
};
