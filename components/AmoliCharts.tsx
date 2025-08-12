"use client";

import React, { useMemo } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import renderLegend from "./PiechartLegend";
import { useTranslations } from "next-intl";

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
  const t = useTranslations();
  const tChart = (k: string) => t(`amoliChart.${k}`);

  const userData = data[userEmail];

  const percentages = useMemo(() => {
    if (!userData) return [];
    const v = Object.values(userData)
      .map((entry) => Number.parseFloat(entry?.percentage ?? "0"))
      .filter((n) => Number.isFinite(n))
      .map((n) => Math.min(100, Math.max(0, n)));
    return v;
  }, [userData]);

  if (!userData || percentages.length === 0) {
    return (
      <div className="text-center text-red-500 font-semibold">
        {tChart("noDataUser")}
      </div>
    );
  }

  const average =
    percentages.reduce((sum, value) => sum + value, 0) / Math.max(1, percentages.length);

  const chartData = useMemo(
    () => [
      { name: tChart("closed"), value: Number(average.toFixed(2)), color: "#4caf50" },
      { name: tChart("remaining"), value: Number((100 - average).toFixed(2)), color: "#f44336" },
    ],
    [average, t]
  );

  return (
    <div className="rounded-lg bg-gradient-to-r from-blue-50 border to-white shadow-xl grow">
      <div className="p-6 text-center border-b border-gray-200">
        {/* Or: t("dashboard.UserDashboard.amoli.title") */}
        <h2 className="text-xl font-bold text-gray-800">{tChart("title")}</h2>
      </div>

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
            <Tooltip formatter={(value: number) => [`${value}%`, ""]} />
            <Legend align="center" verticalAlign="bottom" height={36} content={renderLegend} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AmoliChart;
