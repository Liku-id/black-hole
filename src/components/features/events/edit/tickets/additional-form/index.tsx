import { Box } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { Body2, Select } from '@/components/common';
import { useToast } from '@/contexts/ToastContext';
import { useTicketType } from '@/hooks';
import { ticketsService } from '@/services/tickets';
import { CustomQuestionForm } from './custom-question-form';
import { ExistingQuestionForm } from './existing-question-form';
import { SubmitSection } from './submit-section';

interface TicketType {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface CustomQuestion {
  id: string;
  question: string;
  formType: 'TEXT' | 'PARAGRAPH' | 'NUMBER' | 'DATE' | 'DROPDOWN' | 'CHECKBOX';
  options?: string[];
  isRequired?: boolean;
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
  const [deletedForms, setDeletedForms] = useState<Set<string>>(new Set());
  const [editableForms, setEditableForms] = useState<Map<string, any>>(new Map());
  
  const { additionalForms, loading: additionalFormsLoading, mutate } = useTicketType(selectedTicketType || null);
  const { showInfo } = useToast();

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
    { value: 'DROPDOWN', label: 'Multiple Choice', icon: '/icon/radio.svg' }
  ];

  // Custom question handlers
  const addNewQuestion = () => {
    const newQuestion: CustomQuestion = {
      id: `question-${Date.now()}`,
      question: '',
      formType: 'TEXT',
      isRequired: false
    };
    setCustomQuestions([...customQuestions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<CustomQuestion>) => {
    setCustomQuestions(questions =>
      questions.map(q => {
        if (q.id === id) {
          const updatedQuestion = { ...q, ...updates };
          if (updates.formType && updates.formType !== q.formType) {
            updatedQuestion.question = '';
          }
          if (updates.formType === 'DROPDOWN' || updates.formType === 'CHECKBOX') {
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
    if (questionToDuplicate) {
      const newQuestion: CustomQuestion = {
        ...questionToDuplicate,
        id: `question-${Date.now()}`,
        isRequired: questionToDuplicate.isRequired || false
      };
      setCustomQuestions([...customQuestions, newQuestion]);
    }
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

  // Existing form handlers
  const handleInputChange = (formId: string, field: string, value: any) => {
    setEditableForms(prev => {
      const newMap = new Map(prev);
      const currentForm = newMap.get(formId);
      if (currentForm) {
        const updatedForm = { ...currentForm, [field]: value };
        newMap.set(formId, updatedForm);
      }
      return newMap;
    });
  };

  const handleOptionChange = (formId: string, optionIndex: number, value: string, isExistingForm: boolean = false) => {
    if (isExistingForm) {
      setEditableForms(prev => {
        const newMap = new Map(prev);
        const currentForm = newMap.get(formId);
        if (currentForm && currentForm.options) {
          const newOptions = [...currentForm.options];
          newOptions[optionIndex] = value;
          const updatedForm = { ...currentForm, options: newOptions };
          newMap.set(formId, updatedForm);
        }
        return newMap;
      });
    } else {
      updateOption(formId, optionIndex, value);
    }
  };

  const handleAddOption = (formId: string, isExistingForm: boolean = false) => {
    if (isExistingForm) {
      setEditableForms(prev => {
        const newMap = new Map(prev);
        const currentForm = newMap.get(formId);
        if (currentForm) {
          const newOptions = [...(currentForm.options || []), ''];
          const updatedForm = { ...currentForm, options: newOptions };
          newMap.set(formId, updatedForm);
        }
        return newMap;
      });
    } else {
      addOption(formId);
    }
  };

  const handleClickDeleteIcon = (formId: string) => {
    setDeletedForms(prev => new Set([...prev, formId]));
  };

  const handleClickDuplicateIcon = (formId: string) => {
    const formToDuplicate = additionalForms.find(form => form.id === formId);
    if (formToDuplicate) {
      const newQuestion: CustomQuestion = {
        id: `question-${Date.now()}`,
        question: formToDuplicate.field,
        formType: formToDuplicate.type as any,
        options: Array.isArray(formToDuplicate.options) ? formToDuplicate.options : [],
        isRequired: formToDuplicate.isRequired || false
      };
      setCustomQuestions([...customQuestions, newQuestion]);
    }
  };

  // Validation
  const isFormValid = (form: any) => {
    if (!form.field?.trim()) return false;
    if ((form.type === 'DROPDOWN' || form.type === 'CHECKBOX') && form.options) {
      return form.options.every((option: string) => option.trim() !== '');
    }
    return true;
  };

  const isCustomQuestionValid = (question: CustomQuestion) => {
    if (!question.question?.trim()) return false;
    if ((question.formType === 'DROPDOWN' || question.formType === 'CHECKBOX') && question.options) {
      return question.options.every(option => option.trim() !== '');
    }
    return true;
  };

  const isSubmitDisabled = () => {
    const existingFormsValid = Array.from(editableForms.values()).every(isFormValid);
    const customQuestionsValid = customQuestions.every(isCustomQuestionValid);
    return !existingFormsValid || !customQuestionsValid || isSubmitting;
  };

  // Submit handler - handles all form operations (delete, update, create)
  const handleSubmitAll = async () => {
    if (!selectedTicketType) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // STEP 1: Prepare data
      const deleted = Array.from(deletedForms);
      const validForms = additionalForms?.filter(f => f.id && f.field?.trim()) || [];
      const remainingForms = validForms.filter(f => !deletedForms.has(f.id));
      
      // STEP 2: Prepare forms to update (skip first form order 0)
      const formsToUpdate = remainingForms.filter(form => form.order !== 0);
      
      const updated = formsToUpdate
        .map((form) => {
          const editableForm = editableForms.get(form.id) || form;
          
          // Check content changes only (field, type, options, isRequired)
          const hasContentChanged =
            editableForm.field !== form.field ||
            editableForm.type !== form.type ||
            editableForm.isRequired !== form.isRequired ||
            JSON.stringify(editableForm.options || []) !== JSON.stringify(form.options || []);

          return hasContentChanged ? {
            id: form.id,
            question: editableForm.field,
            type: editableForm.type,
            order: form.order,
            isRequired: editableForm.isRequired !== undefined ? editableForm.isRequired : false,
            ...(editableForm.options && editableForm.options.length > 0 ? { options: editableForm.options } : {})
          } : null;
        })
        .filter(Boolean);

      // STEP 3: Prepare new forms
      const maxExistingOrder = remainingForms.length > 0 ? Math.max(...remainingForms.map(f => f.order)) : 0;
      const startingOrderForNew = maxExistingOrder + 1;

      const newForms = customQuestions.map((q, index) => ({
        question: q.question,
        type: q.formType,
        order: startingOrderForNew + index,
        isRequired: q.isRequired !== undefined ? q.isRequired : false,
        ...(q.options && q.options.length > 0 ? { options: q.options } : {})
      }));

      // STEP 4: Execute operations SEQUENTIALLY
      // Delete forms first
      if (deleted.length > 0) {
        for (const formId of deletedForms) {
          await ticketsService.deleteAdditionalForm(formId);
        }
      }

      // Update existing forms
      if (updated.length > 0) {
        for (const form of updated) {
          await ticketsService.updateAdditionalForm(form.id, {
            ticketTypeId: selectedTicketType,
            field: form.question,
            type: form.type,
            order: form.order,
            isRequired: form.isRequired !== undefined ? form.isRequired : false,
            ...(form.options ? { options: form.options } : {})
          });
        }
      }

      // Create new forms
      if (newForms.length > 0) {
        for (const form of newForms) {
          await ticketsService.createAdditionalForm({
            ticketTypeId: selectedTicketType,
            field: form.question,
            type: form.type,
            isRequired: form.isRequired !== undefined ? form.isRequired : false,
            ...(form.options ? { options: form.options } : {})
          });
        }
      }

      // STEP 5: Clean up
      setDeletedForms(new Set());
      setCustomQuestions([]);
      showInfo('Additional forms updated successfully!');
    } catch (error) {
      setSubmitError('Failed to submit changes. Please try again.');
    } finally {
      setIsSubmitting(false);
      mutate(); // Refresh data
    }
  };

  // Initialize editable forms when additionalForms change
  useEffect(() => {
    if (additionalForms && additionalForms.length > 0) {
      const editableMap = new Map();
      additionalForms.forEach(form => {
        const optionsArray = Array.isArray(form.options) ? form.options : [];
        editableMap.set(form.id, {
          ...form,
          field: form.field,
          type: form.type,
          options: optionsArray,
          isRequired: form.isRequired || false
        });
      });
      setEditableForms(editableMap);
    }
  }, [additionalForms]);

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
              {additionalForms && additionalForms.length > 0 ? (
                additionalForms
                  .filter(form => !deletedForms.has(form.id))
                  .map((form, index) => (
                    <ExistingQuestionForm
                      key={form.id}
                      form={editableForms.get(form.id) || form}
                      questionNumber={index + 1}
                      isFirstForm={index === 0}
                      formTypeOptions={formTypeOptions}
                      onFieldChange={handleInputChange}
                      onTypeChange={(formId, value) => handleInputChange(formId, 'type', value)}
                      onDelete={handleClickDeleteIcon}
                      onDuplicate={handleClickDuplicateIcon}
                      onOptionChange={handleOptionChange}
                      onAddOption={handleAddOption}
                    />
                  ))
              ) : (
                <Box mb={2} p={2} sx={{ backgroundColor: 'warning.light', borderRadius: 1 }}>
                  <Body2 color="warning.main">
                    No additional forms found for this ticket type.
                  </Body2>
                </Box>
              )}

              {/* Custom Questions */}
              {customQuestions.map((question, index) => {
                const remainingCount = additionalForms?.filter(form => !deletedForms.has(form.id)).length || 0;
                return (
                  <CustomQuestionForm
                    key={question.id}
                    question={question}
                    questionNumber={remainingCount + index + 1}
                    formTypeOptions={formTypeOptions}
                    onQuestionChange={updateQuestion}
                    onDelete={deleteQuestion}
                    onDuplicate={duplicateQuestion}
                    onOptionChange={updateOption}
                    onAddOption={addOption}
                  />
                );
              })}

              <SubmitSection
                isSubmitting={isSubmitting}
                submitError={submitError}
                isSubmitDisabled={isSubmitDisabled()}
                onAddNewQuestion={addNewQuestion}
                onSubmitAll={handleSubmitAll}
              />
            </>
          )}
        </Box>
      )}
    </>
  );
}