"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useActivityStore } from "@/store/activityStore";
import { Activity } from "@/types/activity"; 

const ActivityDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const activities = useActivityStore((state) => state.activities);

  const activity = activities.find((p: Activity) => p.id === id);

  if (!activity) {
    return (
      <div className="text-center text-red-500 mt-10">
        Activity not found.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <div className="flex items-center space-x-4">
        <button
          className="text-gray-600 hover:text-gray-900 flex items-center p-2 bg-white border-2 border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          onClick={() => router.push("/activities")}
        >
          <ArrowLeft className="w-5 h-5 mr-2 transition-transform duration-200 transform hover:translate-x-2" />
          <span className="text-lg font-semibold transition-all duration-300">
            Back to Activities
          </span>
        </button>
      </div>

      <h1 className="text-5xl font-bold text-cyan-800 mt-4">
        {activity.activity_name}
      </h1>
      {activity.description && (
        <p className="text-gray-600 mt-2">{activity.description}</p>
      )}

      <div className="mt-4">
        <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
          {activity.status}
        </span>
      </div>

      <div className="lg:w-2/3 mt-6 lg:mt-0 flex justify-center">
        <div className="w-full bg-gray-50 p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4 text-center">
            Activity Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Priority */}
            <div className="flex items-center">
              <span className="bg-yellow-300 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold">
                Priority: {activity.priority}
              </span>
            </div>

            {/* Start Date */}
            <div className="flex items-center">
              <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                Start Date:{" "}
                {new Date(activity.start_date).toLocaleDateString()}
              </span>
            </div>

            {/* End Date */}
            <div className="flex items-center">
              <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                End Date: {new Date(activity.end_date).toLocaleDateString()}
              </span>
            </div>

            {/* Assigned To */}
            <div className="flex items-center">
              <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold">
                Assigned to: {activity.unit}
              </span>
            </div>

            {/* Approval Status */}
            <div className="flex items-center">
              <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold">
                Approval Status: {activity.approvalStatus}
              </span>
            </div>

            {/* Progress */}
            {activity.progress !== undefined && (
              <div className="flex items-center">
                <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold">
                  Progress: {activity.progress}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetailPage;
