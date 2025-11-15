export interface WeeklyTodo {
  id: string;
  title: string;
  details?: string;
  scheduledDate?: string;
  status: 'pending' | 'completed' | 'cancelled';
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
    division?: string;
    district?: string;
    upazila?: string;
    union?: string;
    role?: string;
    phone?: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  division?: string;
  district?: string;
  upazila?: string;
  union?: string;
  role?: string;
  phone?: string;
}

export interface AdminTodoResponse {
  todos: WeeklyTodo[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type DateRangeType = "this-week" | "last-week" | "custom";

export interface CreateWeeklyTodo {
  title: string;
  details?: string;
  scheduledDate?: string;
  status?: 'pending' | 'completed' | 'cancelled';
}

export interface UpdateWeeklyTodo {
  title?: string;
  details?: string;
  scheduledDate?: string;
  status?: 'pending' | 'completed' | 'cancelled';
}