import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default apiRouteUtils.createPostHandler({
  endpoint: '/users/check-availability',
  timeout: 30000,
  requireAuth: false
});
