import { act, renderHook } from '@testing-library/react';

import { useToast } from '@/contexts/ToastContext';
import { partnersService, UpdatePartnerRequest } from '@/services/partners';

import { useUpdatePartner } from './useUpdatePartner';

jest.mock('@/contexts/ToastContext', () => ({
  useToast: jest.fn()
}));

jest.mock('@/services/partners', () => ({
  partnersService: {
    updatePartner: jest.fn()
  }
}));

const mockUseToast = useToast as jest.Mock;
const mockUpdatePartnerService = partnersService.updatePartner as jest.Mock;

describe('useUpdatePartner', () => {
  const mockShowSuccess = jest.fn();
  const mockShowError = jest.fn();

  const payload: UpdatePartnerRequest = {
    partner_name: 'Updated Partner',
    social_media_link: { instagram: '@updated' },
    pic_name: 'John Smith',
    pic_phone_number: '089876543210'
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
    const { result } = renderHook(() => useUpdatePartner());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.updatePartner).toBe('function');
  });

  it('updates partner successfully, updates loading, and shows success toast', async () => {
    let resolvePromise: (value?: unknown) => void = () => {};
    mockUpdatePartnerService.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
    );

    const { result } = renderHook(() => useUpdatePartner());

    let updatePromise: Promise<void>;
    act(() => {
      updatePromise = result.current.updatePartner('partner-1', payload);
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();

    await act(async () => {
      resolvePromise({ status_code: 200, message: 'Updated' });
      await updatePromise;
    });

    expect(mockUpdatePartnerService).toHaveBeenCalledWith('partner-1', payload);
    expect(mockShowSuccess).toHaveBeenCalledWith(
      'Partner updated successfully'
    );
    expect(mockShowError).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets error message from thrown Error, shows error toast, and rethrows', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const err = new Error('Partner not found');
    mockUpdatePartnerService.mockRejectedValue(err);

    const { result } = renderHook(() => useUpdatePartner());

    await act(async () => {
      await expect(
        result.current.updatePartner('partner-1', payload)
      ).rejects.toThrow('Partner not found');
    });

    expect(result.current.error).toBe('Partner not found');
    expect(mockShowError).toHaveBeenCalledWith('Partner not found');
    expect(mockShowSuccess).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('uses fallback error message when error has no message and clears error on retry', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockUpdatePartnerService.mockRejectedValueOnce(null);

    const { result } = renderHook(() => useUpdatePartner());

    await act(async () => {
      await expect(
        result.current.updatePartner('partner-1', payload)
      ).rejects.toBeNull();
    });

    expect(result.current.error).toBe('Failed to update partner');
    expect(mockShowError).toHaveBeenCalledWith('Failed to update partner');
    expect(result.current.loading).toBe(false);

    mockUpdatePartnerService.mockResolvedValueOnce({ status_code: 200 });

    await act(async () => {
      await result.current.updatePartner('partner-1', payload);
    });

    expect(result.current.error).toBeNull();
    expect(mockShowSuccess).toHaveBeenCalledWith(
      'Partner updated successfully'
    );
  });
});
