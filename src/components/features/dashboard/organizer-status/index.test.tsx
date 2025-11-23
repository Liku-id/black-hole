import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import OrganizerRegStatus from './index';
import { useEventOrganizerMe } from '@/hooks';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

// Mock the hook
jest.mock('@/hooks', () => ({
  useEventOrganizerMe: jest.fn()
}));

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  pathname: '/',
  query: {},
  asPath: '/'
};

const mockUseEventOrganizerMe = useEventOrganizerMe as jest.MockedFunction<
  typeof useEventOrganizerMe
>;

describe('OrganizerRegStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  describe('Loading State', () => {
    it('should display loading skeleton when loading is true', () => {
      mockUseEventOrganizerMe.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        mutate: jest.fn()
      });

      render(<OrganizerRegStatus />);

      // Skeleton should be rendered (we can check for the title)
      expect(screen.getByText('Finish your registration account')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when error occurs', () => {
      mockUseEventOrganizerMe.mockReturnValue({
        data: null,
        loading: false,
        error: 'Failed to load',
        mutate: jest.fn()
      });

      render(<OrganizerRegStatus />);

      expect(
        screen.getByText(/An error occurred while loading the registration data/i)
      ).toBeInTheDocument();
      expect(screen.getByText('Reload')).toBeInTheDocument();
    });
  });

  describe('Registration Status Cards', () => {
    it('should render all registration status cards', async () => {
      mockUseEventOrganizerMe.mockReturnValue({
        data: {
          isGeneralComplete: false,
          isLegalCompelete: false,
          isBankComplete: false
        } as any,
        loading: false,
        error: null,
        mutate: jest.fn()
      });

      render(<OrganizerRegStatus />);

      await waitFor(() => {
        expect(screen.getByText('Complete General Information')).toBeInTheDocument();
      });
      expect(screen.getByText('Complete Legal Document')).toBeInTheDocument();
      expect(screen.getByText('Complete Bank Account')).toBeInTheDocument();
    });

    it('should display check icon when status is complete', async () => {
      mockUseEventOrganizerMe.mockReturnValue({
        data: {
          isGeneralComplete: true,
          isLegalCompelete: true,
          isBankComplete: true
        } as any,
        loading: false,
        error: null,
        mutate: jest.fn()
      });

      render(<OrganizerRegStatus />);

      await waitFor(() => {
        const checkIcons = screen.queryAllByAltText(/general-information-status|legal-document-status|bank-account-status/i);
        expect(checkIcons.length).toBeGreaterThan(0);
      });
    });

    it('should navigate to account page when edit button is clicked', async () => {
      mockUseEventOrganizerMe.mockReturnValue({
        data: {
          isGeneralComplete: false,
          isLegalCompelete: false,
          isBankComplete: false
        } as any,
        loading: false,
        error: null,
        mutate: jest.fn()
      });

      render(<OrganizerRegStatus />);

      await waitFor(() => {
        expect(screen.getByText('Edit General Information')).toBeInTheDocument();
      });

      const editButton = screen.getByText('Edit General Information');
      fireEvent.click(editButton);

      expect(mockPush).toHaveBeenCalledWith('/account?doc=general');
    });
  });
});

