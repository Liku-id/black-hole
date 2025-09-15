import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default apiRouteUtils.createGetHandler({
  endpoint: '/assets',
  timeout: 30000
});
