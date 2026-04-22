import { apiUtils } from '@/utils/apiUtils';

export interface CreateOrderRequest {
  quantity: number;
  ticketTypeId: string;
  groupTicketId?: string;
}

export interface CreateOrderResponse {
  statusCode: number;
  message: string;
  order: {
    id: string;
    expiredAt: string;
    [key: string]: any;
  };
}

export interface GetOrderResponse {
  statusCode: number;
  message: string;
  order?: any;
  tickets?: any[];
  [key: string]: any;
}

class OrdersService {
  async createOrder(payload: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      return await apiUtils.post<CreateOrderResponse>(
        '/api/order/create',
        payload,
        'Failed to create order'
      );
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getOrder(id: string): Promise<GetOrderResponse> {
    try {
      return await apiUtils.get<GetOrderResponse>(
        `/api/order/${id}`,
        {},
        'Failed to fetch order details'
      );
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  }

  async checkoutOrder(payload: any): Promise<any> {
    try {
      return await apiUtils.post(
        '/api/order/transaction',
        payload,
        'Failed to process checkout'
      );
    } catch (error) {
      console.error('Error processing checkout:', error);
      throw error;
    }
  }
}

const ordersService = new OrdersService();

export { ordersService };
