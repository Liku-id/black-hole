import { apiUtils } from '@/utils/apiUtils';

export interface UtmPayload {
  action: string;
  amountSpent?: string;
  campaign: string;
  email: string;
  fullName: string;
  medium: string;
  phoneNumber: string;
  platform: string;
  source: string;
  timestamp: string;
  userId?: string;
}

export const utmService = {
  sendUtmData: async (payload: UtmPayload) => {
    try {
      const response = await apiUtils.post('/api/utm', payload);
      return response;
    } catch (error) {
      throw error;
    }
  }
};
