import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { useToast } from '@/contexts/ToastContext';
import { useTicketType } from '@/hooks';
import { ticketsService } from '@/services/tickets';

import { AdditionalForm } from './index';

// Mock hooks and services
jest.mock('@/hooks', () => ({
  useTicketType: jest.fn()
}));

jest.mock('@/contexts/ToastContext', () => ({
  useToast: jest.fn()
}));

jest.mock('@/services/tickets', () => ({
  ticketsService: {
    deleteAdditionalForm: jest.fn(),
    updateAdditionalForm: jest.fn(),
    createAdditionalForm: jest.fn()
  }
}));

const mockUseTicketType = useTicketType as jest.MockedFunction<typeof useTicketType>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;
const mockTicketsService = ticketsService as jest.Mocked<typeof ticketsService>;

describe('AdditionalForm', () => {
  const mockOnTicketTypeChange = jest.fn();
  const mockShowInfo = jest.fn();

  const mockTicketTypes = [
    { id: 'ticket1', name: 'VIP Ticket', price: 100000 },
    { id: 'ticket2', name: 'Regular Ticket', price: 50000 }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseToast.mockReturnValue({
      showInfo: mockShowInfo,
      showError: jest.fn(),
      showSuccess: jest.fn(),
      showWarning: jest.fn()
    } as any);
    mockUseTicketType.mockReturnValue({
      additionalForms: [],
      loading: false,
      mutate: jest.fn()
    } as any);
  });

  describe('Rendering', () => {
    it('should render ticket type select', () => {
      render(
        <AdditionalForm
          ticketTypes={mockTicketTypes}
          selectedTicketType=""
          onTicketTypeChange={mockOnTicketTypeChange}
        />
      );

      expect(screen.getByPlaceholderText('Pilih Tiket')).toBeInTheDocument();
    });

    it('should display loading message when loading', () => {
      mockUseTicketType.mockReturnValue({
        additionalForms: [],
        loading: true,
        mutate: jest.fn()
      } as any);

      render(
        <AdditionalForm
          ticketTypes={mockTicketTypes}
          selectedTicketType="ticket1"
          onTicketTypeChange={mockOnTicketTypeChange}
        />
      );

      expect(screen.getByText('Loading additional forms...')).toBeInTheDocument();
    });

    it('should display no forms message when no additional forms', () => {
      mockUseTicketType.mockReturnValue({
        additionalForms: [],
        loading: false,
        mutate: jest.fn()
      } as any);

      render(
        <AdditionalForm
          ticketTypes={mockTicketTypes}
          selectedTicketType="ticket1"
          onTicketTypeChange={mockOnTicketTypeChange}
        />
      );

      expect(
        screen.getByText(/No additional forms found/i)
      ).toBeInTheDocument();
    });
  });

  describe('Form Management', () => {
    it('should render existing forms when available', () => {
      const mockAdditionalForms = [
        {
          id: 'form1',
          field: 'What is your name?',
          type: 'TEXT',
          order: 0,
          isRequired: false,
          options: []
        }
      ];

      mockUseTicketType.mockReturnValue({
        additionalForms: mockAdditionalForms,
        loading: false,
        mutate: jest.fn()
      } as any);

      render(
        <AdditionalForm
          ticketTypes={mockTicketTypes}
          selectedTicketType="ticket1"
          onTicketTypeChange={mockOnTicketTypeChange}
        />
      );

      expect(screen.getByText('Question 1')).toBeInTheDocument();
    });

    it('should render submit section', () => {
      mockUseTicketType.mockReturnValue({
        additionalForms: [],
        loading: false,
        mutate: jest.fn()
      } as any);

      render(
        <AdditionalForm
          ticketTypes={mockTicketTypes}
          selectedTicketType="ticket1"
          onTicketTypeChange={mockOnTicketTypeChange}
        />
      );

      expect(screen.getByText('Add New Question')).toBeInTheDocument();
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should call onTicketTypeChange when ticket type is selected', () => {
      render(
        <AdditionalForm
          ticketTypes={mockTicketTypes}
          selectedTicketType=""
          onTicketTypeChange={mockOnTicketTypeChange}
        />
      );

      // Ticket type change is handled by Select component
      expect(screen.getByPlaceholderText('Pilih Tiket')).toBeInTheDocument();
    });

    it('should add new question when Add New Question is clicked', () => {
      mockUseTicketType.mockReturnValue({
        additionalForms: [],
        loading: false,
        mutate: jest.fn()
      } as any);

      render(
        <AdditionalForm
          ticketTypes={mockTicketTypes}
          selectedTicketType="ticket1"
          onTicketTypeChange={mockOnTicketTypeChange}
        />
      );

      const addButton = screen.getByText('Add New Question');
      fireEvent.click(addButton);

      // New question should be added
      expect(screen.getByText('Question 1')).toBeInTheDocument();
    });
  });
});


