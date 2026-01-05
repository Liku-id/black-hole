import { Box, Grid, IconButton } from '@mui/material';
import Image from 'next/image';
import React from 'react';

import { Select, TextField, Checkbox, Body2, H4 } from '@/components/common';

import { FormFieldRenderer } from './form-field-renderer';

interface CustomQuestion {
  id: string;
  question: string;
  formType: 'TEXT' | 'PARAGRAPH' | 'NUMBER' | 'DATE' | 'DROPDOWN' | 'CHECKBOX';
  options?: string[];
  isRequired?: boolean;
}

interface CustomQuestionFormProps {
  question: CustomQuestion;
  questionNumber: number;
  formTypeOptions: Array<{ value: string; label: string; icon: string }>;
  onQuestionChange: (id: string, updates: Partial<CustomQuestion>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onOptionChange: (questionId: string, optionIndex: number, value: string) => void;
  onAddOption: (questionId: string) => void;
}

export function CustomQuestionForm({
  question,
  questionNumber,
  formTypeOptions,
  onQuestionChange,
  onDelete,
  onDuplicate,
  onOptionChange,
  onAddOption
}: CustomQuestionFormProps) {
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
              value={question.question}
              onChange={(e) => onQuestionChange(question.id, { question: e.target.value })}
              fullWidth
            />
          </Box>

          <FormFieldRenderer
            formType={question.formType}
            options={question.options}
            isDisabled={false}
            questionId={question.id}
            isExistingForm={false}
            onOptionChange={(questionId, optionIndex, value) => onOptionChange(questionId, optionIndex, value)}
            onAddOption={(questionId) => onAddOption(questionId)}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <Box mb={2}>
            <Select
              label="Form Type"
              options={formTypeOptions}
              value={question.formType}
              onChange={(value) => onQuestionChange(question.id, { formType: value as any })}
              fullWidth
              sx={{
                '& .MuiPaper-root-MuiPopover-paper-MuiMenu-paper': {
                  padding: '8px 0'
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
                checked={question.isRequired || false}
                onChange={(e) => onQuestionChange(question.id, { isRequired: e.target.checked })}
                sx={{ marginRight: "8px" }}
              />
              <Body2 color="text.primary" fontWeight={400} fontSize="14px">
                Required Question
              </Body2>
            </Box>
          </Box>

          <Box display="flex">
            <IconButton onClick={() => onDelete(question.id)} size="small">
              <Image alt="Delete" height={20} src="/icon/trash-v2.svg" width={20} />
            </IconButton>
            <IconButton onClick={() => onDuplicate(question.id)} size="small">
              <Image alt="Copy" height={20} src="/icon/copy.svg" width={20} />
            </IconButton>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
