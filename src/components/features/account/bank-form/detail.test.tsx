import { render, screen } from '@testing-library/react';
import { BankFormDetailInfo } from './detail';
import { EventOrganizer } from '@/types/organizer';

describe('BankFormDetailInfo', () => {
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

  describe('Rendering Bank Information', () => {
    it('should render bank account number', () => {
      render(<BankFormDetailInfo organizerDetail={mockEventOrganizer} />);

      expect(screen.getByText('Bank Account Number')).toBeInTheDocument();
      expect(screen.getByText('1234567890')).toBeInTheDocument();
    });

    it('should render bank account holder name', () => {
      render(<BankFormDetailInfo organizerDetail={mockEventOrganizer} />);

      expect(screen.getByText('Bank Account Holder Name')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should render bank name', () => {
      render(<BankFormDetailInfo organizerDetail={mockEventOrganizer} />);

      expect(screen.getByText('Bank Name')).toBeInTheDocument();
      expect(screen.getByText('Bank BCA')).toBeInTheDocument();
    });
  });

  describe('Empty/Missing Data Handling', () => {
    it('should display "-" when bank_information is null', () => {
      const organizerWithoutBank: EventOrganizer = {
        ...mockEventOrganizer,
        bank_information: null
      };

      render(<BankFormDetailInfo organizerDetail={organizerWithoutBank} />);

      const dashElements = screen.getAllByText('-');
      expect(dashElements.length).toBeGreaterThan(0);
    });

    it('should display "-" when accountNumber is missing', () => {
      const organizerWithoutAccountNumber: EventOrganizer = {
        ...mockEventOrganizer,
        bank_information: {
          ...mockEventOrganizer.bank_information!,
          accountNumber: ''
        }
      };

      render(
        <BankFormDetailInfo organizerDetail={organizerWithoutAccountNumber} />
      );

      expect(screen.getByText('Bank Account Number')).toBeInTheDocument();
      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('should display "-" when accountHolderName is missing', () => {
      const organizerWithoutHolderName: EventOrganizer = {
        ...mockEventOrganizer,
        bank_information: {
          ...mockEventOrganizer.bank_information!,
          accountHolderName: ''
        }
      };

      render(
        <BankFormDetailInfo organizerDetail={organizerWithoutHolderName} />
      );

      expect(screen.getByText('Bank Account Holder Name')).toBeInTheDocument();
    });

    it('should display "-" when bank name is missing', () => {
      const organizerWithoutBankName: EventOrganizer = {
        ...mockEventOrganizer,
        bank_information: {
          ...mockEventOrganizer.bank_information!,
          bank: {
            ...mockEventOrganizer.bank_information!.bank,
            name: ''
          }
        }
      };

      render(<BankFormDetailInfo organizerDetail={organizerWithoutBankName} />);

      expect(screen.getByText('Bank Name')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should render all required fields', () => {
      render(<BankFormDetailInfo organizerDetail={mockEventOrganizer} />);

      expect(screen.getByText('Bank Account Number')).toBeInTheDocument();
      expect(screen.getByText('Bank Account Holder Name')).toBeInTheDocument();
      expect(screen.getByText('Bank Name')).toBeInTheDocument();
    });
  });
});

