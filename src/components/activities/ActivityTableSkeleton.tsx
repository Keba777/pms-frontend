"use client";

import React from "react";

const ActivityTableSkeleton: React.FC = () => {
  const skeletonRows = Array.from({ length: 14 });

  return (
    <div className="rounded-lg border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-max divide-y divide-gray-200">
          {/* Table Header */}
          <thead className="bg-cyan-700">
            <tr>
              <th className="px-4 py-3 whitespace-nowrap" />
              <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Activity
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Priority
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Quantity
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Unit
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Start Date
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                End Date
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Duration
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Progress
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Status
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Approval
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {skeletonRows.map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                {/* Checkbox */}
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="h-4 w-4 bg-gray-300 rounded-full" />
                </td>
                {/* Activity Name */}
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="h-4 bg-gray-300 rounded w-28" />
                </td>
                {/* Priority */}
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="h-4 bg-gray-300 rounded w-16" />
                </td>
                {/* Quantity */}
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="h-4 bg-gray-300 rounded w-12" />
                </td>
                {/* Unit */}
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="h-4 bg-gray-300 rounded w-16" />
                </td>
                {/* Start Date */}
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="h-4 bg-gray-300 rounded w-20" />
                </td>
                {/* End Date */}
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="h-4 bg-gray-300 rounded w-20" />
                </td>
                {/* Duration */}
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="h-4 bg-gray-300 rounded w-20" />
                </td>
                {/* Progress */}
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="relative h-4 bg-gray-300 rounded">
                    {/* Simulated progress bar */}
                    <div
                      className="absolute left-0 top-0 h-full bg-blue-600 rounded"
                      style={{ width: "50%" }}
                    />
                  </div>
                </td>
                {/* Status */}
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="h-4 bg-gray-300 rounded w-16" />
                </td>
                {/* Approval */}
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="h-4 bg-gray-300 rounded w-20" />
                </td>
                {/* Actions */}
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="h-4 bg-gray-300 rounded w-24" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer/Pagination Skeleton */}
      <div className="flex items-center justify-between p-4">
        <div className="h-4 bg-gray-300 rounded w-24" />
        <div className="flex gap-2">
          <div className="h-6 w-6 bg-gray-300 rounded" />
          <div className="h-6 w-6 bg-gray-300 rounded" />
          <div className="h-6 w-6 bg-gray-300 rounded" />
        </div>
      </div>
    </div>
  );
};

export default ActivityTableSkeleton;
