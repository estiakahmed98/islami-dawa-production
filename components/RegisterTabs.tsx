"use client";

import { useState } from "react";
import Register from "@/components/Register";
import { useTranslations } from "next-intl";

type Variant = "standard" | "special";

export default function RegisterTabs() {
  const [activeTab, setActiveTab] = useState<Variant>("standard");
  const t = useTranslations("register.tabs");

  return (
    <div className="mx-auto bg-white shadow-lg rounded-lg">
      <div className="flex border-b mb-4">
        <button
          className={`flex-1 py-2 text-center ${
            activeTab === "standard"
              ? "border-b-4 border-[#155E75] font-bold text-[#155E75]"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("standard")}
        >
          {t("standard")}
        </button>
        <button
          className={`flex-1 py-2 text-center ${
            activeTab === "special"
              ? "border-b-4 border-[#155E75] font-bold text-[#155E75]"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("special")}
        >
          {t("special")}
        </button>
      </div>

      <div className="p-4">
        <Register variant={activeTab} />
      </div>
    </div>
  );
}
