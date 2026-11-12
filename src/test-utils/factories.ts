import { User, UserRole } from '@/types/auth';
import { Event, EventDetail, GroupTicket, TicketType } from '@/types/event';
import { EventOrganizer } from '@/types/organizer';

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-1',
  fullName: 'Test Admin',
  email: 'admin@wukong.co.id',
  phoneNumber: '081234567890',
  ktpNumber: '3171010101010001',
  dateOfBirth: '1990-01-01',
  gender: 'male',
  isVerified: true,
  isGuest: false,
  role: {
    id: 'role-1',
    name: UserRole.ADMIN
  },
  profilePicture: {
    id: 'pic-1',
    url: 'https://example.com/avatar.png'
  },
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...overrides
});

export const createMockEventOrganizer = (
  overrides: Partial<EventOrganizer> = {}
): EventOrganizer =>
  ({
    id: 'eo-1',
    name: 'Wukong Organizer',
    email: 'eo@wukong.co.id',
    phone_number: '081234567890',
    address: 'Jl. Sudirman No. 1',
    description: 'Leading event organizer',
    organizer_type: 'individual',
    social_media_url: JSON.stringify({ instagram: '@wukong' }),
    asset: { id: 'asset-1', url: 'https://example.com/logo.png' },
    ktp_photo_id: 'ktp-1',
    npwp_photo_id: 'npwp-1',
    nik: '3171010101010001',
    npwp: '123456789012345',
    ktp_address: 'Jakarta',
    pic_name: 'PIC Name',
    bank_information: {
      id: 'bank-info-1',
      accountHolderName: 'Wukong Organizer',
      accountNumber: '1234567890',
      bank: { id: 'bank-1', name: 'BCA' }
    },
    ...overrides
  }) as unknown as EventOrganizer;

export const createMockTicketType = (
  overrides: Partial<TicketType> = {}
): TicketType =>
  ({
    id: 'tt-1',
    name: 'Regular Ticket',
    price: 150000,
    quantity: 100,
    purchased_amount: 10,
    description: 'Standard entry ticket',
    max_order_quantity: 5,
    is_public: true,
    sales_start_date: '2026-01-01T00:00:00.000Z',
    sales_end_date: '2026-12-31T23:59:59.000Z',
    ticketStartDate: '2026-12-31T10:00:00.000Z',
    ...overrides
  }) as unknown as TicketType;

export const createMockGroupTicket = (
  overrides: Partial<GroupTicket> = {}
): GroupTicket =>
  ({
    id: 'gt-1',
    name: 'Group Bundle',
    price: 500000,
    quantity: 20,
    bundle_quantity: 4,
    max_order_quantity: 2,
    is_public: true,
    ticket_type_id: 'tt-1',
    sales_start_date: '2026-01-01T00:00:00.000Z',
    sales_end_date: '2026-12-31T23:59:59.000Z',
    ...overrides
  }) as unknown as GroupTicket;

export const createMockEvent = (overrides: Partial<Event> = {}): Event =>
  ({
    id: 'event-1',
    name: 'Wukong Music Fest',
    metaUrl: 'wukong-music-fest',
    status: 'approved',
    startDate: '2026-08-01T10:00:00.000Z',
    endDate: '2026-08-01T22:00:00.000Z',
    ...overrides
  }) as unknown as Event;

export const createMockEventDetail = (
  overrides: Partial<EventDetail> = {}
): EventDetail =>
  ({
    id: 'event-1',
    name: 'Wukong Music Fest',
    metaUrl: 'wukong-music-fest',
    description: 'Annual music festival',
    address: 'GBK Senayan',
    status: 'approved',
    startDate: '2026-08-01T10:00:00.000Z',
    endDate: '2026-08-01T22:00:00.000Z',
    ticketTypes: [createMockTicketType()],
    group_tickets: [],
    eventAssets: [],
    ...overrides
  }) as unknown as EventDetail;
