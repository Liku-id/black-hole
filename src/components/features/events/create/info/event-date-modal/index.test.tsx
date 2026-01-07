import { render, screen, fireEvent } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';

import { EventDateModal } from './index';

const TestWrapper = ({ children, defaultValues }: any) => {
  const methods = useForm({ defaultValues });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('EventDateModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Modal Visibility', () => {
    it('should render when open is true', () => {
      render(
        <TestWrapper defaultValues={{ startDate: '', endDate: '' }}>
          <EventDateModal
            open={true}
            onClose={mockOnClose}
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Start & End Date Event')).toBeInTheDocument();
    });

    it('should not render when open is false', () => {
      render(
        <TestWrapper defaultValues={{ startDate: '', endDate: '' }}>
          <EventDateModal
            open={false}
            onClose={mockOnClose}
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      expect(
        screen.queryByText('Start & End Date Event')
      ).not.toBeInTheDocument();
    });
  });

  describe('Form Rendering', () => {
    it('should render start date and end date fields', () => {
      render(
        <TestWrapper defaultValues={{ startDate: '', endDate: '' }}>
          <EventDateModal
            open={true}
            onClose={mockOnClose}
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Start Date*')).toBeInTheDocument();
      expect(screen.getByText('End Date*')).toBeInTheDocument();
    });

    it('should render save button', () => {
      render(
        <TestWrapper defaultValues={{ startDate: '', endDate: '' }}>
          <EventDateModal
            open={true}
            onClose={mockOnClose}
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Save Data')).toBeInTheDocument();
    });
  });
});


