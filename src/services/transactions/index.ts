import {
  TransactionsResponse,
  TransactionsFilters,
  ExportTransactionsRequest
} from '@/types/transaction';
import { apiUtils } from '@/utils/apiUtils';
import axios from 'axios';

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

  async exportTransactions(request: ExportTransactionsRequest): Promise<void> {
    try {
      const params: Record<string, string> = {};

      if (request.from_date) params.from_date = request.from_date;
      if (request.to_date) params.to_date = request.to_date;
      if (request.payment_status) params.payment_status = request.payment_status;
      if (request.event_id) params.event_id = request.event_id;

      const url = '/api/transactions-export';

      // Make request using axios with blob responseType
      const response = await axios({
        method: 'GET',
        url,
        params,
        responseType: 'blob',
        withCredentials: true,
        timeout: 30000
      });

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'transactions_export.csv';

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename=(.+)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, ''); // Remove quotes
        }
      }

      // Convert response to blob and download
      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'text/csv'
      });

      // Download file
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
      }, 100);
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        throw apiUtils.handleAxiosError(error, 'Failed to export transactions');
      }
      throw error;
    }
  }
}

const transactionsService = new TransactionsService();

export { transactionsService };
