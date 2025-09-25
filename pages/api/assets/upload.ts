import { apiRouteUtils } from '@/utils/apiRouteUtils';

// Configure API route for file uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb'
    }
  }
};

export default apiRouteUtils.createPostHandler({
  endpoint: '/upload-asset',
  timeout: 30000
});
