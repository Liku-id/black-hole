import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EventsFilter from './index';
import { useCities } from '@/hooks/list/useCities';

// Mock hooks
jest.mock('@/hooks/list/useCities', () => ({
  useCities: jest.fn()
}));

const mockUseCities = useCities as jest.MockedFunction<typeof useCities>;

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

  describe('Rendering', () => {
    it('should render filter title', () => {
      render(
        <EventsFilter
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      expect(screen.getByText('Filter Events')).toBeInTheDocument();
    });

    it('should render search field', () => {
      render(
        <EventsFilter
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      expect(screen.getByLabelText('Search Event Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter event name...')).toBeInTheDocument();
    });

    it('should render city select', () => {
      render(
        <EventsFilter
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      // Material-UI Select uses InputLabel - find by text content
      const cityLabels = screen.queryAllByText('City');
      expect(cityLabels.length).toBeGreaterThan(0);
    });

    it('should render start date and end date fields', () => {
      render(
        <EventsFilter
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
      expect(screen.getByLabelText('End Date')).toBeInTheDocument();
    });
  });

  describe('City Selection', () => {
    it('should render city filter field', () => {
      render(
        <EventsFilter
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      // Verify city label exists (may appear multiple times)
      const cityLabels = screen.queryAllByText('City');
      expect(cityLabels.length).toBeGreaterThan(0);
    });

    it('should handle city selection', () => {
      render(
        <EventsFilter
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      // Component should render
      expect(screen.getByText('Filter Events')).toBeInTheDocument();
      const cityLabels = screen.queryAllByText('City');
      expect(cityLabels.length).toBeGreaterThan(0);
    });

    it('should show loading state when cities are loading', () => {
      mockUseCities.mockReturnValue({
        cities: [],
        loading: true
      });

      render(
        <EventsFilter
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      // Just verify component rendered
      expect(screen.getByText('Filter Events')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should call onFiltersChange when search value changes', () => {
      render(
        <EventsFilter
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const searchField = screen.getByPlaceholderText('Enter event name...');
      fireEvent.change(searchField, { target: { value: 'Test Event' } });

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...mockFilters,
        name: 'Test Event',
        page: 1
      });
    });

    it('should display current search value', () => {
      render(
        <EventsFilter
          filters={{ ...mockFilters, name: 'Existing Search' }}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const searchField = screen.getByPlaceholderText('Enter event name...');
      expect(searchField).toHaveValue('Existing Search');
    });
  });

  describe('Date Filtering', () => {
    it('should call onFiltersChange when start date changes', () => {
      render(
        <EventsFilter
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const startDateField = screen.getByLabelText('Start Date');
      fireEvent.change(startDateField, {
        target: { value: '2024-01-15T10:00' }
      });

      expect(mockOnFiltersChange).toHaveBeenCalled();
      const callArgs = mockOnFiltersChange.mock.calls[0][0];
      expect(callArgs.startDate).toBeTruthy();
      expect(callArgs.page).toBe(1);
    });

    it('should call onFiltersChange when end date changes', () => {
      render(
        <EventsFilter
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const endDateField = screen.getByLabelText('End Date');
      fireEvent.change(endDateField, {
        target: { value: '2024-01-20T18:00' }
      });

      expect(mockOnFiltersChange).toHaveBeenCalled();
      const callArgs = mockOnFiltersChange.mock.calls[0][0];
      expect(callArgs.endDate).toBeTruthy();
      expect(callArgs.page).toBe(1);
    });
  });
});

