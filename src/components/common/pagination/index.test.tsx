import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from './index';

// Mock Select
jest.mock('@/components/common/select', () => (props: any) => (
    <select 
      data-testid="page-size-select" 
      value={props.value} 
      onChange={(e) => props.onChange(e.target.value)}
    >
      {props.options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
));

describe('Pagination', () => {
  it('renders current page info', () => {
    render(
      <Pagination
        total={100}
        currentPage={0}
        pageSize={10}
        onPageChange={() => {}}
      />
    );
    expect(screen.getByText(/showing 1 to 10 of 100 entries/i)).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Current page number button
  });

  it('handles next page click', () => {
    const handlePageChange = jest.fn();
    render(
      <Pagination
        total={100}
        currentPage={0}
        pageSize={10}
        onPageChange={handlePageChange}
      />
    );
    const nextBtn = screen.getByTestId('KeyboardArrowRightIcon').closest('button');
    if (nextBtn) fireEvent.click(nextBtn);
    expect(handlePageChange).toHaveBeenCalledWith(1);
  });
});
