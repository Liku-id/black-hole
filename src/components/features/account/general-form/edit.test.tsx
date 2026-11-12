import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { assetsService } from '@/services';
import { EventOrganizer } from '@/types/organizer';

import { OrganizerEditForm } from './edit';

// Mock assetsService
jest.mock('@/services', () => ({
  assetsService: {
    uploadAsset: jest.fn()
  }
}));

describe('OrganizerEditForm', () => {
  const mockOnSubmit = jest.fn();

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
      url: 'https://example.com/profile.jpg',
      bucket: 'bucket',
      key: 'USER/profile-image.jpg',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    ktpPhoto: null,
    npwpPhoto: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Form Rendering', () => {
    it('should render all form fields', async () => {
      render(
        <OrganizerEditForm
          eventOrganizer={mockEventOrganizer}
          onSubmit={mockOnSubmit}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Organizer Name/i)).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText(/Phone Number/i)).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText(/Email Address/i)).toBeInTheDocument();
      });
      // Address might appear multiple times, use getAllByText and check first
      await waitFor(() => {
        const addressLabels = screen.getAllByText(/Address/i);
        expect(addressLabels.length).toBeGreaterThan(0);
      });
      await waitFor(() => {
        expect(screen.getByText(/About Organizer/i)).toBeInTheDocument();
      });
    });

    it('should render social media fields', async () => {
      render(
        <OrganizerEditForm
          eventOrganizer={mockEventOrganizer}
          onSubmit={mockOnSubmit}
        />
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/tiktok/i)).toBeInTheDocument();
      });
      expect(screen.getByPlaceholderText(/instagram/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/twitter/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(
        <OrganizerEditForm
          eventOrganizer={mockEventOrganizer}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText('Save Data')).toBeInTheDocument();
    });
  });

  describe('Form Initialization', () => {
    it('should initialize form with existing organizer data', async () => {
      render(
        <OrganizerEditForm
          eventOrganizer={mockEventOrganizer}
          onSubmit={mockOnSubmit}
        />
      );

      await waitFor(() => {
        const nameField = screen.getByPlaceholderText(/Your organizer name/i);
        expect(nameField).toHaveValue('Test Organizer');
      });
    });

    it('should initialize social media fields from JSON', async () => {
      render(
        <OrganizerEditForm
          eventOrganizer={mockEventOrganizer}
          onSubmit={mockOnSubmit}
        />
      );

      await waitFor(() => {
        const instagramField = screen.getByPlaceholderText(
          /https:\/\/www\.instagram\.com/i
        );
        expect(instagramField).toHaveValue('https://instagram.com/test');
      });
    });

    it('should handle empty social media URL', async () => {
      const organizerWithoutSocial: EventOrganizer = {
        ...mockEventOrganizer,
        social_media_url: ''
      };

      render(
        <OrganizerEditForm
          eventOrganizer={organizerWithoutSocial}
          onSubmit={mockOnSubmit}
        />
      );

      // Form should still render without errors
      await waitFor(() => {
        expect(screen.getByText(/Organizer Name/i)).toBeInTheDocument();
      });
    });
  });

  describe('Read-only Fields', () => {
    it('should render organizer name as read-only', async () => {
      render(
        <OrganizerEditForm
          eventOrganizer={mockEventOrganizer}
          onSubmit={mockOnSubmit}
        />
      );

      await waitFor(() => {
        const nameField = screen.getByPlaceholderText(/Your organizer name/i);
        expect(nameField).toHaveAttribute('readonly');
      });
    });

    it('should render phone number as read-only', async () => {
      render(
        <OrganizerEditForm
          eventOrganizer={mockEventOrganizer}
          onSubmit={mockOnSubmit}
        />
      );

      await waitFor(() => {
        const phoneField = screen.getByPlaceholderText(/Your phone number/i);
        expect(phoneField).toHaveAttribute('readonly');
      });
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit when form is submitted', async () => {
      render(
        <OrganizerEditForm
          eventOrganizer={mockEventOrganizer}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByText('Save Data');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    it('should disable submit button when loading', () => {
      render(
        <OrganizerEditForm
          eventOrganizer={mockEventOrganizer}
          onSubmit={mockOnSubmit}
          loading={true}
        />
      );

      const submitButton = screen.getByText('Saving...');
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Error Handling & Extended Interactions', () => {
    it('should display error message when error is provided', () => {
      render(
        <OrganizerEditForm
          eventOrganizer={mockEventOrganizer}
          onSubmit={mockOnSubmit}
          error="Failed to update organizer"
        />
      );

      expect(
        screen.getByText('Failed to update organizer')
      ).toBeInTheDocument();
    });

    it('handles invalid JSON in social_media_url and missing organizer fields cleanly', async () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      render(
        <OrganizerEditForm
          eventOrganizer={{
            ...mockEventOrganizer,
            name: '',
            email: '',
            phone_number: '',
            address: '',
            description: '',
            social_media_url: 'invalid-json{',
            asset: null
          }}
          onSubmit={mockOnSubmit}
        />
      );

      await waitFor(() => {
        expect(
          screen.getByText('max 2 MB • File type: .jpeg / .jpg / .png')
        ).toBeInTheDocument();
      });
      expect(console.warn).toHaveBeenCalled();
    });

    it('deletes tiktok, instagram, and twitter social links and submits empty socialMediaObj', async () => {
      const { container } = render(
        <OrganizerEditForm
          eventOrganizer={mockEventOrganizer}
          onSubmit={mockOnSubmit}
        />
      );

      await waitFor(() => {
        expect(
          container.querySelector('#tiktok_delete_icon')
        ).toBeInTheDocument();
      });

      fireEvent.click(container.querySelector('#tiktok_delete_icon')!);
      fireEvent.click(container.querySelector('#instagram_delete_icon')!);
      fireEvent.click(container.querySelector('#x_delete_icon')!);

      await waitFor(() => {
        expect(
          container.querySelector('#tiktok_delete_icon')
        ).not.toBeInTheDocument();
        expect(
          container.querySelector('#instagram_delete_icon')
        ).not.toBeInTheDocument();
        expect(
          container.querySelector('#x_delete_icon')
        ).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Save Data'));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            social_media_url: '{}'
          })
        );
      });
    });

    it('removes existing profile picture, validates >2MB file, uploads new file, and submits new asset_id', async () => {
      const { container } = render(
        <OrganizerEditForm
          eventOrganizer={mockEventOrganizer}
          onSubmit={mockOnSubmit}
        />
      );

      // Initially shows filename from key
      expect(await screen.findByText('profile-image.jpg')).toBeInTheDocument();
      expect(screen.getByAltText('Profile preview')).toBeInTheDocument();

      // Remove existing image
      fireEvent.click(container.querySelector('#clear_icon')!);

      expect(
        await screen.findByText('max 2 MB • File type: .jpeg / .jpg / .png')
      ).toBeInTheDocument();
      expect(screen.queryByAltText('Profile preview')).not.toBeInTheDocument();

      // Try >2MB file
      const largeFile = new File(['large'], 'huge.png', {
        type: 'image/png'
      });
      Object.defineProperty(largeFile, 'size', { value: 3 * 1024 * 1024 });
      const fileInput = container.querySelector(
        '#profile-picture-upload'
      ) as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [largeFile] } });
      expect(
        await screen.findByText('File size must be less than 2MB')
      ).toBeInTheDocument();

      // Upload valid <=2MB file
      const validFile = new File(['hello'], 'new-avatar.png', {
        type: 'image/png'
      });
      (assetsService.uploadAsset as jest.Mock).mockResolvedValueOnce({
        body: { asset: { id: 'new-asset-99' } }
      });

      fireEvent.change(fileInput, { target: { files: [validFile] } });

      expect(await screen.findByText('new-avatar.png')).toBeInTheDocument();
      expect(await screen.findByAltText('Profile preview')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Save Data'));

      await waitFor(() => {
        expect(assetsService.uploadAsset).toHaveBeenCalledWith(validFile);
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            asset_id: 'new-asset-99'
          })
        );
      });
    });

    it('shows error when profile picture asset upload fails', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      (assetsService.uploadAsset as jest.Mock).mockRejectedValueOnce(
        new Error('Upload failure')
      );

      const { container } = render(
        <OrganizerEditForm
          eventOrganizer={{ ...mockEventOrganizer, asset: null }}
          onSubmit={mockOnSubmit}
        />
      );

      const validFile = new File(['hello'], 'avatar.png', {
        type: 'image/png'
      });
      const fileInput = container.querySelector(
        '#profile-picture-upload'
      ) as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [validFile] } });

      expect(await screen.findByText('avatar.png')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Save Data'));

      expect(
        await screen.findByText('Failed to upload image. Please try again.')
      ).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('catches synchronous error thrown by onSubmit during form submit', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      mockOnSubmit.mockImplementationOnce(() => {
        throw new Error('Sync submit error');
      });

      render(
        <OrganizerEditForm
          eventOrganizer={mockEventOrganizer}
          onSubmit={mockOnSubmit}
        />
      );

      fireEvent.click(screen.getByText('Save Data'));

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          'Error in form submission:',
          expect.any(Error)
        );
      });
    });
  });
});
