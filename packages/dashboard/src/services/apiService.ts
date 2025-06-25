import { auth } from '../firebase';

const API_BASE_URL = 'https://us-central1-conversiontrackerpro.cloudfunctions.net/api';

class ApiService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const idToken = await user.getIdToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    };
  }

  async getConversions(siteId: string) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/conversions?siteId=${siteId}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  }

  async getEvents(siteId: string) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/events?siteId=${siteId}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  }

  async getAnalytics(siteId: string) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/analytics?siteId=${siteId}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  }

  async collectData(events: any[]) {
    // No authentication required for data collection
    const response = await fetch(`${API_BASE_URL}/collect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ events })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  }
}

export const apiService = new ApiService(); 