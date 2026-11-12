import { fireEvent, render, screen } from '@testing-library/react';

import { useCities } from '@/hooks/list/useCities';

import EventsFilter from './index';

jest.mock('@/hooks/list/useCities', () => ({
  useCities: jest.fn()
}));

const mockUseCities = useCities as jest.Mock;

describe('EventsFilter', () => {
  const mockOnFiltersChange = jest.fn();

  const mockFilters = {
    show: 10,
    page: 0,
    name: '',
    cityId: '',
    startDate: '',
    endDate: ''
  };

  const mockCities = [
    { id: 'city1', name: 'Jakarta' },
    { id: 'city2', name: 'Bandung' },
    { id: 'city3', name: 'Surabaya' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCities.mockReturnValue({
      cities: mockCities,
      loading: false
    });
  });

  it('renders fields and updates name, cityId, startDate, and endDate filters', () => {
    render(
      <EventsFilter
        filters={{
          ...mockFilters,
          name: 'Initial',
          startDate: '2025-05-01T10:00:00.000Z',
          endDate: '2025-05-02T10:00:00.000Z'
        }}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    expect(screen.getByText('Filter Events')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter event name...')).toHaveValue(
      'Initial'
    );

    // Search change
    fireEvent.change(screen.getByPlaceholderText('Enter event name...'), {
      target: { value: 'Music' }
    });
    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Music', page: 1 })
    );

    // City select change (MUI Select renders button/combobox)
    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'Bandung' }));
    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ cityId: 'city2', page: 1 })
    );

    // Start & end date change (valid & cleared)
    fireEvent.change(screen.getByLabelText('Start Date'), {
      target: { value: '2025-06-01T12:00' }
    });
    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ startDate: expect.any(String), page: 1 })
    );

    fireEvent.change(screen.getByLabelText('End Date'), {
      target: { value: '' }
    });
    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ endDate: '', page: 1 })
    );
  });

  it('disables city select while cities are loading', () => {
    mockUseCities.mockReturnValue({ cities: [], loading: true });

    render(
      <EventsFilter
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });
});
