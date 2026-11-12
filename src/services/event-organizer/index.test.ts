import { apiUtils } from '@/utils/apiUtils';

import { eventOrganizerService } from './index';

jest.mock('@/utils/apiUtils', () => ({
  apiUtils: {
    get: jest.fn(),
    post: jest.fn()
  }
}));

const mockGet = apiUtils.get as jest.Mock;
const mockPost = apiUtils.post as jest.Mock;

describe('eventOrganizerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getEventOrganizerMe calls GET /api/event-organizers/me', async () => {
    mockGet.mockResolvedValueOnce({ statusCode: 0, body: { id: 'eo-1' } });
    const res = await eventOrganizerService.getEventOrganizerMe();
    expect(mockGet).toHaveBeenCalledWith(
      '/api/event-organizers/me',
      {},
      'Failed to fetch event organizer'
    );
    expect(res).toEqual({ statusCode: 0, body: { id: 'eo-1' } });
  });

  it('updateEventOrganizerGeneral posts general payload', async () => {
    mockPost.mockResolvedValueOnce({ id: 'eo-1' });
    await eventOrganizerService.updateEventOrganizerGeneral('eo-1', {
      name: 'Wukong EO'
    });
    expect(mockPost).toHaveBeenCalledWith(
      '/api/event-organizers/eo-1/general',
      { name: 'Wukong EO' },
      'Failed to update general information'
    );
  });

  it('updateEventOrganizerLegal posts legal payload', async () => {
    mockPost.mockResolvedValueOnce({ id: 'eo-1' });
    await eventOrganizerService.updateEventOrganizerLegal('eo-1', {
      npwp_number: '123'
    });
    expect(mockPost).toHaveBeenCalledWith(
      '/api/event-organizers/eo-1/legal',
      { npwp_number: '123' },
      'Failed to update legal information'
    );
  });

  it('updateEventOrganizerBank posts bank payload', async () => {
    mockPost.mockResolvedValueOnce({ id: 'eo-1' });
    await eventOrganizerService.updateEventOrganizerBank('eo-1', {
      bank_id: 'b-1',
      account_number: '12345',
      account_holder_name: 'PT Wukong'
    });
    expect(mockPost).toHaveBeenCalledWith(
      '/api/event-organizers/eo-1/bank',
      {
        bank_id: 'b-1',
        account_number: '12345',
        account_holder_name: 'PT Wukong'
      },
      'Failed to update bank information'
    );
  });

  it('getBanks calls GET /api/banks', async () => {
    mockGet.mockResolvedValueOnce({ banks: [] });
    await expect(eventOrganizerService.getBanks()).resolves.toEqual({
      banks: []
    });
    expect(mockGet).toHaveBeenCalledWith(
      '/api/banks',
      {},
      'Failed to fetch banks'
    );
  });

  it('updateEventOrganizerType posts organizer type', async () => {
    mockPost.mockResolvedValueOnce({ id: 'eo-1' });
    await eventOrganizerService.updateEventOrganizerType('eo-1', {
      organizer_type: 'institutional'
    });
    expect(mockPost).toHaveBeenCalledWith(
      '/api/event-organizers/eo-1/type',
      { organizer_type: 'institutional' },
      'Failed to update organizer type'
    );
  });

  it('getEventOrganizerStatistics passes optional eventOrganizerId', async () => {
    mockGet.mockResolvedValue({ statusCode: 0, body: {} });

    await eventOrganizerService.getEventOrganizerStatistics('eo-1');
    expect(mockGet).toHaveBeenCalledWith(
      '/api/event-organizers/statistics',
      { event_organizer_id: 'eo-1' },
      'Failed to fetch event organizer statistics'
    );

    await eventOrganizerService.getEventOrganizerStatistics();
    expect(mockGet).toHaveBeenCalledWith(
      '/api/event-organizers/statistics',
      {},
      'Failed to fetch event organizer statistics'
    );
  });

  it('getAllEventOrganizers forwards optional params or defaults to empty object', async () => {
    mockGet.mockResolvedValue({ statusCode: 0, body: { eventOrganizers: [] } });

    await eventOrganizerService.getAllEventOrganizers({ page: 1, show: 10 });
    expect(mockGet).toHaveBeenCalledWith(
      '/api/organizers',
      { page: 1, show: 10 },
      'Failed to fetch event organizers'
    );

    await eventOrganizerService.getAllEventOrganizers();
    expect(mockGet).toHaveBeenCalledWith(
      '/api/organizers',
      {},
      'Failed to fetch event organizers'
    );
  });

  it('getEventOrganizerById calls GET /api/event-organizers/:id', async () => {
    mockGet.mockResolvedValueOnce({ statusCode: 0, body: { id: 'eo-2' } });
    await eventOrganizerService.getEventOrganizerById('eo-2');
    expect(mockGet).toHaveBeenCalledWith(
      '/api/event-organizers/eo-2',
      {},
      'Failed to fetch event organizer'
    );
  });
});
