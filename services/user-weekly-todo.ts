import { WeeklyTodo, CreateWeeklyTodo, UpdateWeeklyTodo } from '@/types/weekly-todo';

const API_BASE_URL = '/api/weekly-todo';

export const weeklyTodoService = {
  // Get all todos with optional filters
  async getTodos(params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    weekday?: string;
  }): Promise<WeeklyTodo[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.status) queryParams.append('status', params.status);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.weekday) queryParams.append('weekday', params.weekday);

    const response = await fetch(`${API_BASE_URL}?${queryParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch todos');
    }
    
    return response.json();
  },

  // Get single todo
  async getTodo(id: string): Promise<WeeklyTodo> {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch todo');
    }
    
    return response.json();
  },

  // Create todo
  async createTodo(todo: CreateWeeklyTodo): Promise<WeeklyTodo> {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todo),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create todo');
    }
    
    return response.json();
  },

  // Update todo
  async updateTodo(id: string, todo: UpdateWeeklyTodo): Promise<WeeklyTodo> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todo),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update todo');
    }
    
    return response.json();
  },

  // Delete todo
  async deleteTodo(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete todo');
    }
  },

  // Update status only
  async updateStatus(id: string, status: 'pending' | 'completed' | 'cancelled'): Promise<WeeklyTodo> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update status');
    }
    
    return response.json();
  },
};