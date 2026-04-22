import { useState } from 'react';

import { useOTSTransactions } from '@/hooks';

import { EventTransactionTable } from '../../../finance/transaction/event-table';

interface PerformanceTableProps {
  eventId: string;
  cashierId?: string;
}

export function PerformanceTable({ eventId, cashierId }: PerformanceTableProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);

  const { transactions, loading, pagination, error } = useOTSTransactions(eventId, cashierId, {
    page: currentPage,
    limit: pageSize
  });

  return (
    <EventTransactionTable
      transactions={transactions}
      loading={loading}
      error={error?.message}
      total={pagination?.totalRecords || 0}
      currentPage={currentPage}
      pageSize={pageSize}
      onPageChange={setCurrentPage}
    />
  );
}
