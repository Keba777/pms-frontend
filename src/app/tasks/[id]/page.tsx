"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useTaskStore } from "@/store/taskStore";
import { Task } from "@/types/task";
import WorkflowLogTable from "@/components/common/WorkflowLogTable";

export default function TaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  const tasks = useTaskStore((state) => state.tasks);
  const task = tasks.find((t: Task) => t.id === taskId);

  if (!task) {
    return (
      <div className="text-center text-red-500 mt-10">Task not found.</div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <div className="flex items-center space-x-4">
        <button
          className="text-gray-600 hover:text-gray-900 flex items-center p-2 bg-white border-2 border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          onClick={() => router.push("/tasks")}
        >
          <ArrowLeft className="w-5 h-5 mr-2 transition-transform duration-200 transform hover:translate-x-2" />
          <span className="text-lg font-semibold transition-all duration-300">
            Back to Tasks
          </span>
        </button>
      </div>

      <h1 className="text-5xl font-bold text-cyan-800 mt-4">
        {task.task_name}
      </h1>
      {task.description && (
        <p className="text-gray-600 mt-2">{task.description}</p>
      )}

      <div className="mt-4">
        <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
          {task.status}
        </span>
      </div>

      <div className="lg:w-2/3 mt-6 lg:mt-0 flex justify-center">
        <div className="w-full bg-gray-50 p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4 text-center">
            Task Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Priority */}
            <div className="flex items-center">
              <span className="bg-yellow-300 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold">
                Priority: {task.priority}
              </span>
            </div>

            {/* Start Date */}
            <div className="flex items-center">
              <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                Start Date: {new Date(task.start_date).toLocaleDateString()}
              </span>
            </div>

            {/* End Date */}
            <div className="flex items-center">
              <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                End Date: {new Date(task.end_date).toLocaleDateString()}
              </span>
            </div>

            {/* Assigned To */}
            <div className="flex items-center">
              <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold">
                Assigned to:{" "}
                {(task.assignedUsers ?? []).length > 0
                  ? task.assignedUsers
                    ?.map((user) => user.first_name)
                    .join(", ")
                  : "N/A"}
              </span>
            </div>

            {/* Approval Status */}
            <div className="flex items-center">
              <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold">
                Approval Status: {task.approvalStatus}
              </span>
            </div>

            {/* Progress */}
            {task.progress !== undefined && (
              <div className="flex items-center">
                <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold">
                  Progress: {task.progress}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <h1 className="text-2xl font-semibold text-cyan-700 mb-6 mt-8">Task Workflow Logs</h1>
      <WorkflowLogTable entityType="Task" entityId={taskId} />
    </div>
  );
}
