export enum UserRole {
  ADMIN = 'admin',
  BUSINESS_DEVELOPMENT = 'business_development',
  EVENT_ORGANIZER_PIC = 'event_organizer_pic',
  BUYER = 'buyer',
  GUEST = 'guest'
}

export const ALLOWED_ROLES = [
  UserRole.ADMIN,
  UserRole.BUSINESS_DEVELOPMENT,
  UserRole.EVENT_ORGANIZER_PIC
];

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  statusCode: number;
  message: string;
  body: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      fullName: string;
      email: string;
      role: UserRole;
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
    };
  };
}

export interface LogoutRequest {
  userId: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface ErrorResponse {
  code: number;
  message: string;
  details: string[];
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
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

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
