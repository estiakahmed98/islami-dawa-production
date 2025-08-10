import React from "react";

interface DataSet {
  label: string;
  value: number;
}

const ComparisonTallyCard: React.FC<{
  currentData: DataSet[];
  previousData: DataSet[];
}> = ({ currentData, previousData }) => {
  // Filter out items where both current and previous values are 0
  const filteredData = currentData.map((current, index) => {
    const previous = previousData[index] || { value: 0 };
    return { current, previous };
  }).filter(({ current, previous }) => current.value !== 0 || previous.value !== 0);

  if (filteredData.length === 0) {
    return (
      <div className="w-full bg-white lg:shadow-lg rounded-lg p-2 lg:p-10 border border-gray-200">
        <h2 className="text-xl lg:text-3xl font-semibold text-center mt-4 mb-10">তুলনা দেখুন</h2>
        <p className="text-center text-gray-500 py-10">কোন ডেটা পাওয়া যায়নি</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white lg:shadow-lg rounded-lg p-2 lg:p-10 border border-gray-200">
      <h2 className="text-xl lg:text-3xl font-semibold text-center mt-4 mb-10">তুলনা দেখুন</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredData.map(({ current, previous }, index) => {
          // Calculate percentage change
          let percentageChange = 0;
          if (previous.value !== 0) {
            percentageChange = ((current.value - previous.value) / previous.value) * 100;
          } else if (current.value > 0) {
            percentageChange = 100; // Infinite increase (from 0 to positive)
          }

          // Determine colors based on change
          const isIncrease = percentageChange > 0;
          const isSame = percentageChange === 0;
          const isDecrease = percentageChange < 0;

          // Calculate progress bar percentages
          const maxValue = Math.max(current.value, previous.value, 1);
          const currentPercentage = (current.value / maxValue) * 100;
          const previousPercentage = (previous.value / maxValue) * 100;

          return (
            <div
              key={index}
              className="space-y-3 pb-4 border-b border-gray-200 last:border-b-0"
            >
              {/* Title */}
              <h3 className="text-base font-semibold text-gray-800">
                {current.label}
              </h3>

              {/* Current Value */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">বর্তমান</span>
                  <span className={`text-sm font-medium ${
                    isIncrease ? "text-green-600" : 
                    isDecrease ? "text-red-600" : 
                    "text-gray-600"
                  }`}>
                    {current.value}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      isIncrease ? "bg-green-500" : 
                      isDecrease ? "bg-red-500" : 
                      "bg-blue-500"
                    }`}
                    style={{ width: `${currentPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Previous Value */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">পূর্ববর্তী</span>
                  <span className="text-sm font-medium text-gray-600">
                    {previous.value}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full bg-blue-300"
                    style={{ width: `${previousPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Change Indicator */}
              <div className="flex justify-between items-center pt-1">
                <span className="text-xs text-gray-500">পরিবর্তন</span>
                <span className={`text-xs font-medium ${
                  isIncrease ? "text-green-600" : 
                  isDecrease ? "text-red-600" : 
                  "text-gray-600"
                }`}>
                  {percentageChange > 0 ? "+" : ""}
                  {previous.value === 0 && current.value > 0 ? "∞%" : `${percentageChange.toFixed(1)}%`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComparisonTallyCard;