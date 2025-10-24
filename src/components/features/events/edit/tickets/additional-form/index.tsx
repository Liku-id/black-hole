import { Box, Grid, IconButton } from '@mui/material';
import Image from 'next/image';
import { useState } from 'react';

import { Button, Select, TextArea, TextField } from '@/components/common';
import { Body2, H4 } from '@/components/common';
import { useAdditionalFormsByTicketType } from '@/hooks';
import { ticketsService } from '@/services/tickets';

interface TicketType {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface CustomQuestion {
  id: string;
  question: string;
  formType: 'TEXT' | 'PARAGRAPH' | 'NUMBER' | 'DATE' | 'RADIO' | 'CHECKBOX';
  options?: string[];
  placeholder?: string;
}

interface AdditionalFormProps {
  ticketTypes: TicketType[];
  selectedTicketType: string;
  onTicketTypeChange: (value: string) => void;
}

export function AdditionalForm({
  ticketTypes,
  selectedTicketType,
  onTicketTypeChange
}: AdditionalFormProps) {
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch additional forms from backend when ticket type is selected
  const { additionalForms, loading: additionalFormsLoading } = useAdditionalFormsByTicketType(
    selectedTicketType || null
  );

  const selectedTicket = ticketTypes.find(ticket => ticket.id === selectedTicketType);

  const selectOptions = ticketTypes.map(ticketType => ({
    value: ticketType.id,
    label: ticketType.name
  }));

  const formTypeOptions = [
    { value: 'TEXT', label: 'Short Question', icon: '/icon/text.svg' },
    { value: 'PARAGRAPH', label: 'Paragraph', icon: '/icon/paragraph.svg' },
    { value: 'NUMBER', label: 'Number', icon: '/icon/number.svg' },
    { value: 'DATE', label: 'Date', icon: '/icon/calendar.svg' },
    { value: 'CHECKBOX', label: 'Checkbox', icon: '/icon/checkbox.svg' },
    { value: 'RADIO', label: 'Multiple Choice', icon: '/icon/radio.svg' }
  ];

  const addNewQuestion = () => {
    if (customQuestions.length < 5) {
      const newQuestion: CustomQuestion = {
        id: `question-${Date.now()}`,
        question: '',
        formType: 'TEXT'
      };
      setCustomQuestions([...customQuestions, newQuestion]);
    }
  };

  const updateQuestion = (id: string, updates: Partial<CustomQuestion>) => {
    setCustomQuestions(questions =>
      questions.map(q => {
        if (q.id === id) {
          const updatedQuestion = { ...q, ...updates };
          // Reset question when form type changes
          if (updates.formType && updates.formType !== q.formType) {
            updatedQuestion.question = '';
          }
          // Add options for radio/checkbox, remove for others
          if (updates.formType === 'RADIO' || updates.formType === 'CHECKBOX') {
            updatedQuestion.options = ['', ''];
          } else if (updates.formType) {
            delete updatedQuestion.options;
          }
          return updatedQuestion;
        }
        return q;
      })
    );
  };

  const deleteQuestion = (id: string) => {
    setCustomQuestions(questions => questions.filter(q => q.id !== id));
  };

  const duplicateQuestion = (id: string) => {
    const questionToDuplicate = customQuestions.find(q => q.id === id);
    if (questionToDuplicate && customQuestions.length < 5) {
      const newQuestion: CustomQuestion = {
        ...questionToDuplicate,
        id: `question-${Date.now()}`
      };
      setCustomQuestions([...customQuestions, newQuestion]);
    }
  };

  const addOption = (questionId: string) => {
    setCustomQuestions(questions =>
      questions.map(q => {
        if (q.id === questionId) {
          const newOptions = [...(q.options || []), ''];
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setCustomQuestions(questions =>
      questions.map(q => {
        if (q.id === questionId && q.options) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  const handleSubmit = async () => {
    if (!selectedTicketType) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare payload for custom questions
      const payload = customQuestions.map((question, index) => ({
        ticketTypeId: selectedTicketType,
        field: question.question,
        type: question.formType,
        options: question.options?.join(',') || '',
        isRequired: true,
        order: index
      }));

      console.log('Additional Forms Payload:', payload);
      // Call API to create additional forms
      const promises = payload.map(form => ticketsService.createAdditionalForm(form));
      await Promise.all(promises);
      setCustomQuestions([]);
      console.log('Additional forms created successfully!');
    } catch (error) {
      console.error('Error creating additional forms:', error);
      setSubmitError('Failed to create additional forms. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reusable function to render form fields based on type
  const renderFormField = (formType: string, options?: string[], isDisabled: boolean = true, questionId?: string) => {
    switch (formType) {
      case 'TEXT':
        return (
          <Box mb={3}>
            <TextField
              label="Short Answer Text"
              placeholder="Example: Full Name"
              fullWidth
              disabled
              sx={(theme) => ({
                '& .MuiInputBase-root': {
                  backgroundColor: theme.palette.background.default
                }
              })}
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
              disabled
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
              fullWidth
              disabled
              sx={(theme) => ({
                '& .MuiInputBase-root': {
                  backgroundColor: theme.palette.background.default
                }
              })}
            />
          </Box>
        );
      case 'DATE':
        return (
          <Box mb={3}>
            <TextField
              label="Date Answer"
              placeholder="Day/Month/Year"
              fullWidth
              disabled
              startComponent={<Image alt="calendar" height={24} src="/icon/calendar-v3.svg" width={24} />}
              sx={(theme) => ({
                '& .MuiInputBase-root': {
                  backgroundColor: theme.palette.background.default
                }
              })}
            />
          </Box>
        );

      case 'RADIO':
      case 'CHECKBOX':
        return (
          <Box mb={3}>
            {options?.map((option, optionIndex) => (
              <Box key={optionIndex} mb={1}>
                <TextField
                  placeholder={`Option ${optionIndex + 1}`}
                  value={option}
                  onChange={!isDisabled && questionId ? (e) => updateOption(questionId, optionIndex, e.target.value) : undefined}
                  fullWidth
                  disabled={isDisabled}
                  InputProps={{
                    startAdornment: formType === 'CHECKBOX' ? <Image src={'/icon/checkbox-v2.svg'} alt="checkbox" height={24} width={24} /> : <Image src={'/icon/radio-v2.svg'} alt="radio" height={24} width={24} />
                  }}
                />
              </Box>
            ))}

            {!isDisabled && questionId && (
              <Button
                variant="secondary"
                onClick={() => addOption(questionId)}
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
  };

  const renderQuestionForm = (question: CustomQuestion, index: number) => {
    const questionNumber = index + 1;

    return (
      <Box key={question.id} mb={2} borderBottom="1px solid" borderColor="divider">
        <H4 color="text.primary" mb="16px">
          Question {questionNumber}
        </H4>

        <Grid container spacing={2}>
          {/* Left side - 80% */}
          <Grid item xs={12} md={9}>
            <Box mb={2}>
              <TextField
                label='Question*'
                placeholder="Write your question here"
                value={question.question}
                onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                fullWidth
              />
            </Box>

            {/* Render form based on type */}
            {renderFormField(question.formType, question.options, false, question.id)}
          </Grid>

          {/* Right side - 20% */}
          <Grid item xs={12} md={3}>
            <Box mb={2}>
              <Select
                label="Form Type"
                options={formTypeOptions}
                value={question.formType}
                onChange={(value) => updateQuestion(question.id, { formType: value as any })}
                fullWidth
                sx={{
                  '& .MuiPaper-root-MuiPopover-paper-MuiMenu-paper': {
                    padding: '8px 0'
                  }
                }}
              />
            </Box>

            <Body2 color="text.primary" fontWeight={400} fontSize="14px" mb="12px">
              Option
            </Body2>

            <Box display="flex">
              <IconButton onClick={() => deleteQuestion(question.id)} size="small">
                <Image alt="Delete" height={20} src="/icon/trash-v2.svg" width={20} />
              </IconButton>
              <IconButton onClick={() => duplicateQuestion(question.id)} size="small">
                <Image alt="Copy" height={20} src="/icon/copy.svg" width={20} />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <>
      <Select
        placeholder="Pilih Tiket"
        options={selectOptions}
        value={selectedTicketType}
        onChange={onTicketTypeChange}
        fullWidth
      />

      {selectedTicket && (
        <Box mt={3}>
          {additionalFormsLoading ? (
            <Box>Loading additional forms...</Box>
          ) : (
            <>
              {/* Render existing additional forms from backend */}
              {additionalForms.map((form, index) => (
                <Box key={form.id} mb={2} borderBottom="1px solid" borderColor="divider">
                  <H4 color="text.primary" mb="16px">
                    Question {index + 1}
                  </H4>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={9}>
                      <Box mb={2}>
                        <TextField
                          label="Question*"
                          placeholder="Write your question here"
                          value={form.field}
                          fullWidth
                          disabled
                        />
                      </Box>
                      {/* Render form based on type */}
                      {renderFormField(form.type, form.options?.split(','), true)}
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box mb={2}>
                        <Select
                          label="Form Type"
                          options={formTypeOptions}
                          value={form.type.toLowerCase()}
                          fullWidth
                          disabled
                          sx={{
                            '& .MuiPaper-root-MuiPopover-paper-MuiMenu-paper': {
                              padding: '0 !important'
                            }
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              ))}
              {/* Custom Questions */}
              {customQuestions.map((question, index) => renderQuestionForm(question, index + additionalForms.length))}

              {submitError && (
                <Box mt={2} p={2} sx={{ backgroundColor: 'error.light', borderRadius: 1 }}>
                  <Body2 color="error.main">{submitError}</Body2>
                </Box>
              )}

              {customQuestions.length < 5 && (
                <Box display="flex" justifyContent="flex-end" mt={4} gap={2}>
                  <Button
                    variant="secondary"
                    onClick={addNewQuestion}
                    disabled={isSubmitting}
                  >
                    Add New Question
                  </Button>
                  <Button
                    variant="primary"
                    disabled={customQuestions.length === 0 || customQuestions.some(q => !q.question.trim()) || isSubmitting}
                    onClick={handleSubmit}
                  >
                    {isSubmitting ? 'Creating...' : 'Submit'}
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>
      )}
    </>
  );
}
