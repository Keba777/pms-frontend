import React from "react";

const DispatchTableSkeleton = () => {
  return (
    <div className="animate-pulse space-y-4 mt-8">
      {/* Table header */}
      <div className="h-10 bg-gray-200 rounded w-full"></div>

      {/* Table rows */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex space-x-4 items-center bg-white border rounded shadow p-4"
        >
          <div className="h-4 bg-gray-200 rounded w-1/12"></div>
          <div className="h-4 bg-gray-200 rounded w-2/12"></div>
          <div className="h-4 bg-gray-200 rounded w-2/12"></div>
          <div className="h-4 bg-gray-200 rounded w-1/12"></div>
          <div className="h-4 bg-gray-200 rounded w-3/12"></div>
          <div className="h-4 bg-gray-200 rounded w-1/12"></div>
          <div className="h-4 bg-gray-200 rounded w-2/12"></div>
        </div>
      ))}
    </div>
  );
};

export default DispatchTableSkeleton;
