"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  CreateWeeklyTodo,
  WeeklyTodo,
  UpdateWeeklyTodo,
} from "@/types/weekly-todo";
import { weeklyTodoService } from "@/services/user-weekly-todo";
import JoditEditorComponent from "@/components/richTextEditor";
import { toast } from "sonner";

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
  const t = useTranslations("weeklyTodo.modal");
  const tCommon = useTranslations("common");
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
          ? new Date(editingTodo.scheduledDate).toISOString().split("T")[0]
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
        toast.success(tCommon("submittedSuccessfully"));
      } else {
        await weeklyTodoService.createTodo(formData);
        toast.success(tCommon("submittedSuccessfully"));
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
      const message = isEditing ? t("errors.updateFailed") : t("errors.createFailed");
      setError(message);
      toast.error(message);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50  rounded-t-4xl">
      <div className="bg-white rounded-lg w-[80vw] h-[90vh] flex flex-col">
        <div className="flex justify-between bg-gradient-to-r from-[#1B809B] to-[#2C9AB8] items-center p-6 border-b flex-shrink-0  rounded-t-2xl">
          <h2 className="text-xl font-semibold text-white">
            {isEditing ? t("editTitle") : t("addTitle")}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-600"
            aria-label={t("close")}
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

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
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
              {t("fields.title")} *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t("placeholders.title")}
            />
          </div>

          <div>
            <label
              htmlFor="details"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("fields.details")}
            </label>
            <JoditEditorComponent
              placeholder={t("placeholders.details")}
              initialValue={formData.details}
              onContentChange={(content) =>
                setFormData((prev) => ({ ...prev, details: content }))
              }
              height="400px"
            />
          </div>

          <div>
            <label
              htmlFor="scheduledDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("fields.scheduledDate")} *
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
              {t("buttons.cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading
                ? isEditing
                  ? t("buttons.updating")
                  : t("buttons.creating")
                : isEditing
                  ? t("buttons.update")
                  : t("buttons.create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
