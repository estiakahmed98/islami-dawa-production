'use client';

import { useState } from 'react';
import { WeeklyTodo } from '@/types/weekly-todo';
import { weeklyTodoService } from "@/services/user-weekly-todo";

interface TodoCardProps {
  todo: WeeklyTodo;
  onTodoUpdated: () => void;
  onTodoDeleted: () => void;
  onEdit: (todo: WeeklyTodo) => void;
}

export default function TodoCard({ todo, onTodoUpdated, onTodoDeleted, onEdit }: TodoCardProps) {
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleStatusChange = async (newStatus: 'pending' | 'completed' | 'cancelled') => {
    setLoading(true);
    try {
      await weeklyTodoService.updateStatus(todo.id, newStatus);
      onTodoUpdated();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await weeklyTodoService.deleteTodo(todo.id);
      onTodoDeleted();
    } catch (error) {
      console.error('Failed to delete todo:', error);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-2">{todo.title}</h3>
        <div className="flex space-x-2">
          <select
            value={todo.status}
            onChange={(e) => handleStatusChange(e.target.value as 'pending' | 'completed' | 'cancelled')}
            disabled={loading}
            className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${getStatusColor(todo.status)} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {todo.details && (
        <p className="text-gray-600 mb-4 text-sm">{todo.details}</p>
      )}

      <div className="flex justify-between items-center text-sm text-gray-500">
        <div>
          <span className="font-medium">Scheduled:</span>{' '}
          {formatDate(todo.scheduledDate)}
        </div>
        
        {todo.completedAt && (
          <div>
            <span className="font-medium">Completed:</span>{' '}
            {new Date(todo.completedAt).toLocaleDateString()}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-400">
          Created: {new Date(todo.createdAt).toLocaleDateString()}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(todo)}
            disabled={loading}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
          >
            Edit
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={loading}
            className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this todo? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}