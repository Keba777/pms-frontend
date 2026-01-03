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
      <div className="text-center text-destructive mt-10">Task not found.</div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <div className="flex items-center space-x-4">
        <button
          className="text-muted-foreground hover:text-foreground flex items-center p-2 bg-white border-2 border-border rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
          onClick={() => router.push("/tasks")}
        >
          <ArrowLeft className="w-5 h-5 mr-2 transition-transform duration-200 transform hover:translate-x-2" />
          <span className="text-lg font-semibold transition-all duration-300">
            Back to Tasks
          </span>
        </button>
      </div>

      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mt-6 break-words leading-tight">
        {task.task_name}
      </h1>
      {task.description && (
        <p className="text-muted-foreground mt-3 text-base sm:text-lg leading-relaxed">{task.description}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border border-primary/20">
          {task.status}
        </span>
        <span className={`inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border ${task.priority === 'Critical' ? 'bg-destructive/10 text-destructive border-destructive/20' :
          task.priority === 'High' ? 'bg-orange-100 text-orange-700 border-orange-200' :
            'bg-yellow-100 text-yellow-700 border-yellow-200'
          }`}>
          {task.priority} Priority
        </span>
      </div>

      <div className="w-full mt-10">
        <div className="bg-muted p-5 sm:p-8 rounded-xl shadow-sm border border-border">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-6 text-center lg:text-left border-b border-border pb-4">
            Task Specifications
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Start Date</span>
              <span className="text-foreground font-semibold">{new Date(task.start_date).toLocaleDateString()}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">End Date</span>
              <span className="text-foreground font-semibold">{new Date(task.end_date).toLocaleDateString()}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Assigned Team</span>
              <span className="text-foreground font-semibold">
                {(task.assignedUsers ?? []).length > 0
                  ? task.assignedUsers?.map((user) => user.first_name).join(", ")
                  : "N/A"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Approval Status</span>
              <span className="text-foreground font-semibold">{task.approvalStatus}</span>
            </div>
            {task.progress !== undefined && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Completion Progress</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${task.progress}%` }} />
                  </div>
                  <span className="text-sm font-bold text-primary">{task.progress}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Attachments Section */}
          {(task.attachments && task.attachments.length > 0) && (
            <div className="mt-8 border-t border-border pt-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Attachments</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {task.attachments.map((url, index) => {
                  const fileName = url.split("/").pop() || `Attachment ${index + 1}`;
                  // Decode URI component if needed, though split pop usually works for basic filenames
                  const cleanFileName = decodeURIComponent(fileName);
                  return (
                    <li key={index} className="flex items-center p-3 bg-white border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <span className="mr-3 text-destructive">
                        {/* Simple File Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                      </span>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 hover:underline truncate flex-1">
                        {cleanFileName}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
      <h1 className="text-2xl font-semibold text-primary mb-6 mt-8">Task Workflow Logs</h1>
      <WorkflowLogTable entityType="Task" entityId={taskId} />
    </div>
  );
}
