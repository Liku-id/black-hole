import { PaymentMethod } from '@/hooks/list/usePaymentMethods';
import { CitiesResponse } from '@/types/city';
import { apiUtils } from '@/utils/apiUtils';

interface GroupedPaymentMethods {
  [key: string]: PaymentMethod[];
}

class ListService {
  async getCities(): Promise<CitiesResponse> {
    try {
      return await apiUtils.get('/api/cities', {}, 'Failed to fetch cities');
    } catch (error) {
      console.error('Error fetching cities:', error);
      throw error;
    }
  }

  async getPaymentMethods(): Promise<{
    statusCode: number;
    message: string;
    body: GroupedPaymentMethods;
  }> {
    try {
      const responseData = await apiUtils.get(
        '/api/list/payment-method',
        {},
        'Failed to fetch payment methods'
      );

      // Group and map the payment methods
      const groupedMethods = responseData.body.reduce(
        (acc: GroupedPaymentMethods, method: PaymentMethod) => {
          const displayType =
            method.type === 'va' ? 'Virtual Account' : method.type || 'Other';

          if (!acc[displayType]) {
            acc[displayType] = [];
          }
          acc[displayType].push(method);
          return acc;
        },
        {} as GroupedPaymentMethods
      );

      return {
        statusCode: responseData.statusCode || 200,
        message: responseData.message || 'Success',
        body: groupedMethods
      };
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  }
}

const listService = new ListService();

export { listService };
