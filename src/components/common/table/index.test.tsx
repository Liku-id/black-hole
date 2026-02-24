import { Table, TableRow, TableCell } from '@mui/material';
import { render } from '@testing-library/react';
import React from 'react';

import { StyledTableContainer, StyledTableHead, StyledTableBody } from './index';


describe('Table Components', () => {
  it('renders table structure correctly', () => {
    const { container } = render(
      <StyledTableContainer>
        <Table>
          <StyledTableHead>
            <TableRow>
              <TableCell>Header</TableCell>
            </TableRow>
          </StyledTableHead>
          <StyledTableBody>
            <TableRow>
              <TableCell>Row</TableCell>
            </TableRow>
          </StyledTableBody>
        </Table>
      </StyledTableContainer>
    );
    expect(container.querySelector('table')).toBeInTheDocument();
  });
});
