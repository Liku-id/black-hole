import {
  act,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react';
import { useRouter } from 'next/router';

import { useToast } from '@/contexts/ToastContext';
import { withdrawalService, WithdrawalSummary } from '@/services/withdrawal';
import { EventDetail } from '@/types/event';

import { WithdrawalForm } from './index';

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

jest.mock('@/contexts/ToastContext', () => ({
  useToast: jest.fn()
}));

jest.mock('@/services/withdrawal', () => ({
  withdrawalService: {
    createWithdrawal: jest.fn()
  }
}));

jest.mock('@/components/common', () => {
  const { Controller, useFormContext } = require('react-hook-form');
  return {
    Body2: ({ children }: { children: React.ReactNode }) => (
      <span>{children}</span>
    ),
    Button: ({
      children,
      disabled,
      id,
      onClick
    }: {
      children: React.ReactNode;
      disabled?: boolean;
      id?: string;
      onClick?: () => void;
    }) => (
      <button disabled={disabled} id={id} type="button" onClick={onClick}>
        {children}
      </button>
    ),
    Caption: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Overline: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Select: ({
      disabled,
      label,
      name,
      options,
      placeholder,
      rules
    }: {
      disabled?: boolean;
      label?: string;
      name: string;
      options: Array<{ label: string; value: string }>;
      placeholder?: string;
      rules?: Record<string, any>;
    }) => {
      const { control } = useFormContext();
      return (
        <Controller
          control={control}
          name={name}
          rules={rules}
          render={({ field, fieldState }) => (
            <div>
              {label && <label htmlFor={name}>{label}</label>}
              <select
                aria-label={label || name}
                data-placeholder={placeholder}
                disabled={disabled}
                id={name}
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value)}
              >
                <option value="">{placeholder}</option>
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {fieldState.error && <span>{fieldState.error.message}</span>}
            </div>
          )}
        />
      );
    },
    TextField: ({
      disabled,
      id,
      label,
      name,
      placeholder,
      rules,
      startComponent
    }: {
      disabled?: boolean;
      id?: string;
      label?: string;
      name: string;
      placeholder?: string;
      rules?: Record<string, any>;
      startComponent?: React.ReactNode;
    }) => {
      const { control } = useFormContext();
      return (
        <Controller
          control={control}
          name={name}
          rules={rules}
          render={({ field, fieldState }) => (
            <div>
              {label && <label htmlFor={id || name}>{label}</label>}
              {startComponent}
              <input
                disabled={disabled}
                id={id || name}
                placeholder={placeholder}
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value)}
              />
              {fieldState.error && <span>{fieldState.error.message}</span>}
            </div>
          )}
        />
      );
    }
  };
});

jest.mock('../modal', () => ({
  WithdrawalModal: ({
    error,
    loading,
    onClose,
    onConfirm,
    open
  }: {
    error?: string | null;
    loading?: boolean;
    onClose: () => void;
    onConfirm: () => void;
    open: boolean;
  }) =>
    open ? (
      <div data-testid="withdrawal-confirm-modal">
        {error && <div data-testid="modal-error">{error}</div>}
        <div data-testid="modal-loading">{String(Boolean(loading))}</div>
        <button type="button" onClick={onClose}>
          Close Modal
        </button>
        <button type="button" onClick={onConfirm}>
          Confirm Withdraw
        </button>
      </div>
    ) : null
}));

describe('WithdrawalForm', () => {
  const mockPush = jest.fn();
  const mockShowInfo = jest.fn();

  const baseSummary: WithdrawalSummary = {
    eventId: 'evt-1',
    eventName: 'Summer Event',
    eventOrganizerId: 'eo-1',
    eventStatus: 'EVENT_STATUS_ON_GOING',
    withdrawalAmount: '0',
    settlementAmount: '500000',
    availableAmount: '500000',
    totalAmount: '1000000',
    pendingSettlementAmount: '250000',
    lastUpdated: '2024-06-01',
    platformFee: '5',
    withdrawalFee: '5000',
    bankName: 'BCA',
    bankId: 'bank-1',
    accountNumber: '1234567890',
    accountHolderName: 'PT Organizer'
  };

  const baseEventDetail: EventDetail = {
    id: 'evt-1',
    name: 'Summer Event',
    eventType: 'Concert',
    description: 'Desc',
    address: 'Jakarta',
    mapLocationUrl: 'https://maps.google.com',
    metaUrl: 'summer-event',
    startDate: '2024-06-10',
    endDate: '2024-06-11',
    eventStatus: 'on_going',
    termAndConditions: 'Terms',
    websiteUrl: 'https://example.com',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    deletedAt: null,
    ticketTypes: [],
    group_tickets: [],
    tickets: [],
    city: { id: 'c1', name: 'Jakarta' },
    eventOrganizer: {} as any,
    paymentMethods: [],
    adminFee: 5,
    tax: 10,
    feeThresholds: [{ threshold: '0', platformFee: '5' }],
    eventAssets: [],
    is_requested: false,
    rejectedReason: null,
    rejectedFields: null,
    withdrawalFee: '5000',
    login_required: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useToast as jest.Mock).mockReturnValue({ showInfo: mockShowInfo });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders fallback placeholders when summary and eventDetail are null', async () => {
    render(
      <WithdrawalForm
        eventDetail={null}
        eventId="evt-1"
        summary={null}
        summaryLoading={false}
      />
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(6);
    expect(screen.getByLabelText('Bank Account')).toHaveAttribute(
      'data-placeholder',
      'No bank information available'
    );
    expect(screen.getByText('Withdraw')).toBeDisabled();
  });

  it('populates summary values and updates bank fields when summary changes', async () => {
    const { rerender } = render(
      <WithdrawalForm
        eventDetail={null}
        eventId="evt-1"
        summary={null}
        summaryLoading={false}
      />
    );

    rerender(
      <WithdrawalForm
        eventDetail={baseEventDetail}
        eventId="evt-1"
        summary={baseSummary}
        summaryLoading={false}
      />
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Account Holder')).toHaveValue(
        'PT Organizer'
      );
    });

    expect(screen.getByText(/1\.000\.000/)).toBeInTheDocument();
    expect(screen.getByText(/250\.000/)).toBeInTheDocument();
    expect(screen.getByText(/500\.000/)).toBeInTheDocument();
    expect(screen.getByLabelText('Bank Account')).toHaveValue(
      'BCA - 1234567890'
    );
  });

  it('handles summary with empty accountHolderName and accountNumber', async () => {
    render(
      <WithdrawalForm
        eventDetail={baseEventDetail}
        eventId="evt-1"
        summary={{
          ...baseSummary,
          accountHolderName: '',
          accountNumber: ''
        }}
        summaryLoading={false}
      />
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByPlaceholderText('Account Holder')).toHaveValue('');
  });

  it('calculates fees and shows validation errors for exceeded balance and non-positive grand total', async () => {
    render(
      <WithdrawalForm
        eventDetail={baseEventDetail}
        eventId="evt-1"
        summary={baseSummary}
        summaryLoading={false}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Withdrawal reason for'), {
      target: { value: 'Stage' }
    });

    const amountInput = screen.getByPlaceholderText(
      'Add Withdrawal Amount here'
    );

    // Valid amount: 100000 -> tax 10% (10000), afterRed=90000, platformFee 5% (4500), withdrawalFee=5000, grandTotal=90500
    fireEvent.change(amountInput, { target: { value: '100000' } });
    expect(screen.getByText(/4\.500/)).toBeInTheDocument();
    expect(screen.getByText(/5\.000/)).toBeInTheDocument();
    expect(screen.getByText(/90\.500/)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Withdraw')).toBeEnabled();
    });

    // Exceeds availableAmount (500000)
    fireEvent.change(amountInput, { target: { value: '600000' } });
    expect(
      screen.getByText(
        'Total amount (including fees) exceeds available balance'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Withdraw')).toBeDisabled();

    // Grand total <= 0 (amount 1000 with withdrawalFee 5000)
    fireEvent.change(amountInput, { target: { value: '1000' } });
    expect(
      screen.getByText('Grand total cannot be zero or negative')
    ).toBeInTheDocument();
    expect(screen.getByText('Withdraw')).toBeDisabled();
  });

  it('does not open modal when form validation fails on Withdraw click', async () => {
    render(
      <WithdrawalForm
        eventDetail={baseEventDetail}
        eventId="evt-1"
        summary={baseSummary}
        summaryLoading={false}
      />
    );

    const nameInput = screen.getByPlaceholderText('Withdrawal reason for');
    fireEvent.change(nameInput, { target: { value: 'Stage' } });
    fireEvent.change(
      screen.getByPlaceholderText('Add Withdrawal Amount here'),
      { target: { value: '100000' } }
    );

    await waitFor(() => {
      expect(screen.getByText('Withdraw')).toBeEnabled();
    });

    // Clear name and click before async isValid flips button back to disabled
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.click(screen.getByText('Withdraw'));

    await waitFor(() => {
      expect(
        screen.getByText('Withdrawal name is required')
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByTestId('withdrawal-confirm-modal')
    ).not.toBeInTheDocument();
  });

  it('submits withdrawal successfully and navigates to /finance', async () => {
    (withdrawalService.createWithdrawal as jest.Mock).mockResolvedValue({
      statusCode: 200,
      message: 'ok'
    });

    render(
      <WithdrawalForm
        eventDetail={baseEventDetail}
        eventId="evt-1"
        summary={baseSummary}
        summaryLoading={false}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Withdrawal reason for'), {
      target: { value: 'Vendor Stage' }
    });
    fireEvent.change(
      screen.getByPlaceholderText('Add Withdrawal Amount here'),
      { target: { value: '100000' } }
    );

    await waitFor(() => {
      expect(screen.getByText('Withdraw')).toBeEnabled();
    });
    fireEvent.click(screen.getByText('Withdraw'));

    await waitFor(() => {
      expect(
        screen.getByTestId('withdrawal-confirm-modal')
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Confirm Withdraw'));

    await waitFor(() => {
      expect(withdrawalService.createWithdrawal).toHaveBeenCalledWith({
        eventId: 'evt-1',
        requestedAmount: '100000',
        bankId: 'bank-1',
        accountNumber: '1234567890',
        accountHolderName: 'PT Organizer',
        withdrawalName: 'Vendor Stage'
      });
    });

    expect(mockShowInfo).toHaveBeenCalledWith('Withdrawal Success!');
    expect(mockPush).toHaveBeenCalledWith('/finance');
  });

  it('handles non-200 statusCode, fallback error message, non-Error throw, and modal close', async () => {
    (withdrawalService.createWithdrawal as jest.Mock)
      .mockResolvedValueOnce({
        statusCode: 400,
        message: 'Daily limit reached'
      })
      .mockResolvedValueOnce({
        statusCode: 500,
        message: ''
      })
      .mockRejectedValueOnce('string-failure');

    render(
      <WithdrawalForm
        eventDetail={baseEventDetail}
        eventId="evt-1"
        summary={{ ...baseSummary, bankId: '' }}
        summaryLoading={false}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Withdrawal reason for'), {
      target: { value: 'Lighting' }
    });
    fireEvent.change(
      screen.getByPlaceholderText('Add Withdrawal Amount here'),
      { target: { value: '100000' } }
    );

    await waitFor(() => {
      expect(screen.getByText('Withdraw')).toBeEnabled();
    });
    fireEvent.click(screen.getByText('Withdraw'));
    await waitFor(() => {
      expect(
        screen.getByTestId('withdrawal-confirm-modal')
      ).toBeInTheDocument();
    });

    // 1st attempt: statusCode 400 with message
    fireEvent.click(screen.getByText('Confirm Withdraw'));
    await waitFor(() => {
      expect(screen.getByTestId('modal-error')).toHaveTextContent(
        'Daily limit reached'
      );
    });

    // 2nd attempt: statusCode 500 without message
    fireEvent.click(screen.getByText('Confirm Withdraw'));
    await waitFor(() => {
      expect(screen.getByTestId('modal-error')).toHaveTextContent(
        'Failed to process withdrawal'
      );
    });

    // 3rd attempt: non-Error rejection
    fireEvent.click(screen.getByText('Confirm Withdraw'));
    await waitFor(() => {
      expect(screen.getByTestId('modal-error')).toHaveTextContent(
        'Failed to process withdrawal'
      );
    });

    // Close modal clears error and closes modal
    fireEvent.click(screen.getByText('Close Modal'));
    expect(
      screen.queryByTestId('withdrawal-confirm-modal')
    ).not.toBeInTheDocument();
  });

  it('disables Withdraw button when summaryLoading is true', async () => {
    render(
      <WithdrawalForm
        eventDetail={baseEventDetail}
        eventId="evt-1"
        summary={baseSummary}
        summaryLoading={true}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Withdrawal reason for'), {
      target: { value: 'Audio' }
    });
    fireEvent.change(
      screen.getByPlaceholderText('Add Withdrawal Amount here'),
      { target: { value: '100000' } }
    );

    await waitFor(() => {
      expect(screen.getByText('Withdraw')).toBeDisabled();
    });
  });
});
