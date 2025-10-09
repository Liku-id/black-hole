import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default apiRouteUtils.createExportHandler({
  endpoint: '/list-transactions/export',
  timeout: 30000
});
