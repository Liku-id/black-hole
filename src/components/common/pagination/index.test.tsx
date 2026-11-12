import { fireEvent, render, screen } from '@testing-library/react';

import { Pagination } from './index';

describe('Pagination', () => {
  it('returns null when loading is true', () => {
    const { container } = render(
      <Pagination
        total={100}
        currentPage={0}
        pageSize={10}
        loading={true}
        onPageChange={() => {}}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders current page info, page size selector with custom & default options, and page navigation', () => {
    const handlePageChange = jest.fn();
    const handlePageSizeChange = jest.fn();

    const { rerender } = render(
      <Pagination
        total={100}
        currentPage={1}
        pageSize={10}
        pageSizeOptions={[5, 10, 20]}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    );

    expect(
      screen.getByText(/showing 11 to 20 of 100 entries/i)
    ).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('of 10')).toBeInTheDocument();

    const prevBtn = screen
      .getByTestId('KeyboardArrowLeftIcon')
      .closest('button')!;
    const nextBtn = screen
      .getByTestId('KeyboardArrowRightIcon')
      .closest('button')!;

    fireEvent.click(prevBtn);
    expect(handlePageChange).toHaveBeenCalledWith(0);

    fireEvent.click(nextBtn);
    expect(handlePageChange).toHaveBeenCalledWith(2);

    // Open Select menu from Pagination to change page size
    fireEvent.click(screen.getByDisplayValue('10'));
    fireEvent.click(screen.getByText('20'));
    expect(handlePageSizeChange).toHaveBeenCalledWith(20);

    // Default pageSizeOptions & total = 0 & showInfo = false
    rerender(
      <Pagination
        total={0}
        currentPage={0}
        pageSize={10}
        showInfo={false}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    );

    expect(screen.queryByText(/showing/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByDisplayValue('10'));
    expect(screen.getByText('25')).toBeInTheDocument();
  });
});
