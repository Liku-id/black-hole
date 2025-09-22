import { TableBody, TableContainer, TableHead, styled } from '@mui/material';

const StyledTableContainer = styled(TableContainer)({
  backgroundColor: '#FFFFFF',
  borderRadius: 0,
  '& .MuiTable-root': {
    borderCollapse: 'separate',
    borderSpacing: 0,
    tableLayout: 'fixed',
    width: '100%'
  }
});

const StyledTableHead = styled(TableHead)({
  '& .MuiTableCell-head': {
    border: 'none',
    backgroundColor: 'transparent'
  },
  '& .MuiTableCell-root': {
    padding: '16px 8px'
  }
});

const StyledTableBody = styled(TableBody)(({ theme }) => ({
  '& .MuiTableRow-root': {
    borderTop: `1px solid ${theme.palette.grey[100]}`,
    '&:hover': {
      backgroundColor: '#F8FAFC'
    }
  },
  '& .MuiTableCell-body': {
    border: 'none',
    borderTop: `1px solid ${theme.palette.grey[100]}`
  },
  '& .MuiTableCell-root': {
    padding: '16px 8px'
  }
}));

export { StyledTableContainer, StyledTableHead, StyledTableBody };
