import { eventOrganizerService } from '@/services/event-organizer';
import { EventOrganizer } from '@/types/organizer';

import { useApi } from '../../useApi';

interface EOType extends EventOrganizer {
  isBankComplete: boolean;
  isLegalCompelete: boolean;
  isGeneralComplete: boolean;
}

interface UseEventOrganizerByIdReturn {
  data: EOType | null;
  loading: boolean;
  error: string | null;
  mutate: () => void;
}

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === 'string' && v.trim() !== '';

const useEventOrganizerById = (
  eoId: string | null,
  enabled: boolean = true
): UseEventOrganizerByIdReturn => {
  const { data, loading, error, mutate } = useApi(
    enabled && eoId ? [`/api/event-organizers/${eoId}`] : null,
    () => {
      if (!eoId) {
        throw new Error('Event organizer ID is required');
      }
      return eventOrganizerService.getEventOrganizerById(eoId);
    }
  );

  const temp = data?.body as EventOrganizer | undefined;

  let parsedSocial: Record<string, unknown> = {};
  try {
    parsedSocial = temp?.social_media_url
      ? JSON.parse(temp.social_media_url)
      : {};
  } catch {
    parsedSocial = {};
  }

  const keysToCheck = ['tiktok', 'instagram', 'twitter'] as const;
  const hasAtLeastOneSocial = keysToCheck.some((key) =>
    isNonEmptyString(parsedSocial[key])
  );

  const isGeneralComplete = Boolean(
    temp &&
      isNonEmptyString(temp.name) &&
      isNonEmptyString(temp.email) &&
      isNonEmptyString(temp.phone_number) &&
      isNonEmptyString(temp.address) &&
      isNonEmptyString(temp?.asset?.url) &&
      hasAtLeastOneSocial &&
      isNonEmptyString(temp.description) &&
      isNonEmptyString(temp.organizer_type)
  );

  const isLegalCompelete = Boolean(
    temp &&
      (temp.organizer_type === 'individual'
        ? (
            [
              'ktp_photo_id',
              'npwp_photo_id',
              'nik',
              'npwp',
              'ktp_address',
              'pic_name'
            ] as const
          ).every((field) => isNonEmptyString((temp as any)[field]))
        : temp.organizer_type === 'institutional'
          ? (
              ['npwp_photo_id', 'npwp', 'npwp_address', 'full_name'] as const
            ).every((field) => isNonEmptyString((temp as any)[field]))
          : false)
  );

  const isBankComplete = Boolean(
    temp &&
      temp.bank_information &&
      isNonEmptyString(temp.bank_information.accountHolderName) &&
      isNonEmptyString(temp.bank_information.accountNumber) &&
      isNonEmptyString(temp.bank_information?.bank?.name)
  );

  const eoData: EOType | null = temp
    ? {
        ...temp,
        isBankComplete,
        isLegalCompelete,
        isGeneralComplete
      }
    : null;

  return {
    data: eoData,
    loading,
    error,
    mutate
  };
};

export { useEventOrganizerById };

