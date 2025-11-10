import { Box } from '@mui/material';
import React from 'react';

import { Button } from '@/components/common';
import { Body2 } from '@/components/common';

interface SubmitSectionProps {
  isSubmitting: boolean;
  submitError: string | null;
  isSubmitDisabled: boolean;
  onAddNewQuestion: () => void;
  onSubmitAll: () => void;
}

export function SubmitSection({
  isSubmitting,
  submitError,
  isSubmitDisabled,
  onAddNewQuestion,
  onSubmitAll
}: SubmitSectionProps) {
  return (
    <>
      {submitError && (
        <Box mt={2} p={2} sx={{ backgroundColor: 'error.light', borderRadius: 1 }}>
          <Body2 color="error.main">{submitError}</Body2>
        </Box>
      )}

      <Box display="flex" justifyContent="flex-end" mt={4} gap={2}>
        <Button
          variant="secondary"
          onClick={onAddNewQuestion}
          disabled={isSubmitting}
        >
          Add New Question
        </Button>
        <Button
          variant="primary"
          disabled={isSubmitDisabled}
          onClick={onSubmitAll}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </Box>
    </>
  );
}
