import { render, screen } from '@testing-library/react';
import React from 'react';

import OrganizersTable from './index';

jest.mock('@/utils', () => ({
  formatDateTimeWIB: () => '2023-01-01 10:00',
  formatPhoneNumber: (val: any) => val,
  truncate: (val: any) => val,
  dateUtils: {
      formatDateTimeWIB: () => '2023-01-01 10:00'
  }
}));

const mockOrganizers = [
  {
    id: 'org1',
    name: 'Org 1',
    pic_title: 'Manager',
    email: 'org1@example.com',
    phone_number: '123',
    created_at: '2023-01-01',
    bank_information: {
      bank: { name: 'BCA' },
      accountNumber: '123456',
      accountHolderName: 'Org Holder'
    }
  }
];

describe('OrganizersTable', () => {
  it('renders loading state', () => {
    render(
      <OrganizersTable
        organizers={[]}
        loading={true}
      />
    );
    expect(screen.getByText('Loading organizers...')).toBeInTheDocument();
  });

  it('renders organizers', () => {
    render(
      <OrganizersTable
        organizers={mockOrganizers as any[]}
      />
    );
    expect(screen.getByText('Org 1')).toBeInTheDocument();
    expect(screen.getByText('Manager')).toBeInTheDocument();
    expect(screen.getByText('BCA')).toBeInTheDocument();
  });
});
