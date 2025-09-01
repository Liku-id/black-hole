import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default apiRouteUtils.createGetHandler({
  endpoint: '/events',
  timeout: 10000,
  transformQuery: (query) => ({
    show: query.show,
    page: query.page,
    cityId: query.cityId,
    name: query.name,
    startDate: query.startDate,
    endDate: query.endDate
  })
});
