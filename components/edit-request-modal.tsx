"use client";

import type React from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("editRequest");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert(t("reasonRequired")); // 🔹 i18n key for alert
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
          aria-label={t("close")}
        >
          ✖
        </button>

        <h3 className="text-xl font-bold mb-4">{t("title")}</h3>
        <p className="mb-4">{t("description", { day })}</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="reason"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("reasonLabel")}
            </label>
            <textarea
              id="reason"
              className="w-full border border-gray-300 rounded-md p-3 min-h-[100px]"
              placeholder={t("reasonPlaceholder")}
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
              {t("submit")}
            </button>
            <button
              type="button"
              className="bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              onClick={onCancel}
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
