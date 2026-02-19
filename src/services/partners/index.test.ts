import { apiUtils } from '@/utils/apiUtils';

import {
  partnersService,
  CreatePartnerRequest,
  CreatePartnerResponse,
  UpdatePartnerRequest,
  UpdatePartnerResponse,
  GetPartnersFilters,
  GetPartnersResponse,
  SocialMediaLinks
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

describe('PartnersService', () => {
  const mockApiUtilsGet = apiUtils.get as jest.MockedFunction<
    typeof apiUtils.get
  >;
  const mockApiUtilsPost = apiUtils.post as jest.MockedFunction<
    typeof apiUtils.post
  >;
  const mockApiUtilsPut = apiUtils.put as jest.MockedFunction<
    typeof apiUtils.put
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPartner', () => {
    it('should successfully create partner with string social media link', async () => {
      const requestData: CreatePartnerRequest = {
        event_organizer_id: 'org-1',
        partner_name: 'Test Partner',
        social_media_link: 'https://instagram.com/testpartner',
        pic_name: 'John Doe',
        pic_phone_number: '+628123456789'
      };

      const mockResponse: CreatePartnerResponse = {
        status_code: 201,
        message: 'Partner created successfully',
        body: {
          id: 'partner-1',
          event_organizer_id: requestData.event_organizer_id,
          partner_name: requestData.partner_name,
          social_media_link: requestData.social_media_link,
          pic_name: requestData.pic_name,
          pic_phone_number: requestData.pic_phone_number,
          created_by: 'user-1',
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      };

      mockApiUtilsPost.mockResolvedValue(mockResponse);

      const result = await partnersService.createPartner(requestData);

      expect(mockApiUtilsPost).toHaveBeenCalledWith(
        '/api/partners',
        requestData,
        'Failed to create partner'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should successfully create partner with social media links object', async () => {
      const socialMediaLinks: SocialMediaLinks = {
        instagram: 'https://instagram.com/testpartner',
        tiktok: 'https://tiktok.com/@testpartner',
        twitter: 'https://twitter.com/testpartner'
      };

      const requestData: CreatePartnerRequest = {
        event_organizer_id: 'org-1',
        partner_name: 'Test Partner',
        social_media_link: socialMediaLinks,
        pic_name: 'John Doe',
        pic_phone_number: '+628123456789'
      };

      const mockResponse: CreatePartnerResponse = {
        status_code: 201,
        message: 'Partner created successfully',
        body: {
          id: 'partner-2',
          event_organizer_id: requestData.event_organizer_id,
          partner_name: requestData.partner_name,
          social_media_link: socialMediaLinks,
          pic_name: requestData.pic_name,
          pic_phone_number: requestData.pic_phone_number,
          created_by: 'user-1',
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      };

      mockApiUtilsPost.mockResolvedValue(mockResponse);

      const result = await partnersService.createPartner(requestData);

      expect(mockApiUtilsPost).toHaveBeenCalledWith(
        '/api/partners',
        requestData,
        'Failed to create partner'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle error when creating partner', async () => {
      const requestData: CreatePartnerRequest = {
        event_organizer_id: '',
        partner_name: '',
        social_media_link: '',
        pic_name: '',
        pic_phone_number: ''
      };

      const mockError = new Error('Validation error');
      mockApiUtilsPost.mockRejectedValue(mockError);

      await expect(partnersService.createPartner(requestData)).rejects.toThrow(
        'Validation error'
      );
    });
  });

  describe('getPartners', () => {
    it('should successfully fetch partners with minimal filters', async () => {
      const filters: GetPartnersFilters = {
        event_organizer_id: 'org-1'
      };

      const mockResponse: GetPartnersResponse = {
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

      const result = await partnersService.getPartners(filters);

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/partners',
        {
          event_organizer_id: 'org-1'
        },
        'Failed to fetch partners'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch partners with all filters', async () => {
      const filters: GetPartnersFilters = {
        event_organizer_id: 'org-1',
        limit: 20,
        page: 2,
        search: 'Test Partner'
      };

      const mockResponse: GetPartnersResponse = {
        status_code: 200,
        message: 'Success',
        body: {
          data: [
            {
              id: 'partner-1',
              event_organizer_id: 'org-1',
              partner_name: 'Test Partner',
              social_media_link: 'https://instagram.com/testpartner',
              pic_name: 'John Doe',
              pic_phone_number: '+628123456789',
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

      const result = await partnersService.getPartners(filters);

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/partners',
        {
          event_organizer_id: 'org-1',
          limit: '20',
          page: '2',
          search: 'Test Partner'
        },
        'Failed to fetch partners'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch partners with pagination only', async () => {
      const filters: GetPartnersFilters = {
        event_organizer_id: 'org-1',
        limit: 50,
        page: 3
      };

      const mockResponse: GetPartnersResponse = {
        status_code: 200,
        message: 'Success',
        body: {
          data: [],
          pagination: {
            page: 3,
            limit: 50,
            totalRecords: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          }
        }
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      await partnersService.getPartners(filters);

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/partners',
        {
          event_organizer_id: 'org-1',
          limit: '50',
          page: '3'
        },
        'Failed to fetch partners'
      );
    });

    it('should fetch partners with search only', async () => {
      const filters: GetPartnersFilters = {
        event_organizer_id: 'org-1',
        search: 'Partner ABC'
      };

      const mockResponse: GetPartnersResponse = {
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

      await partnersService.getPartners(filters);

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/partners',
        {
          event_organizer_id: 'org-1',
          search: 'Partner ABC'
        },
        'Failed to fetch partners'
      );
    });

    it('should handle error when fetching partners', async () => {
      const filters: GetPartnersFilters = {
        event_organizer_id: 'invalid-org-id'
      };

      const mockError = new Error('Organizer not found');
      mockApiUtilsGet.mockRejectedValue(mockError);

      await expect(partnersService.getPartners(filters)).rejects.toThrow(
        'Organizer not found'
      );
    });
  });

  describe('updatePartner', () => {
    it('should successfully update partner with string social media link', async () => {
      const updateData: UpdatePartnerRequest = {
        partner_name: 'Updated Partner Name',
        social_media_link: 'https://instagram.com/updatedpartner',
        pic_name: 'Jane Smith',
        pic_phone_number: '+628987654321'
      };

      const mockResponse: UpdatePartnerResponse = {
        status_code: 200,
        message: 'Partner updated successfully',
        body: {
          id: 'partner-1',
          event_organizer_id: 'org-1',
          partner_name: updateData.partner_name,
          social_media_link: updateData.social_media_link,
          pic_name: updateData.pic_name,
          pic_phone_number: updateData.pic_phone_number,
          created_by: 'user-1',
          created_at: '2024-01-01',
          updated_at: '2024-02-01'
        }
      };

      mockApiUtilsPut.mockResolvedValue(mockResponse);

      const result = await partnersService.updatePartner('partner-1', updateData);

      expect(mockApiUtilsPut).toHaveBeenCalledWith(
        '/api/partners/partner-1',
        updateData,
        'Failed to update partner'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should successfully update partner with social media links object', async () => {
      const socialMediaLinks: SocialMediaLinks = {
        instagram: 'https://instagram.com/updated',
        tiktok: 'https://tiktok.com/@updated'
      };

      const updateData: UpdatePartnerRequest = {
        partner_name: 'Updated Partner',
        social_media_link: socialMediaLinks,
        pic_name: 'Jane Smith',
        pic_phone_number: '+628987654321'
      };

      const mockResponse: UpdatePartnerResponse = {
        status_code: 200,
        message: 'Partner updated successfully',
        body: {
          id: 'partner-1',
          event_organizer_id: 'org-1',
          partner_name: updateData.partner_name,
          social_media_link: socialMediaLinks,
          pic_name: updateData.pic_name,
          pic_phone_number: updateData.pic_phone_number,
          created_by: 'user-1',
          created_at: '2024-01-01',
          updated_at: '2024-02-01'
        }
      };

      mockApiUtilsPut.mockResolvedValue(mockResponse);

      const result = await partnersService.updatePartner('partner-1', updateData);

      expect(mockApiUtilsPut).toHaveBeenCalledWith(
        '/api/partners/partner-1',
        updateData,
        'Failed to update partner'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should update only partner name and social media', async () => {
      const updateData: UpdatePartnerRequest = {
        partner_name: 'New Name Only',
        social_media_link: 'https://newlink.com',
        pic_name: 'Same PIC',
        pic_phone_number: '+628123456789'
      };

      const mockResponse: UpdatePartnerResponse = {
        status_code: 200,
        message: 'Partner updated successfully',
        body: {
          id: 'partner-1',
          event_organizer_id: 'org-1',
          partner_name: updateData.partner_name,
          social_media_link: updateData.social_media_link,
          pic_name: updateData.pic_name,
          pic_phone_number: updateData.pic_phone_number,
          created_by: 'user-1',
          created_at: '2024-01-01',
          updated_at: '2024-02-01'
        }
      };

      mockApiUtilsPut.mockResolvedValue(mockResponse);

      await partnersService.updatePartner('partner-1', updateData);

      expect(mockApiUtilsPut).toHaveBeenCalledWith(
        '/api/partners/partner-1',
        updateData,
        'Failed to update partner'
      );
    });

    it('should handle error when updating partner', async () => {
      const updateData: UpdatePartnerRequest = {
        partner_name: '',
        social_media_link: '',
        pic_name: '',
        pic_phone_number: ''
      };

      const mockError = new Error('Update failed');
      mockApiUtilsPut.mockRejectedValue(mockError);

      await expect(
        partnersService.updatePartner('partner-1', updateData)
      ).rejects.toThrow('Update failed');
    });

    it('should handle error when partner not found', async () => {
      const updateData: UpdatePartnerRequest = {
        partner_name: 'Valid Name',
        social_media_link: 'https://valid.com',
        pic_name: 'Valid PIC',
        pic_phone_number: '+628123456789'
      };

      const mockError = new Error('Partner not found');
      mockApiUtilsPut.mockRejectedValue(mockError);

      await expect(
        partnersService.updatePartner('invalid-id', updateData)
      ).rejects.toThrow('Partner not found');
    });
  });
});
