"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Link from "next/link";

interface Item {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconColor: string;
  link: string;
}

interface StatsCardProps {
  title: string;
  items: Item[];
  total?: number;
}

const StatsCard = ({ title, items, total }: StatsCardProps) => {
  // Remove "Total" from pie chart data
  const chartData = items
    .filter((item) => item.label !== "Total Projects")
    .map((item) => ({
      name: item.label,
      value: item.value,
      color: item.iconColor,
    }));

  return (
    <div className="h-full bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col">
      {/* Card Header */}
      <div className="flex items-center justify-between p-4">
        <h5 className="text-lg font-semibold text-gray-700">{title}</h5>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1">
        {/* Pie Chart Section */}
        <div className="relative flex justify-center mb-6">
          <ResponsiveContainer width="84%" height={170}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={60}
                fill="#8884d8"
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* List Items */}
        <ul className="p-0 m-0">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex items-center justify-between mb-4 pb-1"
            >
              <div className="flex items-center">
                <div
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full mr-3"
                  style={{ color: item.iconColor }}
                >
                  {item.icon}
                </div>
                <div>
                  <Link
                    href={item.link}
                    className="text-sm font-medium text-gray-700 hover:text-blue-500"
                  >
                    {item.label}
                  </Link>
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-700">
                {item.value}
              </div>
            </li>
          ))}
        </ul>

        {/* Display Total Projects Separately */}
        {total !== undefined && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg text-center">
            <span className="text-gray-600 text-sm">Total Projects:</span>
            <span className="text-lg font-bold text-gray-800 ml-2">
              {total}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
