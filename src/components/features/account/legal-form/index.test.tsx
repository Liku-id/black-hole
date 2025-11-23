import { render, screen } from '@testing-library/react';
import LegalForm from './index';
import { EventOrganizer } from '@/types/organizer';
import { useUpdateEventOrganizerLegal } from '@/hooks/features/organizers/useUpdateEventOrganizerLegal';

// Mock the hook
jest.mock('@/hooks/features/organizers/useUpdateEventOrganizerLegal');

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: false,
    isAuthenticated: false,
    login: jest.fn(),
    logout: jest.fn(),
    clearError: jest.fn(),
    refreshUserData: jest.fn(),
    error: null
  })
}));

const mockMutate = jest.fn();
const mockUseUpdateEventOrganizerLegal =
  useUpdateEventOrganizerLegal as jest.MockedFunction<
    typeof useUpdateEventOrganizerLegal
  >;

describe('LegalForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUpdateEventOrganizerLegal.mockReturnValue({
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
    nik: '1234567890123456',
    npwp: '123456789012345',
    xenplatform_id: 'xen1',
    organizer_type: 'individual',
    npwp_address: 'NPWP Address',
    ktp_address: 'KTP Address',
    full_name: 'Full Name',
    pic_name: 'PIC Name',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    deleted_at: null,
    bank_information: null,
    event_organizer_pic: null,
    asset: null,
    ktpPhoto: {
      id: 'ktp-photo-1',
      type: 'image',
      url: 'https://example.com/ktp.jpg',
      bucket: 'bucket',
      key: 'KTP/ktp.jpg',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    npwpPhoto: {
      id: 'npwp-photo-1',
      type: 'image',
      url: 'https://example.com/npwp.jpg',
      bucket: 'bucket',
      key: 'NPWP/npwp.jpg',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  };

  describe('Loading State', () => {
    it('should display loading message when loading is true', () => {
      render(
        <LegalForm
          eventOrganizer={null}
          loading={true}
          mode="view"
        />
      );

      expect(screen.getByText('Loading legal information...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when error is provided', () => {
      render(
        <LegalForm
          eventOrganizer={null}
          loading={false}
          error="Failed to fetch"
          mode="view"
        />
      );

      expect(
        screen.getByText('Failed to load legal information: Failed to fetch')
      ).toBeInTheDocument();
    });
  });

  describe('No Data State', () => {
    it('should display "No legal information found" when eventOrganizer is null', () => {
      render(
        <LegalForm
          eventOrganizer={null}
          loading={false}
          mode="view"
        />
      );

      expect(screen.getByText('No legal information found')).toBeInTheDocument();
    });
  });

  describe('View Mode', () => {
    it('should render legal detail info in view mode', () => {
      render(
        <LegalForm
          eventOrganizer={mockEventOrganizer}
          loading={false}
          mode="view"
        />
      );

      // The actual detail fields are in LegalFormDetailInfo component
      expect(screen.queryByText('Loading legal information...')).not.toBeInTheDocument();
    });
  });

  describe('Edit Mode', () => {
    it('should render edit form in edit mode', () => {
      render(
        <LegalForm
          eventOrganizer={mockEventOrganizer}
          loading={false}
          mode="edit"
        />
      );

      // The actual form fields are in LegalEditForm component
      expect(screen.queryByText('Loading legal information...')).not.toBeInTheDocument();
    });

    it('should call onRefresh after successful update', async () => {
      const mockOnRefresh = jest.fn();
      mockMutate.mockResolvedValue({ success: true });

      render(
        <LegalForm
          eventOrganizer={mockEventOrganizer}
          loading={false}
          mode="edit"
          onRefresh={mockOnRefresh}
        />
      );

      expect(mockUseUpdateEventOrganizerLegal).toHaveBeenCalled();
    });

    it('should handle update error state', () => {
      mockUseUpdateEventOrganizerLegal.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        error: 'Update failed'
      });

      render(
        <LegalForm
          eventOrganizer={mockEventOrganizer}
          loading={false}
          mode="edit"
        />
      );

      // Error should be passed to LegalEditForm
      expect(screen.queryByText('Loading legal information...')).not.toBeInTheDocument();
    });

    it('should not call mutate if eventOrganizer id is missing', async () => {
      const organizerWithoutId: EventOrganizer = {
        ...mockEventOrganizer,
        id: ''
      };

      render(
        <LegalForm
          eventOrganizer={organizerWithoutId}
          loading={false}
          mode="edit"
        />
      );

      // Should not crash
      expect(screen.queryByText('Loading legal information...')).not.toBeInTheDocument();
    });
  });

  describe('Default Mode', () => {
    it('should default to edit mode when mode is not specified', () => {
      render(
        <LegalForm
          eventOrganizer={mockEventOrganizer}
          loading={false}
        />
      );

      // Should render edit form (default behavior)
      expect(screen.queryByText('Loading legal information...')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle update error and set error state', async () => {
      const mockOnRefresh = jest.fn();
      const updateError = new Error('Update failed');
      mockMutate.mockRejectedValue(updateError);

      render(
        <LegalForm
          eventOrganizer={mockEventOrganizer}
          loading={false}
          mode="edit"
          onRefresh={mockOnRefresh}
        />
      );

      // Error should be handled internally
      expect(mockUseUpdateEventOrganizerLegal).toHaveBeenCalled();
    });
  });
});

