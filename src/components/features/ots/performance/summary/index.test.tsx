import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test-utils/renderWithProviders';

import { OTSSummaryCards } from './index';

describe('OTSSummaryCards', () => {
  it('renders default zero values when data is undefined', () => {
    renderWithProviders(<OTSSummaryCards />);

    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('Ticket Sold')).toBeInTheDocument();
    expect(screen.getByText('Total Transaction')).toBeInTheDocument();
    expect(screen.getByText('Total Visitors')).toBeInTheDocument();
    expect(screen.getAllByText('0')).toHaveLength(4);
  });

  it('renders provided summary card values', () => {
    renderWithProviders(
      <OTSSummaryCards
        data={{
          totalRevenue: 'Rp 5.000.000',
          ticketSold: 120,
          totalTransaction: 45,
          totalVisitors: 110
        }}
      />
    );

    expect(screen.getByText('Rp 5.000.000')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('110')).toBeInTheDocument();
  });

  it('renders loading ellipsis placeholders when loading is true', () => {
    renderWithProviders(
      <OTSSummaryCards
        data={{
          totalRevenue: 'Rp 5.000.000',
          ticketSold: 120,
          totalTransaction: 45,
          totalVisitors: 110
        }}
        loading={true}
      />
    );

    expect(screen.getAllByText('...')).toHaveLength(4);
    expect(screen.queryByText('Rp 5.000.000')).not.toBeInTheDocument();
  });
});
