import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default apiRouteUtils.createGetHandler({
  endpoint: '/payment-method',
  timeout: 10000
});
