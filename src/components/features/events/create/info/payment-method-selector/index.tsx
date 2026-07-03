import { ErrorOutline } from '@mui/icons-material';
import {
  Box,
  Grid,
  InputAdornment,
  Switch,
  FormControlLabel
} from '@mui/material';
import Image from 'next/image';
import { useState, useRef } from 'react';
import { Controller, useFormContext, RegisterOptions } from 'react-hook-form';

import {
  Body2,
  Accordion,
  Checkbox,
  Modal,
  Button,
  Caption
} from '@/components/common';
import { StyledTextField } from '@/components/common/text-field/StyledTextField';

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  logo: string;
  bankId: string;
  requestType: string;
  paymentCode: string;
  paymentMethodFee: number;
  channelProperties: Record<string, any>;
  rules: string[];
  bank: {
    id: string;
    name: string;
    channelCode: string;
    channelType: string;
    minAmount: number;
    maxAmount: number;
  };
}

interface PaymentMethodSelectorProps {
  label?: string;
  name: string;
  rules?: RegisterOptions;
  groupedPaymentMethods: Record<string, PaymentMethod[]>;
  placeholder?: string;
  fullWidth?: boolean;
  isRejected?: boolean;
  id?: string;
  disabled?: boolean;
}

const LogoImage = ({
  src,
  alt,
  height,
  width,
  style
}: {
  src: string;
  alt: string;
  height: number;
  width: number;
  style?: React.CSSProperties;
}) => {
  const [error, setError] = useState(false);
  if (error || !src) return null;
  return (
    <img
      alt={alt}
      height={height}
      src={src}
      style={{ ...style, objectFit: 'contain' }}
      width={width}
      onError={() => setError(true)}
    />
  );
};

const IN_SYSTEM_PAYMENT_CODES = [
  'BCA_VIRTUAL_ACCOUNT',
  'MANDIRI_VIRTUAL_ACCOUNT',
  'BNI_VIRTUAL_ACCOUNT',
  'BRI_VIRTUAL_ACCOUNT',
  'PERMATA_VIRTUAL_ACCOUNT',
  'CIMB_VIRTUAL_ACCOUNT',
  'QRIS',
  'FREE'
];

export const PaymentMethodSelector = ({
  label,
  name,
  rules,
  groupedPaymentMethods,
  placeholder,
  fullWidth,
  isRejected,
  id,
  disabled = false
}: PaymentMethodSelectorProps) => {
  const {
    control,
    formState: { errors }
  } = useFormContext();
  const fieldError = errors[name];
  const [expanded, setExpanded] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [initialSelectedIds, setInitialSelectedIds] = useState<string[]>([]);

  const isSelectionChanged = (current: string[], initial: string[]) => {
    if (current.length !== initial.length) return true;
    const sortedCurrent = [...current].sort();
    const sortedInitial = [...initial].sort();
    for (let i = 0; i < sortedCurrent.length; i++) {
      if (sortedCurrent[i] !== sortedInitial[i]) return true;
    }
    return false;
  };

  // Get all payment methods from grouped data for selected options
  const allPaymentMethods = Object.values(groupedPaymentMethods).flat();

  const getSelectedOptions = (value: string[]) => {
    if (!value || value.length === 0) return '';
    const selectedOptions = allPaymentMethods.filter((method) =>
      value.includes(method.id)
    );
    const hasPaymentLink = selectedOptions.some(
      (m) => m.type === 'payment_link'
    );
    if (hasPaymentLink) {
      return 'Payment Link';
    }
    return selectedOptions
      .filter((m) => m.type === 'va' || m.type === 'qris' || m.type === 'free')
      .map((method) => method.bank?.channelCode || method.name)
      .join(', ');
  };

  // Map payment method type to id locator
  const getPaymentMethodId = (type: string): string => {
    const typeMapping: Record<string, string> = {
      'Virtual Account': 'va',
      QRIS: 'qris',
      'Payment Link': 'payment_link',
      Free: 'free'
    };
    return `${typeMapping[type] || type.toLowerCase().replace(/\s+/g, '_')}_payment_method`;
  };

  // Get checkbox id locator for payment method
  const getCheckboxId = (method: PaymentMethod): string => {
    const paymentMethodName = method.bank
      ? method.bank.channelCode.toLowerCase()
      : method.name.toLowerCase().replace(/\s+/g, '_');
    return `${paymentMethodName}_payment_method_checkbox`;
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Box ref={containerRef} position="relative">
          {label && (
            <Body2
              color="text.primary"
              sx={{
                mb: 1,
                display: isRejected ? 'flex' : 'block',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              {label}
              {isRejected && <ErrorOutline fontSize="small" color="error" />}
            </Body2>
          )}

          <StyledTextField
            error={!!fieldError}
            fullWidth={fullWidth}
            helperText={fieldError?.message as string}
            id={id}
            disabled={disabled}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <Box
                    alignItems="center"
                    component="span"
                    display="flex"
                    paddingY={1}
                    sx={{ cursor: 'pointer' }}
                  >
                    <Image
                      alt="dropdown"
                      height={16}
                      src="/icon/accordion-arrow.svg"
                      style={{
                        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                      }}
                      width={16}
                    />
                  </Box>
                </InputAdornment>
              )
            }}
            placeholder={placeholder}
            sx={{ cursor: 'pointer' }}
            value={getSelectedOptions(field.value || [])}
            variant="outlined"
            onClick={() => {
              if (disabled) return;
              if (!expanded) {
                setInitialSelectedIds(field.value || []);
              }
              setExpanded(!expanded);
            }}
          />

          {/* Modal selection pop-up */}
          <Modal
            open={expanded}
            onClose={() => {
              setExpanded(false);
              setActiveAccordion(null);
            }}
            title="Payment Method Selection"
            width={550}
            height="auto"
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                maxHeight: '75vh',
                overflowY: 'auto',
                p: 0.5
              }}
            >
              {/* Selected Payment Methods Preview Display */}
              {(() => {
                const selectedIds = field.value || [];
                const selectedOptions = allPaymentMethods.filter((method) =>
                  selectedIds.includes(method.id)
                );
                const paymentLinkMethod = allPaymentMethods.find(
                  (m) => m.type === 'payment_link'
                );
                const hasPaymentLinkSelected = paymentLinkMethod
                  ? selectedIds.includes(paymentLinkMethod.id)
                  : false;

                if (selectedIds.length === 0) {
                  return (
                    <Box
                      sx={{
                        mb: 1,
                        p: 1.5,
                        border: '1px dashed',
                        borderColor: 'divider',
                        borderRadius: 1,
                        backgroundColor: 'action.hover'
                      }}
                    >
                      <Body2
                        color="text.secondary"
                        fontSize="12px"
                        sx={{ fontStyle: 'italic' }}
                      >
                        No payment methods selected yet.
                      </Body2>
                    </Box>
                  );
                }

                if (hasPaymentLinkSelected) {
                  const subMethods = selectedOptions.filter(
                    (m) => m.type !== 'payment_link'
                  );
                  return (
                    <Box
                      sx={{
                        mb: 1,
                        p: 2,
                        border: '1px solid',
                        borderColor: 'primary.main',
                        borderRadius: 1,
                        backgroundColor: 'primary.light'
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: subMethods.length > 0 ? 1.5 : 0
                        }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: 'success.main'
                          }}
                        />
                        <Body2
                          color="text.primary"
                          fontSize="12px"
                          fontWeight={600}
                        >
                          Payment Link (Redirect to Xendit Checkout)
                        </Body2>
                      </Box>
                      {subMethods.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {subMethods.map((sub) => (
                            <Box
                              key={sub.id}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: 'background.paper',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: '16px',
                                px: 1.5,
                                py: 0.5,
                                gap: 0.5
                              }}
                            >
                              {sub.logo && (
                                <LogoImage
                                  alt={sub.name}
                                  height={12}
                                  src={sub.logo}
                                  width={20}
                                />
                              )}
                              <Body2 color="text.primary" fontSize="11px">
                                {sub.bank ? sub.bank.channelCode : sub.name}
                              </Body2>
                              <Box
                                component="span"
                                sx={{
                                  ml: 0.5,
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                  color: 'text.secondary',
                                  '&:hover': { color: 'error.main' }
                                }}
                                onClick={() => {
                                  const nextValue = selectedIds.filter(
                                    (id) => id !== sub.id
                                  );
                                  field.onChange(nextValue);
                                }}
                              >
                                ×
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Body2
                          color="text.secondary"
                          fontSize="11px"
                          sx={{ fontStyle: 'italic' }}
                        >
                          All payment methods will be enabled in Xendit
                          Checkout.
                        </Body2>
                      )}
                    </Box>
                  );
                }

                return (
                  <Box
                    sx={{
                      mb: 1,
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      backgroundColor: 'action.hover'
                    }}
                  >
                    <Caption
                      color="text.secondary"
                      fontWeight={400}
                      sx={{
                        mb: 1,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Selected Payment Methods:
                    </Caption>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedOptions.map((opt) => (
                        <Box
                          key={opt.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: '16px',
                            px: 1.5,
                            py: 0.5,
                            gap: 0.5
                          }}
                        >
                          {opt.logo && opt.type !== 'free' && (
                            <LogoImage
                              alt={opt.name}
                              height={12}
                              src={opt.logo}
                              width={20}
                            />
                          )}
                          <Body2 color="text.primary" fontSize="11px">
                            {opt.bank
                              ? `Bank ${opt.bank.channelCode}`
                              : opt.name}
                          </Body2>
                          <Box
                            component="span"
                            sx={{
                              ml: 0.5,
                              cursor: 'pointer',
                              fontSize: '11px',
                              color: 'text.secondary',
                              '&:hover': { color: 'error.main' }
                            }}
                            onClick={() => {
                              const nextValue = selectedIds.filter(
                                (id) => id !== opt.id
                              );
                              field.onChange(nextValue);
                            }}
                          >
                            ×
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                );
              })()}

              {Object.entries(groupedPaymentMethods)
                .filter(([type]) =>
                  ['Virtual Account', 'QRIS', 'Payment Link', 'Free'].includes(
                    type
                  )
                )
                .map(([type, methods]) => {
                  const isVaOrQris =
                    type === 'Virtual Account' || type === 'QRIS';
                  const isPaymentLink = type === 'Payment Link';

                  const selectedIds = field.value || [];
                  const paymentLinkMethod =
                    groupedPaymentMethods['Payment Link']?.[0];
                  const hasPaymentLinkSelected = paymentLinkMethod
                    ? selectedIds.includes(paymentLinkMethod.id)
                    : false;

                  const allVaQrisIds = [
                    ...(groupedPaymentMethods['Virtual Account'] || []),
                    ...(groupedPaymentMethods['QRIS'] || [])
                  ].map((m) => m.id);

                  const hasVaOrQrisSelected =
                    !hasPaymentLinkSelected &&
                    selectedIds.some((id) => allVaQrisIds.includes(id));
                  const isGroupDisabled =
                    (isVaOrQris && hasPaymentLinkSelected) ||
                    (isPaymentLink && hasVaOrQrisSelected);

                  const allSubMethods = Object.entries(groupedPaymentMethods)
                    .filter(
                      ([tType]) => tType !== 'Payment Link' && tType !== 'Free'
                    )
                    .flatMap(([_, tMethods]) => tMethods);
                  const allSubMethodIds = allSubMethods.map((m) => m.id);
                  const nonInSystemSubMethodIds = allSubMethods
                    .filter(
                      (m) => !IN_SYSTEM_PAYMENT_CODES.includes(m.paymentCode)
                    )
                    .map((m) => m.id);

                  const filteredMethods = isVaOrQris
                    ? methods.filter((m) =>
                        IN_SYSTEM_PAYMENT_CODES.includes(m.paymentCode)
                      )
                    : methods;
                  if (isPaymentLink) {
                    const paymentLinkMethod = methods[0];
                    const isChecked = selectedIds.includes(
                      paymentLinkMethod.id
                    );

                    const groupedSubMethods: Record<
                      string,
                      typeof allSubMethods
                    > = {};
                    allSubMethods.forEach((subMethod) => {
                      let catName = 'Other';
                      if (subMethod.type === 'card')
                        catName = 'Credit/Debit Card';
                      else if (subMethod.type === 'ewallet')
                        catName = 'E-Wallet';
                      else if (subMethod.type === 'va')
                        catName = 'Virtual Account';
                      else if (subMethod.type === 'retail')
                        catName = 'Retail Outlets';
                      else if (subMethod.type === 'paylater')
                        catName = 'PayLater';

                      if (!groupedSubMethods[catName]) {
                        groupedSubMethods[catName] = [];
                      }
                      groupedSubMethods[catName].push(subMethod);
                    });

                    return (
                      <Accordion
                        key={type}
                        title={type}
                        id={getPaymentMethodId(type)}
                        disabled={isGroupDisabled}
                        expanded={activeAccordion === type}
                        onChange={(_, isExpanded) => setActiveAccordion(isExpanded ? type : null)}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            pt: 1
                          }}
                        >
                          <FormControlLabel
                            control={
                              <Switch
                                checked={isChecked}
                                disabled={isGroupDisabled}
                                size="small"
                                onChange={(e) => {
                                  let newValue = e.target.checked
                                    ? [...selectedIds, paymentLinkMethod.id]
                                    : selectedIds.filter(
                                        (id: string) =>
                                          id !== paymentLinkMethod.id
                                      );

                                  if (e.target.checked) {
                                    // Clear all VA or QRIS from top-level selection since they are conflicting
                                    const vaQrisIds = [
                                      ...(groupedPaymentMethods[
                                        'Virtual Account'
                                      ] || []),
                                      ...(groupedPaymentMethods['QRIS'] || [])
                                    ].map((m) => m.id);
                                    newValue = newValue.filter(
                                      (id: string) => !vaQrisIds.includes(id)
                                    );
                                  } else {
                                    newValue = newValue.filter(
                                      (id: string) =>
                                        !allSubMethodIds.includes(id)
                                    );
                                  }
                                  field.onChange(newValue);
                                }}
                              />
                            }
                            label={
                              <Body2
                                color="text.primary"
                                fontSize="12px"
                                fontWeight={600}
                              >
                                Enable Payment Link (Redirect to Xendit
                                Checkout)
                              </Body2>
                            }
                          />

                          {isChecked && (
                            <Box
                              sx={{
                                pl: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2.5,
                                mt: 1
                              }}
                            >
                              <Body2 color="text.secondary" fontSize="11px">
                                Select payment methods to enable in Xendit
                                Checkout (leave empty to show all):
                              </Body2>
                              {Object.entries(groupedSubMethods).map(
                                ([categoryName, subItems]) => (
                                  <Box key={categoryName}>
                                    <Body2
                                      color="text.secondary"
                                      fontSize="11px"
                                      fontWeight={600}
                                      sx={{
                                        mb: 1,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                      }}
                                    >
                                      {categoryName}
                                    </Body2>
                                    <Grid container spacing={1.5}>
                                      {subItems.map((subMethod) => {
                                        const isSubChecked =
                                          selectedIds.includes(subMethod.id);
                                        return (
                                          <Grid key={subMethod.id} item xs={6}>
                                            <Checkbox
                                              id={`sub_${getCheckboxId(subMethod)}`}
                                              checked={isSubChecked}
                                              label={
                                                <Box
                                                  alignItems="center"
                                                  display="flex"
                                                >
                                                  {subMethod.logo && (
                                                    <LogoImage
                                                      alt={subMethod.name}
                                                      height={18}
                                                      src={subMethod.logo}
                                                      style={{
                                                        marginRight: '8px'
                                                      }}
                                                      width={30}
                                                    />
                                                  )}
                                                  <Body2
                                                    color="text.primary"
                                                    fontSize="11px"
                                                  >
                                                    {subMethod.bank
                                                      ? subMethod.bank
                                                          .channelCode
                                                      : subMethod.name}
                                                  </Body2>
                                                </Box>
                                              }
                                              size="small"
                                              onChange={(e) => {
                                                const nextValue = e.target
                                                  .checked
                                                  ? [
                                                      ...selectedIds,
                                                      subMethod.id
                                                    ]
                                                  : selectedIds.filter(
                                                      (id: string) =>
                                                        id !== subMethod.id
                                                    );
                                                field.onChange(nextValue);
                                              }}
                                            />
                                          </Grid>
                                        );
                                      })}
                                    </Grid>
                                  </Box>
                                )
                              )}
                            </Box>
                          )}
                        </Box>
                      </Accordion>
                    );
                  }

                  return (
                    <Accordion
                      key={type}
                      title={type}
                      id={getPaymentMethodId(type)}
                      disabled={isGroupDisabled}
                      expanded={activeAccordion === type}
                      onChange={(_, isExpanded) => setActiveAccordion(isExpanded ? type : null)}
                    >
                      <Grid container spacing={2}>
                        {filteredMethods.map((method) => {
                          const isChecked = selectedIds.includes(method.id);

                          return (
                            <Grid key={method.id} item xs={12}>
                              <Checkbox
                                id={getCheckboxId(method)}
                                checked={isChecked}
                                disabled={isGroupDisabled}
                                label={
                                  <Box alignItems="center" display="flex">
                                    {method.logo && method.type !== 'free' && (
                                      <LogoImage
                                        alt={method.name}
                                        height={24}
                                        src={method.logo}
                                        style={{ marginRight: '16px' }}
                                        width={40}
                                      />
                                    )}
                                    <Body2
                                      color="text.primary"
                                      fontFamily="Onest"
                                      fontSize="12px"
                                      sx={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      {method.bank
                                        ? `Bank ${method.bank?.channelCode}`
                                        : method.name}
                                    </Body2>
                                  </Box>
                                }
                                labelProps={{
                                  sx: {
                                    margin: 0,
                                    '& .MuiFormControlLabel-label': {
                                      fontSize: '12px'
                                    }
                                  }
                                }}
                                size="small"
                                onChange={(e) => {
                                  let newValue = e.target.checked
                                    ? [...selectedIds, method.id]
                                    : selectedIds.filter(
                                        (id: string) => id !== method.id
                                      );

                                  if (e.target.checked) {
                                    if (
                                      type === 'Virtual Account' ||
                                      type === 'QRIS'
                                    ) {
                                      // Clear Payment Link
                                      const paymentLinkIds = (
                                        groupedPaymentMethods['Payment Link'] ||
                                        []
                                      ).map((m) => m.id);
                                      newValue = newValue.filter(
                                        (id: string) =>
                                          !paymentLinkIds.includes(id)
                                      );
                                      // Also clear all non-in-system sub-methods
                                      newValue = newValue.filter(
                                        (id: string) =>
                                          !nonInSystemSubMethodIds.includes(id)
                                      );
                                    }
                                  }
                                  field.onChange(newValue);
                                }}
                              />
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Accordion>
                  );
                })}
            </Box>
            {isSelectionChanged(field.value || [], initialSelectedIds) && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="primary"
                  onClick={() => setExpanded(false)}
                  sx={{ width: '100%' }}
                >
                  Done
                </Button>
              </Box>
            )}
          </Modal>
        </Box>
      )}
      rules={rules}
    />
  );
};
