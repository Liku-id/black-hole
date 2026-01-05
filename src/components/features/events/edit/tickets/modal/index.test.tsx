import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/router';

import TicketAdditionalFormModal from './index';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  pathname: '/',
  query: { metaUrl: 'test-event' },
  asPath: '/'
};

describe('TicketAdditionalFormModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  describe('Modal Visibility', () => {
    it('should render when open is true', () => {
      render(
        <TicketAdditionalFormModal
          open={true}
          onClose={jest.fn()}
        />
      );

      expect(screen.getByText('Add Additional Form?')).toBeInTheDocument();
    });

    it('should not render when open is false', () => {
      render(
        <TicketAdditionalFormModal
          open={false}
          onClose={jest.fn()}
        />
      );

      expect(
        screen.queryByText('Add Additional Form?')
      ).not.toBeInTheDocument();
    });
  });

  describe('Content', () => {
    it('should display modal description', () => {
      render(
        <TicketAdditionalFormModal
          open={true}
          onClose={jest.fn()}
        />
      );

      expect(
        screen.getByText(/You can create additional forms/i)
      ).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(
        <TicketAdditionalFormModal
          open={true}
          onClose={jest.fn()}
        />
      );

      expect(screen.getByText("No, I don't need it")).toBeInTheDocument();
      expect(screen.getByText('Yes, add additional form')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to event detail when "No" button is clicked', () => {
      render(
        <TicketAdditionalFormModal
          open={true}
          onClose={jest.fn()}
        />
      );

      const noButton = screen.getByText("No, I don't need it");
      fireEvent.click(noButton);

      expect(mockPush).toHaveBeenCalledWith('/events/test-event');
    });

    it('should navigate to additional form page when "Yes" button is clicked', () => {
      render(
        <TicketAdditionalFormModal
          open={true}
          onClose={jest.fn()}
        />
      );

      const yesButton = screen.getByText('Yes, add additional form');
      fireEvent.click(yesButton);

      expect(mockPush).toHaveBeenCalledWith(
        '/events/edit/test-event/tickets/additional-form'
      );
    });
  });
});


