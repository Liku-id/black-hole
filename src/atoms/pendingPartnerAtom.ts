import { atom, PrimitiveAtom } from 'jotai';

export interface PendingPartnerData {
  partnerName: string;
  picName: string;
  picPhoneNumber: string;
  tiktokLink: string;
  instagramLink: string;
  twitterLink: string;
  eventOrganizerId: string;
}

// Create writable atom using PrimitiveAtom with type assertion
export const pendingPartnerAtom = atom<PendingPartnerData | null>(
  null
) as PrimitiveAtom<PendingPartnerData | null>;
