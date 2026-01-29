import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Card, CardContent, Table, TableCell, TableRow, Menu, MenuItem, IconButton } from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { withAuth } from '@/components/Auth/withAuth';
import {
  Button,
  H2,
  H3,
  Body2,
  StyledTableContainer,
  StyledTableHead,
  StyledTableBody,
} from '@/components/common';
import { AddNewRecipientModal } from '@/components/features/events/invitation/add-recipient';
import { UploadCSVModal } from '@/components/features/events/invitation/upload-csv';
import { useToast } from '@/contexts/ToastContext';
import { useEventDetail } from '@/hooks/features/events/useEventDetail';
import DashboardLayout from '@/layouts/dashboard';
import { eventsService } from '@/services/events';
import { parseCSV } from '@/utils/csvParser';

interface RecipientData {
  id: number;
  recipientName: string;
  phoneNumber: string;
  email: string;
  ticketType: string;
  ticketTypeName: string;
  ticketQty: string;
}

// Utility function to format phone number from CSV
const formatPhoneNumberFromCSV = (phone: string): string => {
  if (!phone) return phone;
  
  const trimmedPhone = phone.trim();
  
  // If already starts with +, leave as is
  if (trimmedPhone.startsWith('+')) {
    return trimmedPhone;
  }
  
  // If starts with 0, replace with +62
  if (trimmedPhone.startsWith('0')) {
    return '+62' + trimmedPhone.substring(1);
  }
  
  // Otherwise, add +62 prefix
  return '+62' + trimmedPhone;
};

function CreateRecipientPage() {
  const router = useRouter();
  const { metaUrl } = router.query;
  const { eventDetail } = useEventDetail(metaUrl as string);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [recipients, setRecipients] = useState<RecipientData[]>([]);
  const { showSuccess, showError } = useToast();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeRowId, setActiveRowId] = useState<number | null>(null);
  const [editingRecipient, setEditingRecipient] = useState<RecipientData | undefined>(undefined);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: number) => {
    setAnchorEl(event.currentTarget);
    setActiveRowId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveRowId(null);
  };

  const handleDelete = () => {
    if (activeRowId) {
      setRecipients(recipients.filter(r => r.id !== activeRowId));
      handleMenuClose();
    }
  };

  const handleDuplicate = () => {
    if (activeRowId) {
      const recipientToDuplicate = recipients.find((r) => r.id === activeRowId);
      if (recipientToDuplicate) {
        const newRecipient = {
          ...recipientToDuplicate,
          id: Date.now(), // Temporary ID
        };
        setRecipients((prev) => [...prev, newRecipient]);
      }
      handleMenuClose();
    }
  };

  const handleEdit = () => {
    if (activeRowId) {
      const recipientToEdit = recipients.find((r) => r.id === activeRowId);
      if (recipientToEdit) {
        setEditingRecipient(recipientToEdit);
        setOpenAddModal(true);
      }
      handleMenuClose();
    }
  };

  const handleSaveRecipient = (data: RecipientData) => {
      // Find ticket type name
      const selectedTicket = eventDetail?.ticketTypes.find(t => t.id === data.ticketType);
      
      if (editingRecipient) {
        // Update existing
        setRecipients(prev => prev.map(r => r.id === editingRecipient.id ? {
            ...r,
            ...data,
            ticketTypeName: selectedTicket?.name || '-',
        } : r));
      } else {
        // Add new
        const newRecipient: RecipientData = {
            ...data,
            ticketTypeName: selectedTicket?.name || '-',
            id: Date.now()
        };
        setRecipients([...recipients, newRecipient]);
      }
      
      setOpenAddModal(false);
      setEditingRecipient(undefined);
  };

  const handleUploadCSV = async (file: File) => {
      setUploadLoading(true);
      try {
          const parsedData = await parseCSV(file);
          
          const newRecipients: RecipientData[] = parsedData.map((row) => {
              // Ticket Type Matching Logic
              const csvTicketName = row.ticketTypeName?.trim().toUpperCase();
              let matchedTicketId = '';
              let matchedTicketName = ''; // Default empty if no match
              let matchedTicketQty = row.ticketQty;

              if (csvTicketName && eventDetail?.ticketTypes) {
                  const match = eventDetail.ticketTypes.find(
                      t => t.name.toUpperCase() === csvTicketName
                  );
                  if (match) {
                      matchedTicketId = match.id;
                      matchedTicketName = match.name;
                      
                      // Check quantity limit
                      const csvQty = parseInt(row.ticketQty, 10);
                      if (!isNaN(csvQty) && csvQty > match.quantity) {
                          matchedTicketQty = ''; // Leave empty if exceeds limit
                      }
                  } else {
                      matchedTicketQty = ''; 
                  }
              } else {
                  matchedTicketQty = '';
              }

              return {
                  id: Date.now() + Math.random(),
                  recipientName: row.name,
                  phoneNumber: formatPhoneNumberFromCSV(row.phone),
                  email: row.email,
                  ticketType: matchedTicketId,
                  ticketTypeName: matchedTicketName || '-',
                  ticketQty: matchedTicketQty
              };
          });

          setRecipients(prev => [...prev, ...newRecipients]);
          setOpenUploadModal(false);
          showSuccess('CSV uploaded successfully');
      } catch (error) {
          console.error('Failed to parse CSV', error);
          showError('Failed to parse CSV file');
      } finally {
          setUploadLoading(false);
      }
  };

  const handleSendInvitation = async () => {
      // Validation
      const invalidRecipients = recipients.filter(r => !r.ticketType || !r.ticketQty);
      if (invalidRecipients.length > 0) {
          showError(`Please fix ${invalidRecipients.length} recipients with missing Ticket Type or Quantity.`);
          return;
      }

      if (!eventDetail?.id) {
        showError('Event ID not found');
        return;
      }
      
      setSending(true);
      try {
        const payload = {
          invitations: recipients.map(r => ({
            name: r.recipientName,
            email: r.email,
            phone_number: r.phoneNumber,
            ticket_qty: parseInt(r.ticketQty, 10),
            ticket_type_id: r.ticketType
          }))
        };

        await eventsService.sendInvitations(eventDetail.id, payload);
        
        showSuccess('Invitations sent successfully');
        router.push(`/events/${metaUrl}/invitation`);
      } catch (error) {
        console.error('Failed to send invitations', error);
        showError('Failed to send invitations');
      } finally {
        setSending(false);
      }
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Recipient List - Black Hole Dashboard</title>
      </Head>

      <Box>
        {/* Back Button */}
        <Box 
          mb={2} 
          display="flex" 
          alignItems="center" 
          sx={{ cursor: 'pointer', width: 'fit-content' }}
          onClick={() => router.push(`/events/${metaUrl}/invitation`)}
        >
          <ArrowBackIcon sx={{ fontSize: 24, mr: 1, color: 'primary.main' }} />
          <Body2 color="text.secondary">Back To Invitation List</Body2>
        </Box>

        {/* Header */}
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          mb={3}
        >
          <H2 color="text.primary" fontWeight={700}>
            Recipient List
          </H2>
            
            <Button
                variant="secondary"
                onClick={() => setOpenUploadModal(true)}
            >
                Upload CSV
            </Button>
        </Box>


        {/* Recipient List Card */}
        <Card sx={{ backgroundColor: 'common.white', borderRadius: 0 }}>
          <CardContent sx={{ padding: '24px' }}>
            <H3 mb={3} fontWeight={700}>List Invitation</H3>
            
            <StyledTableContainer>
              <Table>
                <StyledTableHead>
                  <TableRow>
                     <TableCell sx={{ width: '60px' }}><Body2 color="text.secondary" fontWeight={600}>No</Body2></TableCell>
                     <TableCell sx={{ width: '20%' }}><Body2 color="text.secondary" fontWeight={600}>Full Name</Body2></TableCell>
                     <TableCell sx={{ width: '15%' }}><Body2 color="text.secondary" fontWeight={600}>No Telp</Body2></TableCell>
                     <TableCell sx={{ width: '30%' }}><Body2 color="text.secondary" fontWeight={600}>Email</Body2></TableCell>
                     <TableCell sx={{ width: '15%' }}><Body2 color="text.secondary" fontWeight={600}>Ticket Type</Body2></TableCell>
                     <TableCell sx={{ width: '10%' }}><Body2 color="text.secondary" fontWeight={600}>Qty</Body2></TableCell>
                     <TableCell sx={{ width: '10%' }}><Body2 color="text.secondary" fontWeight={600}>Action</Body2></TableCell>
                  </TableRow>
                </StyledTableHead>
                <StyledTableBody>
                   {recipients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ textAlign: 'center', py: 5, border: 'none' }}>
                            <Body2 color="text.secondary">No recipients added yet.</Body2>
                        </TableCell>
                      </TableRow>
                   ) : (
                       recipients.map((recipient, index) => (
                           <TableRow key={recipient.id}>
                               <TableCell><Body2>{index + 1}</Body2></TableCell>
                               <TableCell><Body2>{recipient.recipientName}</Body2></TableCell>
                               <TableCell><Body2>{recipient.phoneNumber}</Body2></TableCell>
                               <TableCell><Body2>{recipient.email}</Body2></TableCell>
                               <TableCell><Body2>{recipient.ticketTypeName}</Body2></TableCell>
                               <TableCell><Body2>{recipient.ticketQty}</Body2></TableCell>
                               <TableCell>
                                  <IconButton onClick={(e) => handleMenuOpen(e, recipient.id)}>
                                    <Image src="/icon/options.svg" alt="options" width={24} height={24} />
                                  </IconButton>
                               </TableCell>
                           </TableRow>
                       ))
                   )}
                </StyledTableBody>
              </Table>
            </StyledTableContainer>

            <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
                <Button
                    variant="secondary"
                    onClick={() => {
                      setEditingRecipient(undefined);
                      setOpenAddModal(true);
                    }}
                    sx={{ width: 'fit-content' }}
                >
                    Add New Recipient
                </Button>
                <Button
                    onClick={handleSendInvitation}
                    disabled={recipients.length === 0 || sending}
                    sx={{ width: 'fit-content' }}
                >
                    {sending ? 'Sending...' : 'Send Invitation'}
                </Button>
            </Box>

          </CardContent>
        </Card>
      </Box>

      {/* Menu Action */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            marginTop: '8px',
            minWidth: '180px'
          }
        }}
      >
        <MenuItem onClick={handleEdit} sx={{ gap: 1.5, py: 1.5 }}>
          <Image src="/icon/edit.svg" alt="edit" width={20} height={20} />
          <Body2 color="primary.main">Edit</Body2>
        </MenuItem>
        <MenuItem onClick={handleDuplicate} sx={{ gap: 1.5, py: 1.5 }}>
          <Image src="/icon/copy.svg" alt="duplicate" width={20} height={20} />
          <Body2 color="primary.main">Duplicate</Body2>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ gap: 1.5, py: 1.5 }}>
          <Image src="/icon/trash.svg" alt="delete" width={20} height={20} />
          <Body2 color="error.main">Delete</Body2>
        </MenuItem>
      </Menu>

      <AddNewRecipientModal 
        open={openAddModal} 
        onClose={() => setOpenAddModal(false)}
        onSubmit={handleSaveRecipient}
        ticketTypes={eventDetail?.ticketTypes || []}
        defaultValues={editingRecipient ? {
            recipientName: editingRecipient.recipientName,
            email: editingRecipient.email,
            phoneNumber: editingRecipient.phoneNumber,
            ticketType: editingRecipient.ticketType,
            ticketQty: editingRecipient.ticketQty,
        } : undefined}
      />
      
      <UploadCSVModal
        open={openUploadModal}
        onClose={() => setOpenUploadModal(false)}
        onUpload={handleUploadCSV}
        loading={uploadLoading}
      />
    </DashboardLayout>
  );
}

export default withAuth(CreateRecipientPage, { requireAuth: true });
