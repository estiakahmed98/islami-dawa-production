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
import renderLegend from "./PiechartLegend";

interface AmoliChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
}

const AmoliChart: React.FC<AmoliChartProps> = ({
  data,
  innerRadius = 70,
  outerRadius = 100,
  startAngle = 90,
  endAngle = 450,
}) => {
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
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              dataKey="value"
              startAngle={startAngle}
              endAngle={endAngle}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
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
