import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { Checkbox } from './index';

describe('Checkbox', () => {
  it('renders without label', () => {
    render(<Checkbox data-testid="checkbox" />);
    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Checkbox label="Accept Terms" />);
    expect(screen.getByLabelText('Accept Terms')).toBeInTheDocument();
  });

  it('handles change events', () => {
    const handleChange = jest.fn();
    render(<Checkbox onChange={handleChange} label="Test" />);
    const checkbox = screen.getByLabelText('Test');
    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('can be checked', () => {
    render(<Checkbox checked readOnly label="Checked" />);
    const checkbox = screen.getByLabelText('Checked');
    expect(checkbox).toBeChecked();
  });
});
