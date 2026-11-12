import { renderHook } from '@testing-library/react';

import { useApi } from '@/hooks/useApi';
import { eventOrganizerService } from '@/services/event-organizer';
import { createMockEventOrganizer } from '@/test-utils/factories';

import { useEventOrganizerById } from './useEventOrganizerById';

jest.mock('@/hooks/useApi', () => ({
  useApi: jest.fn()
}));

jest.mock('@/services/event-organizer', () => ({
  eventOrganizerService: {
    getEventOrganizerById: jest.fn()
  }
}));

const mockUseApi = useApi as jest.Mock;
const mockGetEventOrganizerById =
  eventOrganizerService.getEventOrganizerById as jest.Mock;

describe('useEventOrganizerById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('passes key when eoId is provided and enabled defaults to true', async () => {
    const mockMutate = jest.fn();
    const eo = createMockEventOrganizer({ id: 'eo-123' });
    mockGetEventOrganizerById.mockResolvedValueOnce({
      statusCode: 0,
      body: eo
    });
    mockUseApi.mockReturnValue({
      data: { statusCode: 0, body: eo },
      loading: false,
      error: null,
      mutate: mockMutate
    });

    const { result } = renderHook(() => useEventOrganizerById('eo-123'));

    expect(mockUseApi).toHaveBeenCalledWith(
      ['/api/event-organizers/eo-123'],
      expect.any(Function)
    );
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.mutate).toBe(mockMutate);
    expect(result.current.data).toMatchObject({
      id: 'eo-123',
      isGeneralComplete: true,
      isLegalCompelete: true,
      isBankComplete: true
    });

    const fetcher = mockUseApi.mock.calls[0][1];
    await expect(fetcher()).resolves.toEqual({ statusCode: 0, body: eo });
    expect(mockGetEventOrganizerById).toHaveBeenCalledWith('eo-123');
  });

  it('passes null key when eoId is null or enabled is false, and fetcher throws if eoId is missing', () => {
    mockUseApi.mockReturnValue({
      data: undefined,
      loading: false,
      error: null,
      mutate: jest.fn()
    });

    const { result: nullIdResult } = renderHook(() =>
      useEventOrganizerById(null)
    );
    expect(mockUseApi).toHaveBeenNthCalledWith(1, null, expect.any(Function));
    expect(nullIdResult.current.data).toBeNull();

    const nullFetcher = mockUseApi.mock.calls[0][1];
    expect(() => nullFetcher()).toThrow('Event organizer ID is required');
    expect(mockGetEventOrganizerById).not.toHaveBeenCalled();

    renderHook(() => useEventOrganizerById('eo-123', false));
    expect(mockUseApi).toHaveBeenNthCalledWith(2, null, expect.any(Function));
  });

  it('returns null data with loading and error states when response body is missing', () => {
    mockUseApi.mockReturnValue({
      data: undefined,
      loading: true,
      error: 'Network error',
      mutate: jest.fn()
    });

    const { result } = renderHook(() => useEventOrganizerById('eo-1'));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe('Network error');
  });

  describe('completeness flags', () => {
    it('evaluates social_media_url branches (empty, invalid JSON, tiktok, twitter, whitespace)', () => {
      const renderWithSocial = (social_media_url: string) => {
        const eo = createMockEventOrganizer({ social_media_url });
        mockUseApi.mockReturnValue({
          data: { body: eo },
          loading: false,
          error: null,
          mutate: jest.fn()
        });
        return renderHook(() => useEventOrganizerById('eo-1')).result.current
          .data;
      };

      expect(renderWithSocial('')?.isGeneralComplete).toBe(false);
      expect(renderWithSocial('invalid-json{')?.isGeneralComplete).toBe(false);
      expect(
        renderWithSocial(JSON.stringify({ instagram: '   ' }))
          ?.isGeneralComplete
      ).toBe(false);
      expect(
        renderWithSocial(JSON.stringify({ tiktok: 123 }))?.isGeneralComplete
      ).toBe(false);
      expect(
        renderWithSocial(JSON.stringify({ tiktok: '@wukong' }))
          ?.isGeneralComplete
      ).toBe(true);
      expect(
        renderWithSocial(JSON.stringify({ twitter: '@wukong' }))
          ?.isGeneralComplete
      ).toBe(true);
    });

    it('evaluates all isGeneralComplete field checks', () => {
      const incompleteCases: Array<
        Partial<ReturnType<typeof createMockEventOrganizer>>
      > = [
        { name: '' },
        { email: '   ' },
        { phone_number: '' },
        { address: '' },
        { asset: null },
        {
          asset: {
            id: 'a1',
            url: '',
            type: '',
            bucket: '',
            key: '',
            createdAt: '',
            updatedAt: ''
          }
        },
        { description: '' },
        { organizer_type: '' }
      ];

      for (const override of incompleteCases) {
        const eo = createMockEventOrganizer(override);
        mockUseApi.mockReturnValue({
          data: { body: eo },
          loading: false,
          error: null,
          mutate: jest.fn()
        });

        const { result } = renderHook(() => useEventOrganizerById('eo-1'));
        expect(result.current.data?.isGeneralComplete).toBe(false);
      }
    });

    it('evaluates isLegalCompelete for individual, institutional, and unknown organizer types', () => {
      // Individual missing field
      const incompleteIndividual = createMockEventOrganizer({
        organizer_type: 'individual',
        pic_name: ''
      });
      mockUseApi.mockReturnValue({
        data: { body: incompleteIndividual },
        loading: false,
        error: null,
        mutate: jest.fn()
      });
      expect(
        renderHook(() => useEventOrganizerById('eo-1')).result.current.data
          ?.isLegalCompelete
      ).toBe(false);

      // Institutional complete
      const completeInstitutional = createMockEventOrganizer({
        organizer_type: 'institutional',
        npwp_photo_id: 'npwp-photo-1',
        npwp: '123456',
        npwp_address: 'Jl. Gatot Subroto',
        full_name: 'PT Wukong Indonesia'
      });
      mockUseApi.mockReturnValue({
        data: { body: completeInstitutional },
        loading: false,
        error: null,
        mutate: jest.fn()
      });
      expect(
        renderHook(() => useEventOrganizerById('eo-1')).result.current.data
          ?.isLegalCompelete
      ).toBe(true);

      // Institutional incomplete
      const incompleteInstitutional = createMockEventOrganizer({
        organizer_type: 'institutional',
        npwp_photo_id: 'npwp-photo-1',
        npwp: '123456',
        npwp_address: 'Jl. Gatot Subroto',
        full_name: ''
      });
      mockUseApi.mockReturnValue({
        data: { body: incompleteInstitutional },
        loading: false,
        error: null,
        mutate: jest.fn()
      });
      expect(
        renderHook(() => useEventOrganizerById('eo-1')).result.current.data
          ?.isLegalCompelete
      ).toBe(false);

      // Unknown organizer type
      const unknownType = createMockEventOrganizer({
        organizer_type: 'unknown'
      });
      mockUseApi.mockReturnValue({
        data: { body: unknownType },
        loading: false,
        error: null,
        mutate: jest.fn()
      });
      expect(
        renderHook(() => useEventOrganizerById('eo-1')).result.current.data
          ?.isLegalCompelete
      ).toBe(false);
    });

    it('evaluates isBankComplete branches', () => {
      const cases: Array<Partial<ReturnType<typeof createMockEventOrganizer>>> =
        [
          { bank_information: null },
          {
            bank_information: {
              id: 'bi-1',
              bankId: 'b-1',
              accountHolderName: '',
              accountNumber: '123456',
              createdAt: '',
              updatedAt: '',
              deletedAt: null,
              bank: {
                id: 'b-1',
                name: 'BCA',
                channelCode: 'BCA',
                channelType: 'VA',
                minAmount: 0,
                maxAmount: 100
              }
            }
          },
          {
            bank_information: {
              id: 'bi-1',
              bankId: 'b-1',
              accountHolderName: 'Holder',
              accountNumber: '   ',
              createdAt: '',
              updatedAt: '',
              deletedAt: null,
              bank: {
                id: 'b-1',
                name: 'BCA',
                channelCode: 'BCA',
                channelType: 'VA',
                minAmount: 0,
                maxAmount: 100
              }
            }
          },
          {
            bank_information: {
              id: 'bi-1',
              bankId: 'b-1',
              accountHolderName: 'Holder',
              accountNumber: '123456',
              createdAt: '',
              updatedAt: '',
              deletedAt: null,
              bank: undefined as any
            }
          }
        ];

      for (const override of cases) {
        const eo = createMockEventOrganizer(override);
        mockUseApi.mockReturnValue({
          data: { body: eo },
          loading: false,
          error: null,
          mutate: jest.fn()
        });

        const { result } = renderHook(() => useEventOrganizerById('eo-1'));
        expect(result.current.data?.isBankComplete).toBe(false);
      }
    });
  });
});
