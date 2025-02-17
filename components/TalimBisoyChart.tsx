"use client"; //Faysal

import React from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface TalimDonutChartProps {
  data1: ChartData[];
  data2: ChartData[];
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  mainTitle?: string;
  chart1Title?: string;
  chart2Title?: string;
}

const renderCustomLegend = (props: any) => {
  const { payload } = props;

  if (!payload || payload.length === 0) {
    return <p className="text-center text-gray-500">No data available</p>;
  }

  return (
    <ul className="flex flex-col space-y-2">
      {payload.map((entry: any, index: number) => (
        <li
          key={`legend-item-${index}`}
          className="flex items-center space-x-2 text-sm font-medium"
        >
          {/* Color Indicator */}
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          ></div>
          <span className="text-gray-700">{entry.payload.name}</span>
          <span className="text-gray-500">({entry.payload.value}%)</span>
        </li>
      ))}
    </ul>
  );
};

const TalimDonutChart: React.FC<TalimDonutChartProps> = ({
  data1,
  data2,
  innerRadius = 40,
  outerRadius = 60,
  startAngle = 90,
  endAngle = 450,
  mainTitle = "তালিম বিষয়",
  chart1Title = "মহিলা তালিম",
  chart2Title = "পুরুষ তালিম",
}) => {
  return (
    <div className="w-full rounded-lg bg-white shadow-lg border border-gray-200 grow">
      {/* Main Title */}
      <div className="p-6 text-center border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">{mainTitle}</h2>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-1">
        {/* Chart 1 */}
        <div className="rounded-lg bg-gray-50 shadow-sm p-2">
          <h3 className="text-xl font-semibold text-gray-700 text-center mb-4">
            {chart1Title}
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={data1}
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                dataKey="value"
                startAngle={startAngle}
                endAngle={endAngle}
              >
                {data1.map((entry, index) => (
                  <Cell key={`cell1-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                align="center"
                verticalAlign="bottom"
                height={50}
                content={renderCustomLegend}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2 */}
        <div className="rounded-lg bg-gray-50 shadow-sm p-2">
          <h3 className="text-xl font-semibold text-gray-700 text-center mb-4">
            {chart2Title}
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={data2}
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                dataKey="value"
                startAngle={startAngle}
                endAngle={endAngle}
              >
                {data2.map((entry, index) => (
                  <Cell key={`cell2-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                align="center"
                verticalAlign="bottom"
                height={50}
                content={renderCustomLegend}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TalimDonutChart;
