import {
  useEventOrganizerById,
  useEventOrganizerMe,
  useEventOrganizers,
  useUpdateEventOrganizerGeneral,
  useUpdateEventOrganizerLegal,
  useUpdateEventOrganizerType
} from './index';

describe('organizers hooks barrel exports', () => {
  it('exports all organizer hooks', () => {
    expect(useEventOrganizerMe).toBeDefined();
    expect(typeof useEventOrganizerMe).toBe('function');

    expect(useEventOrganizerById).toBeDefined();
    expect(typeof useEventOrganizerById).toBe('function');

    expect(useEventOrganizers).toBeDefined();
    expect(typeof useEventOrganizers).toBe('function');

    expect(useUpdateEventOrganizerGeneral).toBeDefined();
    expect(typeof useUpdateEventOrganizerGeneral).toBe('function');

    expect(useUpdateEventOrganizerLegal).toBeDefined();
    expect(typeof useUpdateEventOrganizerLegal).toBe('function');

    expect(useUpdateEventOrganizerType).toBeDefined();
    expect(typeof useUpdateEventOrganizerType).toBe('function');
  });
});
