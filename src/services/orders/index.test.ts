import { apiUtils } from '@/utils/apiUtils';

import { ordersService } from './index';

jest.mock('@/utils/apiUtils', () => ({
  apiUtils: {
    get: jest.fn(),
    post: jest.fn()
  }
}));

const mockGet = apiUtils.get as jest.Mock;
const mockPost = apiUtils.post as jest.Mock;

describe('ordersService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('createOrder posts payload and rethrows on error', async () => {
    const res = {
      statusCode: 0,
      message: 'ok',
      order: { id: 'ord-1', expiredAt: '2026-01-01T00:00:00Z' }
    };
    mockPost.mockResolvedValueOnce(res);

    await expect(
      ordersService.createOrder({ quantity: 2, ticketTypeId: 'tt-1' })
    ).resolves.toEqual(res);
    expect(mockPost).toHaveBeenCalledWith(
      '/api/order/create',
      { quantity: 2, ticketTypeId: 'tt-1' },
      'Failed to create order'
    );

    mockPost.mockRejectedValueOnce(new Error('order fail'));
    await expect(
      ordersService.createOrder({ quantity: 1, ticketTypeId: 'tt-1' })
    ).rejects.toThrow('order fail');
  });

  it('getOrder fetches order by id and rethrows on error', async () => {
    const res = { statusCode: 0, message: 'ok', order: { id: 'ord-1' } };
    mockGet.mockResolvedValueOnce(res);

    await expect(ordersService.getOrder('ord-1')).resolves.toEqual(res);
    expect(mockGet).toHaveBeenCalledWith(
      '/api/order/ord-1',
      {},
      'Failed to fetch order details'
    );

    mockGet.mockRejectedValueOnce(new Error('fetch fail'));
    await expect(ordersService.getOrder('ord-1')).rejects.toThrow('fetch fail');
  });

  it('checkoutOrder posts checkout payload and rethrows on error', async () => {
    const res = { statusCode: 0, message: 'paid' };
    mockPost.mockResolvedValueOnce(res);

    await expect(
      ordersService.checkoutOrder({ orderId: 'ord-1' })
    ).resolves.toEqual(res);
    expect(mockPost).toHaveBeenCalledWith(
      '/api/order/transaction',
      { orderId: 'ord-1' },
      'Failed to process checkout'
    );

    mockPost.mockRejectedValueOnce(new Error('checkout fail'));
    await expect(
      ordersService.checkoutOrder({ orderId: 'ord-1' })
    ).rejects.toThrow('checkout fail');
  });
});
