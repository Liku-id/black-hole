import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { SearchField } from './index';

// Mock Autocomplete
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    Autocomplete: (props: any) => (
      <div data-testid="autocomplete">
         <input 
            onChange={(e) => {
                 const val = e.target.value;
                 const option = props.options.find((o:any) => o.label === val);
                 props.onChange(null, option || null);
            }} 
            placeholder={props.placeholder}
         />
      </div>
    )
  };
});

describe('SearchField', () => {
  const options = [{ label: 'Event 1', value: 'e1' }];

  it('renders correctly', () => {
    render(
       <SearchField
         eventOptions={options}
         selectedEvent=""
         onEventChange={() => {}}
         onScanTicket={() => {}}
       />
    );
    expect(screen.getByText('Select Event')).toBeInTheDocument();
    expect(screen.getByText('Scan Ticket')).toBeInTheDocument();
    expect(screen.getByTestId('autocomplete')).toBeInTheDocument();
  });

  it('calls onScanTicket', () => {
    const handleScan = jest.fn();
    render(
       <SearchField
         eventOptions={options}
         selectedEvent=""
         onEventChange={() => {}}
         onScanTicket={handleScan}
       />
    );
    fireEvent.click(screen.getByText('Scan Ticket'));
    expect(handleScan).toHaveBeenCalled();
  });
});
