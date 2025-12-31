import useSWR from 'swr';
import { staffService } from '@/services/event-organizer/staff'; // Import directly for now
import { ListStaffRequest, ListStaffResponse } from '@/types/staff';

export const useStaff = (
  eventOrganizerId: string,
  params?: ListStaffRequest
) => {
  const { data, error, isLoading, mutate } = useSWR<ListStaffResponse>(
    eventOrganizerId
      ? [`/api/event-organizers/${eventOrganizerId}/staff`, params]
      : null,
    () => staffService.getStaffList(eventOrganizerId, params)
  );

  return {
    staffList: data?.body?.staffs || [],
    pagination: {
      page: data?.body?.page || 0,
      show: data?.body?.show || 10,
      total: data?.body?.total || 0,
      totalPage: data?.body?.totalPage || 0
    },
    isLoading,
    isError: error,
    mutate
  };
};
