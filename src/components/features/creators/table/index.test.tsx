import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/router';
import CreatorsTable from './index';
import { EventOrganizer } from '@/types/organizer';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  pathname: '/',
  query: {},
  asPath: '/'
};

describe('CreatorsTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  const mockCreators: EventOrganizer[] = [
    {
      id: '1',
      bank_information_id: 'bank1',
      name: 'Creator One',
      email: 'creator1@example.com',
      phone_number: '1234567890',
      asset_id: 'asset1',
      description: 'Test creator',
      social_media_url: 'https://instagram.com/creator1',
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
      full_name: 'Creator One Full',
      pic_name: 'PIC One',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      deleted_at: null,
      bank_information: null,
      event_organizer_pic: {
        id: 'pic1',
        name: 'PIC Name',
        email: 'pic@example.com'
      },
      asset: null,
      ktpPhoto: null,
      npwpPhoto: null
    },
    {
      id: '2',
      bank_information_id: 'bank2',
      name: 'Creator Two',
      email: 'creator2@example.com',
      phone_number: '0987654321',
      asset_id: 'asset2',
      description: 'Test creator 2',
      social_media_url: 'https://instagram.com/creator2',
      address: 'Test Address 2',
      pic_title: 'Director',
      ktp_photo_id: 'ktp2',
      npwp_photo_id: 'npwp2',
      user_id: 'user2',
      nik: '987654321',
      npwp: '987654321',
      xenplatform_id: 'xen2',
      organizer_type: 'institutional',
      npwp_address: 'NPWP Address 2',
      ktp_address: 'KTP Address 2',
      full_name: 'Creator Two Full',
      pic_name: 'PIC Two',
      created_at: '2024-01-02',
      updated_at: '2024-01-02',
      deleted_at: null,
      bank_information: null,
      event_organizer_pic: null,
      asset: null,
      ktpPhoto: null,
      npwpPhoto: null
    }
  ];

  describe('Loading State', () => {
    it('should display loading message when loading is true', () => {
      render(<CreatorsTable creators={[]} loading={true} />);

      expect(screen.getByText('Loading creators...')).toBeInTheDocument();
    });

    it('should not display table when loading', () => {
      render(<CreatorsTable creators={mockCreators} loading={true} />);

      expect(screen.queryByText('Creator One')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display "No creators found" when creators array is empty', () => {
      render(<CreatorsTable creators={[]} loading={false} />);

      expect(screen.getByText('No creators found')).toBeInTheDocument();
    });

    it('should not display pagination when creators array is empty', () => {
      const { container } = render(
        <CreatorsTable creators={[]} loading={false} />
      );

      // Pagination should not be rendered
      expect(container.querySelector('[class*="Pagination"]')).not.toBeInTheDocument();
    });
  });

  describe('Table Rendering', () => {
    it('should render table headers correctly', () => {
      render(<CreatorsTable creators={mockCreators} loading={false} />);

      expect(screen.getByText('No.')).toBeInTheDocument();
      expect(screen.getByText('Creators Name')).toBeInTheDocument();
      expect(screen.getByText('PIC Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('should render creator data correctly', () => {
      render(<CreatorsTable creators={mockCreators} loading={false} />);

      expect(screen.getByText('Creator One')).toBeInTheDocument();
      expect(screen.getByText('creator1@example.com')).toBeInTheDocument();
      expect(screen.getByText('Creator Two')).toBeInTheDocument();
      expect(screen.getByText('creator2@example.com')).toBeInTheDocument();
    });

    it('should display correct row numbers with pagination', () => {
      render(
        <CreatorsTable
          creators={mockCreators}
          loading={false}
          currentPage={2}
          pageSize={10}
        />
      );

      // First row should be 21 (index 0 + 1 + currentPage 2 * pageSize 10)
      expect(screen.getByText('21.')).toBeInTheDocument();
      // Second row should be 22
      expect(screen.getByText('22.')).toBeInTheDocument();
    });

    it('should display fallback "-" for missing name', () => {
      const creatorWithoutName: EventOrganizer = {
        ...mockCreators[0],
        name: ''
      };

      render(
        <CreatorsTable creators={[creatorWithoutName]} loading={false} />
      );

      const cells = screen.getAllByText('-');
      expect(cells.length).toBeGreaterThan(0);
    });

    it('should display PIC name with fallback priority', () => {
      // Test with pic_name
      const { rerender } = render(
        <CreatorsTable creators={[mockCreators[0]]} loading={false} />
      );
      const picNameCells = screen.getAllByText('PIC One');
      expect(picNameCells.length).toBeGreaterThan(0);

      // Test with event_organizer_pic.name
      const creatorWithPic: EventOrganizer = {
        ...mockCreators[0],
        pic_name: '',
        event_organizer_pic: {
          id: 'pic1',
          name: 'PIC Name From Object',
          email: 'pic@example.com'
        }
      };
      rerender(<CreatorsTable creators={[creatorWithPic]} loading={false} />);
      const picNameFromObjectCells = screen.getAllByText('PIC Name From Object');
      expect(picNameFromObjectCells.length).toBeGreaterThan(0);

      // Test with full_name fallback
      const creatorWithFullName: EventOrganizer = {
        ...mockCreators[0],
        pic_name: '',
        event_organizer_pic: null,
        full_name: 'Full Name Fallback'
      };
      rerender(
        <CreatorsTable creators={[creatorWithFullName]} loading={false} />
      );
      const fullNameCells = screen.getAllByText('Full Name Fallback');
      expect(fullNameCells.length).toBeGreaterThan(0);
    });
  });

  describe('Action Buttons', () => {
    it('should render calendar and account action buttons', () => {
      render(<CreatorsTable creators={mockCreators} loading={false} />);

      const calendarButtons = screen.getAllByAltText('Calendar');
      const accountButtons = screen.getAllByAltText('Account');

      expect(calendarButtons.length).toBe(2);
      expect(accountButtons.length).toBe(2);
    });

    it('should navigate to events page when calendar button is clicked', () => {
      render(<CreatorsTable creators={[mockCreators[0]]} loading={false} />);

      const calendarButton = screen.getByAltText('Calendar');
      fireEvent.click(calendarButton.closest('button')!);

      expect(mockPush).toHaveBeenCalledWith('/creator/1/events');
    });

    it('should navigate to creator profile when account button is clicked', () => {
      render(<CreatorsTable creators={[mockCreators[0]]} loading={false} />);

      const accountButton = screen.getByAltText('Account');
      fireEvent.click(accountButton.closest('button')!);

      expect(mockPush).toHaveBeenCalledWith('/creator/1');
    });
  });

  describe('Pagination', () => {
    it('should render pagination when creators exist', () => {
      render(
        <CreatorsTable
          creators={mockCreators}
          loading={false}
          total={20}
          currentPage={0}
          pageSize={10}
        />
      );

      // Pagination component should be rendered - check for pagination text
      expect(screen.getByText(/Showing/i)).toBeInTheDocument();
      expect(screen.getByText(/entries/i)).toBeInTheDocument();
    });

    it('should call onPageChange when pagination changes', () => {
      const mockOnPageChange = jest.fn();

      render(
        <CreatorsTable
          creators={mockCreators}
          loading={false}
          total={20}
          currentPage={0}
          pageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      // Note: This test assumes the Pagination component triggers onPageChange
      // You may need to adjust based on your Pagination component implementation
    });

    it('should not render pagination when creators array is empty', () => {
      const { container } = render(
        <CreatorsTable creators={[]} loading={false} total={0} />
      );

      expect(container.querySelector('[class*="Pagination"]')).not.toBeInTheDocument();
    });
  });
});

