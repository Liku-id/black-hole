import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default apiRouteUtils.createExportHandler({
  endpoint: '/tickets/export',
  timeout: 30000
});
