"use client";

import React from "react";
import Link from "next/link";
import ProfileAvatar from "@/components/common/ProfileAvatar";
import { Todo } from "@/types/todo";
import { Department } from "@/types/department";

interface TodoCardProps {
  todo: Todo;
  departments: Department[];
}

const priorityBadgeClasses: Record<Todo["priority"], string> = {
  Urgent: "bg-destructive/10 text-destructive",
  High: "bg-orange-100 text-orange-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-primary/10 text-primary",
};

const statusBadgeClasses: Record<Todo["status"], string> = {
  "Not Started": "bg-muted text-muted-foreground",
  "In progress": "bg-yellow-100 text-yellow-800",
  Pending: "bg-orange-100 text-orange-800",
  Completed: "bg-primary/20 text-primary",
};

export default function TodoCard({ todo, departments }: TodoCardProps) {
  return (
    <div className="bg-background rounded-xl shadow-sm hover:shadow-lg hover:scale-[1.01] transition-all duration-300 border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-primary px-5 py-4 flex justify-between items-center">
        <Link
          href={`/todos/${todo.id}`}
          className="text-primary-foreground font-semibold text-lg tracking-wide hover:underline"
        >
          {todo.task}
        </Link>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${priorityBadgeClasses[todo.priority]
            }`}
        >
          {todo.priority || "-"}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-foreground">
          <InfoItem label="Type" value={todo.type || "-"} />
          <InfoItem
            label="Assigned By"
            value={todo.assignedBy?.first_name || "-"}
          />
          <div className="flex items-center gap-2">
            <span className="text-primary font-medium">Team:</span>
            {todo.assignedUsers?.length ? (
              <div className="flex -space-x-2">
                {todo.assignedUsers.map((user) => (
                  <ProfileAvatar key={user.id} user={user} />
                ))}
              </div>
            ) : (
              <span>N/A</span>
            )}
          </div>
          <InfoItem
            label="Department"
            value={
              todo.department?.name ||
              departments?.find((d) => d.id === todo.departmentId)?.name ||
              "-"
            }
          />

          <div className="flex items-center justify-between col-span-2">
            <div className="flex items-center gap-2">
              <span className="text-primary font-medium whitespace-nowrap">Given:</span>
              <span className="whitespace-nowrap">
                {todo.givenDate ? new Date(todo.givenDate).toLocaleDateString() : "-"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary font-medium whitespace-nowrap">Target:</span>
              <span className="whitespace-nowrap">
                {todo.target_date ? new Date(todo.target_date).toLocaleDateString() : "-"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary font-medium whitespace-nowrap">Due:</span>
              <span className="whitespace-nowrap">
                {todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : "-"}
              </span>
            </div>
          </div>
        </div>
        <InfoItem label="KPI" value={todo.kpi?.score || todo.kpiId || "-"} />

        {/* Status */}
        <div className="flex justify-between items-center mt-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadgeClasses[todo.status]
              }`}
          >
            {todo.status}
          </span>
          <span className="text-xs text-muted-foreground">
            {todo.progress || 0}% Complete
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${todo.progress || 0}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-primary font-medium">{label}:</span>
      <span>{value}</span>
    </div>
  );
}
