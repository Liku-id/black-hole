export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  ktpNumber: string;
  dateOfBirth: string;
  gender: string;
  roleId: string;
  isVerified: boolean;
  profilePictureId: string;
  createdAt: string;
  updatedAt: string;
  isGuest: boolean;
}

export interface Role {
  id: string;
  name: 'admin' | 'partner' | 'buyer';
}

export interface Session {
  id: string;
  user_id: string;
  user_agent: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// API Response interfaces
export interface LoginResponse {
  statusCode: number;
  message: string;
  body: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  detail?: any;
}

// User creation/update DTOs
export interface CreateUserDto {
  name: string;
  email: string;
  phone_number: string;
  password: string;
  profile_picture_id?: string;
  nik: string;
  role_id: string;
  gender: 'male' | 'female';
  user_agent: string;
  ip: string;
  is_verified?: boolean;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  phone_number?: string;
  password?: string;
  profile_picture_id?: string;
  nik?: string;
  role_id?: string;
  gender?: 'male' | 'female';
  user_agent?: string;
  ip?: string;
  is_verified?: boolean;
}

// Authentication DTOs
export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  ktpNumber: string;
  dateOfBirth: string;
  gender: string;
  roleId: string;
  isVerified: boolean;
  profilePictureId: string;
  createdAt: string;
  updatedAt: string;
  isGuest: boolean;
  accessToken?: string;
  refreshToken?: string;
}

// Mock data for development
export const MOCK_ROLES: Role[] = [
  { id: 'admin', name: 'admin' },
  { id: 'partner', name: 'partner' },
  { id: 'buyer', name: 'buyer' }
];

export const MOCK_USERS: User[] = [
  {
    id: '1',
    fullName: 'Administrator',
    email: 'admin@example.com',
    phoneNumber: '+1234567890',
    ktpNumber: '1234567890123456',
    dateOfBirth: '1990-01-01',
    gender: 'male',
    roleId: 'admin',
    isVerified: true,
    profilePictureId: '',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isGuest: false
  },
  {
    id: '2',
    fullName: 'Partner User',
    email: 'partner@example.com',
    phoneNumber: '+1234567891',
    ktpNumber: '1234567890123457',
    dateOfBirth: '1990-01-01',
    gender: 'female',
    roleId: 'partner',
    isVerified: true,
    profilePictureId: '',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isGuest: false
  },
  {
    id: '3',
    fullName: 'Buyer User',
    email: 'buyer@example.com',
    phoneNumber: '+1234567892',
    ktpNumber: '1234567890123458',
    dateOfBirth: '1990-01-01',
    gender: 'male',
    roleId: 'buyer',
    isVerified: true,
    profilePictureId: '',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isGuest: false
  }
]; 