import {
  createMockEventOrganizer,
  createMockUser
} from '@/test-utils/factories';

import {
  ALLOWED_ROLES,
  formatRoleName,
  isEventOrganizer,
  UserRole
} from './auth';

describe('types/auth helpers', () => {
  it('formats known and unknown role names', () => {
    expect(formatRoleName('admin')).toBe('Admin');
    expect(formatRoleName('business_development')).toBe('Business Development');
    expect(formatRoleName('event_organizer_pic')).toBe('Event Organizer PIC');
    expect(formatRoleName('custom_role_name')).toBe('Custom Role Name');
  });

  it('distinguishes EventOrganizer from User with isEventOrganizer', () => {
    expect(isEventOrganizer(createMockEventOrganizer())).toBe(true);
    expect(isEventOrganizer(createMockUser())).toBe(false);
    expect(ALLOWED_ROLES).toContain(UserRole.ADMIN);
    expect(ALLOWED_ROLES).not.toContain(UserRole.BUYER);
  });
});
