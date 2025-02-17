"use client"; //Juwel
import React, { useState } from "react";
import ComparisonModal from "./ComparisonComponent";

type TallyComponentProps = {
  userData: Record<string, any>;
  title?: string;
};

const TallyComponent: React.FC<TallyComponentProps> = ({
  userData = {},
  title = "Tally Data",
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comparisonData, setComparisonData] = useState<any>(null);

  // Extract available months and years from userData
  const availableDates = Object.keys(userData.records || {});
  const availableMonths = [
    ...new Set(availableDates.map((date) => date.split("-")[1])),
  ].sort();
  const availableYears = [
    ...new Set(availableDates.map((date) => date.split("-")[0])),
  ].sort();

  // Function to compare data
  const handleCompare = (
    fromMonth: string,
    fromYear: string,
    toMonth: string,
    toYear: string
  ) => {
    const fromDate = `${fromYear}-${fromMonth}`;
    const toDate = `${toYear}-${toMonth}`;

    if (
      !userData.records ||
      !userData.records[fromDate] ||
      !userData.records[toDate]
    ) {
      setComparisonData(null);
      return;
    }

    const fromData = userData.records[fromDate] || {};
    const toData = userData.records[toDate] || {};

    const allKeys = Array.from(
      new Set([...Object.keys(fromData), ...Object.keys(toData)])
    );
    const comparedResults = allKeys.map((key) => {
      const currentValue = toData[key] || 0;
      const previousValue = fromData[key] || 0;
      const change = currentValue - previousValue;
      const changePercentage =
        previousValue === 0 ? 0 : ((change / previousValue) * 100).toFixed(1);

      return {
        label: key,
        currentValue,
        previousValue,
        change,
        changePercentage,
      };
    });

    setComparisonData(comparedResults);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Button to Open Modal */}
      <div className="mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-emerald-700 transition-all duration-300 focus:ring focus:ring-emerald-300"
        >
          📊 তুলনা দেখুন
        </button>
      </div>

      {/* Modal Popup with Comparison Results Inside */}
      <ComparisonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCompare={handleCompare}
        comparisonData={comparisonData}
        availableMonths={availableMonths}
        availableYears={availableYears}
        currentData={
          userData.records ? userData.records[availableDates[0]] : {}
        }
        previousData={
          userData.records ? userData.records[availableDates[1]] : {}
        }
      />
    </div>
  );
};

export default TallyComponent;
