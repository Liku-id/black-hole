import { Autocomplete } from '@mui/material';
import { forwardRef } from 'react';

import { TextField } from '../text-field';

interface Option {
  id: string;
  label: string;
  value: string;
}

interface AutoCompleteProps {
  label?: string;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  required?: boolean;
  options?: Option[];
  value?: Option | null;
  onChange?: (event: any, newValue: Option | null, reason: string) => void;
  onInputChange?: (event: any, newInputValue: string, reason: string) => void;
  loading?: boolean;
  loadingText?: string;
  noOptionsText?: string;
  inputValue?: string;
  open?: boolean;
}

export const AutoComplete = forwardRef<HTMLDivElement, AutoCompleteProps>(
  (
    {
      label,
      placeholder,
      error,
      helperText,
      disabled = false,
      fullWidth = true,
      required,
      options = [],
      value,
      onChange,
      onInputChange,
      loading,
      loadingText = 'Loading...',
      noOptionsText = 'Not Found',
      inputValue,
      open,
      ...props
    },
    ref
  ) => {
    return (
      <Autocomplete
        ref={ref}
        options={options}
        value={value}
        inputValue={inputValue}
        onChange={onChange}
        onInputChange={onInputChange}
        disabled={disabled}
        fullWidth={fullWidth}
        loading={loading}
        loadingText={loadingText}
        noOptionsText={noOptionsText}
        freeSolo={true}
        open={open}
        disablePortal={true}
        blurOnSelect={false}
        getOptionLabel={(option) => {
          if (typeof option === 'string') return option;
          return option.label || '';
        }}
        isOptionEqualToValue={(option, value) => option.id === value?.id}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            error={error}
            helperText={helperText}
            required={required}
            InputProps={params.InputProps}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                padding: "4px 8px"
              }
            }}
          />
        )}
        {...props}
      />
    );
  }
);

AutoComplete.displayName = 'AutoComplete';
