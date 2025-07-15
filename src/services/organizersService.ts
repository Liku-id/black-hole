import { EventOrganizersResponse } from '@/types/organizer';

class OrganizersService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  async getEventOrganizers(): Promise<EventOrganizersResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/organizers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = 'Failed to fetch event organizers';
        
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else {
            errorMessage = `Server error (${response.status})`;
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorMessage = `Server error (${response.status})`;
        }
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      return responseData;
      
    } catch (error) {
      console.error('Error fetching event organizers:', error);
      throw error;
    }
  }
}

export default new OrganizersService();
