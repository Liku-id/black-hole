import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import WithdrawalFilter from './filter';

// Mock Select
jest.mock('@/components/common', () => ({
  Select: ({ value, onChange, options }: any) => (
    <select data-testid="status-select" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}));

describe('WithdrawalFilter', () => {
  it('renders with correct options', () => {
    render(
      <WithdrawalFilter
        status=""
        onStatusChange={() => {}}
      />
    );
    expect(screen.getByText('All Status')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('calls onStatusChange', () => {
    const handleChange = jest.fn();
    render(
      <WithdrawalFilter
        status=""
        onStatusChange={handleChange}
      />
    );
    
    const select = screen.getByTestId('status-select');
    fireEvent.change(select, { target: { value: 'PENDING' } });
    expect(handleChange).toHaveBeenCalledWith('PENDING');
  });
});
