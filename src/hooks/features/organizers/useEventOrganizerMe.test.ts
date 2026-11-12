import { renderHook } from '@testing-library/react';

import { useApi } from '@/hooks/useApi';
import { eventOrganizerService } from '@/services/event-organizer';
import { createMockEventOrganizer } from '@/test-utils/factories';

import { useEventOrganizerMe } from './useEventOrganizerMe';

jest.mock('@/hooks/useApi', () => ({
  useApi: jest.fn()
}));

jest.mock('@/services/event-organizer', () => ({
  eventOrganizerService: {
    getEventOrganizerMe: jest.fn()
  }
}));

const mockUseApi = useApi as jest.Mock;
const mockGetEventOrganizerMe =
  eventOrganizerService.getEventOrganizerMe as jest.Mock;

describe('useEventOrganizerMe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls useApi with /api/event-organizers/me when enabled defaults to true', async () => {
    const mockMutate = jest.fn();
    const eo = createMockEventOrganizer();
    mockGetEventOrganizerMe.mockResolvedValueOnce({ statusCode: 0, body: eo });
    mockUseApi.mockReturnValue({
      data: { statusCode: 0, body: eo },
      loading: false,
      error: null,
      mutate: mockMutate
    });

    const { result } = renderHook(() => useEventOrganizerMe());

    expect(mockUseApi).toHaveBeenCalledWith(
      ['/api/event-organizers/me'],
      expect.any(Function)
    );
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.mutate).toBe(mockMutate);
    expect(result.current.data).toMatchObject({
      id: eo.id,
      isGeneralComplete: true,
      isLegalCompelete: true,
      isBankComplete: true
    });

    const fetcher = mockUseApi.mock.calls[0][1];
    await expect(fetcher()).resolves.toEqual({ statusCode: 0, body: eo });
    expect(mockGetEventOrganizerMe).toHaveBeenCalledTimes(1);
  });

  it('passes null key when enabled is false and handles empty response', () => {
    mockUseApi.mockReturnValue({
      data: undefined,
      loading: true,
      error: 'Unauthorized',
      mutate: jest.fn()
    });

    const { result } = renderHook(() => useEventOrganizerMe(false));

    expect(mockUseApi).toHaveBeenCalledWith(null, expect.any(Function));
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe('Unauthorized');
  });

  describe('completeness flags', () => {
    it('handles empty, invalid JSON, whitespace, and non-string social media fields', () => {
      const renderWithSocial = (social_media_url: string) => {
        const eo = createMockEventOrganizer({ social_media_url });
        mockUseApi.mockReturnValue({
          data: { body: eo },
          loading: false,
          error: null,
          mutate: jest.fn()
        });
        return renderHook(() => useEventOrganizerMe()).result.current.data;
      };

      expect(renderWithSocial('')?.isGeneralComplete).toBe(false);
      expect(renderWithSocial('{bad-json')?.isGeneralComplete).toBe(false);
      expect(
        renderWithSocial(JSON.stringify({ instagram: '' }))?.isGeneralComplete
      ).toBe(false);
      expect(
        renderWithSocial(JSON.stringify({ twitter: null }))?.isGeneralComplete
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

    it('marks isGeneralComplete false when any required general field is missing', () => {
      const incompleteCases: Array<
        Partial<ReturnType<typeof createMockEventOrganizer>>
      > = [
        { name: '  ' },
        { email: '' },
        { phone_number: '' },
        { address: '' },
        { asset: null },
        {
          asset: {
            id: 'a1',
            url: '  ',
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

        const { result } = renderHook(() => useEventOrganizerMe());
        expect(result.current.data?.isGeneralComplete).toBe(false);
      }
    });

    it('evaluates isLegalCompelete for individual, institutional, and other organizer types', () => {
      const incompleteIndividual = createMockEventOrganizer({
        organizer_type: 'individual',
        ktp_photo_id: ''
      });
      mockUseApi.mockReturnValue({
        data: { body: incompleteIndividual },
        loading: false,
        error: null,
        mutate: jest.fn()
      });
      expect(
        renderHook(() => useEventOrganizerMe()).result.current.data
          ?.isLegalCompelete
      ).toBe(false);

      const completeInstitutional = createMockEventOrganizer({
        organizer_type: 'institutional',
        npwp_photo_id: 'npwp-1',
        npwp: '01.234.567.8-901.000',
        npwp_address: 'Jakarta Selatan',
        full_name: 'PT Black Hole'
      });
      mockUseApi.mockReturnValue({
        data: { body: completeInstitutional },
        loading: false,
        error: null,
        mutate: jest.fn()
      });
      expect(
        renderHook(() => useEventOrganizerMe()).result.current.data
          ?.isLegalCompelete
      ).toBe(true);

      const incompleteInstitutional = createMockEventOrganizer({
        organizer_type: 'institutional',
        npwp_photo_id: 'npwp-1',
        npwp: '01.234.567.8-901.000',
        npwp_address: '',
        full_name: 'PT Black Hole'
      });
      mockUseApi.mockReturnValue({
        data: { body: incompleteInstitutional },
        loading: false,
        error: null,
        mutate: jest.fn()
      });
      expect(
        renderHook(() => useEventOrganizerMe()).result.current.data
          ?.isLegalCompelete
      ).toBe(false);

      const unknownType = createMockEventOrganizer({
        organizer_type: 'enterprise'
      });
      mockUseApi.mockReturnValue({
        data: { body: unknownType },
        loading: false,
        error: null,
        mutate: jest.fn()
      });
      expect(
        renderHook(() => useEventOrganizerMe()).result.current.data
          ?.isLegalCompelete
      ).toBe(false);
    });

    it('evaluates isBankComplete across incomplete bank configurations', () => {
      const cases: Array<Partial<ReturnType<typeof createMockEventOrganizer>>> =
        [
          { bank_information: null },
          {
            bank_information: {
              id: 'bi-1',
              bankId: 'b-1',
              accountHolderName: ' ',
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
              accountNumber: '',
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
              bank: {
                id: 'b-1',
                name: '',
                channelCode: 'BCA',
                channelType: 'VA',
                minAmount: 0,
                maxAmount: 100
              }
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

        const { result } = renderHook(() => useEventOrganizerMe());
        expect(result.current.data?.isBankComplete).toBe(false);
      }
    });
  });
});
