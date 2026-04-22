import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default apiRouteUtils.createGetHandler({
  endpoint: '/events/on-the-spot-sales',
  timeout: 30000
});
