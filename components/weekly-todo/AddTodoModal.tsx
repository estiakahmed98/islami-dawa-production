"use client";

import { useState, useEffect } from "react";
import {
  CreateWeeklyTodo,
  WeeklyTodo,
  UpdateWeeklyTodo,
} from "@/types/weekly-todo";
import { weeklyTodoService } from "@/services/user-weekly-todo";
import JoditEditorComponent from "@/components/richTextEditor";

interface AddTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTodoAdded: () => void;
  editingTodo?: WeeklyTodo | null;
}

export default function AddTodoModal({
  isOpen,
  onClose,
  onTodoAdded,
  editingTodo,
}: AddTodoModalProps) {
  const [formData, setFormData] = useState<CreateWeeklyTodo>({
    title: "",
    details: "",
    scheduledDate: "",
    status: "pending",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isEditing = !!editingTodo;

  useEffect(() => {
    if (editingTodo) {
      setFormData({
        title: editingTodo.title,
        details: editingTodo.details || "",
        scheduledDate: editingTodo.scheduledDate 
          ? new Date(editingTodo.scheduledDate).toISOString().split('T')[0]
          : "",
        status: editingTodo.status,
      });
    } else {
      setFormData({
        title: "",
        details: "",
        scheduledDate: "",
        status: "pending",
      });
    }
  }, [editingTodo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isEditing && editingTodo) {
        const updateData: UpdateWeeklyTodo = {
          title: formData.title,
          details: formData.details,
          scheduledDate: formData.scheduledDate,
          status: formData.status,
        };
        await weeklyTodoService.updateTodo(editingTodo.id, updateData);
      } else {
        await weeklyTodoService.createTodo(formData);
      }
      onTodoAdded();
      onClose();
      setFormData({
        title: "",
        details: "",
        scheduledDate: "",
        status: "pending",
      });
    } catch (err) {
      setError(
        `Failed to ${isEditing ? "update" : "create"} todo. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-[80vw] h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? "Edit Plan" : "Add New Plan"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter todo title"
            />
          </div>

          <div>
            <label
              htmlFor="details"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Details
            </label>
            <JoditEditorComponent
              placeholder="Enter todo details"
              initialValue={formData.details}
              onContentChange={(content) => setFormData(prev => ({ ...prev, details: content }))}
              height="400px"
            />
          </div>

          <div>
            <label
              htmlFor="scheduledDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Scheduled Date *
            </label>
            <input
              type="date"
              id="scheduledDate"
              name="scheduledDate"
              value={formData.scheduledDate}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                  ? "Update Plan"
                  : "Create Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
