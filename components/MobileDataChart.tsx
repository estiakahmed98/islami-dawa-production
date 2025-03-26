import React from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  division?: string;
  district?: string;
  upazila?: string;
  union?: string;
}

interface ChartData {
  labelMap: {
    [key: string]: string;
  };
  records: {
    [email: string]: {
      [date: string]: {
        [key: string]: string | number;
      };
    };
  };
}

interface MobileDataChartProps {
  moktobData: ChartData;
  dawatiData: ChartData;
  dawatiMojlishData: ChartData;
  jamatData: ChartData;
  dineFeraData: ChartData;
  soforData: ChartData;
  dayeData: ChartData;
  talimData: ChartData;
  selectedMonth: number;
  selectedYear: number;
  users: User[];
}

const MobileDataChart: React.FC<MobileDataChartProps> = ({
  moktobData,
  dawatiData,
  dawatiMojlishData,
  jamatData,
  dineFeraData,
  soforData,
  dayeData,
  talimData,
  selectedMonth,
  selectedYear,
}) => {
  const aggregateMonthlyData = (data: ChartData) => {
    if (!data || !data.records) return {};

    const monthStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;
    let aggregated: { [key: string]: number } = {};

    Object.values(data.records).forEach((userRecords) => {
      Object.entries(userRecords).forEach(([date, values]) => {
        if (date.startsWith(monthStr)) {
          Object.entries(values).forEach(([key, value]) => {
            if (key !== "editorContent" && key !== "motamotdin") {
              aggregated[key] = (aggregated[key] || 0) + Number(value);
            }
          });
        }
      });
    });

    return aggregated;
  };

  const aggregatedData = {
    moktob: aggregateMonthlyData(moktobData),
    dawati: aggregateMonthlyData(dawatiData),
    dawatiMojlish: aggregateMonthlyData(dawatiMojlishData),
    jamat: aggregateMonthlyData(jamatData),
    dineFera: aggregateMonthlyData(dineFeraData),
    sofor: aggregateMonthlyData(soforData),
    daye: aggregateMonthlyData(dayeData),
    talim: aggregateMonthlyData(talimData),
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
      {Object.entries(aggregatedData).map(([category, data]) => (
        <div key={category} className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">
            {category === "moktob" && "মক্তব বিষয়"}
            {category === "dawati" && "দাওয়াতি বিষয়"}
            {category === "dawatiMojlish" && "দাওয়াতি মজলিশ"}
            {category === "jamat" && "জামাত বিষয়"}
            {category === "dineFera" && "দ্বীনে ফিরে এসেছে"}
            {category === "sofor" && "সফর বিষয়"}
            {category === "daye" && "দায়ী বিষয়"}
            {category === "talim" && "তালিম বিষয়"}
          </h3>
          <div className="space-y-2">
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-gray-600">
                  {(moktobData.labelMap && moktobData.labelMap[key]) || key}
                </span>
                <span className="font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MobileDataChart;
