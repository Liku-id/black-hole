import { listService } from '@/services/list';

import { useApi } from '../useApi';

export interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  logo: string;
  bankId: string;
  requestType: string;
  paymentCode: string;
  paymentMethodFee: number;
  channelProperties: Record<string, any>;
  rules: string[];
  bank: {
    id: string;
    name: string;
    channelCode: string;
    channelType: string;
    minAmount: number;
    maxAmount: number;
  };
}

interface GroupedPaymentMethodsResponse {
  statusCode: number;
  message: string;
  body: Record<string, PaymentMethod[]>;
}

export const usePaymentMethods = () => {
  const { data, loading, error } = useApi<GroupedPaymentMethodsResponse>(
    '/api/list/payment-method',
    () => listService.getPaymentMethods()
  );

  return {
    paymentMethods: data?.body || {},
    loading,
    error
  };
};
