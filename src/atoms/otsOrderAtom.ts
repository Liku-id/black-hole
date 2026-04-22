import { atomWithStorage } from 'jotai/utils';

export interface ActiveOtsOrder {
  id: string;
  expiredAt: string;
}

export const activeOtsOrderAtom = atomWithStorage<ActiveOtsOrder | null>(
  'active_ots_order',
  null
);
