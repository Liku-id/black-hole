import { Box, Grid, InputAdornment } from '@mui/material';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { Controller, useFormContext, RegisterOptions } from 'react-hook-form';

import { Body2, Accordion, Checkbox } from '@/components/common';
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
}

export const PaymentMethodSelector = ({
  label,
  name,
  rules,
  groupedPaymentMethods,
  placeholder,
  fullWidth
}: PaymentMethodSelectorProps) => {
  const {
    control,
    formState: { errors }
  } = useFormContext();
  const fieldError = errors[name];
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get all payment methods from grouped data for selected options
  const allPaymentMethods = Object.values(groupedPaymentMethods).flat();

  const getSelectedOptions = (value: string[]) => {
    if (!value || value.length === 0) return '';
    const selectedOptions = allPaymentMethods.filter((method) =>
      value.includes(method.id)
    );
    return selectedOptions
      .map((method) => method.bank?.channelCode || method.name)
      .join(', ');
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setExpanded(false);
      }
    };

    if (expanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expanded]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Box ref={containerRef} position="relative">
          {label && (
            <Body2 color="text.primary" display="block" mb={1}>
              {label}
            </Body2>
          )}

          <StyledTextField
            error={!!fieldError}
            fullWidth={fullWidth}
            helperText={fieldError?.message as string}
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
            onClick={() => setExpanded(!expanded)}
          />

          {/* Dropdown that floats above other content */}
          <Box
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1000,
              mt: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              backgroundColor: 'background.paper',
              boxShadow: 3,
              overflow: 'hidden',
              display: expanded ? 'block' : 'none'
            }}
          >
            {Object.entries(groupedPaymentMethods).map(([type, methods]) => (
              <Accordion key={type} title={type}>
                <Grid container spacing={2}>
                  {methods.map((method) => (
                    <Grid key={method.id} item xs={6}>
                      <Checkbox
                        checked={(field.value || []).includes(method.id)}
                        label={
                          <Box alignItems="center" display="flex">
                            {method.logo && (
                              <Image
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
                          const newValue = e.target.checked
                            ? [...(field.value || []), method.id]
                            : (field.value || []).filter(
                                (id: string) => id !== method.id
                              );
                          field.onChange(newValue);
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Accordion>
            ))}
          </Box>
        </Box>
      )}
      rules={rules}
    />
  );
};
