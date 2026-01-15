import useSWR from 'swr';

import { staffService } from '@/services/staff'; // Updated import path
import { ListStaffRequest, ListStaffResponse } from '@/types/staff';

export const useStaff = (
  eventOrganizerId: string,
  params?: ListStaffRequest
) => {
  const { data, error, isLoading, mutate } = useSWR<ListStaffResponse>(
    eventOrganizerId
      ? [`/api/event-organizers/staff/${eventOrganizerId}`, params]
      : null,
    () => staffService.getStaffList(eventOrganizerId, params)
  );

  return {
    staffList: data?.body?.staff || [],
    pagination: {
      page: data?.body?.pagination?.page || 0,
      show: data?.body?.pagination?.limit || 10,
      total: data?.body?.pagination?.totalRecords || 0,
      totalPage: data?.body?.pagination?.totalPages || 0
    },
    isLoading,
    isError: error,
    mutate
  };
};
