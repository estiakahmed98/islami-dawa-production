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
}

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

export type TodoStatus = 'pending' | 'completed' | 'cancelled';
export type DateRangeType = 'this-week' | 'last-week' | 'custom';