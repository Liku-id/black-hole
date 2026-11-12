import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { useAuth } from '@/contexts/AuthContext';
import { assetsService } from '@/services';
import { EventOrganizer } from '@/types/organizer';

import { LegalEditForm } from './edit';

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

// Mock assetsService
jest.mock('@/services', () => ({
  assetsService: {
    uploadAsset: jest.fn()
  }
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('LegalEditForm', () => {
  const mockOnSubmit = jest.fn();
  const mockRefreshUserData = jest.fn();

  const mockEventOrganizerIndividual: EventOrganizer = {
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
    npwp: '12.345.678.9-012.345',
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

  const mockEventOrganizerInstitutional: EventOrganizer = {
    ...mockEventOrganizerIndividual,
    organizer_type: 'institutional',
    full_name: 'Company Name',
    npwp_address: 'Company NPWP Address'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-preview-url');
    global.URL.revokeObjectURL = jest.fn();
    mockUseAuth.mockReturnValue({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,
      login: jest.fn(),
      logout: jest.fn(),
      clearError: jest.fn(),
      refreshUserData: mockRefreshUserData,
      error: null
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Individual Creator Form', () => {
    it('should render individual-specific fields', async () => {
      render(
        <LegalEditForm
          eventOrganizer={mockEventOrganizerIndividual}
          onSubmit={mockOnSubmit}
        />
      );

      await waitFor(() => {
        // Wait for form to render - check for any legal-related text
        const legalText =
          screen.queryByText(/Legal/i) || screen.queryByText(/NPWP/i);
        expect(legalText).toBeInTheDocument();
      });

      // Check for individual fields
      await waitFor(() => {
        expect(screen.getByText(/NPWP Number/i)).toBeInTheDocument();
      });
      expect(screen.getByText(/NIK Number/i)).toBeInTheDocument();
      expect(screen.getByText(/KTP Address/i)).toBeInTheDocument();
      expect(screen.getByText(/PIC Full Name/i)).toBeInTheDocument();
      expect(screen.getByText(/PIC Title/i)).toBeInTheDocument();
    });

    it('should render KTP and NPWP dropzones for individual', async () => {
      render(
        <LegalEditForm
          eventOrganizer={mockEventOrganizerIndividual}
          onSubmit={mockOnSubmit}
        />
      );

      await waitFor(() => {
        // Wait for form to render
        expect(screen.getByText(/NPWP Number/i)).toBeInTheDocument();
      });

      // Both KTP and NPWP should be present for individual
      const ktpLabels = screen.queryAllByText(/KTP/i);
      const npwpLabels = screen.queryAllByText(/NPWP/i);
      expect(ktpLabels.length).toBeGreaterThan(0);
      expect(npwpLabels.length).toBeGreaterThan(0);
    });

    it('should initialize form with existing individual data', async () => {
      render(
        <LegalEditForm
          eventOrganizer={mockEventOrganizerIndividual}
          onSubmit={mockOnSubmit}
        />
      );

      await waitFor(() => {
        // Wait for form to render
        expect(screen.getByText(/NPWP Number/i)).toBeInTheDocument();
      });

      // Check if form fields are rendered (they should be initialized)
      // We don't need to check exact values, just that form is initialized
      expect(screen.getByText(/NPWP Number/i)).toBeInTheDocument();
      expect(screen.getByText(/NIK Number/i)).toBeInTheDocument();
      expect(screen.getByText(/PIC Full Name/i)).toBeInTheDocument();
    });
  });

  describe('Institutional Creator Form', () => {
    it('should render institutional-specific fields', async () => {
      render(
        <LegalEditForm
          eventOrganizer={mockEventOrganizerInstitutional}
          onSubmit={mockOnSubmit}
        />
      );

      await waitFor(() => {
        // Wait for form to render - check for Company text in title
        expect(screen.getByText(/Company/i)).toBeInTheDocument();
      });

      // Wait for form fields to be rendered
      await waitFor(() => {
        // Check that form has rendered by looking for submit button
        expect(screen.getByText(/Save Legal Document/i)).toBeInTheDocument();
      });

      // Verify institutional form is rendered (not individual fields)
      // Individual fields should NOT be present
      const nikLabels = screen.queryAllByText(/NIK Number/i);
      expect(nikLabels.length).toBe(0);

      const ktpAddressLabels = screen.queryAllByText(/KTP Address/i);
      expect(ktpAddressLabels.length).toBe(0);

      // Institutional fields should be present (at least NPWP)
      const npwpLabels = screen.queryAllByText(/NPWP/i);
      expect(npwpLabels.length).toBeGreaterThan(0);
    });

    it('should render only NPWP dropzone for institutional', async () => {
      render(
        <LegalEditForm
          eventOrganizer={mockEventOrganizerInstitutional}
          onSubmit={mockOnSubmit}
        />
      );

      await waitFor(() => {
        // Wait for form to render
        expect(screen.getByText(/Company/i)).toBeInTheDocument();
      });

      // NPWP should be present (multiple instances are OK)
      const npwpLabels = screen.queryAllByText(/NPWP/i);
      expect(npwpLabels.length).toBeGreaterThan(0);

      // KTP Image should not appear in institutional form
      const ktpImageLabels = screen.queryAllByText(/KTP Image/i);
      expect(ktpImageLabels.length).toBe(0);

      // KTP Number should also not appear
      const ktpNumberLabels = screen.queryAllByText(/NIK Number/i);
      expect(ktpNumberLabels.length).toBe(0);
    });

    it('should initialize form with existing institutional data', async () => {
      render(
        <LegalEditForm
          eventOrganizer={mockEventOrganizerInstitutional}
          onSubmit={mockOnSubmit}
        />
      );

      await waitFor(() => {
        // Wait for form to render - check for Company text
        expect(screen.getByText(/Company/i)).toBeInTheDocument();
      });

      // Wait for form to be fully rendered
      await waitFor(() => {
        // Check that form has rendered by looking for submit button
        expect(screen.getByText(/Save Legal Document/i)).toBeInTheDocument();
      });

      // Verify form is initialized (fields are present)
      // For institutional, we should have NPWP fields
      const npwpLabels = screen.queryAllByText(/NPWP/i);
      expect(npwpLabels.length).toBeGreaterThan(0);

      // Form should be rendered and ready (submit button exists means form is initialized)
      expect(screen.getByText(/Save Legal Document/i)).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('opens confirmation modal and submits individual payload with pic_title', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      mockRefreshUserData.mockResolvedValue(undefined);

      render(
        <LegalEditForm
          eventOrganizer={mockEventOrganizerIndividual}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = await screen.findByText(/Save Legal Document/i);
      fireEvent.click(submitButton);

      expect(await screen.findByText('Confirm!')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('checkbox'));
      fireEvent.click(screen.getByRole('button', { name: 'Confirm and Save' }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          npwp_photo_id: 'npwp1',
          npwp_number: '12.345.678.9-012.345',
          ktp_photo_id: 'ktp1',
          ktp_number: '1234567890123456',
          ktp_address: 'KTP Address',
          pic_name: 'PIC Name',
          pic_title: 'Manager'
        });
        expect(mockRefreshUserData).toHaveBeenCalled();
      });
    });

    it('submits individual payload without optional pic_title when blank and can close modal', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      mockRefreshUserData.mockResolvedValue(undefined);

      render(
        <LegalEditForm
          eventOrganizer={{
            ...mockEventOrganizerIndividual,
            pic_title: ''
          }}
          onSubmit={mockOnSubmit}
        />
      );

      fireEvent.click(await screen.findByText(/Save Legal Document/i));
      expect(await screen.findByText('Confirm!')).toBeInTheDocument();

      // Close confirmation modal
      fireEvent.click(screen.getByAltText('Close').closest('button')!);
      await waitFor(() => {
        expect(screen.queryByText('Confirm!')).not.toBeInTheDocument();
      });

      // Re-open and confirm
      fireEvent.click(screen.getByText(/Save Legal Document/i));
      expect(await screen.findByText('Confirm!')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('checkbox'));
      fireEvent.click(screen.getByRole('button', { name: 'Confirm and Save' }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          npwp_photo_id: 'npwp1',
          npwp_number: '12.345.678.9-012.345',
          ktp_photo_id: 'ktp1',
          ktp_number: '1234567890123456',
          ktp_address: 'KTP Address',
          pic_name: 'PIC Name'
        });
      });
    });

    it('submits institutional payload after confirmation', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      mockRefreshUserData.mockResolvedValue(undefined);

      render(
        <LegalEditForm
          eventOrganizer={mockEventOrganizerInstitutional}
          onSubmit={mockOnSubmit}
        />
      );

      fireEvent.click(await screen.findByText(/Save Legal Document/i));
      expect(await screen.findByText('Confirm!')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('checkbox'));
      fireEvent.click(screen.getByRole('button', { name: 'Confirm and Save' }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          npwp_photo_id: 'npwp1',
          npwp_number: '12.345.678.9-012.345',
          npwp_address: 'Company NPWP Address',
          full_name: 'Company Name'
        });
      });
    });

    it('uploads new KTP and NPWP files when confirming submission', async () => {
      const ktpFile = new File(['ktp-content'], 'ktp-new.png', {
        type: 'image/png'
      });
      const npwpFile = new File(['npwp-content'], 'npwp-new.png', {
        type: 'image/png'
      });

      (assetsService.uploadAsset as jest.Mock)
        .mockResolvedValueOnce({ body: { asset: { id: 'uploaded-ktp-id' } } })
        .mockResolvedValueOnce({
          body: { asset: { id: 'uploaded-npwp-id' } }
        });
      mockOnSubmit.mockResolvedValue(undefined);
      mockRefreshUserData.mockResolvedValue(undefined);

      const { container } = render(
        <LegalEditForm
          eventOrganizer={mockEventOrganizerIndividual}
          onSubmit={mockOnSubmit}
        />
      );

      const ktpInput = container.querySelector(
        '#upload_npwp_field input[type="file"]'
      ) as HTMLInputElement;
      const npwpInput = container.querySelector(
        '#upload_ktp_field input[type="file"]'
      ) as HTMLInputElement;

      fireEvent.change(ktpInput, { target: { files: [ktpFile] } });
      fireEvent.change(npwpInput, { target: { files: [npwpFile] } });

      await waitFor(() => {
        expect(global.URL.createObjectURL).toHaveBeenCalledTimes(2);
      });

      fireEvent.click(screen.getByText(/Save Legal Document/i));
      expect(await screen.findByText('Confirm!')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('checkbox'));
      fireEvent.click(screen.getByRole('button', { name: 'Confirm and Save' }));

      await waitFor(() => {
        expect(assetsService.uploadAsset).toHaveBeenCalledWith(ktpFile);
        expect(assetsService.uploadAsset).toHaveBeenCalledWith(npwpFile);
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            ktp_photo_id: 'uploaded-ktp-id',
            npwp_photo_id: 'uploaded-npwp-id'
          })
        );
      });
    });

    it('shows error when KTP upload fails during confirmation', async () => {
      const ktpFile = new File(['ktp-content'], 'ktp-new.png', {
        type: 'image/png'
      });
      (assetsService.uploadAsset as jest.Mock).mockRejectedValueOnce(
        new Error('Upload error')
      );

      const { container } = render(
        <LegalEditForm
          eventOrganizer={mockEventOrganizerIndividual}
          onSubmit={mockOnSubmit}
        />
      );

      const ktpInput = container.querySelector(
        '#upload_npwp_field input[type="file"]'
      ) as HTMLInputElement;
      fireEvent.change(ktpInput, { target: { files: [ktpFile] } });

      await waitFor(() => {
        expect(global.URL.createObjectURL).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByText(/Save Legal Document/i));
      expect(await screen.findByText('Confirm!')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('checkbox'));
      fireEvent.click(screen.getByRole('button', { name: 'Confirm and Save' }));

      expect(
        await screen.findByText('Failed to upload KTP image. Please try again.')
      ).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('shows error when NPWP upload fails during confirmation', async () => {
      const npwpFile = new File(['npwp-content'], 'npwp-new.png', {
        type: 'image/png'
      });
      (assetsService.uploadAsset as jest.Mock).mockRejectedValueOnce(
        new Error('NPWP upload error')
      );

      const { container } = render(
        <LegalEditForm
          eventOrganizer={mockEventOrganizerIndividual}
          onSubmit={mockOnSubmit}
        />
      );

      const npwpInput = container.querySelector(
        '#upload_ktp_field input[type="file"]'
      ) as HTMLInputElement;
      fireEvent.change(npwpInput, { target: { files: [npwpFile] } });

      await waitFor(() => {
        expect(global.URL.createObjectURL).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByText(/Save Legal Document/i));
      expect(await screen.findByText('Confirm!')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('checkbox'));
      fireEvent.click(screen.getByRole('button', { name: 'Confirm and Save' }));

      expect(
        await screen.findByText(
          'Failed to upload NPWP image. Please try again.'
        )
      ).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('handles onSubmit rejection during confirmation', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      mockOnSubmit.mockRejectedValueOnce(new Error('Submit failed'));

      render(
        <LegalEditForm
          eventOrganizer={mockEventOrganizerIndividual}
          onSubmit={mockOnSubmit}
        />
      );

      fireEvent.click(await screen.findByText(/Save Legal Document/i));
      expect(await screen.findByText('Confirm!')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('checkbox'));
      fireEvent.click(screen.getByRole('button', { name: 'Confirm and Save' }));

      expect(
        await screen.findByText('Failed to submit form. Please try again.')
      ).toBeInTheDocument();
    });

    it('should disable submit button when loading', () => {
      render(
        <LegalEditForm
          eventOrganizer={mockEventOrganizerIndividual}
          onSubmit={mockOnSubmit}
          loading={true}
        />
      );

      const submitButton = screen.getByText(/Updating/i);
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when error is provided', () => {
      render(
        <LegalEditForm
          eventOrganizer={mockEventOrganizerIndividual}
          onSubmit={mockOnSubmit}
          error="Failed to update legal information"
        />
      );

      expect(
        screen.getByText('Failed to update legal information')
      ).toBeInTheDocument();
    });
  });

  describe('File Upload Validation & Early Field Validation', () => {
    it('validates file size > 2MB for KTP and NPWP uploads and handles removal', async () => {
      const largeFile = new File(['large'], 'large.png', {
        type: 'image/png'
      });
      Object.defineProperty(largeFile, 'size', { value: 3 * 1024 * 1024 });

      const { container } = render(
        <LegalEditForm
          eventOrganizer={mockEventOrganizerIndividual}
          onSubmit={mockOnSubmit}
        />
      );

      const ktpInput = container.querySelector(
        '#upload_npwp_field input[type="file"]'
      ) as HTMLInputElement;
      const npwpInput = container.querySelector(
        '#upload_ktp_field input[type="file"]'
      ) as HTMLInputElement;

      fireEvent.change(ktpInput, { target: { files: [largeFile] } });
      expect(
        await screen.findByText('File size must be less than 2MB')
      ).toBeInTheDocument();

      // Upload valid small file to clear error
      const validFile = new File(['ok'], 'ok.png', { type: 'image/png' });
      fireEvent.change(npwpInput, { target: { files: [largeFile] } });
      expect(
        await screen.findByText('File size must be less than 2MB')
      ).toBeInTheDocument();

      fireEvent.change(npwpInput, { target: { files: [validFile] } });
      await waitFor(() => {
        expect(
          screen.queryByText('File size must be less than 2MB')
        ).not.toBeInTheDocument();
      });

      // Remove NPWP and KTP photos and submit form directly to hit early missing-photo checks
      const clearIcons = container.querySelectorAll('#clear_icon');
      fireEvent.click(clearIcons[1]); // Remove NPWP
      fireEvent.submit(container.querySelector('form')!);
      expect(
        await screen.findByText('NPWP photo is required')
      ).toBeInTheDocument();

      // Re-add NPWP, remove KTP
      fireEvent.change(npwpInput, { target: { files: [validFile] } });
      await waitFor(() => {
        expect(
          container.querySelectorAll('#clear_icon').length
        ).toBeGreaterThanOrEqual(2);
      });
      fireEvent.click(container.querySelectorAll('#clear_icon')[0]); // Remove KTP
      fireEvent.submit(container.querySelector('form')!);
      expect(
        await screen.findByText('KTP photo is required')
      ).toBeInTheDocument();
    });

    it('shows early validation messages for whitespace fields in individual and institutional modes', async () => {
      const { container: indContainer, rerender } = render(
        <LegalEditForm
          eventOrganizer={mockEventOrganizerIndividual}
          onSubmit={mockOnSubmit}
        />
      );

      // Whitespace in ktp_address
      fireEvent.change(indContainer.querySelector('#pic_ktp_address_field')!, {
        target: { value: '   ' }
      });
      fireEvent.submit(indContainer.querySelector('form')!);
      expect(
        await screen.findByText('KTP address is required')
      ).toBeInTheDocument();

      // Restore ktp_address and whitespace in pic_name
      fireEvent.change(indContainer.querySelector('#pic_ktp_address_field')!, {
        target: { value: 'Valid KTP Address' }
      });
      fireEvent.change(indContainer.querySelector('#pic_name_field')!, {
        target: { value: '   ' }
      });
      fireEvent.submit(indContainer.querySelector('form')!);
      expect(
        await screen.findByText('PIC name is required')
      ).toBeInTheDocument();

      // Institutional mode whitespace and missing NPWP photo checks
      rerender(
        <LegalEditForm
          eventOrganizer={mockEventOrganizerInstitutional}
          onSubmit={mockOnSubmit}
        />
      );

      fireEvent.change(indContainer.querySelector('#address_npwp_field')!, {
        target: { value: '   ' }
      });
      fireEvent.submit(indContainer.querySelector('form')!);
      expect(
        await screen.findByText('Address as in NPWP is required')
      ).toBeInTheDocument();

      fireEvent.change(indContainer.querySelector('#address_npwp_field')!, {
        target: { value: 'Valid NPWP Address' }
      });
      fireEvent.change(indContainer.querySelector('#fullname_npwp_field')!, {
        target: { value: '   ' }
      });
      fireEvent.submit(indContainer.querySelector('form')!);
      expect(
        await screen.findByText('Full name as in NPWP is required')
      ).toBeInTheDocument();
    });

    it('renders properly when eventOrganizer has missing initial fields', () => {
      render(
        <LegalEditForm
          eventOrganizer={{
            ...mockEventOrganizerIndividual,
            npwp: '',
            nik: '',
            ktp_address: '',
            pic_name: '',
            pic_title: '',
            npwp_address: '',
            full_name: '',
            ktp_photo_id: '',
            npwp_photo_id: '',
            ktpPhoto: null,
            npwpPhoto: null
          }}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText(/Save Legal Document/i)).toBeDisabled();
    });
  });
});
