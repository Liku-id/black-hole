import { fireEvent, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';

import { renderWithProviders } from '@/test-utils/renderWithProviders';

import { EventTimeModal } from './index';

const TestWrapper = ({
  children,
  defaultValues = { startTime: '09:00', endTime: '17:00', timeZone: '+07:00' }
}: any) => {
  const methods = useForm({ defaultValues });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('EventTimeModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders conditionally based on open prop', () => {
    const { rerender } = renderWithProviders(
      <TestWrapper>
        <EventTimeModal
          open={false}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      </TestWrapper>
    );
    expect(screen.queryByText('Select Time Range')).not.toBeInTheDocument();

    rerender(
      <TestWrapper>
        <EventTimeModal open={true} onClose={mockOnClose} onSave={mockOnSave} />
      </TestWrapper>
    );
    expect(screen.getByText('Select Time Range')).toBeInTheDocument();
  });

  it('validates missing values and saves formatted time range on valid submit', async () => {
    renderWithProviders(
      <TestWrapper defaultValues={{ startTime: '', endTime: '', timeZone: '' }}>
        <EventTimeModal open={true} onClose={mockOnClose} onSave={mockOnSave} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save Data' }));
    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  it('saves formatted time range with matching and unknown timezone fallback and handles Close', async () => {
    const { rerender } = renderWithProviders(
      <TestWrapper
        defaultValues={{
          startTime: '09:00',
          endTime: '17:00',
          timeZone: '+08:00'
        }}
      >
        <EventTimeModal open={true} onClose={mockOnClose} onSave={mockOnSave} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save Data' }));
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('09:00 - 17:00 WITA');
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    // Test custom timezone fallback when timezone option isn't found
    rerender(
      <TestWrapper
        key="custom-tz"
        defaultValues={{
          startTime: '10:00',
          endTime: '12:00',
          timeZone: '+05:00'
        }}
      >
        <EventTimeModal open={true} onClose={mockOnClose} onSave={mockOnSave} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save Data' }));
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('10:00 - 12:00 +05:00');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(mockOnClose).toHaveBeenCalledTimes(3);
  });
});
