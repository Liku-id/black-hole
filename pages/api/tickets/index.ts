import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

// Transform query parameters for the backend API
const transformQuery = (query: any) => {
  const { eventId, page = '0', show = '10', search, ticketTypeIds } = query;

  // Validate required parameters
  if (!eventId || typeof eventId !== 'string') {
    throw new Error('eventId is required');
  }

  const transformedQuery: any = {
    eventId,
    page: page.toString(),
    show: show.toString()
  };

  if (search && typeof search === 'string') {
    transformedQuery.search = search;
  }

  if (ticketTypeIds) {
    const typeIds = Array.isArray(ticketTypeIds)
      ? ticketTypeIds
      : [ticketTypeIds];
    typeIds.forEach((id, index) => {
      transformedQuery[`ticketTypeIds[${index}]`] = id.toString();
    });
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
