import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default apiRouteUtils.createPostHandler({
  endpoint: '/upload-asset',
  timeout: 30000
});
