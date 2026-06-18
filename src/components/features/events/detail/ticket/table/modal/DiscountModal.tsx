import { Box, Grid, Alert } from '@mui/material';
import { FC, useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import {
  Button,
  Modal,
  TextField,
  TextArea,
  Select,
  DateField,
  TimeField,
  Body2,
  Caption
} from '@/components/common';
import { Discount } from '@/services/discounts';
import { dateUtils, formatPrice } from '@/utils';

import { StatusBadge } from '../../../../status-badge';

interface DiscountModalProps {
  open: boolean;
  onClose: () => void;
  ticket: any; // ticket object containing id, name, price, etc.
  discount: Discount | null;
  sessionRole?: string;
  onSave: (data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onApproveReject: (id: string, status: 'approved' | 'rejected', reason?: string) => Promise<void>;
  loading?: boolean;
  eventStatus?: string;
  approvalMode?: boolean;
}

interface DiscountFormData {
  name: string;
  description: string;
  type: 'percentage' | 'nominal';
  value: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
}

export const DiscountModal: FC<DiscountModalProps> = ({
  open,
  onClose,
  ticket,
  discount,
  sessionRole,
  onSave,
  onDelete,
  onApproveReject,
  loading = false,
  eventStatus,
  approvalMode = false
}) => {
  const [rejectReasonOpen, setRejectReasonOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const isPrivileged = sessionRole === 'admin' || sessionRole === 'business_development';
  const hasExistingDiscount = !!discount;

  // Non-privileged user can edit/delete if:
  // 1. There is no existing discount (creating a new one)
  // 2. Or they are privileged (admin/BD)
  // 3. Or the event is in 'draft' or 'approved' status (upcoming)
  // 4. Or the discount status is NOT 'approved' (i.e. 'pending' or 'rejected')
  const canEdit =
    !approvalMode && (
      !hasExistingDiscount ||
      isPrivileged ||
      eventStatus === 'draft' ||
      eventStatus === 'approved' ||
      discount?.status !== 'approved'
    );

  // Parse ISO date-time into local date/time parts for the inputs
  const parseIsoToParts = (isoString?: string) => {
    if (!isoString) return { date: '', time: '00:00', timeZone: '+07:00' };
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return { date: '', time: '00:00', timeZone: '+07:00' };

    // Format to parts in WIB for consistent display
    const tzParts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).formatToParts(d);

    const year = tzParts.find((p) => p.type === 'year')?.value || '';
    const month = tzParts.find((p) => p.type === 'month')?.value || '';
    const day = tzParts.find((p) => p.type === 'day')?.value || '';
    const hour = tzParts.find((p) => p.type === 'hour')?.value?.padStart(2, '0') || '00';
    const minute = tzParts.find((p) => p.type === 'minute')?.value?.padStart(2, '0') || '00';

    return {
      date: `${year}-${month}-${day}`,
      time: `${hour}:${minute}`,
      timeZone: '+07:00'
    };
  };

  const startParts = parseIsoToParts(discount?.start_date);
  const endParts = parseIsoToParts(discount?.end_date);

  const methods = useForm<DiscountFormData>({
    defaultValues: {
      name: '',
      description: '',
      type: 'percentage',
      value: '',
      startDate: '',
      startTime: '00:00',
      endDate: '',
      endTime: '23:59'
    }
  });

  const { watch, handleSubmit, reset } = methods;

  // Reset form when modal opens or discount changes
  useEffect(() => {
    if (open) {
      setRejectReasonOpen(false);
      setRejectReason('');
      if (discount) {
        reset({
          name: discount.name,
          description: discount.description || '',
          type: discount.value <= 100 ? 'percentage' : 'nominal',
          value: discount.value.toString(),
          startDate: startParts.date,
          startTime: startParts.time,
          endDate: endParts.date,
          endTime: endParts.time
        });
      } else {
        reset({
          name: '',
          description: '',
          type: 'percentage',
          value: '',
          startDate: '',
          startTime: '00:00',
          endDate: '',
          endTime: '23:59'
        });
      }
    }
  }, [open, discount, reset]);

  const watchedType = watch('type');
  const watchedValue = watch('value');

  // Dynamic preview calculation
  const getDiscountPreview = () => {
    if (!ticket?.price || !watchedValue) return null;
    const valueNum = parseFloat(watchedValue);
    if (isNaN(valueNum) || valueNum <= 0) return null;

    let discountAmount = 0;
    if (watchedType === 'percentage') {
      if (valueNum > 100) return 'Percentage value must not exceed 100%';
      discountAmount = (ticket.price * valueNum) / 100;
    } else {
      if (valueNum <= 100) return 'Nominal value must be greater than 100';
      if (valueNum > ticket.price) return 'Discount value must not exceed the ticket price';
      discountAmount = valueNum;
    }

    const discountedPrice = Math.max(0, ticket.price - discountAmount);
    return `Original Price: ${formatPrice(ticket.price)} → Discounted Price: ${formatPrice(discountedPrice)} (Saved ${formatPrice(discountAmount)})`;
  };

  const previewText = getDiscountPreview();
  const isPreviewError = previewText && !previewText.startsWith('Original');

  const onSubmitForm = async (data: DiscountFormData) => {
    setActionLoading(true);
    try {
      if (!data.value && (eventStatus === 'draft' || eventStatus === 'approved')) {
        if (discount) {
          await onDelete(discount.id);
        }
        onClose();
        return;
      }

      const val = parseFloat(data.value);

      // Perform validation check
      if (data.type === 'percentage' && val > 100) {
        alert('Percentage value must not exceed 100%');
        return;
      }
      if (data.type === 'nominal' && val <= 100) {
        alert('Nominal value must be greater than 100');
        return;
      }

      const startISO = dateUtils.formatDateISO({
        date: data.startDate,
        time: data.startTime,
        timeZone: '+07:00'
      });
      const endISO = dateUtils.formatDateISO({
        date: data.endDate,
        time: data.endTime,
        timeZone: '+07:00'
      });

      await onSave({
        ticket_type_id: ticket.id,
        name: data.name,
        description: data.description,
        value: val,
        start_date: startISO,
        end_date: endISO
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!discount) return;
    setActionLoading(true);
    try {
      await onApproveReject(discount.id, 'approved');
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!discount) return;
    if (!rejectReason.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }
    setActionLoading(true);
    try {
      await onApproveReject(discount.id, 'rejected', rejectReason.trim());
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!discount) return;
    if (confirm('Are you sure you want to delete this discount?')) {
      setActionLoading(true);
      try {
        await onDelete(discount.id);
        onClose();
      } catch (error) {
        console.error(error);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const renderFooter = () => {
    // If reject reason form is open for reviewer
    if (isPrivileged && hasExistingDiscount && discount?.status === 'pending' && rejectReasonOpen) {
      return (
        <Box display="flex" justifyContent="flex-end" gap={2} width="100%">
          <Button variant="secondary" onClick={() => setRejectReasonOpen(false)}>
            Cancel Rejection
          </Button>
          <Button
            variant="primary"
            disabled={actionLoading || loading}
            onClick={handleReject}
            sx={{
              backgroundColor: 'error.main',
              '&:hover': { backgroundColor: 'error.dark' }
            }}
          >
            Confirm Reject
          </Button>
        </Box>
      );
    }

    // Normal footer layout
    return (
      <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
        <Box>
          {hasExistingDiscount && canEdit && (
            <Button
              variant="secondary"
              disabled={actionLoading || loading}
              onClick={handleDelete}
              sx={{
                color: 'error.main',
                borderColor: 'error.main',
                '&:hover': { backgroundColor: 'error.light' }
              }}
            >
              Delete Discount
            </Button>
          )}
        </Box>

        <Box display="flex" gap={2}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          {/* Privileged reviewer controls (Approve/Reject buttons) */}
          {isPrivileged && hasExistingDiscount && discount?.status === 'pending' && (
            <>
              <Button
                variant="secondary"
                disabled={actionLoading || loading}
                onClick={() => setRejectReasonOpen(true)}
              >
                Reject Discount
              </Button>
              <Button
                variant="primary"
                disabled={actionLoading || loading}
                onClick={handleApprove}
              >
                Approve Discount
              </Button>
            </>
          )}

          {/* Standard Save Discount button for editors */}
          {canEdit && (
            <Button
              type="submit"
              form="discount-form"
              variant="primary"
              disabled={actionLoading || loading || isPreviewError}
            >
              {actionLoading || loading ? 'Saving...' : 'Save Discount'}
            </Button>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Modal
      open={open}
      title={hasExistingDiscount ? `Discount for ${ticket?.name}` : `Create Discount for ${ticket?.name}`}
      onClose={onClose}
      width={680}
      height={700}
      footer={renderFooter()}
    >
      <FormProvider {...methods}>
        <form id="discount-form" onSubmit={handleSubmit(onSubmitForm)}>
          <Box display="flex" flexDirection="column" gap={3}>

            {/* Status Information */}
            {hasExistingDiscount && (
              <Box display="flex" flexDirection="column" gap={2} width="100%">
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  p={2}
                  sx={{ backgroundColor: 'grey.50', borderRadius: 1, width: '100%' }}
                >
                  <Body2 color="text.secondary" fontSize="13px" fontWeight={500}>
                    Current Discount Status
                  </Body2>
                  <StatusBadge status={discount.status} displayName={discount.status} />
                </Box>
                {discount.status === 'rejected' && discount.rejected_reason && (
                  <Box p={2} sx={{ backgroundColor: 'error.light', borderRadius: 1, borderLeft: '4px solid', borderLeftColor: 'error.main' }}>
                    <Caption color="error.main" fontWeight={600}>Rejection Reason:</Caption>
                    <Body2 color="text.primary" fontSize="13px" mt={0.5}>{discount.rejected_reason}</Body2>
                  </Box>
                )}
              </Box>
            )}

            {/* Main Form Fields */}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Discount Name"
                  name="name"
                  placeholder="e.g. Early Bird"
                  disabled={!canEdit}
                  rules={{ required: 'Discount name is required' }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextArea
                  fullWidth
                  label="Description"
                  name="description"
                  placeholder="e.g. Discount for early ticket buyers"
                  disabled={!canEdit}
                  rows={2}
                />
              </Grid>

              <Grid item md={6} xs={12}>
                <Select
                  fullWidth
                  label="Discount Option"
                  name="type"
                  disabled={!canEdit}
                  options={[
                    { value: 'percentage', label: 'Percentage (%)' },
                    { value: 'nominal', label: 'Nominal (Rp)' }
                  ]}
                  rules={{ required: 'Discount option is required' }}
                />
              </Grid>

              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Discount Value"
                  name="value"
                  placeholder={watchedType === 'percentage' ? 'e.g. 20' : 'e.g. 25000'}
                  disabled={!canEdit}
                  type="number"
                  rules={
                    (eventStatus === 'draft' || eventStatus === 'approved')
                      ? undefined
                      : { required: 'Discount value is required' }
                  }
                />
              </Grid>

              {/* Price Preview */}
              {previewText && (
                <Grid item xs={12}>
                  <Alert severity={isPreviewError ? 'error' : 'info'} sx={{ fontWeight: 500 }}>
                    {previewText}
                  </Alert>
                </Grid>
              )}

              {/* Start Date & Time */}
              <Grid item xs={12}>
                <Body2 color="text.primary" fontWeight={600}>Discount Start Time</Body2>
              </Grid>

              <Grid item md={8} xs={12}>
                <DateField
                  fullWidth
                  label="Start Date"
                  name="startDate"
                  placeholder="YYYY-MM-DD"
                  disabled={!canEdit}
                  rules={{ required: 'Start date is required' }}
                />
              </Grid>

              <Grid item md={4} xs={12}>
                <TimeField
                  label="Time"
                  name="startTime"
                  placeholder="00:00"
                  disabled={!canEdit}
                  rules={{ required: 'Start time is required' }}
                />
              </Grid>

              {/* End Date & Time */}
              <Grid item xs={12}>
                <Body2 color="text.primary" fontWeight={600}>Discount End Time</Body2>
              </Grid>

              <Grid item md={8} xs={12}>
                <DateField
                  fullWidth
                  label="End Date"
                  name="endDate"
                  placeholder="YYYY-MM-DD"
                  disabled={!canEdit}
                  rules={{ required: 'End date is required' }}
                />
              </Grid>

              <Grid item md={4} xs={12}>
                <TimeField
                  label="Time"
                  name="endTime"
                  placeholder="23:59"
                  disabled={!canEdit}
                  rules={{ required: 'End time is required' }}
                />
              </Grid>
            </Grid>

            {/* Privileged Approval Rejection Input - in content body */}
            {isPrivileged && hasExistingDiscount && discount.status === 'pending' && rejectReasonOpen && (
              <Box borderTop="1px solid" borderColor="divider" pt={3} display="flex" flexDirection="column" gap={2}>
                <Body2 color="text.primary" fontWeight={600}>Review Pending Discount</Body2>
                <TextArea
                  fullWidth
                  label="Rejection Reason"
                  placeholder="Explain why this discount is rejected..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={2}
                />
              </Box>
            )}
          </Box>
        </form>
      </FormProvider>
    </Modal>
  );
};
