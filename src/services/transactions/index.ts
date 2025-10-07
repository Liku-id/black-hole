import { TransactionsResponse, TransactionsFilters, ExportTransactionsResponse, ExportTransactionsRequest } from '@/types/transaction';
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

  async exportTransactions(request: ExportTransactionsRequest): Promise<ExportTransactionsResponse> {
    try {
      const params: Record<string, any> = {};

      if (request.from_date) params.from_date = request.from_date;
      if (request.to_date) params.to_date = request.to_date;
      if (request.payment_status) params.payment_status = request.payment_status;
      if (request.event_id) params.event_id = request.event_id;

      return await apiUtils.get<ExportTransactionsResponse>(
        '/api/transactions/export',
        params,
        'Failed to export transactions'
      );
    } catch (error) {
      console.error('Error exporting transactions:', error);
      throw error;
    }
  }
}

const transactionsService = new TransactionsService();

export { transactionsService };
