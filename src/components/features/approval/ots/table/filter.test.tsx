import { fireEvent, render, screen } from '@testing-library/react';

import OTSFilter from './filter';

jest.mock('@/components/common', () => ({
  Select: ({
    onChange,
    options,
    value
  }: {
    onChange: (value: string) => void;
    options: Array<{ label: string; value: string }>;
    value: string;
  }) => (
    <select
      data-testid="ots-status-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}));

describe('OTSFilter', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders all status options and current selected value', () => {
    render(<OTSFilter status="pending" onStatusChange={jest.fn()} />);

    const select = screen.getByTestId('ots-status-select') as HTMLSelectElement;
    expect(select.value).toBe('pending');
    expect(screen.getByText('All Status')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });

  it('calls onStatusChange when selection changes', () => {
    const onStatusChange = jest.fn();

    render(<OTSFilter status="" onStatusChange={onStatusChange} />);

    fireEvent.change(screen.getByTestId('ots-status-select'), {
      target: { value: 'approved' }
    });

    expect(onStatusChange).toHaveBeenCalledWith('approved');
  });
});
