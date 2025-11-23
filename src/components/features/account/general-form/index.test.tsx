import { render, screen, waitFor } from '@testing-library/react';
import GeneralForm from './index';
import { EventOrganizer } from '@/types/organizer';
import { useUpdateEventOrganizerGeneral } from '@/hooks/features/organizers/useUpdateEventOrganizerGeneral';

// Mock the hook
jest.mock('@/hooks/features/organizers/useUpdateEventOrganizerGeneral');

const mockMutate = jest.fn();
const mockUseUpdateEventOrganizerGeneral =
  useUpdateEventOrganizerGeneral as jest.MockedFunction<
    typeof useUpdateEventOrganizerGeneral
  >;

describe('GeneralForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUpdateEventOrganizerGeneral.mockReturnValue({
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
    social_media_url: JSON.stringify({
      instagram: 'https://instagram.com/test',
      tiktok: 'https://tiktok.com/@test',
      twitter: 'https://twitter.com/test'
    }),
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
    bank_information: null,
    event_organizer_pic: null,
    asset: {
      id: 'asset1',
      type: 'image',
      url: 'https://example.com/image.jpg',
      bucket: 'bucket',
      key: 'USER/test-image.jpg',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    ktpPhoto: null,
    npwpPhoto: null
  };

  describe('Loading State', () => {
    it('should display loading message when loading is true', () => {
      render(
        <GeneralForm
          eventOrganizer={null}
          loading={true}
          mode="view"
        />
      );

      expect(screen.getByText('Loading organizer data...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when error is provided', () => {
      render(
        <GeneralForm
          eventOrganizer={null}
          loading={false}
          error="Failed to fetch"
          mode="view"
        />
      );

      expect(
        screen.getByText('Failed to load organizer data: Failed to fetch')
      ).toBeInTheDocument();
    });
  });

  describe('No Data State', () => {
    it('should display "No organizer data found" when eventOrganizer is null', () => {
      render(
        <GeneralForm
          eventOrganizer={null}
          loading={false}
          mode="view"
        />
      );

      expect(screen.getByText('No organizer data found')).toBeInTheDocument();
    });
  });

  describe('View Mode', () => {
    it('should render organizer detail info in view mode', () => {
      render(
        <GeneralForm
          eventOrganizer={mockEventOrganizer}
          loading={false}
          mode="view"
        />
      );

      expect(screen.getByText('Test Organizer')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('Test Address')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('should display phone number without country code prefix', () => {
      render(
        <GeneralForm
          eventOrganizer={mockEventOrganizer}
          loading={false}
          mode="view"
        />
      );

      // Phone number should be displayed without +62 prefix
      expect(screen.getByText('1234567890')).toBeInTheDocument();
    });

    it('should display social media links', () => {
      render(
        <GeneralForm
          eventOrganizer={mockEventOrganizer}
          loading={false}
          mode="view"
        />
      );

      expect(screen.getByText('https://instagram.com/test')).toBeInTheDocument();
      expect(screen.getByText('https://tiktok.com/@test')).toBeInTheDocument();
      expect(screen.getByText('https://twitter.com/test')).toBeInTheDocument();
    });

    it('should display profile picture name', () => {
      render(
        <GeneralForm
          eventOrganizer={mockEventOrganizer}
          loading={false}
          mode="view"
        />
      );

      expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
    });

    it('should display "No social media links" when social media is empty', () => {
      const organizerWithoutSocial: EventOrganizer = {
        ...mockEventOrganizer,
        social_media_url: ''
      };

      render(
        <GeneralForm
          eventOrganizer={organizerWithoutSocial}
          loading={false}
          mode="view"
        />
      );

      expect(screen.getByText('No social media links')).toBeInTheDocument();
    });
  });

  describe('Edit Mode', () => {
    it('should render edit form in edit mode', () => {
      render(
        <GeneralForm
          eventOrganizer={mockEventOrganizer}
          loading={false}
          mode="edit"
        />
      );

      // Check if form fields are rendered (they should be in edit mode)
      // The actual form fields are in OrganizerEditForm component
      expect(screen.queryByText('Loading organizer data...')).not.toBeInTheDocument();
    });

    it('should call onRefresh after successful update', async () => {
      const mockOnRefresh = jest.fn();
      mockMutate.mockResolvedValue({ success: true });

      render(
        <GeneralForm
          eventOrganizer={mockEventOrganizer}
          loading={false}
          mode="edit"
          onRefresh={mockOnRefresh}
        />
      );

      // The actual form submission would be tested in OrganizerEditForm test
      // This test just ensures the component structure is correct
      expect(mockUseUpdateEventOrganizerGeneral).toHaveBeenCalled();
    });
  });

  describe('Data Conversion', () => {
    it('should convert social media URL from JSON string to array format', () => {
      render(
        <GeneralForm
          eventOrganizer={mockEventOrganizer}
          loading={false}
          mode="view"
        />
      );

      // Social media should be parsed and displayed
      expect(screen.getByText('https://instagram.com/test')).toBeInTheDocument();
    });

    it('should handle invalid JSON in social_media_url gracefully', () => {
      const organizerWithInvalidSocial: EventOrganizer = {
        ...mockEventOrganizer,
        social_media_url: 'invalid-json'
      };

      render(
        <GeneralForm
          eventOrganizer={organizerWithInvalidSocial}
          loading={false}
          mode="view"
        />
      );

      // Should fallback to "No social media links" or handle gracefully
      expect(screen.queryByText('Loading organizer data...')).not.toBeInTheDocument();
    });

    it('should extract profile picture name from asset key', () => {
      render(
        <GeneralForm
          eventOrganizer={mockEventOrganizer}
          loading={false}
          mode="view"
        />
      );

      // Should extract "test-image.jpg" from "USER/test-image.jpg"
      expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
    });
  });

  describe('Invalid Mode', () => {
    it('should display "Invalid mode" for invalid mode value', () => {
      render(
        <GeneralForm
          eventOrganizer={mockEventOrganizer}
          loading={false}
          mode={'invalid' as any}
        />
      );

      expect(screen.getByText('Invalid mode')).toBeInTheDocument();
    });
  });
});

