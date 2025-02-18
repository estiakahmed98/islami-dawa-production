import React from "react"; //Juwel

interface DataSet {
  label: string;
  value: number;
}

const ComparisonTallyCard: React.FC<{
  currentData: DataSet[];
  previousData: DataSet[];
}> = ({ currentData, previousData }) => {
  return (
    <div className="w-full bg-white lg:shadow-lg rounded-lg p-2 lg:p-10 border border-gray-200">
      <h2 className="text-xl lg:text-3xl font-semibold text-center mt-4 mb-10">তুলনা দেখুন</h2>
      <div className="grid grid-cols-2 gap-10">
        {currentData.map((item, index) => {
          const current = item;
          const previous = previousData[index] || { value: 0 };

          // Calculate percentage change for current value
          let percentageChange = 0;
          if (previous.value !== 0) {
            percentageChange =
              ((current.value - previous.value) / previous.value) * 100;
          }

          // Determine text and progress bar colors
          let textColorClass = "text-gray-700"; // Default color
          let progressBarColor = "bg-blue-500"; // Default for equal values
          let percentageColor = "text-gray-500"; // Default for 0% change

          if (current.value > previous.value) {
            textColorClass = "text-green-600 font-bold"; // Green for increase
            progressBarColor = "bg-green-500"; // Green progress bar
            percentageColor = "text-green-600"; // Green for increase
          } else if (current.value < previous.value) {
            textColorClass = "text-red-600 font-bold"; // Red for decrease
            progressBarColor = "bg-red-500"; // Red progress bar
            percentageColor = "text-red-600"; // Red for decrease
          }

          // Calculate percentages for progress bars
          const maxVal = Math.max(current.value, previous.value, 1);
          const currentPercentage = (current.value / maxVal) * 100;
          const previousPercentage = (previous.value / maxVal) * 100;

          return (
            <div
              key={index}
              className="space-y-1 pb-4 border-b border-gray-300 w-full"
            >
              {/* Title */}
              <span className="text-sm font-medium block">{current.label}</span>

              {/* Value Comparison */}
              <div className="grid space-y-4 text-sm">
                <div className={`font-medium ${textColorClass}`}>
                  বর্তমান: {current.value}{" "}
                  <span className={`text-xs ${percentageColor}`}>
                    ({percentageChange > 0 ? "+" : ""}
                    {percentageChange.toFixed(1)}%)
                  </span>
                  {/* Current Value Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-4 relative">
                    <div
                      className={`h-4 rounded-full ${progressBarColor}`}
                      style={{ width: `${currentPercentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-gray-500 font-medium">
                  পূর্ববর্তী: {previous.value}
                  {/* Previous Value Progress Bar (Always Blue) */}
                  <div className="w-full bg-gray-200 rounded-full h-4 relative">
                    <div
                      className="h-4 rounded-full bg-blue-500"
                      style={{ width: `${previousPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="grid space-y-4"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComparisonTallyCard;
