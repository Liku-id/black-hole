import { atom } from 'jotai';

export interface PendingPartnerData {
  partnerName: string;
  picName: string;
  picPhoneNumber: string;
  tiktokLink: string;
  instagramLink: string;
  twitterLink: string;
  eventOrganizerId: string;
}

// Create writable atom
const basePendingPartnerAtom = atom<PendingPartnerData | null>(null);

export const pendingPartnerAtom = atom(
  (get) => get(basePendingPartnerAtom),
  (get, set, update: PendingPartnerData | null) => {
    set(basePendingPartnerAtom, update);
  }
);
