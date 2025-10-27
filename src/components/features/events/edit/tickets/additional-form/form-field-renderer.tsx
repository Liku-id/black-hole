import { Box } from '@mui/material';
import Image from 'next/image';
import React from 'react';
import { Button, TextArea, TextField } from '@/components/common';

interface FormFieldRendererProps {
  formType: 'TEXT' | 'PARAGRAPH' | 'NUMBER' | 'DATE' | 'RADIO' | 'CHECKBOX';
  options?: string[];
  isDisabled: boolean;
  questionId?: string;
  isExistingForm?: boolean;
  onOptionChange?: (questionId: string, optionIndex: number, value: string, isExistingForm: boolean) => void;
  onAddOption?: (questionId: string, isExistingForm: boolean) => void;
}

export function FormFieldRenderer({
  formType,
  options = [],
  isDisabled,
  questionId,
  isExistingForm = false,
  onOptionChange,
  onAddOption
}: FormFieldRendererProps) {
  const isFieldDisabled = formType === 'RADIO' || formType === 'CHECKBOX' ? isDisabled : true;

  const commonTextFieldProps = {
    fullWidth: true,
    disabled: isFieldDisabled,
    sx: (theme: any) => ({
      '& .MuiInputBase-root': {
        backgroundColor: theme.palette.background.default
      }
    })
  };

  switch (formType) {
    case 'TEXT':
      return (
        <Box mb={3}>
          <TextField
            label="Short Answer Text"
            placeholder="Example: Full Name"
            {...commonTextFieldProps}
          />
        </Box>
      );

    case 'PARAGRAPH':
      return (
        <Box mb={3}>
          <TextArea
            label="Paragraph Answer"
            placeholder="Example: Please provide your dietary restrictions or special requirements for the event."
            fullWidth
            disabled={isFieldDisabled}
            rows={1}
            sx={{
              '& .MuiOutlinedInput-root textarea': {
                padding: '0px'
              }
            }}
          />
        </Box>
      );

    case 'NUMBER':
      return (
        <Box mb={3}>
          <TextField
            label="Number Answer"
            type="number"
            placeholder="Example: 25"
            {...commonTextFieldProps}
          />
        </Box>
      );

    case 'DATE':
      return (
        <Box mb={3}>
          <TextField
            label="Date Answer"
            placeholder="Day/Month/Year"
            startComponent={<Image alt="calendar" height={24} src="/icon/calendar-v3.svg" width={24} />}
            {...commonTextFieldProps}
          />
        </Box>
      );

    case 'RADIO':
    case 'CHECKBOX':
      return (
        <Box mb={3}>
          {options.map((option, optionIndex) => (
            <Box key={optionIndex} mb={1}>
              <TextField
                placeholder={`Option ${optionIndex + 1}`}
                value={option}
                onChange={!isFieldDisabled && questionId && onOptionChange ? 
                  (e) => onOptionChange(questionId, optionIndex, e.target.value, isExistingForm) : 
                  undefined
                }
                fullWidth
                disabled={isFieldDisabled}
                InputProps={{
                  startAdornment: formType === 'CHECKBOX' ? 
                    <Image src={'/icon/checkbox-v2.svg'} alt="checkbox" height={24} width={24} /> : 
                    <Image src={'/icon/radio-v2.svg'} alt="radio" height={24} width={24} />
                }}
              />
            </Box>
          ))}

          {!isFieldDisabled && questionId && onAddOption && (
            <Button
              variant="secondary"
              onClick={() => onAddOption(questionId, isExistingForm)}
              sx={{ mt: 2 }}
            >
              Add new option
            </Button>
          )}
        </Box>
      );

    default:
      return null;
  }
}
