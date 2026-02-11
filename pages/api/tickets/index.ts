import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

// Transform query parameters for the backend API
const transformQuery = (query: any) => {
  const {
    eventId,
    page = '0',
    show = '10',
    search,
    ticketTypeIds,
    ticketStatus
  } = query;

  // Validate required parameters
  if (!eventId || typeof eventId !== 'string') {
    throw new Error('eventId is required');
  }

  const transformedQuery: any = {
    event_id: eventId,
    page: page.toString(),
    limit: show.toString()
  };

  if (search && typeof search === 'string' && search.trim() !== '') {
    transformedQuery.search = search.trim();
  }

  if (
    ticketTypeIds &&
    typeof ticketTypeIds === 'string' &&
    ticketTypeIds.trim() !== ''
  ) {
    transformedQuery.ticketTypeIds = ticketTypeIds.split(',');
  }

  if (
    ticketStatus &&
    typeof ticketStatus === 'string' &&
    ticketStatus.trim() !== ''
  ) {
    transformedQuery.status = ticketStatus.trim();
  }

  return transformedQuery;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const getHandler = apiRouteUtils.createGetHandler({
    endpoint: '/tickets',
    transformQuery,
    timeout: 30000
  });

  return await getHandler(req, res);
}
