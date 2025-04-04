"use client";

import React from "react";

const ProjectCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow p-5 relative animate-pulse h-[350px]">
      <div className="flex justify-between mb-3">
        {/* Title placeholder */}
        <div className="h-6 w-1/2 bg-gray-300 rounded"></div>
        <div className="flex items-center space-x-2">
          {/* Action icons placeholder */}
          <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
          <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
        </div>
      </div>
      {/* Budget placeholder */}
      <div className="h-4 w-3/4 bg-gray-300 rounded mb-3"></div>
      <div className="flex justify-between items-center mb-3">
        {/* Status placeholder */}
        <div className="h-4 w-1/3 bg-gray-300 rounded"></div>
        {/* Priority placeholder */}
        <div className="h-4 w-1/3 bg-gray-300 rounded"></div>
      </div>
      {/* Task info placeholder */}
      <div className="h-3 w-full bg-gray-300 rounded mb-2"></div>
      <div className="h-3 w-1/2 bg-gray-300 rounded mb-2"></div>
      {/* Extra placeholders to increase height */}
      <div className="h-4 w-full bg-gray-300 rounded mb-2"></div>
      <div className="h-4 w-full bg-gray-300 rounded mb-2"></div>
      <div className="h-4 w-3/4 bg-gray-300 rounded mb-2"></div>
    </div>
  );
};

export default ProjectCardSkeleton;
