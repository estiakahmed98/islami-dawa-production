//Faysal

"use client";

import React from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
// import renderLegend from "./renderLegend";
import renderLegend from "./PiechartLegend";

interface AmoliChartProps {
  data: {
    [email: string]: {
      [date: string]: {
        percentage: string;
      };
    };
  };
  userEmail: string;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
}

const AmoliChart: React.FC<AmoliChartProps> = ({
  data,
  userEmail,
  innerRadius = 80,
  outerRadius = 130,
  startAngle = 90,
  endAngle = 450,
}) => {
  // Extract percentages for the specified user and calculate average
  const userData = data[userEmail];

  if (!userData) {
    return (
      <div className="text-center text-red-500 font-bold">
        No data available for the specified user.
      </div>
    );
  }

  const percentages: number[] = Object.values(userData).map((entry) =>
    parseFloat(entry.percentage)
  );

  const averagePercentage =
    percentages.reduce((sum, value) => sum + value, 0) / percentages.length;

  const chartData = [
    {
      name: "Closed",
      value: parseFloat(averagePercentage.toFixed(2)),
      color: "#4caf50",
    },
    {
      name: "Remaining",
      value: parseFloat((100 - averagePercentage).toFixed(2)),
      color: "#f44336",
    },
  ];

  return (
    <div className="rounded-lg bg-gradient-to-r from-blue-50 border to-white shadow-xl grow">
      {/* Title Section */}
      <div className="p-6 text-center border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">আ’মলি মুহাসাবা</h2>
      </div>

      {/* Chart Section */}
      <div className="max-w-sm mx-auto relative p-6 rounded-b-lg">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart className="p-4">
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              dataKey="value"
              startAngle={startAngle}
              endAngle={endAngle}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value}%`, ""]} />
            <Legend
              align="center"
              verticalAlign="bottom"
              height={36}
              content={renderLegend}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AmoliChart;
