import axios from 'axios';

import { TicketsFilters, TicketsResponse, TicketStatus } from '@/types/ticket';
import { apiUtils } from '@/utils/apiUtils';

import { ticketsService } from './index';

// Mock apiUtils and axios
jest.mock('@/utils/apiUtils', () => ({
  apiUtils: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    handleAxiosError: jest.fn()
  }
}));

jest.mock('axios');

describe('TicketsService', () => {
  const mockApiUtilsGet = apiUtils.get as jest.MockedFunction<
    typeof apiUtils.get
  >;
  const mockApiUtilsPost = apiUtils.post as jest.MockedFunction<
    typeof apiUtils.post
  >;
  const mockApiUtilsPut = apiUtils.put as jest.MockedFunction<
    typeof apiUtils.put
  >;
  const mockApiUtilsDelete = apiUtils.delete as jest.MockedFunction<
    typeof apiUtils.delete
  >;

  // mockAxios is available but not used in these tests
  // Keeping the mock setup for potential future use
  axios as jest.Mocked<typeof axios>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTickets', () => {
    it('should successfully fetch tickets with basic filters', async () => {
      const filters: TicketsFilters = {
        eventId: 'event-1',
        page: 1,
        show: 10
      };

      const mockResponse: TicketsResponse = {
        statusCode: 200,
        message: 'Success',
        body: {
          data: [],
          pagination: {
            totalRecords: 0,
            totalPages: 0,
            page: 1,
            limit: 10,
            hasNext: false,
            hasPrev: false
          }
        }
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      const result = await ticketsService.getTickets(filters);

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        expect.stringContaining('/api/tickets?'),
        undefined,
        'Failed to fetch tickets'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch tickets with all filters including search and status', async () => {
      const filters: TicketsFilters = {
        eventId: 'event-1',
        page: 2,
        show: 20,
        search: 'John Doe',
        ticketTypeIds: 'type-1,type-2',
        ticketStatus: 'valid' as TicketStatus
      };

      const mockResponse: TicketsResponse = {
        statusCode: 200,
        message: 'Success',
        body: {
          data: [],
          pagination: {
            totalRecords: 0,
            totalPages: 0,
            page: 2,
            limit: 20,
            hasNext: false,
            hasPrev: false
          }
        }
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      await ticketsService.getTickets(filters);

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        expect.stringContaining('eventId=event-1'),
        undefined,
        'Failed to fetch tickets'
      );
    });

    it('should handle error when fetching tickets', async () => {
      const filters: TicketsFilters = {
        eventId: 'event-1'
      };

      const mockError = new Error('Network error');
      mockApiUtilsGet.mockRejectedValue(mockError);

      await expect(ticketsService.getTickets(filters)).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('Ticket Type operations', () => {
    describe('createTicketType', () => {
      it('should successfully create a ticket type', async () => {
        const mockPayload = {
          name: 'VIP Ticket',
          quantity: 100,
          description: 'VIP access',
          price: 50000,
          eventId: 'event-1',
          maxOrderQuantity: 5,
          colorHex: '#FF0000',
          salesStartDate: '2024-01-01',
          salesEndDate: '2024-12-31',
          isPublic: true,
          ticketStartDate: '2024-02-01',
          ticketEndDate: '2024-11-30'
        };

        const mockResponse = {
          statusCode: 201,
          message: 'Ticket type created',
          body: {
            id: 'ticket-type-1',
            ...mockPayload
          }
        };

        mockApiUtilsPost.mockResolvedValue(mockResponse);

        const result = await ticketsService.createTicketType(mockPayload);

        expect(mockApiUtilsPost).toHaveBeenCalledWith(
          '/api/tickets/ticket-types/create',
          mockPayload,
          'Failed to create ticket type'
        );
        expect(result).toEqual(mockResponse);
      });

      it('should handle error when creating ticket type', async () => {
        const mockPayload = {
          name: 'Invalid Ticket',
          quantity: -1
        } as any;

        const mockError = new Error('Validation error');
        mockApiUtilsPost.mockRejectedValue(mockError);

        await expect(
          ticketsService.createTicketType(mockPayload)
        ).rejects.toThrow('Validation error');
      });
    });

    describe('getTicketType', () => {
      it('should successfully fetch ticket type', async () => {
        const mockResponse = {
          statusCode: 200,
          body: {
            id: 'ticket-type-1',
            name: 'VIP Ticket'
          }
        };

        mockApiUtilsGet.mockResolvedValue(mockResponse);

        const result = await ticketsService.getTicketType('ticket-type-1');

        expect(mockApiUtilsGet).toHaveBeenCalledWith(
          '/api/tickets/ticket-types/ticket-type-1'
        );
        expect(result).toEqual(mockResponse.body);
      });

      it('should handle error when fetching ticket type', async () => {
        const mockError = new Error('Not found');
        mockApiUtilsGet.mockRejectedValue(mockError);

        await expect(
          ticketsService.getTicketType('invalid-id')
        ).rejects.toThrow('Not found');
      });
    });

    describe('updateTicketType', () => {
      it('should successfully update ticket type', async () => {
        const mockPayload = {
          name: 'Updated VIP Ticket',
          quantity: 150,
          description: 'Updated description',
          price: 60000,
          eventId: 'event-1',
          maxOrderQuantity: 10,
          colorHex: '#00FF00',
          salesStartDate: '2024-01-01',
          salesEndDate: '2024-12-31',
          isPublic: true,
          ticketStartDate: '2024-02-01',
          ticketEndDate: '2024-11-30'
        };

        mockApiUtilsPut.mockResolvedValue(undefined);

        await ticketsService.updateTicketType('ticket-type-1', mockPayload);

        expect(mockApiUtilsPut).toHaveBeenCalledWith(
          '/api/tickets/ticket-types/ticket-type-1',
          mockPayload,
          'Failed to update ticket type'
        );
      });

      it('should handle error when updating ticket type', async () => {
        const mockError = new Error('Update failed');
        mockApiUtilsPut.mockRejectedValue(mockError);

        await expect(
          ticketsService.updateTicketType('ticket-type-1', {} as any)
        ).rejects.toThrow('Update failed');
      });
    });

    describe('deleteTicketType', () => {
      it('should successfully delete ticket type', async () => {
        mockApiUtilsDelete.mockResolvedValue(undefined);

        await ticketsService.deleteTicketType('ticket-type-1');

        expect(mockApiUtilsDelete).toHaveBeenCalledWith(
          '/api/tickets/ticket-types/ticket-type-1',
          'Failed to delete ticket type'
        );
      });

      it('should handle error when deleting ticket type', async () => {
        const mockError = new Error('Delete failed');
        mockApiUtilsDelete.mockRejectedValue(mockError);

        await expect(
          ticketsService.deleteTicketType('ticket-type-1')
        ).rejects.toThrow('Delete failed');
      });
    });

    describe('approveTicketType', () => {
      it('should successfully approve ticket type', async () => {
        const mockResponse = {
          statusCode: 200,
          message: 'Ticket type approved'
        };

        mockApiUtilsPost.mockResolvedValue(mockResponse);

        const result = await ticketsService.approveTicketType('ticket-type-1');

        expect(mockApiUtilsPost).toHaveBeenCalledWith(
          '/api/tickets/ticket-types/ticket-type-1/approve',
          {},
          'Failed to approve ticket type'
        );
        expect(result).toEqual(mockResponse);
      });

      it('should handle error when approving ticket type', async () => {
        const mockError = new Error('Approval failed');
        mockApiUtilsPost.mockRejectedValue(mockError);

        await expect(
          ticketsService.approveTicketType('ticket-type-1')
        ).rejects.toThrow('Approval failed');
      });
    });

    describe('rejectTicketType', () => {
      it('should successfully reject ticket type', async () => {
        const mockPayload = {
          rejected_fields: ['price', 'quantity'],
          rejected_reason: 'Invalid pricing'
        };

        const mockResponse = {
          statusCode: 200,
          message: 'Ticket type rejected'
        };

        mockApiUtilsPost.mockResolvedValue(mockResponse);

        const result = await ticketsService.rejectTicketType(
          'ticket-type-1',
          mockPayload
        );

        expect(mockApiUtilsPost).toHaveBeenCalledWith(
          '/api/tickets/ticket-types/ticket-type-1/reject',
          mockPayload,
          'Failed to reject ticket type'
        );
        expect(result).toEqual(mockResponse);
      });

      it('should handle error when rejecting ticket type', async () => {
        const mockError = new Error('Rejection failed');
        mockApiUtilsPost.mockRejectedValue(mockError);

        await expect(
          ticketsService.rejectTicketType('ticket-type-1', {
            rejected_fields: [],
            rejected_reason: ''
          })
        ).rejects.toThrow('Rejection failed');
      });
    });
  });

  describe('redeemTicket', () => {
    it('should successfully redeem a ticket', async () => {
      const mockPayload = {
        ticketStatus: 'redeemed' as TicketStatus
      };

      const mockResponse = {
        statusCode: 200,
        message: 'Ticket redeemed successfully',
        body: {
          id: 'ticket-1',
          status: 'redeemed'
        }
      };

      mockApiUtilsPut.mockResolvedValue(mockResponse);

      const result = await ticketsService.redeemTicket('ticket-1', mockPayload);

      expect(mockApiUtilsPut).toHaveBeenCalledWith(
        '/api/tickets/ticket-1',
        mockPayload,
        'Failed to redeem ticket'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle error when redeeming ticket', async () => {
      const mockError = new Error('Redeem failed');
      mockApiUtilsPut.mockRejectedValue(mockError);

      await expect(
        ticketsService.redeemTicket('ticket-1', {
          ticketStatus: 'redeemed' as TicketStatus
        })
      ).rejects.toThrow('Redeem failed');
    });
  });

  describe('Additional Form operations', () => {
    describe('createAdditionalForm', () => {
      it('should successfully create additional form', async () => {
        const mockData = {
          ticketTypeId: 'ticket-type-1',
          field: 'Dietary Requirements',
          type: 'TEXT' as const,
          isRequired: false
        };

        const mockResponse = {
          data: {
            id: 'form-1',
            ...mockData,
            options: [],
            order: 1,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
          }
        };

        mockApiUtilsPost.mockResolvedValue(mockResponse);

        const result = await ticketsService.createAdditionalForm(mockData);

        expect(mockApiUtilsPost).toHaveBeenCalledWith(
          '/api/tickets/ticket-types/ticket-type-1/additional-forms',
          mockData
        );
        expect(result).toEqual(mockResponse.data);
      });

      it('should handle error when creating additional form', async () => {
        const mockError = new Error('Creation failed');
        mockApiUtilsPost.mockRejectedValue(mockError);

        await expect(
          ticketsService.createAdditionalForm({
            ticketTypeId: 'ticket-type-1',
            field: 'Field',
            type: 'TEXT',
            isRequired: false
          })
        ).rejects.toThrow('Creation failed');
      });
    });

    describe('updateAdditionalForm', () => {
      it('should successfully update additional form', async () => {
        const mockData = {
          ticketTypeId: 'ticket-type-1',
          field: 'Updated Field',
          type: 'DROPDOWN' as const,
          options: ['Option 1', 'Option 2'],
          isRequired: true,
          order: 2
        };

        const mockResponse = {
          data: {
            id: 'form-1',
            ...mockData
          }
        };

        mockApiUtilsPut.mockResolvedValue(mockResponse);

        const result = await ticketsService.updateAdditionalForm(
          'form-1',
          mockData
        );

        expect(mockApiUtilsPut).toHaveBeenCalledWith(
          '/api/tickets/ticket-types/additional-forms/form-1',
          mockData
        );
        expect(result).toEqual(mockResponse.data);
      });

      it('should handle error when updating additional form', async () => {
        const mockError = new Error('Update failed');
        mockApiUtilsPut.mockRejectedValue(mockError);

        await expect(
          ticketsService.updateAdditionalForm('form-1', {} as any)
        ).rejects.toThrow('Update failed');
      });
    });

    describe('deleteAdditionalForm', () => {
      it('should successfully delete additional form', async () => {
        mockApiUtilsDelete.mockResolvedValue(undefined);

        await ticketsService.deleteAdditionalForm('form-1');

        expect(mockApiUtilsDelete).toHaveBeenCalledWith(
          '/api/tickets/ticket-types/additional-forms/form-1'
        );
      });

      it('should handle error when deleting additional form', async () => {
        const mockError = new Error('Delete failed');
        mockApiUtilsDelete.mockRejectedValue(mockError);

        await expect(
          ticketsService.deleteAdditionalForm('form-1')
        ).rejects.toThrow('Delete failed');
      });
    });
  });

  describe('Group Ticket operations', () => {
    describe('createGroupTicket', () => {
      it('should successfully create group ticket', async () => {
        const mockPayload = {
          ticketTypeId: 'ticket-type-1',
          name: 'Group of 5',
          description: 'Bundle ticket',
          price: 200000,
          quantity: 20,
          bundleQuantity: 5,
          maxOrderQuantity: 2,
          salesStartDate: '2024-01-01',
          salesEndDate: '2024-12-31'
        };

        const mockResponse = {
          statusCode: 201,
          message: 'Group ticket created',
          body: {
            id: 'group-1',
            ...mockPayload
          }
        };

        mockApiUtilsPost.mockResolvedValue(mockResponse);

        const result = await ticketsService.createGroupTicket(mockPayload);

        expect(mockApiUtilsPost).toHaveBeenCalledWith(
          '/api/group-tickets',
          mockPayload,
          'Failed to create group ticket'
        );
        expect(result).toEqual(mockResponse);
      });

      it('should handle error when creating group ticket', async () => {
        const mockError = new Error('Creation failed');
        mockApiUtilsPost.mockRejectedValue(mockError);

        await expect(
          ticketsService.createGroupTicket({} as any)
        ).rejects.toThrow('Creation failed');
      });
    });

    describe('updateGroupTicket', () => {
      it('should successfully update group ticket', async () => {
        const mockPayload = {
          name: 'Updated Group',
          description: 'Updated description',
          price: 250000,
          quantity: 30,
          bundleQuantity: 6,
          maxOrderQuantity: 3,
          salesStartDate: '2024-01-01',
          salesEndDate: '2024-12-31'
        };

        const mockResponse = {
          statusCode: 200,
          message: 'Group ticket updated',
          body: {
            id: 'group-1',
            ...mockPayload
          }
        };

        mockApiUtilsPut.mockResolvedValue(mockResponse);

        const result = await ticketsService.updateGroupTicket(
          'group-1',
          mockPayload
        );

        expect(mockApiUtilsPut).toHaveBeenCalledWith(
          '/api/group-tickets/group-1',
          mockPayload,
          'Failed to update group ticket'
        );
        expect(result).toEqual(mockResponse);
      });

      it('should handle error when updating group ticket', async () => {
        const mockError = new Error('Update failed');
        mockApiUtilsPut.mockRejectedValue(mockError);

        await expect(
          ticketsService.updateGroupTicket('group-1', {} as any)
        ).rejects.toThrow('Update failed');
      });
    });

    describe('deleteGroupTicket', () => {
      it('should successfully delete group ticket', async () => {
        mockApiUtilsDelete.mockResolvedValue(undefined);

        await ticketsService.deleteGroupTicket('group-1');

        expect(mockApiUtilsDelete).toHaveBeenCalledWith(
          '/api/group-tickets/group-1',
          'Failed to delete group ticket'
        );
      });

      it('should handle error when deleting group ticket', async () => {
        const mockError = new Error('Delete failed');
        mockApiUtilsDelete.mockRejectedValue(mockError);

        await expect(
          ticketsService.deleteGroupTicket('group-1')
        ).rejects.toThrow('Delete failed');
      });
    });

    describe('getGroupTicket', () => {
      it('should successfully fetch group ticket', async () => {
        const mockResponse = {
          statusCode: 200,
          body: {
            id: 'group-1',
            name: 'Group of 5'
          }
        };

        mockApiUtilsGet.mockResolvedValue(mockResponse);

        const result = await ticketsService.getGroupTicket('group-1');

        expect(mockApiUtilsGet).toHaveBeenCalledWith(
          '/api/group-tickets/group-1',
          undefined,
          'Failed to fetch group ticket'
        );
        expect(result).toEqual(mockResponse);
      });

      it('should handle error when fetching group ticket', async () => {
        const mockError = new Error('Not found');
        mockApiUtilsGet.mockRejectedValue(mockError);

        await expect(ticketsService.getGroupTicket('group-1')).rejects.toThrow(
          'Not found'
        );
      });
    });

    describe('approveGroupTicket', () => {
      it('should successfully approve group ticket', async () => {
        const mockPayload = {
          id: 'group-1',
          status: 'approved'
        };

        const mockResponse = {
          statusCode: 200,
          message: 'Group ticket approved'
        };

        mockApiUtilsPost.mockResolvedValue(mockResponse);

        const result = await ticketsService.approveGroupTicket(mockPayload);

        expect(mockApiUtilsPost).toHaveBeenCalledWith(
          '/api/group-tickets/approval',
          mockPayload,
          'Failed to approve/reject group ticket'
        );
        expect(result).toEqual(mockResponse);
      });

      it('should successfully reject group ticket with reason', async () => {
        const mockPayload = {
          id: 'group-1',
          status: 'rejected',
          rejectedReason: 'Invalid pricing'
        };

        const mockResponse = {
          statusCode: 200,
          message: 'Group ticket rejected'
        };

        mockApiUtilsPost.mockResolvedValue(mockResponse);

        await ticketsService.approveGroupTicket(mockPayload);

        expect(mockApiUtilsPost).toHaveBeenCalledWith(
          '/api/group-tickets/approval',
          mockPayload,
          'Failed to approve/reject group ticket'
        );
      });

      it('should handle error when processing group ticket approval', async () => {
        const mockError = new Error('Approval failed');
        mockApiUtilsPost.mockRejectedValue(mockError);

        await expect(
          ticketsService.approveGroupTicket({
            id: 'group-1',
            status: 'approved'
          })
        ).rejects.toThrow('Approval failed');
      });
    });
  });
});
