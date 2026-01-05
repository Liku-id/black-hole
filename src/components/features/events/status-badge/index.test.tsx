import { render, screen } from '@testing-library/react';

import { StatusBadge } from './index';

describe('StatusBadge', () => {
  describe('Status Rendering', () => {
    it('should render "Done" status', () => {
      render(<StatusBadge status="done" />);
      expect(screen.getByText('Done')).toBeInTheDocument();
    });

    it('should render "Ongoing" status', () => {
      render(<StatusBadge status="on_going" />);
      expect(screen.getByText('Ongoing')).toBeInTheDocument();
    });

    it('should render "Upcoming" status for approved', () => {
      render(<StatusBadge status="approved" />);
      expect(screen.getByText('Upcoming')).toBeInTheDocument();
    });

    it('should render "Rejected" status', () => {
      render(<StatusBadge status="rejected" />);
      expect(screen.getByText('Rejected')).toBeInTheDocument();
    });

    it('should render "On Review" status', () => {
      render(<StatusBadge status="on_review" />);
      expect(screen.getByText('On Review')).toBeInTheDocument();
    });

    it('should render "Pending" status', () => {
      render(<StatusBadge status="pending" />);
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('should render "Failed" status', () => {
      render(<StatusBadge status="failed" />);
      expect(screen.getByText('Failed')).toBeInTheDocument();
    });

    it('should render "Paid" status', () => {
      render(<StatusBadge status="paid" />);
      expect(screen.getByText('Paid')).toBeInTheDocument();
    });

    it('should render "Draft" as default for unknown status', () => {
      render(<StatusBadge status="unknown_status" />);
      expect(screen.getByText('Draft')).toBeInTheDocument();
    });

    it('should render "Draft" for empty status', () => {
      render(<StatusBadge status="" />);
      expect(screen.getByText('Draft')).toBeInTheDocument();
    });
  });

  describe('Custom Display Name', () => {
    it('should use custom displayName when provided', () => {
      render(<StatusBadge status="on_going" displayName="Custom Ongoing" />);
      expect(screen.getByText('Custom Ongoing')).toBeInTheDocument();
      expect(screen.queryByText('Ongoing')).not.toBeInTheDocument();
    });

    it('should use default displayName when displayName is not provided', () => {
      render(<StatusBadge status="pending" />);
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });
  });

  describe('Case Insensitive', () => {
    it('should handle uppercase status', () => {
      render(<StatusBadge status="DONE" />);
      expect(screen.getByText('Done')).toBeInTheDocument();
    });

    it('should handle mixed case status', () => {
      render(<StatusBadge status="On_Going" />);
      expect(screen.getByText('Ongoing')).toBeInTheDocument();
    });
  });
});

