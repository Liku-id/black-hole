import { TextFieldProps, InputAdornment, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { forwardRef } from 'react';
import { Body2 } from '@/components/common';
import { StyledTextField } from '../text-field/StyledTextField';
import { Controller, useFormContext, RegisterOptions } from 'react-hook-form';
import Image from 'next/image';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface CustomDateFieldProps extends Omit<TextFieldProps, 'variant'> {
  label?: string;
  name: string; 
  rules?: RegisterOptions;
  error?: boolean;
  helperText?: string;
  placeholder?: string;
}

// Custom input component for DatePicker
const CustomInput = forwardRef<HTMLInputElement, any>(({ value, onClick, placeholder, error, helperText }, ref) => (
  <StyledTextField
    ref={ref}
    value={value}
    onClick={onClick}
    placeholder={placeholder}
    variant="outlined"
    error={error}
    helperText={helperText}
    name=""
    InputProps={{
      readOnly: true,
      startAdornment: (
        <InputAdornment position="start">
          <Box
            component="span"
            display="flex"
            alignItems="center"
            paddingY={1}
            sx={{ cursor: 'pointer' }}
          >
            <Image
              src="/icon/calendar.svg"
              alt="calendar"
              width={24}
              height={24}
            />
          </Box>
        </InputAdornment>
      ),
    }}
  />
));

// Global styles for react-datepicker to match our design
const DatePickerWrapper = styled(Box)(({ theme }) => ({
  '& .react-datepicker': {
    fontFamily: '"Onest", sans-serif',
    fontSize: '14px',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '4px',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[8],
    padding: '24px',
  },
  '& .react-datepicker__header': {
    backgroundColor: 'transparent',
    borderBottom: 'none',
    paddingTop: '0',
    paddingBottom: '10px',
    position: 'relative',
  },
  '& .react-datepicker__current-month': {
    display: 'none', // Hide default month text
  },
  '& .react-datepicker__header__dropdown': {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  '& .react-datepicker__day-names': {
    display: 'flex',
    justifyContent: 'space-between',
  },
  '& .react-datepicker__day-name': {
    color: theme.palette.text.primary,
    fontWeight: 600,
    fontSize: '12px',
    width: '40px',
    height: '40px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  '& .react-datepicker__week': {
    display: 'flex',
    justifyContent: 'space-between',
  },
  '& .react-datepicker__day': {
    color: theme.palette.text.primary,
    fontWeight: 300,
    fontSize: '14px',
    width: '30px',
    height: '30px',
    lineHeight: '30px',
    margin: '0',
    borderRadius: '4px',
    fontFamily: '"Onest", sans-serif',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  '& .react-datepicker__day--outside-month': {
    color: theme.palette.text.secondary,
  },
  '& .react-datepicker__day--today': {
    fontWeight: 600,
    backgroundColor: 'transparent',
    color: theme.palette.text.primary,
  },
  '& .react-datepicker__day--selected': {
    backgroundColor: `${theme.palette.primary.main} !important`,
    color: `${theme.palette.common.white} !important`,
    fontWeight: 300,
  },
  '& .react-datepicker__navigation': {
    top: '24px',
    width: '24px',
    height: '24px',
    lineHeight: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&--previous': {
      left: '24px',
    },
    '&--next': {
      right: '24px',
    },
  },
  '& .react-datepicker__navigation-icon': {
    '&::before': {
      borderColor: theme.palette.text.primary,
      borderWidth: '2px 2px 0 0',
      width: '8px',
      height: '8px',
      top: '8px',
    },
  },
  '& .react-datepicker__month-dropdown-container': {
    position: 'relative',
    display: 'inline-block',
  },
  '& .react-datepicker__year-dropdown-container': {
    position: 'relative',
    display: 'inline-block',
  },
  '& .react-datepicker__month-select': {
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    fontSize: '16px',
    fontWeight: 600,
    fontFamily: '"Onest", sans-serif',
    color: theme.palette.text.primary,
    padding: '0',
    appearance: 'none',
    '&:hover': {
      color: theme.palette.primary.main,
    },
    '&--down-arrow': {
      display: 'none',
    },
  },
  '& .react-datepicker__year-select': {
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    fontSize: '16px',
    fontWeight: 600,
    fontFamily: '"Onest", sans-serif',
    color: theme.palette.text.primary,
    padding: '0',
    appearance: 'none',
    '&:hover': {
      color: theme.palette.primary.main,
    },
    '&--down-arrow': {
      display: 'none',
    },
  },
  '& .react-datepicker__month-read-view--down-arrow:after, & .react-datepicker__month-read-view--down-arrow:before': {
    display: 'none !important',
  },
  '& .react-datepicker__year-read-view--down-arrow:after, & .react-datepicker__year-read-view--down-arrow:before': {
    display: 'none !important',
  },
  '& .react-datepicker__month-select::-ms-expand': {
    display: 'none',
  },
  '& .react-datepicker__year-select::-ms-expand': {
    display: 'none',
  },
  '& .react-datepicker__month-select::-webkit-outer-spin-button, & .react-datepicker__month-select::-webkit-inner-spin-button': {
    display: 'none',
  },
  '& .react-datepicker__year-select::-webkit-outer-spin-button, & .react-datepicker__year-select::-webkit-inner-spin-button': {
    display: 'none',
  },
  '& .react-datepicker__month-select, & .react-datepicker__year-select': {
    backgroundImage: 'none !important',
    background: 'transparent !important',
  },
  '& .react-datepicker__month-dropdown': {
    backgroundColor: theme.palette.background.paper,
    border: 'none',
    borderRadius: '4px',
    boxShadow: theme.shadows[8],
    fontFamily: '"Onest", sans-serif',
    fontSize: '16px',
    minWidth: '120px',
    padding: '8px 0',
  },
  '& .react-datepicker__year-dropdown': {
    backgroundColor: theme.palette.background.paper,
    border: 'none',
    borderRadius: '4px',
    boxShadow: theme.shadows[8],
    fontFamily: '"Onest", sans-serif',
    fontSize: '16px',
    minWidth: '80px',
    padding: '8px 0',
  },
  '& .react-datepicker__month-option, .react-datepicker__year-option': {
    padding: '12px 16px',
    color: theme.palette.text.primary,
    fontSize: '16px',
    fontFamily: '"Onest", sans-serif',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '&--selected': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
    },
  },
}));

export const CustomDateField = (props: CustomDateFieldProps) => {
  const { 
    label, 
    name,
    rules,
    placeholder
  } = props;

  const { control, formState: { errors } } = useFormContext();
  const fieldError = errors[name];

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <Box>
          {label && (
            <Body2 color="text.primary" mb={1} display="block">
              {label}
            </Body2>
          )}
          <DatePickerWrapper>
            <DatePicker
              selected={field.value ? new Date(field.value) : null}
              onChange={(date: Date | null) => {
                field.onChange(date ? date.toISOString().split('T')[0] : '');
              }}
              dateFormat="dd/MM/yyyy"
              placeholderText={placeholder || "Select date"}
              customInput={
                <CustomInput
                  error={!!fieldError}
                  helperText={fieldError?.message as string}
                />
              }
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              yearDropdownItemNumber={10}
              scrollableYearDropdown
            />
          </DatePickerWrapper>
        </Box>
      )}
    />
  );
};

export default CustomDateField;
