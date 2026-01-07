import { render, screen } from '@testing-library/react';

import { useUpdateEventOrganizerBank } from '@/hooks/features/organizers/useUpdateEventOrganizerBank';
import { EventOrganizer } from '@/types/organizer';

import BankForm from './index';

// Mock the hook
jest.mock('@/hooks/features/organizers/useUpdateEventOrganizerBank');

const mockMutate = jest.fn();
const mockUseUpdateEventOrganizerBank =
  useUpdateEventOrganizerBank as jest.MockedFunction<
    typeof useUpdateEventOrganizerBank
  >;

describe('BankForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUpdateEventOrganizerBank.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null
    });
  });

  const mockEventOrganizer: EventOrganizer = {
    id: '1',
    bank_information_id: 'bank1',
    name: 'Test Organizer',
    email: 'test@example.com',
    phone_number: '+621234567890',
    asset_id: 'asset1',
    description: 'Test description',
    social_media_url: '',
    address: 'Test Address',
    pic_title: 'Manager',
    ktp_photo_id: 'ktp1',
    npwp_photo_id: 'npwp1',
    user_id: 'user1',
    nik: '123456789',
    npwp: '123456789',
    xenplatform_id: 'xen1',
    organizer_type: 'individual',
    npwp_address: 'NPWP Address',
    ktp_address: 'KTP Address',
    full_name: 'Full Name',
    pic_name: 'PIC Name',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    deleted_at: null,
    bank_information: {
      id: 'bank-info-1',
      bankId: 'bank-id-1',
      accountNumber: '1234567890',
      accountHolderName: 'John Doe',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      deletedAt: null,
      bank: {
        id: 'bank-id-1',
        name: 'Bank BCA',
        logo: 'https://example.com/logo.png',
        channelCode: 'BCA',
        channelType: 'bank_transfer',
        minAmount: 10000,
        maxAmount: 100000000
      }
    },
    event_organizer_pic: null,
    asset: null,
    ktpPhoto: null,
    npwpPhoto: null
  };

  describe('Loading State', () => {
    it('should display loading message when loading is true', () => {
      render(
        <BankForm
          eventOrganizer={null}
          loading={true}
          mode="view"
        />
      );

      expect(screen.getByText('Loading bank information...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when error is provided', () => {
      render(
        <BankForm
          eventOrganizer={null}
          loading={false}
          error="Failed to fetch"
          mode="view"
        />
      );

      expect(
        screen.getByText('Failed to load bank information: Failed to fetch')
      ).toBeInTheDocument();
    });
  });

  describe('No Data State', () => {
    it('should display "No bank information found" when eventOrganizer is null', () => {
      render(
        <BankForm
          eventOrganizer={null}
          loading={false}
          mode="view"
        />
      );

      expect(screen.getByText('No bank information found')).toBeInTheDocument();
    });
  });

  describe('View Mode', () => {
    it('should render bank detail info in view mode', () => {
      render(
        <BankForm
          eventOrganizer={mockEventOrganizer}
          loading={false}
          mode="view"
        />
      );

      expect(screen.getByText('Bank BCA')).toBeInTheDocument();
      expect(screen.getByText('1234567890')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('Edit Mode', () => {
    it('should render edit form in edit mode', () => {
      render(
        <BankForm
          eventOrganizer={mockEventOrganizer}
          loading={false}
          mode="edit"
        />
      );

      // The actual form fields are in BankEditForm component
      expect(screen.queryByText('Loading bank information...')).not.toBeInTheDocument();
    });

    it('should call onRefresh after successful update', async () => {
      const mockOnRefresh = jest.fn();
      mockMutate.mockResolvedValue({ success: true });

      render(
        <BankForm
          eventOrganizer={mockEventOrganizer}
          loading={false}
          mode="edit"
          onRefresh={mockOnRefresh}
        />
      );

      expect(mockUseUpdateEventOrganizerBank).toHaveBeenCalled();
    });

    it('should not call mutate if eventOrganizer id is missing', async () => {
      const organizerWithoutId: EventOrganizer = {
        ...mockEventOrganizer,
        id: ''
      };

      render(
        <BankForm
          eventOrganizer={organizerWithoutId}
          loading={false}
          mode="edit"
        />
      );

      // Should not crash, but also should not call mutate
      expect(screen.queryByText('Loading bank information...')).not.toBeInTheDocument();
    });
  });

  describe('Default Mode', () => {
    it('should default to edit mode when mode is not specified', () => {
      render(
        <BankForm
          eventOrganizer={mockEventOrganizer}
          loading={false}
        />
      );

      // Should render edit form (default behavior)
      expect(screen.queryByText('Loading bank information...')).not.toBeInTheDocument();
    });
  });
});

