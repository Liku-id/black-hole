import { TableBody, TableContainer, TableHead, styled } from '@mui/material';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  borderRadius: 0,
  '& .MuiTable-root': {
    borderCollapse: 'separate',
    borderSpacing: 0,
    tableLayout: 'fixed',
    width: '100%'
  }
}));

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
  overflow: 'scroll',
  '& .MuiTableRow-root': {
    borderTop: `1px solid ${theme.palette.grey[100]}`,
    '&:hover': {
      backgroundColor: theme.palette.grey[50]
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
