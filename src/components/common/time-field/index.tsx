'use client';

import { Box, IconButton, InputAdornment } from '@mui/material';
import { useState, useEffect } from 'react';
import { Body2 } from '@/components/common';
import { StyledTextField } from '../text-field/StyledTextField';
import { Controller, useFormContext, RegisterOptions } from 'react-hook-form';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Image from 'next/image';

interface TimeFieldProps {
  label?: string;
  name?: string;
  rules?: RegisterOptions;
  error?: boolean;
  helperText?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

interface TimeValue {
  hours: number | null;
  minutes: number | null;
}

// Internal component for rendering the time field UI
const TimeFieldUI = ({ 
  label, 
  error, 
  helperText, 
  disabled, 
  timeValue,
  onTimeChange
}: {
  label?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  placeholder?: string;
  timeValue: TimeValue;
  onTimeChange: (newTime: TimeValue) => void;
}) => {
  const incrementHours = () => {
    const currentHours = timeValue.hours ?? 0;
    onTimeChange({
      ...timeValue,
      hours: (currentHours + 1) % 24
    });
  };

  const decrementHours = () => {
    const currentHours = timeValue.hours ?? 0;
    onTimeChange({
      ...timeValue,
      hours: currentHours === 0 ? 23 : currentHours - 1
    });
  };

  const incrementMinutes = () => {
    const currentMinutes = timeValue.minutes ?? 0;
    onTimeChange({
      ...timeValue,
      minutes: (currentMinutes + 1) % 60
    });
  };

  const decrementMinutes = () => {
    const currentMinutes = timeValue.minutes ?? 0;
    onTimeChange({
      ...timeValue,
      minutes: currentMinutes === 0 ? 59 : currentMinutes - 1
    });
  };

  const startComponent = (
    <Image 
      src="/icon/time.svg" 
      alt="Time" 
      width={20} 
      height={20}
    />
  );

  const endComponent = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {/* Hours spinner */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, pointerEvents: 'auto' }}>
        <IconButton
          size="small"
          onClick={incrementHours}
          disabled={disabled}
          sx={{ 
            p: 0.25, 
            minWidth: 'auto',
            '&:hover': { backgroundColor: 'transparent' }
          }}
        >
          <KeyboardArrowUpIcon sx={{ fontSize: 14 }} />
        </IconButton>
        <IconButton
          size="small"
          onClick={decrementHours}
          disabled={disabled}
          sx={{ 
            p: 0.25, 
            minWidth: 'auto',
            '&:hover': { backgroundColor: 'transparent' }
          }}
        >
          <KeyboardArrowDownIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>
      
      <Box sx={{ fontSize: '14px', color: 'text.primary', fontWeight: 500 }}>
        {timeValue.hours !== null ? timeValue.hours.toString().padStart(2, '0') : '--'}
      </Box>
      
      <Box sx={{ fontSize: '14px', color: 'text.primary', mx: 0.5 }}>:</Box>
      
      {/* Minutes spinner */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, pointerEvents: 'auto' }}>
        <IconButton
          size="small"
          onClick={incrementMinutes}
          disabled={disabled}
          sx={{ 
            p: 0.25, 
            minWidth: 'auto',
            '&:hover': { backgroundColor: 'transparent' }
          }}
        >
          <KeyboardArrowUpIcon sx={{ fontSize: 14 }} />
        </IconButton>
        <IconButton
          size="small"
          onClick={decrementMinutes}
          disabled={disabled}
          sx={{ 
            p: 0.25, 
            minWidth: 'auto',
            '&:hover': { backgroundColor: 'transparent' }
          }}
        >
          <KeyboardArrowDownIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>
      
      <Box sx={{ fontSize: '14px', color: 'text.primary', fontWeight: 500 }}>
        {timeValue.minutes !== null ? timeValue.minutes.toString().padStart(2, '0') : '--'}
      </Box>
    </Box>
  );

  const inputProps = {
    startAdornment: (
      <InputAdornment position="start" sx={{ marginRight: 0, marginLeft: 0 }}>
        {startComponent}
      </InputAdornment>
    ),
  };

  const hasValue = timeValue.hours !== null && timeValue.minutes !== null;

  return (
    <Box>
      {label && (
        <Body2 color="text.primary" sx={{ mb: 1, display: 'block' }}>
          {label}
        </Body2>
      )}
      <Box sx={{ position: 'relative' }}>
        <StyledTextField
          variant="outlined"
          value=""
          InputProps={{
            ...inputProps,
            readOnly: true
          }}
          error={error}
          helperText={helperText}
          disabled={disabled}
          sx={(theme) => ({
            '& .MuiOutlinedInput-root': {
              '& input': {
                paddingLeft: '0 !important',
                paddingRight: '0 !important',
              },
              '& fieldset': {
                border: 'none !important',
              },
              '&:hover fieldset': {
                border: 'none !important',
              },
              '&.Mui-focused fieldset': {
                border: 'none !important',
              },
              '&.Mui-error fieldset': {
                border: 'none !important',
              },
              '&.Mui-focused': {
                '& fieldset': {
                  border: 'none !important',
                }
              }
            },
            '& .MuiInputBase-root': {
              backgroundColor: hasValue 
                ? `${theme.palette.background.default} !important`
                : `${theme.palette.common.white} !important`,
              border: hasValue 
                ? `1px solid ${theme.palette.primary.main} !important`
                : `1px solid ${theme.palette.divider} !important`,
              '&.Mui-focused': {
                backgroundColor: `${theme.palette.background.default} !important`,
                border: `1px solid ${theme.palette.primary.main} !important`,
              },
            },
            '& fieldset': {
              border: 'none !important',
            },
            '&:hover fieldset': {
              border: 'none !important',
            },
            '&.Mui-focused fieldset': {
              border: 'none !important',
            }
          })}
        />
        <Box 
          sx={{ 
            position: 'absolute',
            top: '50%',
            left: '48px',
            right: '12px',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            pointerEvents: 'none'
          }}
        >
          {endComponent}
        </Box>
      </Box>
    </Box>
  );
};

// Main TimeField component
const TimeField = (props: TimeFieldProps) => {
  const { 
    label, 
    name,
    rules,
    error,
    helperText,
    value,
    onChange,
    disabled,
    placeholder = "00:00"
  } = props;

  const [timeValue, setTimeValue] = useState<TimeValue>(() => {
    if (value) {
      const [hours, minutes] = value.split(':').map(Number);
      return { hours: hours || 0, minutes: minutes || 0 };
    }
    return { hours: null, minutes: null };
  });

  // Update internal state when value prop changes
  useEffect(() => {
    if (value) {
      const [hours, minutes] = value.split(':').map(Number);
      setTimeValue({ hours: hours || 0, minutes: minutes || 0 });
    }
  }, [value]);

  const handleTimeChange = (newTime: TimeValue) => {
    setTimeValue(newTime);
    if (newTime.hours !== null && newTime.minutes !== null) {
      const timeString = `${newTime.hours.toString().padStart(2, '0')}:${newTime.minutes.toString().padStart(2, '0')}`;
      onChange?.(timeString);
    }
  };

  // If name is provided, use React Hook Form
  if (name) {
    return <FormTimeField name={name} rules={rules} {...props} />;
  }

  // Regular TimeField without form
  return (
    <TimeFieldUI
      label={label}
      error={error}
      helperText={helperText}
      disabled={disabled}
      placeholder={placeholder}
      timeValue={timeValue}
      onTimeChange={handleTimeChange}
    />
  );
};

// Form TimeField with React Hook Form integration
const FormTimeField = ({ name, rules, ...props }: TimeFieldProps) => {
  const { control, formState: { errors } } = useFormContext();
  const fieldError = errors[name as string];
  
  return (
    <Controller
      name={name as string}
      control={control}
      rules={rules}
      render={({ field }) => {
        const [timeValue, setTimeValue] = useState<TimeValue>(() => {
          if (field.value) {
            const [hours, minutes] = field.value.split(':').map(Number);
            return { hours: hours || 0, minutes: minutes || 0 };
          }
          return { hours: null, minutes: null };
        });

        const handleTimeChange = (newTime: TimeValue) => {
          setTimeValue(newTime);
          if (newTime.hours !== null && newTime.minutes !== null) {
            const timeString = `${newTime.hours.toString().padStart(2, '0')}:${newTime.minutes.toString().padStart(2, '0')}`;
            field.onChange(timeString);
          }
        };

        return (
          <TimeFieldUI
            {...props}
            error={!!fieldError}
            helperText={fieldError?.message as string}
            timeValue={timeValue}
            onTimeChange={handleTimeChange}
          />
        );
      }}
    />
  );
};

export default TimeField;
