import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default apiRouteUtils.createPostHandler({
  endpoint: '/auth/password/change',
  timeout: 30000,
  requireAuth: false
});

