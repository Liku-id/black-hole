import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default apiRouteUtils.createPostHandler({
  endpoint: '/events/on-the-spot-sales/status',
  timeout: 30000
});
