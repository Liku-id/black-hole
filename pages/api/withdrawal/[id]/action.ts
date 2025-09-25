import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default apiRouteUtils.createPutHandler({
  endpoint: '/withdrawal/{id}/action',
  requireAuth: true
});
