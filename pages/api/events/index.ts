import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default apiRouteUtils.createGetHandler({
  endpoint: '/events',
  timeout: 30000
});
