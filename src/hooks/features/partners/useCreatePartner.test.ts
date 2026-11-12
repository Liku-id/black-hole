import { act, renderHook } from '@testing-library/react';

import { useToast } from '@/contexts/ToastContext';
import { CreatePartnerRequest, partnersService } from '@/services/partners';

import { useCreatePartner } from './useCreatePartner';

jest.mock('@/contexts/ToastContext', () => ({
  useToast: jest.fn()
}));

jest.mock('@/services/partners', () => ({
  partnersService: {
    createPartner: jest.fn()
  }
}));

const mockUseToast = useToast as jest.Mock;
const mockCreatePartnerService = partnersService.createPartner as jest.Mock;

describe('useCreatePartner', () => {
  const mockShowSuccess = jest.fn();
  const mockShowError = jest.fn();

  const payload: CreatePartnerRequest = {
    event_organizer_id: 'eo-1',
    partner_name: 'Acme Partner',
    social_media_link: 'https://instagram.com/acme',
    pic_name: 'Jane Doe',
    pic_phone_number: '081234567890'
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
    const { result } = renderHook(() => useCreatePartner());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.createPartner).toBe('function');
  });

  it('creates partner successfully, updates loading, and shows success toast', async () => {
    let resolvePromise: (value?: unknown) => void = () => {};
    mockCreatePartnerService.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
    );

    const { result } = renderHook(() => useCreatePartner());

    let createPromise: Promise<void>;
    act(() => {
      createPromise = result.current.createPartner(payload);
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();

    await act(async () => {
      resolvePromise({ status_code: 201, message: 'Created' });
      await createPromise;
    });

    expect(mockCreatePartnerService).toHaveBeenCalledWith(payload);
    expect(mockShowSuccess).toHaveBeenCalledWith(
      'Partner created successfully'
    );
    expect(mockShowError).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets error message from thrown Error, shows error toast, and rethrows', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const err = new Error('Partner already exists');
    mockCreatePartnerService.mockRejectedValue(err);

    const { result } = renderHook(() => useCreatePartner());

    await act(async () => {
      await expect(result.current.createPartner(payload)).rejects.toThrow(
        'Partner already exists'
      );
    });

    expect(result.current.error).toBe('Partner already exists');
    expect(mockShowError).toHaveBeenCalledWith('Partner already exists');
    expect(mockShowSuccess).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('uses fallback error message when error has no message and clears error on retry', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockCreatePartnerService.mockRejectedValueOnce({});

    const { result } = renderHook(() => useCreatePartner());

    await act(async () => {
      await expect(result.current.createPartner(payload)).rejects.toEqual({});
    });

    expect(result.current.error).toBe('Failed to create partner');
    expect(mockShowError).toHaveBeenCalledWith('Failed to create partner');
    expect(result.current.loading).toBe(false);

    mockCreatePartnerService.mockResolvedValueOnce({ status_code: 201 });

    await act(async () => {
      await result.current.createPartner(payload);
    });

    expect(result.current.error).toBeNull();
    expect(mockShowSuccess).toHaveBeenCalledWith(
      'Partner created successfully'
    );
  });
});
