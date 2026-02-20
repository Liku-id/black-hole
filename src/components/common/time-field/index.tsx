'use client';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Box, IconButton, InputAdornment } from '@mui/material';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Controller, useFormContext, RegisterOptions } from 'react-hook-form';

import { Body2 } from '../typography';

import { StyledTextField } from '../text-field/StyledTextField';

interface TimeFieldProps {
  id?: string;
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
  id,
  label,
  error,
  helperText,
  disabled,
  timeValue,
  onTimeChange
}: {
  id?: string;
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
    <Image alt="Time" height={20} src="/icon/time.svg" width={20} />
  );

  const endComponent = (
    <Box id={id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {/* Hours spinner */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          pointerEvents: 'auto'
        }}
      >
        <IconButton
          disabled={disabled}
          size="small"
          sx={{
            p: 0.25,
            minWidth: 'auto',
            '&:hover': { backgroundColor: 'transparent' }
          }}
          onClick={incrementHours}
        >
          <KeyboardArrowUpIcon sx={{ fontSize: 14 }} />
        </IconButton>
        <IconButton
          disabled={disabled}
          size="small"
          sx={{
            p: 0.25,
            minWidth: 'auto',
            '&:hover': { backgroundColor: 'transparent' }
          }}
          onClick={decrementHours}
        >
          <KeyboardArrowDownIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>

      <Box sx={{ fontSize: '14px', color: 'text.primary', fontWeight: 500 }}>
        {timeValue.hours !== null
          ? timeValue.hours.toString().padStart(2, '0')
          : '--'}
      </Box>

      <Box sx={{ fontSize: '14px', color: 'text.primary', mx: 0.5 }}>:</Box>

      {/* Minutes spinner */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          pointerEvents: 'auto'
        }}
      >
        <IconButton
          disabled={disabled}
          size="small"
          sx={{
            p: 0.25,
            minWidth: 'auto',
            '&:hover': { backgroundColor: 'transparent' }
          }}
          onClick={incrementMinutes}
        >
          <KeyboardArrowUpIcon sx={{ fontSize: 14 }} />
        </IconButton>
        <IconButton
          disabled={disabled}
          size="small"
          sx={{
            p: 0.25,
            minWidth: 'auto',
            '&:hover': { backgroundColor: 'transparent' }
          }}
          onClick={decrementMinutes}
        >
          <KeyboardArrowDownIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>

      <Box sx={{ fontSize: '14px', color: 'text.primary', fontWeight: 500 }}>
        {timeValue.minutes !== null
          ? timeValue.minutes.toString().padStart(2, '0')
          : '--'}
      </Box>
    </Box>
  );

  const inputProps = {
    startAdornment: (
      <InputAdornment position="start" sx={{ marginRight: 0, marginLeft: 0 }}>
        {startComponent}
      </InputAdornment>
    )
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
          disabled={disabled}
          error={error}
          helperText={helperText}
          InputProps={{
            ...inputProps,
            readOnly: true
          }}
          sx={(theme) => ({
            '& .MuiOutlinedInput-root': {
              '& input': {
                paddingLeft: '0 !important',
                paddingRight: '0 !important'
              },
              '& fieldset': {
                border: 'none !important'
              },
              '&:hover fieldset': {
                border: 'none !important'
              },
              '&.Mui-focused fieldset': {
                border: 'none !important'
              },
              '&.Mui-error fieldset': {
                border: 'none !important'
              },
              '&.Mui-focused': {
                '& fieldset': {
                  border: 'none !important'
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
                border: `1px solid ${theme.palette.primary.main} !important`
              }
            },
            '& fieldset': {
              border: 'none !important'
            },
            '&:hover fieldset': {
              border: 'none !important'
            },
            '&.Mui-focused fieldset': {
              border: 'none !important'
            }
          })}
          value=""
          variant="outlined"
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
    id,
    label,
    name,
    rules,
    error,
    helperText,
    value,
    onChange,
    disabled,
    placeholder = '00:00'
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
      id={id}
      disabled={disabled}
      error={error}
      helperText={helperText}
      label={label}
      placeholder={placeholder}
      timeValue={timeValue}
      onTimeChange={handleTimeChange}
    />
  );
};

// Form TimeField with React Hook Form integration
const FormTimeField = ({ name, rules, ...props }: TimeFieldProps) => {
  const {
    control,
    formState: { errors }
  } = useFormContext();
  const fieldError = errors[name as string];

  return (
    <Controller
      control={control}
      name={name as string}
      render={({ field }) => {
        const handleTimeChange = (newTime: TimeValue) => {
          // If either hours or minutes is set, initialize the other to 0 if null
          const finalTime: TimeValue = {
            hours: newTime.hours !== null ? newTime.hours : (newTime.minutes !== null ? 0 : null),
            minutes: newTime.minutes !== null ? newTime.minutes : (newTime.hours !== null ? 0 : null)
          };
          
          if (finalTime.hours !== null && finalTime.minutes !== null) {
            const timeString = `${finalTime.hours.toString().padStart(2, '0')}:${finalTime.minutes.toString().padStart(2, '0')}`;
            field.onChange(timeString);
          }
        };

        const timeValue: TimeValue = field.value && typeof field.value === 'string' && field.value.trim() !== ''
          ? (() => {
              try {
                const [hours, minutes] = field.value.split(':').map(Number);
                if (isNaN(hours) || isNaN(minutes)) {
                  return { hours: null, minutes: null };
                }
                return { hours: hours || 0, minutes: minutes || 0 };
              } catch {
                return { hours: null, minutes: null };
              }
            })()
          : { hours: null, minutes: null };

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
      rules={rules}
    />
  );
};

export default TimeField;
