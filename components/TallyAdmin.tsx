"use client"; //Juwel
import React, { useMemo } from "react";

type TallyAdminProps = {
  userData: Record<string, any>;
  emails: string | string[];
  title?: string;
};

const TallyAdmin: React.FC<TallyAdminProps> = ({
  userData = {},
  emails = [],
  title = "Tally Admin",
}) => {
  const getBackgroundColor = (percentage: number): string => {
    if (percentage >= 80) return "bg-teal-500";
    if (percentage >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  const aggregateUserData = (
    userData: Record<string, any>,
    emails: string | string[]
  ) => {
    if (!userData || typeof userData !== "object") return [];
    const aggregatedData: Record<string, number> = {};
    const labelMap: Record<string, string> = userData.labelMap || {};

    // Initialize aggregation structure for each label
    Object.keys(labelMap).forEach((key) => {
      aggregatedData[key] = 0;
    });

    // Ensure emails is always an array
    const emailList = Array.isArray(emails) ? emails : [emails];

    emailList.forEach((email) => {
      const userRecords = userData.records?.[email];

      // Skip this email if no data exists for it
      if (!userRecords) {
        console.warn(`No data found for email: ${email}`);
        return; // Skip to the next email
      }

      // Merge data for each label from all dates for valid users
      Object.values(userRecords).forEach((dailyData) => {
        const data = dailyData as Record<string, string>; // Explicitly cast to the expected type
        Object.entries(data).forEach(([key, value]) => {
          if (aggregatedData[key] !== undefined) {
            aggregatedData[key] += parseInt(value, 10); // Sum up values for the valid emails
          }
        });
      });
    });

    // Format aggregated data for display
    return Object.entries(aggregatedData).map(([key, totalValue]) => ({
      label: labelMap[key] || key, // Use label map if available
      value: Math.min(totalValue, 5000), // Cap the value
      totalValue: totalValue,
      max: 5000, // Example max value
    }));
  };

  const dataForTally = useMemo(
    () => aggregateUserData(userData, emails),
    [userData, emails]
  );

  return (
    <div className="flex justify-center">
      <div className="bg-white border shadow-lg rounded-lg p-4 w-full">
        <h2 className="text-center text-xl font-bold mb-4">{title}</h2>

        {dataForTally.length > 0 ? (
          <div className="space-y-3 p-4">
            {dataForTally.map((item, index) => {
              const percentage = (item.value / item.max) * 100;
              return (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs sm:text-sm font-medium">
                      {item.label}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold">
                      {item.totalValue}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full ${getBackgroundColor(
                        percentage
                      )}`}
                      style={{ width: `${percentage}%` }}
                      role="progressbar"
                      aria-valuenow={item.value}
                      aria-valuemin={0}
                      aria-valuemax={item.max}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            No data available for the selected user(s).
          </p>
        )}
      </div>
    </div>
  );
};

export default TallyAdmin;
