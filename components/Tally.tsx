import React from "react";

// Type definition for label map
type LabelMap = { [key: string]: string };

// Type definition for user records
type UserRecords = { [key: string]: { [key: string]: string } };

// Type definition for user data, combining LabelMap and UserRecords
type UserData = {
  labelMap?: LabelMap;
} & UserRecords;

// Type definition for component props
type TallyProps = {
  userData: UserData;
  email: string;
  title: string;
};

const Tally: React.FC<TallyProps> = ({ userData = {}, email, title }) => {
  // Function to determine background color based on percentage
  const getBackgroundColor = (percentage: number) => {
    if (percentage >= 80) {
      return "bg-teal-500"; // Greenish Teal for 80% or higher
    } else if (percentage >= 50) {
      return "bg-amber-500"; // Yellow for 50% to 79%
    } else {
      return "bg-red-500"; // Red for less than 50%
    }
  };

  // Function to aggregate user data
  const aggregateUserData = (userData: UserData, email: string) => {
    if (!userData || typeof userData !== "object") {
      console.error("Invalid or missing userData:", userData);
      return [];
    }

    const userRecords = userData[email];
    if (!userRecords) {
      console.warn(`No records found for email: ${email}`);
      return [];
    }

    const aggregatedData: { [key: string]: number } = {};
    const labelMap = userData.labelMap || {};

    // Initialize aggregation structure
    Object.keys(labelMap).forEach((key) => {
      aggregatedData[key] = 0;
    });

    // Aggregate data across all dates for the user
    Object.values(userRecords).forEach((dailyData) => {
      Object.entries(dailyData).forEach(([key, value]) => {
        if (aggregatedData[key] !== undefined) {
          aggregatedData[key] += parseInt(value, 10);
        }
      });
    });

    // Format aggregated data for display and cap values at max
    return Object.entries(aggregatedData).map(([key, totalValue]) => ({
      label: labelMap[key] || key,
      value: Math.min(totalValue, 1000),
      totalValue: totalValue,
      max: 1000,
    }));
  };

  // Process data for the tally
  const dataForTally = aggregateUserData(userData, email);

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
                    <span className="text-xs sm:text-sm font-medium">{item.label}</span>
                    <span className="text-xs sm:text-sm font-semibold">{item.totalValue}</span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full ${getBackgroundColor(percentage)}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            No data available for the selected user.
          </p>
        )}
      </div>
    </div>
  );
};

export default Tally;
