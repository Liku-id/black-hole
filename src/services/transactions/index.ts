import axios from 'axios';

import {
  TransactionsResponse,
  TransactionsFilters,
  ExportTransactionsRequest,
  TransactionSummary
} from '@/types/transaction';
import { apiUtils } from '@/utils/apiUtils';

class TransactionsService {
  async getEventTransactions(
    filters: TransactionsFilters
  ): Promise<TransactionsResponse> {
    try {
      const params: Record<string, any> = {};

      if (filters?.page !== undefined) params.page = filters.page.toString();
      if (filters?.show !== undefined) params.limit = filters.show.toString();
      if (filters?.partnerId) params.partnerId = filters.partnerId;
      if (filters?.search) params.search = filters.search;
      if (filters?.status) params.status = filters.status;

      return await apiUtils.get<TransactionsResponse>(
        `/api/transactions/${filters.eventId}`,
        params,
        'Failed to fetch event transactions'
      );
    } catch (error) {
      console.error('Error fetching event transactions:', error);
      throw error;
    }
  }

  async exportTransactions(
    request: ExportTransactionsRequest,
    eventName?: string
  ): Promise<void> {
    try {
      const params: Record<string, string> = {};

      if (request.from_date) params.from_date = request.from_date;
      if (request.to_date) params.to_date = request.to_date;
      if (request.payment_status)
        params.payment_status = request.payment_status;
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

      // Generate filename with new format: transactions_[event name]_[exported date DDMMYYYY & time HH:MM:SS].csv
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-GB').replace(/\//g, ''); // DDMMYYYY format
      const timeStr = now
        .toLocaleTimeString('en-GB', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
        .replace(/:/g, ''); // HHMMSS format

      const eventNameFormatted = eventName
        ? eventName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')
        : 'all_events';
      const filename = `transactions_${eventNameFormatted}_${dateStr}_${timeStr}.csv`;

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

  async getTransactionSummary(eventId: string): Promise<TransactionSummary> {
    try {
      const response = await apiUtils.get<any>(
        `/api/transactions/${eventId}/summary`,
        {},
        'Failed to fetch transaction summary'
      );

      const data = response?.body;

      if (!data) {
        return {
          ticketSales: {
            total: 0,
            amount: 0
          },
          payment: 0,
          withdrawal: 0,
          balance: 0
        };
      }

      return {
        ticketSales: {
          total: parseFloat(data.total_ticket_sold || '0'),
          amount: parseFloat(data.total_payment || '0')
        },
        payment: parseFloat(data.total_payment || '0'),
        withdrawal: parseFloat(data.total_withdrawal || '0'),
        balance: parseFloat(data.available_balance || '0')
      };
    } catch (error) {
      console.error('Error fetching transaction summary:', error);
      throw error;
    }
  }
}

const transactionsService = new TransactionsService();

export { transactionsService };
