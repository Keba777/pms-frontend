import React from "react";

const RequestDeliveryTableSkeleton = () => {
  return (
    <div className="animate-pulse mt-8 space-y-4">
      {/* Table header */}
      <div className="h-10 bg-gray-200 rounded w-full"></div>

      {/* Table rows */}
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex space-x-4 items-center bg-white border rounded shadow p-4"
        >
          <div className="h-4 bg-gray-200 rounded w-1/12"></div>
          <div className="h-4 bg-gray-200 rounded w-2/12"></div>
          <div className="h-4 bg-gray-200 rounded w-2/12"></div>
          <div className="h-4 bg-gray-200 rounded w-1/12"></div>
          <div className="h-4 bg-gray-200 rounded w-2/12"></div>
          <div className="h-4 bg-gray-200 rounded w-1/12"></div>
          <div className="h-4 bg-gray-200 rounded w-2/12"></div>
        </div>
      ))}
    </div>
  );
};

export default RequestDeliveryTableSkeleton;
