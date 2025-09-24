import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default apiRouteUtils.createLoginHandler({
  endpoint: '/auth/login',
  timeout: 30000
});
