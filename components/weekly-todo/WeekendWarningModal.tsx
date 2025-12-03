"use client";

import { useTranslations } from "next-intl";

interface WeekendWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WeekendWarningModal({ isOpen, onClose }: WeekendWarningModalProps) {
  const t = useTranslations("weeklyTodo.modal");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-[90%] max-w-md shadow-xl">
        <h2 className="text-xl font-bold text-red-600 mb-4">
          {t("warning.title")}
        </h2>

        <p className="text-gray-700 mb-6">
          {t("warning.msg1")} <b>{t("warning.saturday")}</b> {t("warning.and")} <b>{t("warning.sunday")}</b>.
          <br />{t("warning.msg2")}
        </p>

        <button
          onClick={onClose}
          className="px-6 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 w-full"
        >
          {t("warning.ok")}
        </button>
      </div>
    </div>
  );
}
