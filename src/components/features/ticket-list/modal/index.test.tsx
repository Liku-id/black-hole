import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TicketDetailModal } from './index';

jest.mock('@/utils', () => ({
  dateUtils: {
    formatDateDDMMYYYY: () => '01/01/2023',
    formatDateDDMMYYYYHHMM: () => '01/01/2023 10:00'
  }
}));

const mockAttendee = {
  name: 'John Doe',
  ticketType: 'VIP',
  phoneNumber: '123456789',
  email: 'john@example.com',
  paymentMethod: 'Bank Transfer',
  transactionNumber: 'TRX123',
  date: '2023-01-01',
  redeemStatus: 'issued',
  attendeeData: [
    { field: 'Dietary', value: ['Vegetarian'] }
  ]
};

describe('TicketDetailModal', () => {
  it('renders details correctly', () => {
    render(
      <TicketDetailModal
        open={true}
        onClose={() => {}}
        attendee={mockAttendee as any}
      />
    );
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('VIP')).toBeInTheDocument();
    expect(screen.getByText('TRX123')).toBeInTheDocument();
  });

  it('switches tabs', () => {
    render(
      <TicketDetailModal
        open={true}
        onClose={() => {}}
        attendee={mockAttendee as any}
      />
    );
    
    fireEvent.click(screen.getByText('Additional Question'));
    expect(screen.getByText('Dietary')).toBeInTheDocument();
    expect(screen.getByText('Vegetarian')).toBeInTheDocument();
  });
});
