import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default apiRouteUtils.createGetHandler({
  endpoint: '/event-organizers/statistics',
  timeout: 10000
});


