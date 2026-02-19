import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterProfileForm from './index';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

// Mock Next.js Image/Link
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
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
        Button: (props: any) => <button type={props.type} onClick={props.onClick} disabled={props.disabled}>{props.children}</button>,
        Body2: ({ children }: any) => <div>{children}</div>,
        Caption: ({ children }: any) => <div>{children}</div>,
        H3: ({ children }: any) => <h3>{children}</h3>,
        TextField: (props: any) => {
             const { name, label, placeholder, rules, type, InputProps, ...rest } = props;
             
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
             
             const { register, formState: { errors } } = context;
             
             if (name === 'address') {
                 console.log('TextField rendering address. Errors:', errors ? errors[name] : 'no errors');
             }

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
             const { register, formState: { errors } } = useFormContext();
             return (
                 <div>
                     <label htmlFor={name}>{label}</label>
                     <textarea id={name} placeholder={placeholder} {...register(name, rules)} />
                     {errors[name] && <span>{errors[name].message}</span>}
                 </div>
             );
        },
        Checkbox: (props: any) => <input type="checkbox" {...props} />,
    };
});

describe('RegisterProfileForm', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
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
    await userEvent.click(submitButton);
    
    expect(await screen.findByText('Address is required')).toBeInTheDocument();
    expect(await screen.findByText('About organizer is required')).toBeInTheDocument();
    expect(await screen.findByText('You must accept the terms and conditions and privacy policy')).toBeInTheDocument();
  });

  it('validates social media requirement', async () => {
    render(
      <ThemeProvider theme={theme}>
        <RegisterProfileForm onSubmit={mockOnSubmit} />
      </ThemeProvider>
    );
    
    // Fill all other fields
    await userEvent.type(screen.getByLabelText(/Address/i), 'SoHo');
    await userEvent.type(screen.getByLabelText(/About Organizer/i), 'Cool org');
    await userEvent.click(screen.getByRole('checkbox')); // Accept terms
    
    // Social media fields are empty by default?
    // Code: defaultValues has socialMedia: []. 
    // State initializes with 3 empty items.
    
    // Try submit with empty social media
    const submitButton = screen.getByRole('button', { name: 'Sign Up' });
    await userEvent.click(submitButton);
    
    expect(await screen.findByText('At least one social media link is required')).toBeInTheDocument();
    
    // Fill one social media
    const inputs = screen.getAllByPlaceholderText('Link Profile Account');
    await userEvent.type(inputs[0], 'http://tiktok.com/me');
    
    await userEvent.click(submitButton);
    
    await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('adds and removes social media inputs', async () => {
    render(
      <ThemeProvider theme={theme}>
        <RegisterProfileForm onSubmit={mockOnSubmit} />
      </ThemeProvider>
    );
    
    const inputs = screen.getAllByPlaceholderText('Link Profile Account');
    expect(inputs[0]).toHaveValue('');
    
    await userEvent.type(inputs[0], 'test');
    expect(inputs[0]).toHaveValue('test');
    
    // Find delete button
    // It has ID `${[link.platform]}_clear_icon_button`
    // link.platform is tiktok for index 0.
    // id="tiktok_clear_icon_button" ???
    // The code: id={`${[link.platform]}_clear_icon_button`} -> actually `['tiktok']` toString is `tiktok`. 
    // So `tiktok_clear_icon_button`.
    
    // Wait, array toString `['tiktok'].toString()` is `'tiktok'`.
    
    // However, the delete button only appears if link.url !== ''.
    
    // Note: Since I am using `userEvent.type`, verify value update.
    
    // We can query by img with alt="Delete" inside the input adornment.
    const deleteButton = screen.getAllByAltText('Delete')[0];
    await userEvent.click(deleteButton);
    
    expect(inputs[0]).toHaveValue('');
  });
});
