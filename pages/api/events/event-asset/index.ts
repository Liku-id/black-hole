import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default apiRouteUtils.createPostHandler({
  endpoint: '/event-asset',
  timeout: 30000
});
