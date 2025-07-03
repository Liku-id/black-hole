export interface User {
  id: string;
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
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  role?: Role; // Related role object
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
  user_agent: string;
  ip: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  is_verified: boolean;
}

// Mock data for development
export const MOCK_ROLES: Role[] = [
  { id: '1', name: 'admin' },
  { id: '2', name: 'partner' },
  { id: '3', name: 'buyer' }
];

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Administrator',
    email: 'admin@example.com',
    phone_number: '+1234567890',
    password: 'password123', // In real app, this would be hashed
    nik: '1234567890123456',
    role_id: '1',
    gender: 'male',
    user_agent: 'Mozilla/5.0...',
    ip: '192.168.1.1',
    is_verified: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    role: MOCK_ROLES[0]
  },
  {
    id: '2',
    name: 'Partner User',
    email: 'partner@example.com',
    phone_number: '+1234567891',
    password: 'password123',
    nik: '1234567890123457',
    role_id: '2',
    gender: 'female',
    user_agent: 'Mozilla/5.0...',
    ip: '192.168.1.2',
    is_verified: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    role: MOCK_ROLES[1]
  },
  {
    id: '3',
    name: 'Buyer User',
    email: 'buyer@example.com',
    phone_number: '+1234567892',
    password: 'password123',
    nik: '1234567890123458',
    role_id: '3',
    gender: 'male',
    user_agent: 'Mozilla/5.0...',
    ip: '192.168.1.3',
    is_verified: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    role: MOCK_ROLES[2]
  }
]; 