import { act, renderHook } from '@testing-library/react';

import { useToast } from '@/contexts/ToastContext';
import {
  CreatePartnerTicketTypeRequest,
  partnerTicketTypesService
} from '@/services/partner-ticket-types';

import { useCreatePartnerTicketType } from './useCreatePartnerTicketType';

jest.mock('@/contexts/ToastContext', () => ({
  useToast: jest.fn()
}));

jest.mock('@/services/partner-ticket-types', () => ({
  partnerTicketTypesService: {
    createPartnerTicketType: jest.fn()
  }
}));

const mockUseToast = useToast as jest.Mock;
const mockCreateService =
  partnerTicketTypesService.createPartnerTicketType as jest.Mock;

describe('useCreatePartnerTicketType', () => {
  const mockShowSuccess = jest.fn();
  const mockShowError = jest.fn();

  const payload: CreatePartnerTicketTypeRequest = {
    partner_id: 'partner-1',
    ticket_type_ids: ['tt-1'],
    discount: {
      'tt-1': { discount: 10, quota: 50, max_order_quantity: 2 }
    },
    expired_at: '2026-12-31T23:59:59.000Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseToast.mockReturnValue({
      showSuccess: mockShowSuccess,
      showError: mockShowError
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('initializes with loading false and error null', () => {
    const { result } = renderHook(() => useCreatePartnerTicketType());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.createPartnerTicketType).toBe('function');
  });

  it('creates partner ticket type successfully, updates loading, and shows success toast', async () => {
    let resolvePromise: (value?: unknown) => void = () => {};
    mockCreateService.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
    );

    const { result } = renderHook(() => useCreatePartnerTicketType());

    let createPromise: Promise<void>;
    act(() => {
      createPromise = result.current.createPartnerTicketType(payload);
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();

    await act(async () => {
      resolvePromise({ status_code: 201, message: 'Created' });
      await createPromise;
    });

    expect(mockCreateService).toHaveBeenCalledWith(payload);
    expect(mockShowSuccess).toHaveBeenCalledWith(
      'Private link created successfully'
    );
    expect(mockShowError).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets error message from thrown Error, shows error toast, and rethrows', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const err = new Error('Invalid discount configuration');
    mockCreateService.mockRejectedValue(err);

    const { result } = renderHook(() => useCreatePartnerTicketType());

    await act(async () => {
      await expect(
        result.current.createPartnerTicketType(payload)
      ).rejects.toThrow('Invalid discount configuration');
    });

    expect(result.current.error).toBe('Invalid discount configuration');
    expect(mockShowError).toHaveBeenCalledWith(
      'Invalid discount configuration'
    );
    expect(mockShowSuccess).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('uses fallback error message when error has no message and clears error on retry', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockCreateService.mockRejectedValueOnce({});

    const { result } = renderHook(() => useCreatePartnerTicketType());

    await act(async () => {
      await expect(
        result.current.createPartnerTicketType(payload)
      ).rejects.toEqual({});
    });

    expect(result.current.error).toBe('Failed to create partner ticket type');
    expect(mockShowError).toHaveBeenCalledWith(
      'Failed to create partner ticket type'
    );
    expect(result.current.loading).toBe(false);

    mockCreateService.mockResolvedValueOnce({ status_code: 201 });

    await act(async () => {
      await result.current.createPartnerTicketType(payload);
    });

    expect(result.current.error).toBeNull();
    expect(mockShowSuccess).toHaveBeenCalledWith(
      'Private link created successfully'
    );
  });
});
