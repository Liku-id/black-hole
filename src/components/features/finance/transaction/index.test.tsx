import { fireEvent, render, screen } from '@testing-library/react';

import FinanceTransaction from './index';

jest.mock('@/components/common', () => ({
  Body1: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  Button: ({
    children,
    id,
    onClick
  }: {
    children: React.ReactNode;
    id?: string;
    onClick?: () => void;
  }) => (
    <button id={id} type="button" onClick={onClick}>
      {children}
    </button>
  )
}));

jest.mock('./table', () => ({
  FinanceTransactionTable: () => (
    <div data-testid="finance-transaction-table">Table</div>
  )
}));

jest.mock('./export-modal', () => ({
  ExportModal: ({ onClose, open }: { onClose: () => void; open: boolean }) =>
    open ? (
      <div data-testid="export-modal">
        <button type="button" onClick={onClose}>
          Close Export
        </button>
      </div>
    ) : null
}));

describe('FinanceTransaction', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders header, export button, and transaction table with modal closed initially', () => {
    render(<FinanceTransaction />);

    expect(screen.getByText('Event Transaction Detail')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByTestId('finance-transaction-table')).toBeInTheDocument();
    expect(screen.queryByTestId('export-modal')).not.toBeInTheDocument();
  });

  it('opens and closes ExportModal via Export button and onClose', () => {
    render(<FinanceTransaction />);

    fireEvent.click(screen.getByText('Export'));
    expect(screen.getByTestId('export-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Close Export'));
    expect(screen.queryByTestId('export-modal')).not.toBeInTheDocument();
  });
});
