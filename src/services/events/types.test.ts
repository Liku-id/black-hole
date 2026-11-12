import { apiUtils } from '@/utils';

import { eventTypesService } from './types';

jest.mock('@/utils', () => ({
  apiUtils: {
    get: jest.fn()
  }
}));

describe('EventTypesService', () => {
  it('fetches event types via apiUtils.get', async () => {
    const mockResponse = { statusCode: 0, message: 'ok', body: [] };
    (apiUtils.get as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await eventTypesService.getEventTypes();

    expect(apiUtils.get).toHaveBeenCalledWith('/api/event-types');
    expect(result).toEqual(mockResponse);
  });
});
