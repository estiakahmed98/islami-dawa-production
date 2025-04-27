"use client";

import type React from "react";
import { useState } from "react";

interface EditRequestModalProps {
  day: number;
  onSubmit: (reason: string) => void;
  onCancel: () => void;
}

export const EditRequestModal: React.FC<EditRequestModalProps> = ({
  day,
  onSubmit,
  onCancel,
}) => {
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert("Please provide a reason for your edit request");
      return;
    }
    onSubmit(reason);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-[85vw] lg:w-[500px] relative">
        <button
          className="absolute top-4 right-6 text-xl text-red-500 hover:text-red-700"
          onClick={onCancel}
        >
          ✖
        </button>

        <h3 className="text-xl font-bold mb-4">Request Edit Permission</h3>
        <p className="mb-4">
          You need admin approval to edit data for Day {day}. Please explain why
          you need to make changes.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="reason"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Reason for Edit
            </label>
            <textarea
              id="reason"
              className="w-full border border-gray-300 rounded-md p-3 min-h-[100px]"
              placeholder="Please explain why you need to edit this data..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Submit Request
            </button>
            <button
              type="button"
              className="bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
