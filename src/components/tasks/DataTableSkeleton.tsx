"use client";

import React from "react";

const DataTableSkeleton: React.FC = () => {
  // We'll assume your table has 11 columns based on your actual table implementation.
  const columnCount = 11;
  // Adjust the number of rows as needed.
  const rowCount = 12;

  return (
    <div className="rounded-lg border border-gray-200">
      {/* Table container with horizontal scroll */}
      <div className="overflow-x-auto">
        <table className="min-w-max divide-y divide-gray-200">
          <thead className="bg-cyan-700">
            <tr>
              {Array.from({ length: columnCount }).map((_, index) => (
                <th key={index} className="px-4 py-3 whitespace-nowrap">
                  <div className="h-4 w-24 bg-gray-300 rounded animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 animate-pulse">
                {Array.from({ length: columnCount }).map((_, colIndex) => (
                  <td key={colIndex} className="px-4 py-2 whitespace-nowrap">
                    <div className="h-4 bg-gray-300 rounded" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Skeleton for the pagination controls */}
      <div className="flex items-center justify-between p-4 animate-pulse">
        <div className="h-4 w-20 bg-gray-300 rounded" />
        <div className="flex gap-2">
          <div className="h-4 w-6 bg-gray-300 rounded" />
          <div className="h-4 w-6 bg-gray-300 rounded" />
          <div className="h-4 w-6 bg-gray-300 rounded" />
        </div>
      </div>
    </div>
  );
};

export default DataTableSkeleton;
