import { useApi } from '@/hooks/useApi';
import {
  eventOrganizerService,
  BanksResponse
} from '@/services/event-organizer';

export const useBanks = () => {
  return useApi<BanksResponse>(['banks'], () =>
    eventOrganizerService.getBanks()
  );
};
