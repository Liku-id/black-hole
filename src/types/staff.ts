export interface Staff {
  id?: string;
  user_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  role_id?: string;
  role_name?: string;
  status: string;
  profile_picture_url?: string;
  last_login?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ListStaffRequest {
  page?: number;
  limit?: number;
  search?: string;
  name?: string;
}

export interface ListStaffResponse {
  status_code: number;
  message: string;
  body: {
    staff: Staff[];
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

export interface CreateStaffRequest {
  event_organizer_id: string;
  full_name: string;
  email: string;
  role: string;
}

export interface CreateStaffResponse {
  status_code: number;
  message: string;
  body: {
    id: string;
    full_name: string;
    email: string;
    phone_number: string;
    role_id: string;
    role_name: string;
    event_organizer_id: string;
    created_at: string;
  };
}

export interface DeleteStaffRequest {
  user_id: string;
  reason?: string;
}

export interface DeleteStaffResponse {
  status_code: number;
  message: string;
}
