import { apiUtils } from '@/utils/apiUtils';

export interface Discount {
  id: string;
  ticket_type_id: string;
  name: string;
  description?: string;
  value: number;
  start_date: string;
  end_date: string;
  status: 'pending' | 'approved' | 'rejected';
  rejected_reason?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface GetDiscountsResponse {
  statusCode: number;
  message: string;
  body: {
    discounts: Discount[];
  };
}

export interface DiscountDetailResponse {
  statusCode: number;
  message: string;
  body: Discount;
}

export interface CreateDiscountRequest {
  ticket_type_id: string;
  name: string;
  description?: string;
  value: number;
  start_date: string;
  end_date: string;
}

export interface UpdateDiscountRequest {
  id: string;
  ticket_type_id: string;
  name: string;
  description?: string;
  value: number;
  start_date: string;
  end_date: string;
}

export interface DiscountApprovalRequest {
  id: string;
  status: 'approved' | 'rejected';
  rejected_reason?: string;
}

class DiscountsService {
  async getDiscountsByEvent(eventId: string): Promise<GetDiscountsResponse> {
    try {
      return await apiUtils.get<GetDiscountsResponse>(
        `/api/events/${eventId}/discounts`,
        undefined,
        'Failed to fetch discounts by event'
      );
    } catch (error) {
      console.error('Error fetching discounts by event:', error);
      throw error;
    }
  }

  async getDiscountDetail(id: string): Promise<DiscountDetailResponse> {
    try {
      return await apiUtils.get<DiscountDetailResponse>(
        `/api/discounts/${id}`,
        undefined,
        'Failed to fetch discount details'
      );
    } catch (error) {
      console.error('Error fetching discount detail:', error);
      throw error;
    }
  }

  async createDiscount(
    payload: CreateDiscountRequest
  ): Promise<DiscountDetailResponse> {
    try {
      return await apiUtils.post<DiscountDetailResponse>(
        '/api/discounts',
        payload,
        'Failed to create discount'
      );
    } catch (error) {
      console.error('Error creating discount:', error);
      throw error;
    }
  }

  async updateDiscount(
    id: string,
    payload: Omit<UpdateDiscountRequest, 'id'>
  ): Promise<DiscountDetailResponse> {
    try {
      return await apiUtils.put<DiscountDetailResponse>(
        `/api/discounts/${id}`,
        payload,
        'Failed to update discount'
      );
    } catch (error) {
      console.error('Error updating discount:', error);
      throw error;
    }
  }

  async deleteDiscount(id: string): Promise<void> {
    try {
      await apiUtils.delete<void>(
        `/api/discounts/${id}`,
        'Failed to delete discount'
      );
    } catch (error) {
      console.error('Error deleting discount:', error);
      throw error;
    }
  }

  async approveRejectDiscount(
    id: string,
    payload: Omit<DiscountApprovalRequest, 'id'>
  ): Promise<DiscountDetailResponse> {
    try {
      return await apiUtils.post<DiscountDetailResponse>(
        `/api/discounts/${id}/approval`,
        { ...payload, id },
        'Failed to approve/reject discount'
      );
    } catch (error) {
      console.error('Error processing discount approval:', error);
      throw error;
    }
  }
}

export const discountsService = new DiscountsService();
