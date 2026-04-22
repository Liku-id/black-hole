'use client';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Box, IconButton, InputAdornment } from '@mui/material';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { Controller, useFormContext, RegisterOptions } from 'react-hook-form';

import { StyledTextField } from '../text-field/StyledTextField';
import { Body2 } from '../typography';

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
  onTimeChange,
  onValidationError
}: {
  id?: string;
  label?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  placeholder?: string;
  timeValue: TimeValue;
  onTimeChange: (newTime: TimeValue) => void;
  onValidationError?: (error: string | null) => void;
}) => {
  const [hoursInput, setHoursInput] = useState<string>('');
  const [minutesInput, setMinutesInput] = useState<string>('');
  const hoursInputRef = useRef<boolean>(false);
  const minutesInputRef = useRef<boolean>(false);

  useEffect(() => {
    if (!hoursInputRef.current) {
      setHoursInput(
        timeValue.hours !== null
          ? timeValue.hours.toString().padStart(2, '0')
          : ''
      );
    }
  }, [timeValue.hours]);

  useEffect(() => {
    if (!minutesInputRef.current) {
      setMinutesInput(
        timeValue.minutes !== null
          ? timeValue.minutes.toString().padStart(2, '0')
          : ''
      );
    }
  }, [timeValue.minutes]);

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

      <Box
        sx={{
          fontSize: '14px',
          color: 'text.primary',
          fontWeight: 500,
          pointerEvents: 'auto'
        }}
      >
        <input
          disabled={disabled}
          maxLength={2}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '');
            setHoursInput(val);
            if (val === '') {
              onTimeChange({ ...timeValue, hours: null });
              onValidationError?.(null);
              return;
            }
            const hours = parseInt(val, 10);
            if (hours > 23) {
              onValidationError?.('Hours must be 0-23');
            } else {
              onValidationError?.(null);
              onTimeChange({ ...timeValue, hours });
            }
          }}
          onBlur={() => {
            hoursInputRef.current = false;
            if (timeValue.hours !== null) {
              setHoursInput(timeValue.hours.toString().padStart(2, '0'));
            } else {
              setHoursInput('');
            }
            onValidationError?.(null);
          }}
          onFocus={(e) => {
            hoursInputRef.current = true;
            e.target.select();
          }}
          style={{
            width: '24px',
            border: 'none',
            background: 'transparent',
            padding: 0,
            fontSize: 'inherit',
            fontFamily: 'inherit',
            fontWeight: 'inherit',
            color: 'inherit',
            textAlign: 'center',
            outline: 'none'
          }}
          value={hoursInput}
        />
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

      <Box
        sx={{
          fontSize: '14px',
          color: 'text.primary',
          fontWeight: 500,
          pointerEvents: 'auto'
        }}
      >
        <input
          disabled={disabled}
          maxLength={2}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '');
            setMinutesInput(val);
            if (val === '') {
              onTimeChange({ ...timeValue, minutes: null });
              onValidationError?.(null);
              return;
            }
            const minutes = parseInt(val, 10);
            if (minutes > 59) {
              onValidationError?.('Minutes must be 0-59');
            } else {
              onValidationError?.(null);
              onTimeChange({ ...timeValue, minutes });
            }
          }}
          onBlur={() => {
            minutesInputRef.current = false;
            if (timeValue.minutes !== null) {
              setMinutesInput(timeValue.minutes.toString().padStart(2, '0'));
            } else {
              setMinutesInput('');
            }
            onValidationError?.(null);
          }}
          onFocus={(e) => {
            minutesInputRef.current = true;
            e.target.select();
          }}
          style={{
            width: '24px',
            border: 'none',
            background: 'transparent',
            padding: 0,
            fontSize: 'inherit',
            fontFamily: 'inherit',
            fontWeight: 'inherit',
            color: 'inherit',
            textAlign: 'center',
            outline: 'none'
          }}
          value={minutesInput}
        />
      </Box>
    </Box>
  );

  const inputProps = {
    startAdornment: (
      <InputAdornment position="start" sx={{ marginRight: 0, marginLeft: 0 }}>
        {startComponent}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            ml: 1.5,
            pointerEvents: 'auto'
          }}
        >
          {endComponent}
        </Box>
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
      <StyledTextField
        disabled={disabled}
        error={error}
        fullWidth
        helperText={helperText}
        InputProps={{
          ...inputProps,
          readOnly: true
        }}
        sx={(theme) => ({
          '& .MuiOutlinedInput-root': {
            '& input': {
              paddingLeft: '0 !important',
              paddingRight: '0 !important',
              width: 0
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
            height: '48px',
            backgroundColor: hasValue
              ? `${theme.palette.background.default} !important`
              : `${theme.palette.common.white} !important`,
            border: hasValue
              ? `1px solid ${theme.palette.primary.main} !important`
              : `1px solid ${theme.palette.divider} !important`,
            '&.Mui-focused': {
              backgroundColor: `${theme.palette.background.default} !important`,
              border: `1px solid ${theme.palette.primary.main} !important`
            },
            '&.Mui-error': {
              border: `1px solid ${theme.palette.error.main} !important`
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

  const [localError, setLocalError] = useState<string | null>(null);

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
      error={error || !!localError}
      helperText={localError || helperText}
      label={label}
      placeholder={placeholder}
      timeValue={timeValue}
      onTimeChange={handleTimeChange}
      onValidationError={setLocalError}
    />
  );
};

// Form TimeField with React Hook Form integration
const FormTimeField = ({ name, rules, ...props }: TimeFieldProps) => {
  const {
    control,
    formState: { errors }
  } = useFormContext();
  const [localError, setLocalError] = useState<string | null>(null);
  const fieldError = errors[name as string];

  return (
    <Controller
      control={control}
      name={name as string}
      render={({ field }) => {
        const handleTimeChange = (newTime: TimeValue) => {
          // If either hours or minutes is set, initialize the other to 0 if null
          const finalTime: TimeValue = {
            hours:
              newTime.hours !== null
                ? newTime.hours
                : newTime.minutes !== null
                  ? 0
                  : null,
            minutes:
              newTime.minutes !== null
                ? newTime.minutes
                : newTime.hours !== null
                  ? 0
                  : null
          };

          if (finalTime.hours !== null && finalTime.minutes !== null) {
            const timeString = `${finalTime.hours.toString().padStart(2, '0')}:${finalTime.minutes.toString().padStart(2, '0')}`;
            field.onChange(timeString);
          }
        };

        const timeValue: TimeValue =
          field.value &&
          typeof field.value === 'string' &&
          field.value.trim() !== ''
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
            error={!!fieldError || !!localError}
            helperText={(fieldError?.message as string) || localError || ''}
            timeValue={timeValue}
            onTimeChange={handleTimeChange}
            onValidationError={setLocalError}
          />
        );
      }}
      rules={rules}
    />
  );
};

export default TimeField;
