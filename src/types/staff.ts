export interface Staff {
  id: string;
  user_id: string;
  event_organizer_id: string;
  name: string;
  email: string;
  role: string;
  phone_number: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListStaffRequest {
  page?: number;
  show?: number;
  search?: string;
  name?: string;
}

export interface ListStaffResponseBody {
  staffs: Staff[];
  show: number;
  page: number;
  total: number;
  totalPage: number;
}

export interface ListStaffResponse {
  statusCode: number;
  message: string;
  body: ListStaffResponseBody;
}
