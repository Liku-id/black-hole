import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default apiRouteUtils.createPostHandler({
  endpoint: '/events/on-the-spot-sales/request',
  timeout: 30000
});
