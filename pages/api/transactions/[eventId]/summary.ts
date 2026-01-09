import type { NextApiRequest, NextApiResponse } from 'next/types';

import { TransactionSummary } from '@/types/transaction';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TransactionSummary | { message: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Dummy data as requested
  const dummyData: TransactionSummary = {
    ticketSales: {
      total: 657450,
      amount: 657450
    },
    payment: 132560000,
    withdrawal: 132560000,
    balance: 2560000
  };

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return res.status(200).json(dummyData);
}
