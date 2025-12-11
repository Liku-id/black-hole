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
export const pendingPartnerAtom = atom(null as PendingPartnerData | null);
