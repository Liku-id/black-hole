import { TransactionsResponse, TransactionsFilters } from '@/types/transaction';

class TransactionsService {
  async getEventTransactions(
    eventId: string,
    filters?: TransactionsFilters
  ): Promise<TransactionsResponse> {
    try {
      const params = new URLSearchParams();

      if (filters?.page !== undefined)
        params.append('page', filters.page.toString());
      if (filters?.limit !== undefined)
        params.append('limit', filters.limit.toString());

      const queryString = params.toString();
      const url = `/api/transactions/${eventId}${
        queryString ? `?${queryString}` : ''
      }`;

      // Get auth token from localStorage
      const token = localStorage.getItem('auth_access_token');

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        let errorMessage = 'Failed to fetch event transactions';

        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else {
            errorMessage = `Server error (${response.status})`;
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorMessage = `Server error (${response.status})`;
        }

        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error('Error fetching event transactions:', error);
      throw error;
    }
  }
}

export default new TransactionsService();
