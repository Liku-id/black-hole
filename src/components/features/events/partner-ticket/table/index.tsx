import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableCell,
  TableRow
} from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FC, useState } from 'react';

import {
  Body2,
  CollapsibleCardList,
  Pagination,
  StyledTableBody,
  StyledTableContainer,
  StyledTableHead
} from '@/components/common';
import { dateUtils, formatUtils } from '@/utils';

interface Partner {
  id: string;
  partnerName: string;
  socialMediaLink?:
    | string
    | { tiktok?: string; instagram?: string; twitter?: string };
  picName: string;
  picPhoneNumber: string;
  totalRevenue: string;
  linkExpiredDate?: string;
  privateLink?: string;
}

interface PartnerEventTableProps {
  partners: Partner[];
  loading?: boolean;
  total?: number;
  currentPage?: number;
  pageSize?: number;
  metaUrl?: string;
  onPageChange?: (page: number) => void;
  onCreatePrivateLink?: (partner: Partner) => void;
  onTransactionList?: (partner: Partner) => void;
  onEdit?: (partner: Partner) => void;
}

const PartnerEventTable: FC<PartnerEventTableProps> = ({
  partners = [],
  loading = false,
  total = 0,
  currentPage = 0,
  pageSize = 10,
  metaUrl,
  onPageChange,
  onCreatePrivateLink,
  onTransactionList,
  onEdit
}) => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<{
    [key: string]: HTMLElement | null;
  }>({});

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    partnerId: string
  ) => {
    setAnchorEl((prev) => ({ ...prev, [partnerId]: event.currentTarget }));
  };

  const handleMenuClose = (partnerId: string) => {
    setAnchorEl((prev) => ({ ...prev, [partnerId]: null }));
  };

  const handleCreatePrivateLink = (partner: Partner) => {
    handleMenuClose(partner.id);
    onCreatePrivateLink && onCreatePrivateLink(partner);
  };

  const handleCheckPrivateLink = (partner: Partner) => {
    handleMenuClose(partner.id);
    if (metaUrl && partner.id) {
      router.push(
        `/events/${metaUrl}/partner-ticket/view-private-link?partnerId=${partner.id}`
      );
    }
  };

  const handleTransactionList = (partner: Partner) => {
    handleMenuClose(partner.id);
    onTransactionList && onTransactionList(partner);
  };

  const handleEdit = (partner: Partner) => {
    handleMenuClose(partner.id);
    onEdit && onEdit(partner);
  };

  const renderPrivateLink = (partner: Partner) => {
    if (!partner.privateLink) {
      return '-';
    }

    return (
      <Box
        alignItems="center"
        display="flex"
        gap={0.5}
        justifyContent="flex-end"
        minWidth={0}
      >
        <Body2
          color="text.primary"
          fontSize="12px"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '160px'
          }}
        >
          {partner.privateLink}
        </Body2>
        <IconButton
          size="small"
          sx={{
            color: 'text.secondary',
            cursor: 'pointer',
            padding: '4px',
            flexShrink: 0
          }}
          onClick={() => {
            if (navigator.clipboard) {
              navigator.clipboard.writeText(partner.privateLink || '');
            }
          }}
        >
          <Image alt="Copy" height={16} src="/icon/copy.svg" width={16} />
        </IconButton>
      </Box>
    );
  };

  const renderActionCell = (partner: Partner) => (
    <Box>
      <IconButton
        size="small"
        id="hamburger_icon_button"
        sx={{ color: 'text.secondary', cursor: 'pointer' }}
        onClick={(e) => handleMenuOpen(e, partner.id)}
      >
        <Image alt="Options" height={24} src="/icon/options.svg" width={24} />
      </IconButton>
      <Menu
        anchorEl={anchorEl[partner.id]}
        open={Boolean(anchorEl[partner.id])}
        onClose={() => handleMenuClose(partner.id)}
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
        {!partner.privateLink ? (
          <MenuItem
            id="create_private_link"
            onClick={() => handleCreatePrivateLink(partner)}
            sx={{
              padding: '12px 16px',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 'auto', mr: 2 }}>
              <Image
                alt="Create Private Link"
                src="/icon/ticket.svg"
                height={18}
                width={18}
                style={{
                  filter:
                    'brightness(0) saturate(100%) invert(37%) sepia(95%) saturate(2082%) hue-rotate(227deg) brightness(95%) contrast(90%)'
                }}
              />
            </ListItemIcon>
            <ListItemText
              primary={
                <Body2 color="text.primary" fontSize="14px" fontWeight="400">
                  Create Private Link
                </Body2>
              }
            />
          </MenuItem>
        ) : (
          <MenuItem
            id="check_private_link"
            onClick={() => handleCheckPrivateLink(partner)}
            sx={{
              padding: '12px 16px',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 'auto', mr: 2 }}>
              <Image
                alt="Check Private Link"
                src="/icon/eye.svg"
                height={18}
                width={18}
                style={{
                  filter:
                    'brightness(0) saturate(100%) invert(37%) sepia(95%) saturate(2082%) hue-rotate(227deg) brightness(95%) contrast(90%)'
                }}
              />
            </ListItemIcon>
            <ListItemText
              primary={
                <Body2 color="text.primary" fontSize="14px" fontWeight="400">
                  Check Private Link
                </Body2>
              }
            />
          </MenuItem>
        )}
        <MenuItem
          id="transaction_list"
          onClick={() => handleTransactionList(partner)}
          sx={{
            padding: '12px 16px',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 'auto', mr: 2 }}>
            <Image
              alt="Transaction List"
              src="/icon/ticket.svg"
              height={18}
              width={18}
              style={{
                filter:
                  'brightness(0) saturate(100%) invert(37%) sepia(95%) saturate(2082%) hue-rotate(227deg) brightness(95%) contrast(90%)'
              }}
            />
          </ListItemIcon>
          <ListItemText
            primary={
              <Body2 color="text.primary" fontSize="14px" fontWeight="400">
                Transaction List
              </Body2>
            }
          />
        </MenuItem>
        <MenuItem
          id="edit_partner"
          onClick={() => handleEdit(partner)}
          sx={{
            padding: '12px 16px',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 'auto', mr: 2 }}>
            <Image
              alt="Edit Partner"
              src="/icon/edit.svg"
              height={18}
              width={18}
            />
          </ListItemIcon>
          <ListItemText
            primary={
              <Body2 color="text.primary" fontSize="14px" fontWeight="400">
                Edit Partner
              </Body2>
            }
          />
        </MenuItem>
      </Menu>
    </Box>
  );

  const pagination =
    partners.length > 0 ? (
      <Pagination
        total={total}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={(page) => onPageChange && onPageChange(page)}
        loading={loading}
      />
    ) : null;

  return (
    <>
      <StyledTableContainer sx={{ display: { xs: 'block', lg: 'none' } }}>
        <CollapsibleCardList
          items={partners}
          getKey={(partner) => partner.id}
          loading={loading}
          loadingMessage="Loading partners..."
          emptyMessage="No partner data available"
          renderTitle={(partner, index) =>
            `${index + 1 + currentPage * pageSize}. ${partner.partnerName}`
          }
          renderSubtitle={(partner) => partner.picName}
          renderTitleMeta={(partner) => (
            <Body2 color="primary.main" fontSize="12px" fontWeight={700}>
              {formatUtils.formatPrice(parseFloat(partner.totalRevenue))}
            </Body2>
          )}
          renderDetails={(partner) => [
            { label: 'Partner Name', value: partner.partnerName },
            { label: 'PIC Name', value: partner.picName },
            {
              label: 'Link Expired Date',
              value: partner.linkExpiredDate
                ? dateUtils.formatDateDDMMYYYY(partner.linkExpiredDate)
                : '-'
            },
            { label: 'PIC Phone Number', value: partner.picPhoneNumber },
            {
              label: 'Total Revenue',
              value: (
                <Body2 color="primary.main" fontSize="12px" fontWeight={700}>
                  {formatUtils.formatPrice(parseFloat(partner.totalRevenue))}
                </Body2>
              )
            },
            {
              label: 'Private Link',
              value: renderPrivateLink(partner)
            }
          ]}
          renderActions={renderActionCell}
        />
        {pagination}
      </StyledTableContainer>

      <StyledTableContainer
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiTable-root': {
            minWidth: { xs: '720px', md: '100%' }
          }
        }}
      >
        <Table>
          <StyledTableHead>
            <TableRow>
              <TableCell sx={{ width: '5%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  No
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '15%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Partner Name
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '15%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  PIC Name
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '12%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Link Expired Date
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '13%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  PIC Phone Number
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '12%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Total Revenue
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '13%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Private Link
                </Body2>
              </TableCell>
              <TableCell align="left" sx={{ width: '15%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Action
                </Body2>
              </TableCell>
            </TableRow>
          </StyledTableHead>
          <StyledTableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ padding: '40px' }}>
                  <Body2 color="text.secondary">Loading partners...</Body2>
                </TableCell>
              </TableRow>
            ) : partners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ padding: '40px' }}>
                  <Body2 color="text.secondary">
                    No partner data available
                  </Body2>
                </TableCell>
              </TableRow>
            ) : (
              partners.map((partner, index) => (
                <TableRow key={partner.id}>
                  <TableCell>
                    <Body2 color="text.primary" fontSize="14px">
                      {index + 1 + currentPage * pageSize}.
                    </Body2>
                  </TableCell>
                  <TableCell
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '15%'
                    }}
                  >
                    <Body2
                      color="text.primary"
                      fontSize="14px"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block'
                      }}
                    >
                      {partner.partnerName}
                    </Body2>
                  </TableCell>
                  <TableCell>
                    <Body2 color="text.primary" fontSize="14px">
                      {partner.picName}
                    </Body2>
                  </TableCell>
                  <TableCell>
                    <Body2 color="text.secondary" fontSize="14px">
                      {partner.linkExpiredDate
                        ? dateUtils.formatDateDDMMYYYY(partner.linkExpiredDate)
                        : '-'}
                    </Body2>
                  </TableCell>
                  <TableCell>
                    <Body2 color="text.primary" fontSize="14px">
                      {partner.picPhoneNumber}
                    </Body2>
                  </TableCell>
                  <TableCell>
                    <Body2
                      color="primary.main"
                      fontSize="14px"
                      fontWeight={700}
                    >
                      {formatUtils.formatPrice(
                        parseFloat(partner.totalRevenue)
                      )}
                    </Body2>
                  </TableCell>
                  <TableCell>
                    {partner.privateLink ? (
                      <Box alignItems="center" display="flex" gap={1}>
                        <Body2
                          color="text.primary"
                          fontSize="14px"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '200px'
                          }}
                        >
                          {partner.privateLink}
                        </Body2>
                        <IconButton
                          size="small"
                          sx={{
                            color: 'text.secondary',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                          onClick={() => {
                            navigator.clipboard.writeText(
                              partner.privateLink || ''
                            );
                          }}
                        >
                          <Image
                            alt="Copy"
                            height={16}
                            src="/icon/copy.svg"
                            width={16}
                          />
                        </IconButton>
                      </Box>
                    ) : (
                      <Body2 color="text.secondary" fontSize="14px">
                        -
                      </Body2>
                    )}
                  </TableCell>
                  <TableCell>{renderActionCell(partner)}</TableCell>
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

export default PartnerEventTable;
