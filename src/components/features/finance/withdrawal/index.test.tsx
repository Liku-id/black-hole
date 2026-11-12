import {
  act,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react';
import { useRouter } from 'next/router';

import { useEvents } from '@/hooks';
import { withdrawalService } from '@/services';

import FinanceWithdrawal from './index';

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({})
}));

jest.mock('@/hooks', () => ({
  useEvents: jest.fn()
}));

jest.mock('@/services', () => ({
  withdrawalService: {
    getSummaryByEventId: jest.fn()
  }
}));

jest.mock('@/components/common', () => ({
  AutoComplete: ({
    disabled,
    id,
    inputValue,
    loading,
    loadingText,
    noOptionsText,
    onChange,
    onInputChange,
    open,
    options,
    placeholder,
    value
  }: {
    disabled?: boolean;
    id?: string;
    inputValue?: string;
    loading?: boolean;
    loadingText?: string;
    noOptionsText?: string;
    onChange?: (event: any, newValue: any, reason: string) => void;
    onInputChange?: (event: any, newInputValue: string, reason: string) => void;
    open?: boolean;
    options: Array<{ id: string; label: string; value: string }>;
    placeholder?: string;
    value?: { id: string; label: string; value: string } | null;
  }) => (
    <div
      data-disabled={String(Boolean(disabled))}
      data-loading={String(Boolean(loading))}
      data-loading-text={loadingText}
      data-no-options-text={noOptionsText}
      data-open={String(Boolean(open))}
      data-selected-id={value?.id || ''}
      data-testid="autocomplete"
      id={id}
    >
      <input
        data-testid="autocomplete-input"
        disabled={disabled}
        placeholder={placeholder}
        value={inputValue || ''}
        onChange={(e) => onInputChange?.(e, e.target.value, 'input')}
      />
      <button
        type="button"
        onClick={() => onInputChange?.(null, 'reset-text', 'reset')}
      >
        Trigger Reset Input
      </button>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange?.(null, opt, 'selectOption')}
        >
          Select {opt.label}
        </button>
      ))}
      <button
        type="button"
        onClick={() =>
          onChange?.(
            null,
            { id: 'unknown-id', label: 'Unknown', value: 'unknown-id' },
            'selectOption'
          )
        }
      >
        Select Unknown
      </button>
      <button
        type="button"
        onClick={() => onChange?.(null, null, 'selectOption')}
      >
        Select Null
      </button>
      <button type="button" onClick={() => onChange?.(null, null, 'clear')}>
        Clear Selection
      </button>
      <button type="button" onClick={() => onChange?.(null, null, 'blur')}>
        Blur Selection
      </button>
    </div>
  ),
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
    <span>{children}</span>
  )
}));

describe('FinanceWithdrawal', () => {
  const mockPush = jest.fn();
  const mockEvents = [
    {
      id: 'evt-1',
      name: 'Music Fest',
      metaUrl: 'music-fest',
      eventOrganizerId: 'eo-1'
    },
    {
      id: 'evt-2',
      name: 'Zero Balance Event',
      metaUrl: 'zero-balance',
      eventOrganizerId: ''
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useEvents as jest.Mock).mockReturnValue({
      events: mockEvents,
      loading: false
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('renders loading state when events are loading', () => {
    (useEvents as jest.Mock).mockReturnValue({
      events: [],
      loading: true
    });

    render(<FinanceWithdrawal />);

    expect(
      screen.getByPlaceholderText('Loading events...')
    ).toBeInTheDocument();
    expect(screen.getByTestId('autocomplete')).toHaveAttribute(
      'data-disabled',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Withdrawal' })).toBeDisabled();
  });

  it('navigates to withdrawal history when history icon is clicked', () => {
    const { container } = render(<FinanceWithdrawal />);

    const historyIcon = container.querySelector('#withdrawal_history_icon');
    fireEvent.click(historyIcon!);

    expect(mockPush).toHaveBeenCalledWith('/finance/withdrawal/history');
  });

  it('handles debounced input search, empty input, non-input reason, and searching completion', () => {
    jest.useFakeTimers();

    const { rerender } = render(<FinanceWithdrawal />);
    const input = screen.getByTestId('autocomplete-input');

    // Type search query -> opens dropdown & schedules debounce
    fireEvent.change(input, { target: { value: 'Music' } });
    expect(screen.getByTestId('autocomplete')).toHaveAttribute(
      'data-open',
      'true'
    );

    // While search request is in-flight, useEvents returns loading: true
    (useEvents as jest.Mock).mockReturnValue({
      events: mockEvents,
      loading: true
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(useEvents).toHaveBeenLastCalledWith({
      status: ['EVENT_STATUS_ON_GOING', 'EVENT_STATUS_DONE'],
      name: 'Music'
    });
    expect(screen.getByTestId('autocomplete')).toHaveAttribute(
      'data-no-options-text',
      'No events found for "Music"'
    );
    expect(screen.getByTestId('autocomplete')).toHaveAttribute(
      'data-loading',
      'true'
    );

    // Once useEvents finishes loading, useEffect resets isSearching to false
    (useEvents as jest.Mock).mockReturnValue({
      events: mockEvents,
      loading: false
    });
    rerender(<FinanceWithdrawal />);
    expect(screen.getByTestId('autocomplete')).toHaveAttribute(
      'data-loading',
      'false'
    );

    // Whitespace input resets search and closes dropdown
    fireEvent.change(input, { target: { value: '   ' } });
    expect(screen.getByTestId('autocomplete')).toHaveAttribute(
      'data-open',
      'false'
    );
    expect(screen.getByTestId('autocomplete')).toHaveAttribute(
      'data-no-options-text',
      'No events available'
    );

    // Non-input reason updates inputValue only
    fireEvent.click(screen.getByText('Trigger Reset Input'));
    expect(input).toHaveValue('reset-text');
  });

  it('selects project, fetches summary, invokes callback, and navigates on Withdrawal click', async () => {
    const onEventOrganizerSelect = jest.fn();
    let resolveSummary: (value: any) => void;
    const summaryPromise = new Promise((resolve) => {
      resolveSummary = resolve;
    });
    (withdrawalService.getSummaryByEventId as jest.Mock).mockReturnValue(
      summaryPromise
    );

    render(
      <FinanceWithdrawal onEventOrganizerSelect={onEventOrganizerSelect} />
    );

    fireEvent.click(screen.getByText('Select Music Fest'));

    expect(onEventOrganizerSelect).toHaveBeenCalledWith('eo-1');
    expect(withdrawalService.getSummaryByEventId).toHaveBeenCalledWith('evt-1');
    expect(screen.getAllByText('Loading...')).toHaveLength(3);

    await act(async () => {
      resolveSummary!({
        body: {
          totalAmount: '1000000',
          pendingSettlementAmount: '200000',
          availableAmount: '800000'
        }
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/1\.000\.000/)).toBeInTheDocument();
    });
    expect(screen.getByText(/200\.000/)).toBeInTheDocument();
    expect(screen.getByText(/800\.000/)).toBeInTheDocument();

    const withdrawBtn = screen.getByRole('button', { name: 'Withdrawal' });
    expect(withdrawBtn).toBeEnabled();
    fireEvent.click(withdrawBtn);

    expect(mockPush).toHaveBeenCalledWith('/finance/withdrawal/music-fest');
  });

  it('keeps Withdrawal disabled when availableAmount is 0 and handles missing EO id, clear, null, unknown, and blur', async () => {
    const onEventOrganizerSelect = jest.fn();
    (withdrawalService.getSummaryByEventId as jest.Mock).mockResolvedValue({
      body: {
        totalAmount: '500000',
        pendingSettlementAmount: '500000',
        availableAmount: '0'
      }
    });

    render(
      <FinanceWithdrawal onEventOrganizerSelect={onEventOrganizerSelect} />
    );

    // Select event without eventOrganizerId
    fireEvent.click(screen.getByText('Select Zero Balance Event'));
    expect(onEventOrganizerSelect).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getAllByText(/500\.000/)).toHaveLength(2);
    });
    expect(screen.getByRole('button', { name: 'Withdrawal' })).toBeDisabled();

    // Clear selection
    fireEvent.click(screen.getByText('Clear Selection'));
    expect(screen.getAllByText('Rp 0')).toHaveLength(3);

    // Select unknown event ID -> selectedProject null
    fireEvent.click(screen.getByText('Select Unknown'));
    expect(screen.getByTestId('autocomplete')).toHaveAttribute(
      'data-selected-id',
      ''
    );

    // Select null with selectOption
    fireEvent.click(screen.getByText('Select Null'));
    expect(screen.getByTestId('autocomplete')).toHaveAttribute(
      'data-selected-id',
      ''
    );

    // Non-matching reason like blur
    fireEvent.click(screen.getByText('Blur Selection'));
  });

  it('logs console.error when getSummaryByEventId fails', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const fetchErr = new Error('Network failure');
    (withdrawalService.getSummaryByEventId as jest.Mock).mockRejectedValue(
      fetchErr
    );

    render(<FinanceWithdrawal />);

    fireEvent.click(screen.getByText('Select Music Fest'));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to fetch withdrawal summary:',
        fetchErr
      );
    });
    expect(screen.getAllByText('Rp 0')).toHaveLength(3);
  });
});
