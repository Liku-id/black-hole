import { TransactionsResponse, TransactionsFilters } from '@/types/transaction';
import { apiUtils } from '@/utils/apiUtils';

class TransactionsService {
  async getEventTransactions(
    eventId: string,
    filters?: TransactionsFilters
  ): Promise<TransactionsResponse> {
    try {
      const params: Record<string, any> = {};

      if (filters?.page !== undefined) {
        params.page = (filters.page + 1).toString();
      }
      if (filters?.limit !== undefined) params.limit = filters.limit.toString();

      return await apiUtils.get<TransactionsResponse>(
        `/api/transactions/${eventId}`,
        params,
        'Failed to fetch event transactions'
      );
    } catch (error) {
      console.error('Error fetching event transactions:', error);
      throw error;
    }
  }
}

const transactionsService = new TransactionsService();

export { transactionsService };
