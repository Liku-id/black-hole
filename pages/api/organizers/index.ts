import {
  EventOrganizer,
  EventOrganizersResponse,
  ListEventOrganizersResponse
} from '@/types/organizer';
import { apiRouteUtils } from '@/utils/apiRouteUtils';
import { stringUtils } from '@/utils/stringUtils';

/**
 * Only returns fields necessary for UI display (principle of least privilege)
 * Returns only: id, name, pic_name, email (masked on server-side)
 */
const filterOrganizer = (organizer: EventOrganizer): Partial<EventOrganizer> => {
  return {
    id: organizer.id,
    name: organizer.name,
    email: stringUtils.mask(organizer.email),
    pic_name: organizer.pic_name || null
  };
};

/**
 * Transform response to filter data before sending to client
 */
const transformResponse = (
  data: EventOrganizersResponse | ListEventOrganizersResponse
): EventOrganizersResponse | ListEventOrganizersResponse => {
  if ('statusCode' in data && 'body' in data && 'total' in data.body) {
    const listResponse = data as ListEventOrganizersResponse;
    return {
      ...listResponse,
      body: {
        ...listResponse.body,
        eventOrganizers: listResponse.body.eventOrganizers.map(
          filterOrganizer
        ) as EventOrganizer[]
      }
    };
  }
  return {
    ...data,
    body: {
      ...(data as EventOrganizersResponse).body,
      eventOrganizers: (data as EventOrganizersResponse).body.eventOrganizers.map(
        filterOrganizer
      ) as EventOrganizer[]
    }
  };
};

export default apiRouteUtils.createGetHandler({
  endpoint: '/event-organizers',
  timeout: 10000,
  transformResponse
});
