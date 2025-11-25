import { apiUtils } from '@/utils/apiUtils';

export interface SocialMediaLinks {
  tiktok?: string;
  instagram?: string;
  twitter?: string;
}

export interface CreatePartnerRequest {
  event_organizer_id: string;
  partner_name: string;
  social_media_link: string | SocialMediaLinks;
  pic_name: string;
  pic_phone_number: string;
}

export interface Partner {
  id: string;
  event_organizer_id: string;
  partner_name: string;
  social_media_link: string | SocialMediaLinks;
  pic_name: string;
  pic_phone_number: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator?: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    ktpNumber: string;
    dateOfBirth: string;
    gender: string;
    isVerified: boolean;
    isGuest: boolean;
    role: {
      id: string;
      name: string;
    };
    profilePicture: {
      id: string;
      url: string;
    };
    createdAt: string;
    updatedAt: string;
  };
}

export interface CreatePartnerResponse {
  status_code: number;
  message: string;
  body: Partner;
}

export interface UpdatePartnerRequest {
  partner_name: string;
  social_media_link: string | SocialMediaLinks;
  pic_name: string;
  pic_phone_number: string;
}

export interface UpdatePartnerResponse {
  status_code: number;
  message: string;
  body: Partner;
}

export interface GetPartnersFilters {
  limit?: number;
  page?: number;
  search?: string;
  event_organizer_id: string;
}

export interface GetPartnersResponse {
  status_code: number;
  message: string;
  body: {
    data: Partner[];
    pagination: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

class PartnersService {
  async createPartner(
    data: CreatePartnerRequest
  ): Promise<CreatePartnerResponse> {
    try {
      return await apiUtils.post<CreatePartnerResponse>(
        '/api/partners',
        data,
        'Failed to create partner'
      );
    } catch (error) {
      console.error('Error creating partner:', error);
      throw error;
    }
  }

  async getPartners(filters: GetPartnersFilters): Promise<GetPartnersResponse> {
    try {
      const params: Record<string, any> = {
        event_organizer_id: filters.event_organizer_id
      };

      if (filters.limit !== undefined) {
        params.limit = filters.limit.toString();
      }
      if (filters.page !== undefined) {
        params.page = filters.page.toString();
      }
      if (filters.search) {
        params.search = filters.search;
      }

      return await apiUtils.get<GetPartnersResponse>(
        '/api/partners',
        params,
        'Failed to fetch partners'
      );
    } catch (error) {
      console.error('Error fetching partners:', error);
      throw error;
    }
  }

  async updatePartner(
    id: string,
    data: UpdatePartnerRequest
  ): Promise<UpdatePartnerResponse> {
    try {
      return await apiUtils.put<UpdatePartnerResponse>(
        `/api/partners/${id}`,
        data,
        'Failed to update partner'
      );
    } catch (error) {
      console.error('Error updating partner:', error);
      throw error;
    }
  }
}

const partnersService = new PartnersService();

export { partnersService };
