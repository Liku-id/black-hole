import { TableBody, TableContainer, TableHead, styled } from '@mui/material';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  borderRadius: 0,
  overflowX: 'auto',
  width: '100%',
  maxWidth: '100%',
  '& .MuiTable-root': {
    borderCollapse: 'separate',
    borderSpacing: 0,
    width: '100%',
    tableLayout: 'fixed',
    [theme.breakpoints.down('md')]: {
      tableLayout: 'auto'
    }
  }
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  '& .MuiTableCell-head': {
    border: 'none',
    backgroundColor: 'transparent'
  },
  '& .MuiTableCell-root': {
    padding: '16px 8px',
    [theme.breakpoints.down('sm')]: {
      padding: '12px 6px',
      fontSize: '12px'
    }
  }
}));

const StyledTableBody = styled(TableBody)(({ theme }) => ({
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
    padding: '16px 8px',
    [theme.breakpoints.down('sm')]: {
      padding: '12px 6px',
      fontSize: '12px'
    }
  }
}));

export { StyledTableContainer, StyledTableHead, StyledTableBody };
