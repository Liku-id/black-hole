import { fireEvent, render, screen } from '@testing-library/react';

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
    description: 'Event company description',
    email: 'org1@example.com',
    phone_number: '123',
    nik: '12345',
    npwp: '67890',
    created_at: '2023-01-01',
    bank_information: {
      bank: { name: 'BCA' },
      accountNumber: '123456',
      accountHolderName: 'Org Holder'
    }
  },
  {
    id: 'org2',
    name: 'Org 2',
    phone_number: '456',
    created_at: '2023-01-02'
  }
];

describe('OrganizersTable', () => {
  it('renders loading state', () => {
    render(<OrganizersTable organizers={[]} loading={true} />);
    expect(screen.getAllByText('Loading organizers...').length).toBeGreaterThan(
      0
    );
  });

  it('renders organizers with and without bank info and supports selection, pagination, refresh, and mobile expand', () => {
    const onRefresh = jest.fn();
    render(
      <OrganizersTable
        organizers={mockOrganizers as any[]}
        onRefresh={onRefresh}
      />
    );
    expect(screen.getAllByText('Org 1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Manager').length).toBeGreaterThan(0);
    expect(screen.getAllByText('BCA').length).toBeGreaterThan(0);
    expect(screen.getAllByText('No Bank Info').length).toBeGreaterThan(0);

    // Refresh
    fireEvent.click(screen.getByText('Refresh'));
    expect(onRefresh).toHaveBeenCalledTimes(1);

    // Select one row, partial, then select all, then deselect
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);
    expect(checkboxes[1]).toBeChecked();

    fireEvent.click(checkboxes[1]);
    expect(checkboxes[1]).not.toBeChecked();

    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0]).toBeChecked();

    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0]).not.toBeChecked();

    // Expand mobile collapsible card for Org 1 & Org 2
    const mobileRow = screen.getByText('1. Org 1').closest('[role="button"]')!;
    fireEvent.click(mobileRow);
    const mobileRow2 = screen.getByText('2. Org 2').closest('[role="button"]')!;
    fireEvent.click(mobileRow2);

    // Change rows per page
    const rowsSelect = screen.getByLabelText('Rows per page:');
    fireEvent.mouseDown(rowsSelect);
    const option5 = screen.getByRole('option', { name: '5' });
    fireEvent.click(option5);
    expect(screen.getByText('1–2 of 2')).toBeInTheDocument();
  });

  it('paginates across multiple pages', () => {
    const many = Array.from({ length: 12 }, (_, idx) => ({
      id: `org-${idx + 1}`,
      name: `Paged Org ${idx + 1}`,
      phone_number: '123',
      created_at: '2023-01-01'
    }));

    render(<OrganizersTable organizers={many as any[]} />);
    expect(screen.getAllByText(/Paged Org 1$/).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByLabelText('Go to next page'));
    expect(screen.getAllByText(/Paged Org 11$/).length).toBeGreaterThan(0);
  });
});
