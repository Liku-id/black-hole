import { createStore } from 'jotai';

import { selectedEOIdAtom, selectedEONameAtom } from './eventOrganizerAtom';
import { activeOtsOrderAtom } from './otsOrderAtom';
import { pendingPartnerAtom } from './pendingPartnerAtom';

describe('Jotai atoms', () => {
  it('initializes and updates eventOrganizer, otsOrder, and pendingPartner atoms', () => {
    const store = createStore();

    expect(store.get(selectedEOIdAtom)).toBe('');
    expect(store.get(selectedEONameAtom)).toBe('');
    expect(store.get(activeOtsOrderAtom)).toBeNull();
    expect(store.get(pendingPartnerAtom)).toBeNull();

    store.set(selectedEOIdAtom, 'eo-1');
    store.set(selectedEONameAtom, 'Organizer One');
    store.set(activeOtsOrderAtom, { id: 'order-1', expiredAt: '2026-12-01' });
    store.set(pendingPartnerAtom, {
      partnerName: 'Partner A',
      picName: 'PIC',
      picPhoneNumber: '0812',
      tiktokLink: '',
      instagramLink: '',
      twitterLink: '',
      eventOrganizerId: 'eo-1'
    });

    expect(store.get(selectedEOIdAtom)).toBe('eo-1');
    expect(store.get(selectedEONameAtom)).toBe('Organizer One');
    expect(store.get(activeOtsOrderAtom)).toEqual({
      id: 'order-1',
      expiredAt: '2026-12-01'
    });
    expect(store.get(pendingPartnerAtom)?.partnerName).toBe('Partner A');
  });
});
