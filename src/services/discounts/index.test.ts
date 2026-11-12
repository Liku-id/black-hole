import { apiUtils } from '@/utils/apiUtils';

import { discountsService } from './index';

jest.mock('@/utils/apiUtils', () => ({
  apiUtils: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

const mockGet = apiUtils.get as jest.Mock;
const mockPost = apiUtils.post as jest.Mock;
const mockPut = apiUtils.put as jest.Mock;
const mockDelete = apiUtils.delete as jest.Mock;

describe('discountsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('getDiscountsByEvent fetches event discounts and rethrows errors', async () => {
    const res = { statusCode: 0, body: { discounts: [] } };
    mockGet.mockResolvedValueOnce(res);

    await expect(discountsService.getDiscountsByEvent('ev-1')).resolves.toEqual(
      res
    );
    expect(mockGet).toHaveBeenCalledWith(
      '/api/events/ev-1/discounts',
      undefined,
      'Failed to fetch discounts by event'
    );

    mockGet.mockRejectedValueOnce(new Error('fail'));
    await expect(discountsService.getDiscountsByEvent('ev-1')).rejects.toThrow(
      'fail'
    );
  });

  it('getDiscountDetail fetches detail and rethrows errors', async () => {
    const res = { statusCode: 0, body: { id: 'd-1' } };
    mockGet.mockResolvedValueOnce(res);

    await expect(discountsService.getDiscountDetail('d-1')).resolves.toEqual(
      res
    );
    expect(mockGet).toHaveBeenCalledWith(
      '/api/discounts/d-1',
      undefined,
      'Failed to fetch discount details'
    );

    mockGet.mockRejectedValueOnce(new Error('fail'));
    await expect(discountsService.getDiscountDetail('d-1')).rejects.toThrow(
      'fail'
    );
  });

  it('createDiscount posts discount payload and rethrows errors', async () => {
    const payload = {
      ticket_type_id: 'tt-1',
      name: 'Early Bird',
      value: 10000,
      start_date: '2026-01-01',
      end_date: '2026-01-02'
    };
    const res = { statusCode: 0, body: { id: 'd-1', ...payload } };
    mockPost.mockResolvedValueOnce(res);

    await expect(discountsService.createDiscount(payload)).resolves.toEqual(
      res
    );
    expect(mockPost).toHaveBeenCalledWith(
      '/api/discounts',
      payload,
      'Failed to create discount'
    );

    mockPost.mockRejectedValueOnce(new Error('create fail'));
    await expect(discountsService.createDiscount(payload)).rejects.toThrow(
      'create fail'
    );
  });

  it('updateDiscount puts update payload and rethrows errors', async () => {
    const payload = {
      ticket_type_id: 'tt-1',
      name: 'Updated',
      value: 20000,
      start_date: '2026-01-01',
      end_date: '2026-01-05'
    };
    mockPut.mockResolvedValueOnce({ statusCode: 0, body: payload });

    await discountsService.updateDiscount('d-1', payload);
    expect(mockPut).toHaveBeenCalledWith(
      '/api/discounts/d-1',
      payload,
      'Failed to update discount'
    );

    mockPut.mockRejectedValueOnce(new Error('put fail'));
    await expect(
      discountsService.updateDiscount('d-1', payload)
    ).rejects.toThrow('put fail');
  });

  it('deleteDiscount calls delete endpoint and rethrows errors', async () => {
    mockDelete.mockResolvedValueOnce(undefined);
    await expect(
      discountsService.deleteDiscount('d-1')
    ).resolves.toBeUndefined();
    expect(mockDelete).toHaveBeenCalledWith(
      '/api/discounts/d-1',
      'Failed to delete discount'
    );

    mockDelete.mockRejectedValueOnce(new Error('del fail'));
    await expect(discountsService.deleteDiscount('d-1')).rejects.toThrow(
      'del fail'
    );
  });

  it('approveRejectDiscount posts approval payload with id and rethrows errors', async () => {
    mockPost.mockResolvedValueOnce({ statusCode: 0, body: { id: 'd-1' } });
    await discountsService.approveRejectDiscount('d-1', {
      status: 'rejected',
      rejected_reason: 'invalid'
    });
    expect(mockPost).toHaveBeenCalledWith(
      '/api/discounts/d-1/approval',
      { status: 'rejected', rejected_reason: 'invalid', id: 'd-1' },
      'Failed to approve/reject discount'
    );

    mockPost.mockRejectedValueOnce(new Error('approval fail'));
    await expect(
      discountsService.approveRejectDiscount('d-1', { status: 'approved' })
    ).rejects.toThrow('approval fail');
  });
});
