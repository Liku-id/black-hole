import { ThemeProvider, createTheme } from '@mui/material/styles';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import RegisterProfileForm from './index';

const theme = createTheme();

// Mock Next.js Image/Link
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}));
// Link is used, checking if we need to mock it.
jest.mock('next/link', () => {
  return ({ children, href }: any) => {
    return <a href={href}>{children}</a>;
  };
});

jest.mock('@/components/common', () => {
  const { useFormContext } = require('react-hook-form');
  return {
    Button: (props: any) => (
      <button
        type={props.type}
        onClick={props.onClick}
        disabled={props.disabled}
      >
        {props.children}
      </button>
    ),
    Body2: ({ children }: any) => <div>{children}</div>,
    Caption: ({ children }: any) => <div>{children}</div>,
    H3: ({ children }: any) => <h3>{children}</h3>,
    TextField: (props: any) => {
      const { name, label, placeholder, rules, type, InputProps, ...rest } =
        props;

      // We are inside a mock factory, so we can use hooks from required module
      // useFormContext should return methods if inside FormProvider
      const context = useFormContext();

      if (!name) {
        // Social media inputs (no name, controlled)
        return (
          <div>
            {InputProps?.startAdornment}
            <input placeholder={placeholder} {...rest} />
            {InputProps?.endAdornment}
          </div>
        );
      }

      if (!context) {
        return <div>TextField outside FormProvider</div>;
      }

      const {
        register,
        formState: { errors }
      } = context;

      return (
        <div>
          <label htmlFor={name}>{label}</label>
          <input
            id={name}
            type={type}
            placeholder={placeholder}
            {...register(name, rules)}
            readOnly={InputProps?.readOnly}
          />
          {InputProps?.endAdornment}
          {errors[name] && <span>{errors[name].message}</span>}
        </div>
      );
    },
    TextArea: ({ name, label, placeholder, rules }: any) => {
      const {
        register,
        formState: { errors }
      } = useFormContext();
      return (
        <div>
          <label htmlFor={name}>{label}</label>
          <textarea
            id={name}
            placeholder={placeholder}
            {...register(name, rules)}
          />
          {errors[name] && <span>{errors[name].message}</span>}
        </div>
      );
    },
    Checkbox: (props: any) => <input type="checkbox" {...props} />
  };
});

describe('RegisterProfileForm', () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    }))
  });
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <ThemeProvider theme={theme}>
        <RegisterProfileForm onSubmit={mockOnSubmit} />
      </ThemeProvider>
    );

    expect(screen.getByText('Complete Your Profile')).toBeInTheDocument();
    expect(screen.getByLabelText(/Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/About Organizer/i)).toBeInTheDocument();

    // Check social media inputs
    const inputs = screen.getAllByPlaceholderText('Link Profile Account');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('validates required fields', async () => {
    render(
      <ThemeProvider theme={theme}>
        <RegisterProfileForm onSubmit={mockOnSubmit} />
      </ThemeProvider>
    );

    const submitButton = screen.getByRole('button', { name: 'Sign Up' });
    fireEvent.click(submitButton);

    expect(await screen.findByText('Address is required')).toBeInTheDocument();
    expect(
      await screen.findByText('About organizer is required')
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        'You must accept the terms and conditions and privacy policy'
      )
    ).toBeInTheDocument();
  });

  it('validates social media requirement', async () => {
    render(
      <ThemeProvider theme={theme}>
        <RegisterProfileForm onSubmit={mockOnSubmit} />
      </ThemeProvider>
    );

    // Fill all other fields
    fireEvent.change(screen.getByLabelText(/Address/i), {
      target: { value: 'SoHo' }
    });
    fireEvent.change(screen.getByLabelText(/About Organizer/i), {
      target: { value: 'Cool org' }
    });
    fireEvent.click(screen.getByRole('checkbox')); // Accept terms

    // Try submit with empty social media
    const submitButton = screen.getByRole('button', { name: 'Sign Up' });
    fireEvent.click(submitButton);

    expect(
      await screen.findByText('At least one social media link is required')
    ).toBeInTheDocument();

    // Fill one social media
    const inputs = screen.getAllByPlaceholderText('Link Profile Account');
    fireEvent.change(inputs[0], {
      target: { value: 'http://tiktok.com/me' }
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('adds and removes social media inputs', () => {
    render(
      <ThemeProvider theme={theme}>
        <RegisterProfileForm onSubmit={mockOnSubmit} />
      </ThemeProvider>
    );

    const inputs = screen.getAllByPlaceholderText('Link Profile Account');
    expect(inputs[0]).toHaveValue('');

    fireEvent.change(inputs[0], { target: { value: 'test' } });
    expect(inputs[0]).toHaveValue('test');

    const deleteButton = screen.getAllByAltText('Delete')[0];
    fireEvent.click(deleteButton);

    expect(inputs[0]).toHaveValue('');
  });
});
