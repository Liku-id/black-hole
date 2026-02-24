import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ExportModal } from './index';

// Mock Hooks
const mockExportData = jest.fn();
jest.mock('@/hooks', () => ({
  useEvents: () => ({
    events: [{ id: '1', name: 'Event 1' }, { id: '2', name: 'Event 2' }],
    loading: false,
  }),
  useExportTransactions: () => ({
    exportData: mockExportData,
    loading: false,
  }),
}));

const mockShowInfo = jest.fn();
const mockShowError = jest.fn();
jest.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({
    showInfo: mockShowInfo,
    showError: mockShowError,
  }),
}));

jest.mock('@/components/common', () => {
    const { useFormContext } = require('react-hook-form');
    return {
        Modal: ({ children, title, open, onClose, footer }: any) => {
            if (!open) return null;
            return (
                <div role="dialog">
                    <h2>{title}</h2>
                    <button onClick={onClose}>Close</button>
                    {children}
                    {footer}
                </div>
            )
        },
        Button: (props: any) => <button {...props}>{props.children}</button>,
        Select: ({ name, label, options, rules, placeholder }: any) => {
            const { register } = useFormContext();
            return (
                <div>
                    <label htmlFor={name}>{label}</label>
                    <select id={name} data-testid={name} {...register(name, rules)}>
                       <option value="">{placeholder}</option>
                       {options?.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
            );
        },
        DateField: ({ name, label, placeholder, rules }: any) => {
             const { register } = useFormContext();
             // DateField usually is controlled, but for test we can use register if simpler, 
             // or mock as input that takes value/onChange if Controller is used. 
             // Assuming Register/Controller usage, let's stick to register for simple text input mock
             return (
                 <div>
                     <label htmlFor={name}>{label}</label>
                     <input id={name} data-testid={name} placeholder={placeholder} {...register(name, rules)} />
                 </div>
             );
        },
    };
});

describe('ExportModal', () => {
  const mockOnClose = jest.fn();
  const defaultProps = {
    open: true,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<ExportModal {...defaultProps} />);
    
    expect(screen.getByText('Export Transaction')).toBeInTheDocument();
    expect(screen.getByTestId('eventId')).toBeInTheDocument();
    expect(screen.getByTestId('paymentStatus')).toBeInTheDocument();
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
  });

  it('submits form correctly', async () => {
    render(<ExportModal {...defaultProps} />);
    
    const exportButton = screen.getByText('Export CSV');
    await userEvent.click(exportButton);
    
    await waitFor(() => {
        expect(mockExportData).toHaveBeenCalled();
    });
    await userEvent.click(exportButton);
    
    await waitFor(() => {
        expect(mockExportData).toHaveBeenCalled();
    });
  });
});
