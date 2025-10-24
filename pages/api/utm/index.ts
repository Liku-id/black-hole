import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default apiRouteUtils.createPostHandler({
  endpoint: '/utm',
  timeout: 30000,
  requireAuth: false
});
