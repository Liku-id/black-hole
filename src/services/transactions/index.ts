import {
  TransactionsResponse,
  TransactionsFilters,
  ExportTransactionsRequest
} from '@/types/transaction';
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

  async exportTransactions(request: ExportTransactionsRequest): Promise<void> {
    try {
      const params = new URLSearchParams();

      if (request.from_date) params.append('from_date', request.from_date);
      if (request.to_date) params.append('to_date', request.to_date);
      if (request.payment_status)
        params.append('payment_status', request.payment_status);
      if (request.event_id) params.append('event_id', request.event_id);

      const url = `/api/transactions-export${params.toString() ? '?' + params.toString() : ''}`;

      // Make request
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        // Try to parse error message
        let errorMessage = `Export failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'transactions_export.csv';

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename=(.+)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Convert response to blob and download
      const blob = await response.blob();

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
      throw error;
    }
  }
}

const transactionsService = new TransactionsService();

export { transactionsService };
