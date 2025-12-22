import {
  EventSubmissionsFilters,
  EventSubmissionsResponse
} from '@/types/events-submission';
import { apiUtils } from '@/utils/apiUtils';

// Event Submissions Service
class EventSubmissionsService {
  async getEventSubmissions(
    filters?: EventSubmissionsFilters
  ): Promise<EventSubmissionsResponse> {
    try {
      const params: Record<string, any> = {};

      if (filters?.show) params.show = filters.show.toString();
      if (filters?.page) params.page = filters.page.toString();
      if (filters?.search) params.search = filters.search;
      if (filters?.type) params.type = filters.type;

      return await apiUtils.get(
        '/api/events-submissions',
        params,
        'Failed to fetch event submissions'
      );
    } catch (error) {
      console.error('Error fetching event submissions:', error);
      throw error;
    }
  }

  async getEventSubmissionDetail(id: string): Promise<any> {
    try {
      return await apiUtils.get(
        `/api/events-submissions/${id}`,
        {},
        'Failed to fetch event submission detail'
      );
    } catch (error) {
      console.error('Error fetching event submission detail:', error);
      throw error;
    }
  }

  async approveOrRejectSubmission(
    eventId: string,
    payload: {
      rejectedFields: string[];
      rejectedReason: string;
      status: 'approved' | 'rejected';
    }
  ): Promise<any> {
    try {
      return await apiUtils.post(
        `/api/events-submissions/${eventId}/approval`,
        payload,
        'Failed to submit approval decision'
      );
    } catch (error) {
      console.error('Error submitting approval decision:', error);
      throw error;
    }
  }

  async approveOrRejectEvent(
    submissionId: string,
    status: 'approved' | 'rejected'
  ): Promise<any> {
    try {
      return await apiUtils.post(
        `/api/events-submissions/${submissionId}/approval`,
        { status },
        'Failed to submit approval decision'
      );
    } catch (error) {
      console.error('Error submitting approval decision:', error);
      throw error;
    }
  }
}

const eventSubmissionsService = new EventSubmissionsService();

export { eventSubmissionsService };
