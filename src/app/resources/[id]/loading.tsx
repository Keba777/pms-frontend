"use client";

import React from "react";

/**
 * A reusable skeleton placeholder for loading states in the ClientActivityResourcesPage.
 * Displays pulsating gray blocks in place of the header, project/task info, tabs, and content.
 */
export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header skeleton */}
      <div className="h-12 bg-gray-200 rounded-lg w-1/3 mx-auto" />

      {/* Project & Task Info skeleton */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-24 bg-gray-200 rounded-xl" />
        <div className="h-24 bg-gray-200 rounded-xl" />
      </div>

      {/* Tabs skeleton */}
      <div className="flex space-x-2 mt-6">
        <div className="h-8 w-24 bg-gray-200 rounded" />
        <div className="h-8 w-24 bg-gray-200 rounded" />
        <div className="h-8 w-24 bg-gray-200 rounded" />
      </div>

      {/* Content skeleton */}
      <div className="mt-4 space-y-3">
        <div className="h-6 bg-gray-200 rounded" />
        <div className="h-6 bg-gray-200 rounded" />
        <div className="h-6 bg-gray-200 rounded" />
        <div className="h-6 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
