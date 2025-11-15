import { WeeklyTodo, AdminTodoResponse, User } from '@/types/weekly-todo';

const API_BASE_URL = '/api/weekly-todo';

export const adminWeeklyTodoService = {
  // Get all todos with users data in single API call
  async getAdminTodos(params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    userId?: string;
    weekday?: string;
  }): Promise<AdminTodoResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.status) queryParams.append('status', params.status);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.weekday) queryParams.append('weekday', params.weekday);

    try {
      const response = await fetch(`${API_BASE_URL}/admin?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Ensure fresh data
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch todos: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validate response structure
      if (!data || typeof data !== 'object' || !('todos' in data) || !('pagination' in data)) {
        throw new Error('Invalid response structure from API');
      }
      
      return data as AdminTodoResponse;
    } catch (error) {
      console.error('Admin weekly todo service error:', error);
      throw error;
    }
  },
};