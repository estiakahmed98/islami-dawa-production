"use client"; // Juwel
import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

type TallyAdminProps = {
  userData: Record<string, any>;
  emails: string | string[];
  title?: string;
};

// Custom Label Inside the Bar (Centered Vertically & Horizontally)
const CustomVerticalLabel = (props: any) => {
  const { x, y, value, height, width } = props;
  const isMobile = typeof window !== "undefined" && window.innerWidth < 600;

  return (
    <text
      x={x + width / 2} // Center horizontally inside the bar
      y={y + height / 2} // Center vertically inside the bar
      fill="white"
      fontSize={isMobile ? 8 : 14} // Adjust font size for mobile
      textAnchor="middle"
      alignmentBaseline="middle"
      transform={`rotate(-90, ${x + width / 2}, ${y + height / 2})`} // Rotate at the center of the text
    >
      {value}
    </text>
  );
};

// Custom Label for Values on Top (Centered)
const CustomValueLabel = (props: any) => {
  const { x, y, value, width } = props;
  const isMobile = typeof window !== "undefined" && window.innerWidth < 600;

  return (
    <text
      x={x + width / 2} // Center text horizontally
      y={isMobile ? y - 5 : y - 15} // Adjust vertical spacing for mobile
      fill="black"
      fontSize={isMobile ? 12 : 14} // Smaller font for mobile
      fontWeight="bold"
      textAnchor="middle" // Keep text centered
    >
      {value}
    </text>
  );
};

const TallyMobileCombine: React.FC<TallyAdminProps> = ({
  userData = {},
  emails = [],
  title = "Tally Admin",
}) => {
  const aggregateUserData = (
    userData: Record<string, any>,
    emails: string | string[]
  ) => {
    if (!userData || typeof userData !== "object") return [];
    const aggregatedData: Record<string, number> = {};
    const labelMap: Record<string, string> = userData.labelMap || {};

    Object.keys(labelMap).forEach((key) => {
      aggregatedData[key] = 0;
    });

    const emailList = Array.isArray(emails) ? emails : [emails];

    emailList.forEach((email) => {
      const userRecords = userData.records?.[email];

      if (!userRecords) return;

      Object.values(userRecords).forEach((dailyData) => {
        const data = dailyData as Record<string, string>;
        Object.entries(data).forEach(([key, value]) => {
          if (aggregatedData[key] !== undefined) {
            aggregatedData[key] += parseInt(value, 10);
          }
        });
      });
    });

    return Object.entries(aggregatedData).map(([key, totalValue]) => ({
      label: labelMap[key] || key,
      value: Math.min(totalValue, 5000), // Cap max value
    }));
  };

  type TallyData = {
    label: string;
    value: number;
  };

  const [tallyData, setTallyData] = useState<TallyData[]>([]);

  useEffect(() => {
    if (!userData || typeof userData !== "object") return;
    setTallyData(aggregateUserData(userData, emails || []));
  }, [userData, emails]);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 600;

  return (
    <div className="bg-white border shadow-lg rounded-lg p-0 md:p-6 w-full">
      <h2 className="text-lg md:text-xl font-bold mb-4 text-gray-800">
        {title}
      </h2>

      {tallyData.length > 0 ? (
        <ResponsiveContainer width="100%" height={isMobile ? 450 : 550}>
          <BarChart
            data={tallyData}
            barSize={isMobile ? 25 : 60} // Slightly wider bars for mobile
            margin={{
              top: isMobile ? 20 : 40,
              right: isMobile ? 0 : 20,
              left: isMobile ? 0 : 20,
              bottom: 30,
            }} // Adjust spacing for mobile
          >
            <XAxis
              dataKey="label"
              tick={false} // Hide X-axis labels
              axisLine={{ stroke: "#ddd", strokeWidth: 2 }} // Keep bottom border
            />

            {/* Y-Axis with formatted values */}
            <YAxis
              tick={{ fontSize: isMobile ? 10 : 12 }}
              tickFormatter={(value) => `${value / 1000}k`}
              tickLine={false}
              axisLine={false}
            />

            {/* Tooltip for better readability */}
            <Tooltip
              cursor={{ fill: "rgba(13, 148, 136, 0.1)" }}
              contentStyle={{
                backgroundColor: "#fff",
                color: "#333",
                borderRadius: "6px",
                padding: "6px",
                boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
              }}
              labelStyle={{ fontWeight: "bold", color: "#0d9488" }}
              formatter={(value) => [`${value} users`, "Total"]}
            />

            {/* Bar Chart with Values on Top & Labels Inside */}
            <Bar dataKey="value" fill="#0d9488" radius={[6, 6, 0, 0]}>
              {/* Label Inside Bar (Rotated from Bottom to Top) */}
              <LabelList dataKey="label" content={<CustomVerticalLabel />} />

              {/* Value on Top with Extra Padding */}
              <LabelList
                dataKey="value"
                content={<CustomValueLabel />}
                allowEscapeViewBox={{ y: true }} // Prevents cropping
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-center text-gray-500 text-sm">No data available.</p>
      )}
    </div>
  );
};

export default TallyMobileCombine;
