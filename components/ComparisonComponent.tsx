"use client"; //Juwel
import React from "react";

type ComparisonComponentProps = {
  isOpen: boolean;
  onClose: () => void;
  onCompare: (
    fromMonth: string,
    fromYear: string,
    toMonth: string,
    toYear: string
  ) => void;
  currentData: Record<string, number>;
  previousData: Record<string, number>;
  availableMonths: string[];

  availableYears: string[];

  comparisonData: any; // Add this line
};

const ComparisonComponent: React.FC<ComparisonComponentProps> = ({
  currentData,
  previousData,
}) => {
  const allKeys = Array.from(
    new Set([...Object.keys(currentData), ...Object.keys(previousData)])
  );

  return (
    <div className="bg-gray-100 border shadow-lg rounded-lg p-4 w-full mb-6">
      <h3 className="text-center text-lg font-bold mb-4">Comparison Results</h3>

      {allKeys.length > 0 ? (
        <div className="space-y-3">
          {allKeys.map((key, index) => {
            const currentValue = currentData[key] || 0;
            const previousValue = previousData[key] || 0;
            const change = currentValue - previousValue;
            const changePercentage =
              previousValue === 0
                ? 0
                : ((change / previousValue) * 100).toFixed(1);

            return (
              <div key={index} className="flex justify-between items-center">
                <span className="text-xs sm:text-sm font-medium">{key}</span>
                <span className="text-xs sm:text-sm font-semibold">
                  {currentValue}{" "}
                  {change !== 0 && (
                    <span
                      className={`ml-2 ${change > 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {change > 0 ? "📈" : "📉"}{" "}
                      {Math.abs(Number(changePercentage))}%
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No data available for comparison.
        </p>
      )}
    </div>
  );
};

export default ComparisonComponent;
