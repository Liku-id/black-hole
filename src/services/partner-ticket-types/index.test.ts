import { apiUtils } from '@/utils/apiUtils';

import {
  partnerTicketTypesService,
  CreatePartnerTicketTypeRequest,
  CreatePartnerTicketTypeResponse,
  GetPartnerTicketTypesFilters,
  GetPartnerTicketTypesResponse
} from './index';

// Mock apiUtils
jest.mock('@/utils/apiUtils', () => ({
  apiUtils: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

describe('PartnerTicketTypesService', () => {
  const mockApiUtilsGet = apiUtils.get as jest.MockedFunction<
    typeof apiUtils.get
  >;
  const mockApiUtilsPost = apiUtils.post as jest.MockedFunction<
    typeof apiUtils.post
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPartnerTicketType', () => {
    it('should successfully create partner ticket type', async () => {
      const requestData: CreatePartnerTicketTypeRequest = {
        partner_id: 'partner-1',
        ticket_type_ids: ['ticket-type-1', 'ticket-type-2'],
        discount: {
          'ticket-type-1': {
            discount: 10,
            quota: 100,
            max_order_quantity: 5
          },
          'ticket-type-2': {
            discount: 15,
            quota: 50,
            max_order_quantity: 3
          }
        },
        expired_at: '2024-12-31'
      };

      const mockResponse: CreatePartnerTicketTypeResponse = {
        status_code: 201,
        message: 'Partner ticket type created successfully',
        body: {
          id: 'partner-ticket-type-1',
          partner_id: requestData.partner_id,
          code: 'PTT-001',
          ticket_type_ids: requestData.ticket_type_ids,
          discount: requestData.discount,
          expired_at: requestData.expired_at,
          created_by: 'user-1',
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      };

      mockApiUtilsPost.mockResolvedValue(mockResponse);

      const result =
        await partnerTicketTypesService.createPartnerTicketType(requestData);

      expect(mockApiUtilsPost).toHaveBeenCalledWith(
        '/api/partner-ticket-types',
        requestData,
        'Failed to create partner ticket type'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should create partner ticket type with single ticket type', async () => {
      const requestData: CreatePartnerTicketTypeRequest = {
        partner_id: 'partner-1',
        ticket_type_ids: ['ticket-type-1'],
        discount: {
          'ticket-type-1': {
            discount: 20,
            quota: 200,
            max_order_quantity: 10
          }
        },
        expired_at: '2024-06-30'
      };

      const mockResponse: CreatePartnerTicketTypeResponse = {
        status_code: 201,
        message: 'Partner ticket type created successfully',
        body: {
          id: 'partner-ticket-type-2',
          partner_id: requestData.partner_id,
          code: 'PTT-002',
          ticket_type_ids: requestData.ticket_type_ids,
          discount: requestData.discount,
          expired_at: requestData.expired_at,
          created_by: 'user-1',
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      };

      mockApiUtilsPost.mockResolvedValue(mockResponse);

      await partnerTicketTypesService.createPartnerTicketType(requestData);

      expect(mockApiUtilsPost).toHaveBeenCalledWith(
        '/api/partner-ticket-types',
        requestData,
        'Failed to create partner ticket type'
      );
    });

    it('should handle error when creating partner ticket type', async () => {
      const requestData: CreatePartnerTicketTypeRequest = {
        partner_id: '',
        ticket_type_ids: [],
        discount: {},
        expired_at: ''
      };

      const mockError = new Error('Validation error');
      mockApiUtilsPost.mockRejectedValue(mockError);

      await expect(
        partnerTicketTypesService.createPartnerTicketType(requestData)
      ).rejects.toThrow('Validation error');
    });
  });

  describe('getPartnerTicketTypes', () => {
    it('should successfully fetch partner ticket types with minimal filters', async () => {
      const filters: GetPartnerTicketTypesFilters = {
        event_id: 'event-1'
      };

      const mockResponse: GetPartnerTicketTypesResponse = {
        status_code: 200,
        message: 'Success',
        body: {
          data: [],
          pagination: {
            page: 1,
            limit: 10,
            totalRecords: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          }
        }
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      const result =
        await partnerTicketTypesService.getPartnerTicketTypes(filters);

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/partner-ticket-types',
        {
          event_id: 'event-1'
        },
        'Failed to fetch partner ticket types'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch partner ticket types with pagination', async () => {
      const filters: GetPartnerTicketTypesFilters = {
        event_id: 'event-1',
        limit: 20,
        page: 2
      };

      const mockResponse: GetPartnerTicketTypesResponse = {
        status_code: 200,
        message: 'Success',
        body: {
          data: [
            {
              id: 'partner-ticket-type-1',
              partner_id: 'partner-1',
              code: 'PTT-001',
              ticket_type_ids: ['ticket-type-1'],
              discount: {
                'ticket-type-1': {
                  discount: 10,
                  quota: 100,
                  max_order_quantity: 5
                }
              },
              expired_at: '2024-12-31',
              created_by: 'user-1',
              created_at: '2024-01-01',
              updated_at: '2024-01-01'
            }
          ],
          pagination: {
            page: 2,
            limit: 20,
            totalRecords: 25,
            totalPages: 2,
            hasNext: false,
            hasPrev: true
          }
        }
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      const result =
        await partnerTicketTypesService.getPartnerTicketTypes(filters);

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/partner-ticket-types',
        {
          event_id: 'event-1',
          limit: '20',
          page: '2'
        },
        'Failed to fetch partner ticket types'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch partner ticket types with limit only', async () => {
      const filters: GetPartnerTicketTypesFilters = {
        event_id: 'event-1',
        limit: 50
      };

      const mockResponse: GetPartnerTicketTypesResponse = {
        status_code: 200,
        message: 'Success',
        body: {
          data: [],
          pagination: {
            page: 1,
            limit: 50,
            totalRecords: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          }
        }
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      await partnerTicketTypesService.getPartnerTicketTypes(filters);

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/partner-ticket-types',
        {
          event_id: 'event-1',
          limit: '50'
        },
        'Failed to fetch partner ticket types'
      );
    });

    it('should fetch partner ticket types with page only', async () => {
      const filters: GetPartnerTicketTypesFilters = {
        event_id: 'event-1',
        page: 3
      };

      const mockResponse: GetPartnerTicketTypesResponse = {
        status_code: 200,
        message: 'Success',
        body: {
          data: [],
          pagination: {
            page: 3,
            limit: 10,
            totalRecords: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          }
        }
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      await partnerTicketTypesService.getPartnerTicketTypes(filters);

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/partner-ticket-types',
        {
          event_id: 'event-1',
          page: '3'
        },
        'Failed to fetch partner ticket types'
      );
    });

    it('should handle error when fetching partner ticket types', async () => {
      const filters: GetPartnerTicketTypesFilters = {
        event_id: 'invalid-event-id'
      };

      const mockError = new Error('Event not found');
      mockApiUtilsGet.mockRejectedValue(mockError);

      await expect(
        partnerTicketTypesService.getPartnerTicketTypes(filters)
      ).rejects.toThrow('Event not found');
    });
  });
});
