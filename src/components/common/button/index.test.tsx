import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CustomButton from './index';

describe('CustomButton', () => {
  it('renders correctly with default props', () => {
    render(<CustomButton>Click me</CustomButton>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    // Check default primary styles implicitly by class or computed style if needed, 
    // but usually existence is enough for unit test unless visual regression.
  });

  it('renders primary variant correctly', () => {
    render(<CustomButton variant="primary">Primary</CustomButton>);
    const button = screen.getByRole('button', { name: /primary/i });
    expect(button).toBeInTheDocument();
  });

  it('renders secondary variant correctly', () => {
    render(<CustomButton variant="secondary">Secondary</CustomButton>);
    const button = screen.getByRole('button', { name: /secondary/i });
    expect(button).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<CustomButton onClick={handleClick}>Click me</CustomButton>);
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    render(<CustomButton disabled>Disabled</CustomButton>);
    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
  });
});
