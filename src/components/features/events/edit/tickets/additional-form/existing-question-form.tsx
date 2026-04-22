import { Box, Grid, IconButton } from '@mui/material';
import Image from 'next/image';
import React from 'react';

import { Select, TextField, Checkbox, Body2, H4 } from '@/components/common';

import { FormFieldRenderer } from './form-field-renderer';

interface ExistingForm {
  id: string;
  field: string;
  type: 'TEXT' | 'PARAGRAPH' | 'NUMBER' | 'DATE' | 'DROPDOWN' | 'CHECKBOX';
  options?: string[];
  isRequired?: boolean;
}

interface ExistingQuestionFormProps {
  form: ExistingForm;
  questionNumber: number;
  isFirstForm: boolean;
  formTypeOptions: Array<{ value: string; label: string; icon: string }>;
  onFieldChange: (formId: string, field: string, value: any) => void;
  onTypeChange: (formId: string, value: string) => void;
  onDelete: (formId: string) => void;
  onDuplicate: (formId: string) => void;
  onOptionChange: (formId: string, optionIndex: number, value: string, isExistingForm: boolean) => void;
  onAddOption: (formId: string, isExistingForm: boolean) => void;
}

export function ExistingQuestionForm({
  form,
  questionNumber,
  isFirstForm,
  formTypeOptions,
  onFieldChange,
  onTypeChange,
  onDelete,
  onDuplicate,
  onOptionChange,
  onAddOption
}: ExistingQuestionFormProps) {
  return (
    <Box mb={2} borderBottom="1px solid" borderColor="divider">
      <H4 color="text.primary" mb="16px">
        Question {questionNumber}
      </H4>

      <Grid container spacing={2}>
        <Grid item xs={12} md={9}>
          <Box mb={2}>
            <TextField
              label="Question*"
              placeholder="Write your question here"
              value={form.field}
              onChange={isFirstForm ? undefined : (e) => onFieldChange(form.id, 'field', e.target.value)}
              fullWidth
              disabled={isFirstForm}
            />
          </Box>

          <FormFieldRenderer
            formType={form.type}
            options={form.options}
            isDisabled={isFirstForm}
            questionId={form.id}
            isExistingForm={true}
            onOptionChange={onOptionChange}
            onAddOption={onAddOption}
          />
        </Grid>

        {!isFirstForm && (
          <Grid item xs={12} md={3}>
            <Box mb={2}>
              <Select
                label="Form Type"
                options={formTypeOptions}
                value={form.type}
                onChange={(value) => onTypeChange(form.id, value)}
                fullWidth
                sx={{
                  '& .MuiPaper-root-MuiPopover-paper-MuiMenu-paper': {
                    padding: '0 !important'
                  }
                }}
              />
            </Box>

            <Box display="flex" alignItems="center" gap={2} mb="12px" justifyContent="space-between">
              <Box display="flex" alignItems="center">
                <Body2 color="text.primary" fontWeight={400} fontSize="14px">
                  Option
                </Body2>
              </Box>
              <Box display="flex" alignItems="center" gap={0}>
                <Checkbox
                  checked={form.isRequired || false}
                  onChange={(e) => onFieldChange(form.id, 'isRequired', e.target.checked)}
                  sx={{ marginRight: "8px" }}
                />
                <Body2 color="text.primary" fontWeight={400} fontSize="14px">
                  Required Question
                </Body2>
              </Box>
            </Box>

            <Box display="flex">
              <IconButton onClick={() => onDelete(form.id)} size="small">
                <Image alt="Delete" height={20} src="/icon/trash-v2.svg" width={20} />
              </IconButton>
              <IconButton onClick={() => onDuplicate(form.id)} size="small">
                <Image alt="Copy" height={20} src="/icon/copy.svg" width={20} />
              </IconButton>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
