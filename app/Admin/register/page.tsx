"use client";

import { useState } from "react";
import Register from "@/components/Register";
import SpeacialRegister from "@/components/SpeacialRegister";

const Page = () => {
  const [activeTab, setActiveTab] = useState("register");

  return (
    <div className="mx-auto bg-white shadow-lg rounded-lg">
      {/* Tab Buttons */}
      <div className="flex border-b mb-4">
        <button
          className={`flex-1 py-2 text-center ${
            activeTab === "register"
              ? "border-b-4 border-[#155E75] font-bold text-[#155E75]"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("register")}
        >
          দা'ঈ যোগ করুন
        </button>
        <button
          className={`flex-1 py-2 text-center ${
            activeTab === "specialRegister"
              ? "border-b-4 border-[#155E75] font-bold text-[#155E75]"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("specialRegister")}
        >
          বিশেষ দা'ঈ যোগ করুন
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === "register" && <Register />}
        {activeTab === "specialRegister" && <SpeacialRegister />}
      </div>
    </div>
  );
};

export default Page;
