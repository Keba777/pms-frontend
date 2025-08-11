"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useTodoStore } from "@/store/todoStore";
import { Todo } from "@/types/todo";

interface ClientTodoDetailProps {
  todoId: string;
}

export default function ClientTodoDetails({ todoId }: ClientTodoDetailProps) {
  const router = useRouter();
  const todos = useTodoStore((state) => state.todos);
  const todo = todos.find((t: Todo) => t.id === todoId);

  if (!todo) {
    return (
      <div className="text-center text-red-500 mt-10">Todo not found.</div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-gray-100 shadow-xl rounded-xl mt-6 lg:mt-8">
      <div className="flex items-center space-x-4">
        <button
          className="text-gray-600 hover:text-cyan-700 flex items-center p-2 bg-white border-2 border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50"
          onClick={() => router.push("/todos")} // Assuming route is /todos
        >
          <ArrowLeft className="w-5 h-5 mr-2 transition-transform duration-200 transform hover:translate-x-2" />
          <span className="text-lg font-semibold transition-all duration-300">
            Back to Todos
          </span>
        </button>
      </div>

      <h1 className="text-4xl sm:text-5xl font-bold text-cyan-700 mt-4">
        {todo.task}
      </h1>
      {todo.remark && <p className="text-gray-600 mt-2">{todo.remark}</p>}
      {todo.remainder && (
        <p className="text-gray-500 italic mt-1">{todo.remainder}</p>
      )}

      <div className="mt-4">
        <span className="inline-block bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-sm font-semibold">
          {todo.status}
        </span>
      </div>

      <div className="mt-6 flex justify-center">
        <div className="w-full bg-white p-6 sm:p-8 rounded-lg shadow-md">
          <h2 className="text-2xl sm:text-3xl font-semibold text-cyan-700 mb-4 text-center">
            Todo Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Priority */}
            <div className="flex items-center justify-center sm:justify-start">
              <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                Priority: {todo.priority}
              </span>
            </div>

            {/* Type */}
            <div className="flex items-center justify-center sm:justify-start">
              <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                Type: {todo.type}
              </span>
            </div>

            {/* Assigned By */}
            <div className="flex items-center justify-center sm:justify-start">
              <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                Assigned By:{" "}
                {todo.assignedBy ? todo.assignedBy.first_name : "N/A"}{" "}
                {/* Assuming User has first_name */}
              </span>
            </div>

            {/* Assigned To */}
            <div className="flex items-center justify-center sm:justify-start">
              <span className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                Assigned To:{" "}
                {(todo.assignedUsers ?? []).length > 0
                  ? todo.assignedUsers
                      ?.map((user) => user.first_name)
                      .join(", ")
                  : "N/A"}
              </span>
            </div>

            {/* Given Date */}
            <div className="flex items-center justify-center sm:justify-start">
              <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                Given Date: {new Date(todo.givenDate).toLocaleDateString()}
              </span>
            </div>

            {/* Due Date */}
            <div className="flex items-center justify-center sm:justify-start">
              <span className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                Due Date: {new Date(todo.dueDate).toLocaleDateString()}
              </span>
            </div>

            {/* Target */}
            <div className="flex items-center justify-center sm:justify-start">
              <span className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                Target: {new Date(todo.target).toLocaleDateString()}
              </span>
            </div>

            {/* Department */}
            <div className="flex items-center justify-center sm:justify-start">
              <span className="bg-teal-100 text-teal-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                Department: {todo.department ? todo.department.name : "N/A"}{" "}
                {/* Assuming Department has name */}
              </span>
            </div>

            {/* KPI */}
            <div className="flex items-center justify-center sm:justify-start">
              <span className="bg-pink-100 text-pink-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                KPI: {todo.kpi ? todo.kpi.score : "N/A"}{" "}
                {/* Assuming Kpi has name */}
              </span>
            </div>

            {/* Progress */}
            <div className="flex items-center justify-center sm:justify-start">
              <span className="bg-cyan-100 text-cyan-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                Progress: {todo.progress}%
              </span>
            </div>

            {/* Created At */}
            {todo.createdAt && (
              <div className="flex items-center justify-center sm:justify-start">
                <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                  Created At: {new Date(todo.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* Updated At */}
            {todo.updatedAt && (
              <div className="flex items-center justify-center sm:justify-start">
                <span className="bg-gray-200 text-gray-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                  Updated At: {new Date(todo.updatedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Attachments */}
          {todo.attachment && todo.attachment.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-cyan-700 mb-2">
                Attachments
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                {todo.attachment.map((attach, index) => (
                  <li key={index}>
                    <a
                      href={attach}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-600 hover:underline"
                    >
                      {attach.split("/").pop()}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Progress Updates - Simple list for now */}
          {todo.progressUpdates && todo.progressUpdates.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-cyan-700 mb-2">
                Progress Updates
              </h3>
              <ul className="space-y-2">
                {todo.progressUpdates.map((update, index) => (
                  <li
                    key={index}
                    className="bg-gray-50 p-3 rounded-md shadow-sm"
                  >
                    {/* Assuming TodoProgress has fields like date, progress, note */}
                    <p className="text-gray-700">
                      {update.createdAt
                        ? new Date(update.createdAt).toLocaleDateString()
                        : ""}{" "}
                      - {update.progress}%: {update.remark}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
