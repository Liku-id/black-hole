import { render, screen } from '@testing-library/react';

import { EventOrganizer } from '@/types/organizer';

import { LegalFormDetailInfo } from './detail';

describe('LegalFormDetailInfo', () => {
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

  describe('Individual Creator Rendering', () => {
    it('should render "Individual Creator" title', () => {
      render(
        <LegalFormDetailInfo organizerDetail={mockEventOrganizerIndividual} />
      );

      expect(screen.getByText('Individual Creator')).toBeInTheDocument();
    });

    it('should render KTP and NPWP images for individual', () => {
      render(
        <LegalFormDetailInfo organizerDetail={mockEventOrganizerIndividual} />
      );

      expect(screen.getByText('KTP Image*')).toBeInTheDocument();
      expect(screen.getByText('NPWP Image*')).toBeInTheDocument();
    });

    it('should render individual-specific fields', () => {
      render(
        <LegalFormDetailInfo organizerDetail={mockEventOrganizerIndividual} />
      );

      expect(screen.getByText('NPWP Number*')).toBeInTheDocument();
      expect(screen.getByText('NIK Number*')).toBeInTheDocument();
      expect(screen.getByText('PIC Full Name*')).toBeInTheDocument();
      expect(screen.getByText('PIC KTP Address*')).toBeInTheDocument();
      expect(screen.getByText('PIC Title')).toBeInTheDocument();
    });

    it('should display individual field values', () => {
      render(
        <LegalFormDetailInfo organizerDetail={mockEventOrganizerIndividual} />
      );

      expect(screen.getByText('12.345.678.9-012.345')).toBeInTheDocument();
      expect(screen.getByText('1234567890123456')).toBeInTheDocument();
      expect(screen.getByText('PIC Name')).toBeInTheDocument();
      expect(screen.getByText('KTP Address')).toBeInTheDocument();
      expect(screen.getByText('Manager')).toBeInTheDocument();
    });
  });

  describe('Institutional Creator Rendering', () => {
    it('should render "Company Creator" title', () => {
      render(
        <LegalFormDetailInfo
          organizerDetail={mockEventOrganizerInstitutional}
        />
      );

      expect(screen.getByText('Company Creator')).toBeInTheDocument();
    });

    it('should render only NPWP image for institutional', () => {
      render(
        <LegalFormDetailInfo
          organizerDetail={mockEventOrganizerInstitutional}
        />
      );

      expect(screen.getByText('NPWP Image*')).toBeInTheDocument();
      expect(screen.queryByText('KTP Image*')).not.toBeInTheDocument();
    });

    it('should render institutional-specific fields', () => {
      render(
        <LegalFormDetailInfo
          organizerDetail={mockEventOrganizerInstitutional}
        />
      );

      expect(screen.getByText('Company NPWP Number*')).toBeInTheDocument();
      expect(screen.getByText('Address as in NPWP*')).toBeInTheDocument();
      expect(screen.getByText('Full Name as in NPWP*')).toBeInTheDocument();
    });

    it('should display institutional field values', () => {
      render(
        <LegalFormDetailInfo
          organizerDetail={mockEventOrganizerInstitutional}
        />
      );

      expect(screen.getByText('12.345.678.9-012.345')).toBeInTheDocument();
      expect(screen.getByText('Company NPWP Address')).toBeInTheDocument();
      expect(screen.getByText('Company Name')).toBeInTheDocument();
    });
  });

  describe('Empty/Missing Data Handling', () => {
    it('should display "-" for missing NPWP number', () => {
      const organizerWithoutNpwp: EventOrganizer = {
        ...mockEventOrganizerIndividual,
        npwp: ''
      };

      render(
        <LegalFormDetailInfo organizerDetail={organizerWithoutNpwp} />
      );

      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('should display "-" for missing NIK number', () => {
      const organizerWithoutNik: EventOrganizer = {
        ...mockEventOrganizerIndividual,
        nik: ''
      };

      render(<LegalFormDetailInfo organizerDetail={organizerWithoutNik} />);

      const dashElements = screen.getAllByText('-');
      expect(dashElements.length).toBeGreaterThan(0);
    });

    it('should display "No ktp image* image available" when KTP photo is missing', () => {
      const organizerWithoutKtp: EventOrganizer = {
        ...mockEventOrganizerIndividual,
        ktpPhoto: null
      };

      render(<LegalFormDetailInfo organizerDetail={organizerWithoutKtp} />);

      expect(screen.getByText(/No ktp image\* image available/i)).toBeInTheDocument();
    });

    it('should display "No npwp image* image available" when NPWP photo is missing', () => {
      const organizerWithoutNpwp: EventOrganizer = {
        ...mockEventOrganizerIndividual,
        npwpPhoto: null
      };

      render(<LegalFormDetailInfo organizerDetail={organizerWithoutNpwp} />);

      expect(
        screen.getByText(/No npwp image\* image available/i)
      ).toBeInTheDocument();
    });
  });

  describe('Document Images', () => {
    it('should render KTP image when available', () => {
      render(
        <LegalFormDetailInfo organizerDetail={mockEventOrganizerIndividual} />
      );

      const ktpImage = screen.getByAltText('KTP Document');
      expect(ktpImage).toBeInTheDocument();
      expect(ktpImage).toHaveAttribute('src', 'https://example.com/ktp.jpg');
    });

    it('should render NPWP image when available', () => {
      render(
        <LegalFormDetailInfo organizerDetail={mockEventOrganizerIndividual} />
      );

      const npwpImage = screen.getByAltText('NPWP Document');
      expect(npwpImage).toBeInTheDocument();
      expect(npwpImage).toHaveAttribute('src', 'https://example.com/npwp.jpg');
    });
  });
});

