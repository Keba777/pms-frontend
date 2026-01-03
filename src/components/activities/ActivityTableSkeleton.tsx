"use client";

import React from "react";

const ActivityTableSkeleton: React.FC = () => {
  const skeletonRows = Array.from({ length: 14 });

  return (
    <div className="rounded-lg border border-border">
      <div className="overflow-x-auto">
        <table className="min-w-max divide-y divide-border">
          {/* Table Header */}
          <thead className="bg-primary">
            <tr>
              <th className="px-4 py-3 whitespace-nowrap text-left text-xs font-bold text-gray-50 uppercase tracking-wider border-r border-cyan-700/50">
                No
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-xs font-bold text-gray-50 uppercase tracking-wider border-r border-cyan-700/50">
                Activity
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-xs font-bold text-gray-50 uppercase tracking-wider border-r border-cyan-700/50">
                Priority
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-xs font-bold text-gray-50 uppercase tracking-wider border-r border-cyan-700/50">
                Quantity
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-xs font-bold text-gray-50 uppercase tracking-wider border-r border-cyan-700/50">
                Unit
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-xs font-bold text-gray-50 uppercase tracking-wider border-r border-cyan-700/50">
                Start Date
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-xs font-bold text-gray-50 uppercase tracking-wider border-r border-cyan-700/50">
                End Date
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-xs font-bold text-gray-50 uppercase tracking-wider border-r border-cyan-700/50">
                Duration
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-xs font-bold text-gray-50 uppercase tracking-wider border-r border-cyan-700/50">
                Progress
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-xs font-bold text-gray-50 uppercase tracking-wider border-r border-cyan-700/50">
                Status
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-xs font-bold text-gray-50 uppercase tracking-wider border-r border-cyan-700/50">
                Approval
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-xs font-bold text-gray-50 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white divide-y divide-border">
            {skeletonRows.map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                <td className="px-4 py-3 border-r border-gray-100">
                  <div className="h-4 w-6 bg-gray-200 rounded animate-pulse" />
                </td>
                <td className="px-4 py-3 border-r border-gray-100">
                  <div className="h-4 bg-muted rounded w-28 animate-pulse" />
                </td>
                <td className="px-4 py-3 border-r border-gray-100">
                  <div className="h-4 bg-muted rounded w-16 animate-pulse" />
                </td>
                <td className="px-4 py-3 border-r border-gray-100">
                  <div className="h-4 bg-muted rounded w-12 animate-pulse" />
                </td>
                <td className="px-4 py-3 border-r border-gray-100">
                  <div className="h-4 bg-muted rounded w-16 animate-pulse" />
                </td>
                <td className="px-4 py-3 border-r border-gray-100">
                  <div className="h-4 bg-muted rounded w-20 animate-pulse" />
                </td>
                <td className="px-4 py-3 border-r border-gray-100">
                  <div className="h-4 bg-muted rounded w-20 animate-pulse" />
                </td>
                <td className="px-4 py-3 border-r border-gray-100">
                  <div className="h-4 bg-muted rounded w-20 animate-pulse" />
                </td>
                <td className="px-4 py-3 border-r border-gray-100">
                  <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                </td>
                <td className="px-4 py-3 border-r border-gray-100">
                  <div className="h-4 bg-muted rounded w-16 animate-pulse" />
                </td>
                <td className="px-4 py-3 border-r border-gray-100">
                  <div className="h-4 bg-muted rounded w-20 animate-pulse" />
                </td>
                <td className="px-4 py-3 border-r border-gray-100">
                  <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer/Pagination Skeleton */}
      <div className="flex items-center justify-between p-4">
        <div className="h-4 bg-muted rounded w-24" />
        <div className="flex gap-2">
          <div className="h-6 w-6 bg-muted rounded" />
          <div className="h-6 w-6 bg-gray-300 rounded" />
          <div className="h-6 w-6 bg-gray-300 rounded" />
        </div>
      </div>
    </div>
  );
};

export default ActivityTableSkeleton;
