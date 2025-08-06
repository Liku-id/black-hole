import { CitiesResponse } from '@/types/city';

class CityService {
  async getCities(): Promise<CitiesResponse> {
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('auth_access_token');

      const response = await fetch(`/api/cities`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        let errorMessage = 'Failed to fetch cities';

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
      console.error('Error fetching cities:', error);
      throw error;
    }
  }
}

export default new CityService();
