import React from 'react';
import { render, screen } from '@testing-library/react';
import CustomTextArea from './index';

// Mock StyledTextField
jest.mock('../text-field/StyledTextField', () => {
  const { TextField } = require('@mui/material');
  return {
    StyledTextField: (props: any) => <TextField {...props} />
  };
});

describe('CustomTextArea', () => {
  it('renders correctly with label', () => {
    render(<CustomTextArea label="Comment" value="" onChange={() => {}} />);
    expect(screen.getByText('Comment')).toBeInTheDocument();
  });

  it('renders input area', () => {
    render(<CustomTextArea label="Comment" data-testid="textarea" />);
    // Since we mocked StyledTextField with TextField, it renders as input/textarea
    // MUI TextField usually renders label and input.
    // If multiline is true, it renders a textarea.
    expect(screen.getByText('Comment')).toBeInTheDocument();
  });
  
  it('displays error state', () => {
     // Checking if error prop is passed down
     const { container } = render(<CustomTextArea error label="Error" />);
     const errorDiv = container.querySelector('.Mui-error');
     expect(errorDiv).toBeInTheDocument();
  });
});
