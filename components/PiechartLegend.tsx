//Faysal Updated by //Juwel

import React from "react";

interface Payload {
  color?: string;
  value?: any;
  payload?: any;
}

interface RenderLegendProps {
  payload?: Payload[];
}

const renderLegend = ({ payload }: RenderLegendProps) => {
  if (!payload || payload.length === 0) {
    return <p>No legend data available.</p>;
  }

  return (
    <ul className="grid justify-center">
      {payload.map((entry, index) => (
        <li
          key={`item-${index}`}
          className="flex items-center space-x-2 text-sm font-medium"
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color || "#000" }}
          ></div>
          <span className="text-gray-700 text-lg lg:text-xl">
            {entry.value}
          </span>
          <span className="text-gray-800 text-lg lg:text-xl font-semibold">
            ({entry.payload?.value}%)
          </span>
        </li>
      ))}
    </ul>
  );
};

export default renderLegend;
