import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default apiRouteUtils.createGetHandler({
  endpoint: '/export-transactions',
  timeout: 30000, // Longer timeout for export operations
  transformQuery: (query) => {
    // Transform query parameters to match backend expectations
    const transformedQuery: any = {};
    
    if (query.from_date) {
      transformedQuery.from_date = query.from_date;
    }
    if (query.to_date) {
      transformedQuery.to_date = query.to_date;
    }
    if (query.payment_status) {
      transformedQuery.payment_status = query.payment_status;
    }
    if (query.event_id) {
      transformedQuery.event_id = query.event_id;
    }
    
    return transformedQuery;
  }
});
