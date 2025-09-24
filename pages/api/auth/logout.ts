import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default apiRouteUtils.createLogoutHandler({
  endpoint: '/auth/logout',
  timeout: 30000
});
