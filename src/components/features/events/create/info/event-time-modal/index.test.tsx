import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { EventTimeModal } from './index';

const TestWrapper = ({ children, defaultValues }: any) => {
  const methods = useForm({ defaultValues });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('EventTimeModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Modal Visibility', () => {
    it('should render when open is true', () => {
      render(
        <TestWrapper
          defaultValues={{ startTime: '00:00', endTime: '00:00', timeZone: '+07:00' }}
        >
          <EventTimeModal
            open={true}
            onClose={mockOnClose}
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Select Time Range')).toBeInTheDocument();
    });

    it('should not render when open is false', () => {
      render(
        <TestWrapper
          defaultValues={{ startTime: '00:00', endTime: '00:00', timeZone: '+07:00' }}
        >
          <EventTimeModal
            open={false}
            onClose={mockOnClose}
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      expect(screen.queryByText('Select Time Range')).not.toBeInTheDocument();
    });
  });

  describe('Form Rendering', () => {
    it('should render time fields and timezone select', () => {
      render(
        <TestWrapper
          defaultValues={{ startTime: '00:00', endTime: '00:00', timeZone: '+07:00' }}
        >
          <EventTimeModal
            open={true}
            onClose={mockOnClose}
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Time Start')).toBeInTheDocument();
      expect(screen.getByText('Time End')).toBeInTheDocument();
      expect(screen.getByText('Time Zone')).toBeInTheDocument();
    });

    it('should render save button', () => {
      render(
        <TestWrapper
          defaultValues={{ startTime: '00:00', endTime: '00:00', timeZone: '+07:00' }}
        >
          <EventTimeModal
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


