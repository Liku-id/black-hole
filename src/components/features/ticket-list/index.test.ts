import { AttendeeTable, SearchField } from './index';

describe('ticket-list barrel exports', () => {
  it('re-exports AttendeeTable and SearchField', () => {
    expect(AttendeeTable).toBeDefined();
    expect(SearchField).toBeDefined();
  });
});
