import React from 'react';
import { render, screen } from '@testing-library/react';
import CustomTextField from './index';

// Mock StyledTextField
jest.mock('./StyledTextField', () => ({
  StyledTextField: (props: any) => (
    <div data-testid="text-field-container">
      {props.InputProps?.startAdornment}
      <input 
        data-testid="text-field-input" 
        value={props.value} 
        onChange={props.onChange}
        placeholder={props.placeholder}
      />
      {props.InputProps?.endAdornment}
    </div>
  )
}));

describe('CustomTextField', () => {
  it('renders correctly', () => {
    render(
      <CustomTextField
        label="Test Label"
        value=""
        onChange={() => {}}
      />
    );
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByTestId('text-field-input')).toBeInTheDocument();
  });

  it('renders start and end components', () => {
    render(
      <CustomTextField
        startComponent={<span data-testid="start">Start</span>}
        endComponent={<span data-testid="end">End</span>}
      />
    );
    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });
});
