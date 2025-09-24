import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default apiRouteUtils.createPostHandler({
  endpoint: '/auth/otp/verification',
  timeout: 30000,
  requireAuth: false
});
