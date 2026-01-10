"use client";

import React, { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { FaEdit, FaEye } from "react-icons/fa";
import { Task, TaskActuals } from "@/types/task";
import {
  useUpdateTaskActuals,
} from "@/hooks/useTasks";
import { toast } from "react-toastify";
import { ReusableTable, ColumnConfig } from "../common/ReusableTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/dateUtils";
import Link from "next/link";

interface ActualTaskTableProps {
  tasks: Task[];
  projectId?: string;
}

const statusBadgeClasses: Record<string, string> = {
  "Not Started": "bg-gray-100 text-gray-800",
  Started: "bg-blue-100 text-blue-800",
  InProgress: "bg-yellow-100 text-yellow-800",
  Onhold: "bg-amber-100 text-amber-800",
  Canceled: "bg-red-100 text-red-800",
  Completed: "bg-green-100 text-green-800",
};

export default function ActualTaskTable({
  tasks,
  projectId,
}: ActualTaskTableProps) {
  const router = useRouter();
  const { mutateAsync: updateTaskActuals } = useUpdateTaskActuals();
  const [searchTerm, setSearchTerm] = useState("");

  const defaultActuals: TaskActuals = {
    start_date: null,
    end_date: null,
    progress: null,
    status: null,
    budget: null,
  };

  const extendedTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.map((t) => ({
      ...t,
      actuals: { ...defaultActuals, ...(t.actuals || {}) },
    }));
  }, [tasks]);

  const sanitizeActualsForApi = (raw: any): TaskActuals => {
    const safe: any = { ...(raw || {}) };
    const toIso = (v: any) => {
      if (!v && v !== 0) return null;
      try {
        const d = new Date(v);
        if (isNaN(d.getTime())) return null;
        return d.toISOString();
      } catch {
        return null;
      }
    };
    safe.start_date = toIso(safe.start_date);
    safe.end_date = toIso(safe.end_date);

    const toNumberOrNull = (v: any) => {
      if (v === null || v === undefined || v === "") return null;
      const n = Number(v);
      return isNaN(n) ? null : n;
    };
    safe.progress = toNumberOrNull(safe.progress);
    safe.budget = toNumberOrNull(safe.budget);
    safe.status = safe.status ?? null;
    return safe as TaskActuals;
  };

  const handleSaveActuals = async (tasksToUpdate: Task[]) => {
    try {
      await Promise.all(
        tasksToUpdate.map((t) => {
          const sanitized = sanitizeActualsForApi(t.actuals);
          return updateTaskActuals({ id: t.id, actuals: sanitized });
        })
      );
      toast.success("Task actuals updated successfully");
    } catch (error) {
      console.error("Failed to update task actuals:", error);
      toast.error("Failed to update task actuals");
    }
  };

  const columns: ColumnConfig<Task>[] = [
    {
      key: "id",
      label: "ID",
      render: (_, index) => index + 1,
    },
    {
      key: "task_name",
      label: "Task",
      render: (t) => (
        <Link href={`/tasks/${t.id}`} className="text-primary hover:underline font-medium">
          {t.task_name}
        </Link>
      ),
    },
    {
      key: "actuals.start_date",
      label: "Start Date",
      editable: true,
      inputType: "date",
      render: (t) => (t.actuals?.start_date ? formatDate(t.actuals.start_date) : "N/A"),
    },
    {
      key: "actuals.end_date",
      label: "End Date",
      editable: true,
      inputType: "date",
      render: (t) => (t.actuals?.end_date ? formatDate(t.actuals.end_date) : "N/A"),
    },
    {
      key: "duration",
      label: "Duration",
      render: (t) => {
        const start = t.actuals?.start_date;
        const end = t.actuals?.end_date;
        if (!start || !end) return "N/A";
        const diff = Math.ceil(
          (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 3600 * 24)
        );
        return isNaN(diff) ? "N/A" : `${diff} Days`;
      },
    },
    {
      key: "remaining",
      label: "Remaining",
      render: (t) => {
        const end = t.actuals?.end_date;
        if (!end) return "N/A";
        const diff = Math.ceil((new Date(end).getTime() - Date.now()) / (1000 * 3600 * 24));
        return isNaN(diff) ? "N/A" : `${diff} Days`;
      },
    },
    {
      key: "actuals.budget",
      label: "Budget",
      editable: true,
      inputType: "number",
      render: (t) => t.actuals?.budget ?? "N/A",
    },
    {
      key: "actuals.progress",
      label: "Progress",
      editable: true,
      inputType: "number",
      render: (t) => (
        <div className="relative h-6 w-full bg-gray-200 rounded overflow-hidden">
          <div
            className="absolute h-full bg-primary flex items-center justify-center text-[10px] text-white font-bold transition-all"
            style={{ width: `${t.actuals?.progress || 0}%` }}
          >
            {t.actuals?.progress || 0}%
          </div>
        </div>
      ),
    },
    {
      key: "actuals.status",
      label: "Status",
      editable: true,
      inputType: "select",
      options: [
        { label: "Not Started", value: "Not Started" },
        { label: "Started", value: "Started" },
        { label: "InProgress", value: "InProgress" },
        { label: "Onhold", value: "Onhold" },
        { label: "Canceled", value: "Canceled" },
        { label: "Completed", value: "Completed" },
      ],
      render: (t) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusBadgeClasses[t.actuals?.status || ""] || "bg-gray-100 text-gray-800"
            }`}
        >
          {t.actuals?.status || "N/A"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (t, _, { toggleEdit }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="bg-primary text-white hover:bg-primary/90 h-8 px-3 text-xs">
              Action <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toggleEdit()}>
              <FaEdit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/tasks/${t.id}`)}>
              <FaEye className="mr-2 h-4 w-4" /> View
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <ReusableTable
      title="Actual Tasks"
      data={extendedTasks}
      columns={columns}
      isLoading={false}
      isError={false}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      placeholder="Search tasks..."
      isEditable={true}
      onSave={handleSaveActuals}
      onRowSave={async (t) => handleSaveActuals([t])}
    />
  );
}
