import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default apiRouteUtils.createRefreshTokenHandler({
  endpoint: '/auth/refresh-token',
  timeout: 30000
});