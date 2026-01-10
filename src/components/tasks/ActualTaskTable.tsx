"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { FaEdit, FaEye } from "react-icons/fa";
import {
  useTasks,
  useUpdateTaskActuals,
} from "@/hooks/useTasks";
import { Task, TaskActuals } from "@/types/task";
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
import { toast } from "react-toastify";
import ProfileAvatar from "../common/ProfileAvatar";

interface ExtendedTask extends Task {
  actuals: TaskActuals;
}

interface ActualTaskTableProps {
  externalFilters?: Record<string, any>;
}

const statusBadgeClasses: Record<string, string> = {
  "Not Started": "bg-gray-100 text-gray-800",
  Started: "bg-blue-100 text-blue-800",
  InProgress: "bg-yellow-100 text-yellow-800",
  Onhold: "bg-amber-100 text-amber-800",
  Canceled: "bg-red-100 text-red-800",
  Completed: "bg-green-100 text-green-800",
};

const priorityBadgeClasses: Record<string, string> = {
  Critical: "bg-red-100 text-red-800",
  High: "bg-orange-100 text-orange-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-green-100 text-green-800",
};

const ActualTaskTable: React.FC<ActualTaskTableProps> = ({ externalFilters }) => {
  const { data: tasks, isLoading, isError } = useTasks();
  const { mutateAsync: updateTaskActuals } = useUpdateTaskActuals();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const defaultActuals: TaskActuals = {
    start_date: null,
    end_date: null,
    progress: null,
    status: null,
    budget: null,
  };

  const extendedTasks: ExtendedTask[] = useMemo(() => {
    if (!tasks) return [];
    return tasks.map((t) => ({
      ...t,
      actuals: { ...defaultActuals, ...(t.actuals || {}) },
    }));
  }, [tasks]);

  const filteredData = useMemo(() => {
    return extendedTasks.filter((t) => {
      const matchesLocalSearch =
        !searchTerm ||
        t.task_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.project?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.project?.clientInfo?.companyName?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!externalFilters) return matchesLocalSearch;

      const matchesSearch =
        !externalFilters.task_name ||
        t.task_name.toLowerCase().includes(externalFilters.task_name.toLowerCase());

      const matchesAdvancedStatus =
        !externalFilters.status ||
        externalFilters.status.length === 0 ||
        externalFilters.status.includes(t.actuals?.status || t.status);

      const matchesAdvancedPriority =
        !externalFilters.priority ||
        externalFilters.priority.length === 0 ||
        externalFilters.priority.includes(t.priority);

      const matchesDateRange = (() => {
        if (!externalFilters.dateRange?.from) return true;
        const taskStart = new Date(t.actuals?.start_date || t.start_date);
        const taskEnd = new Date(t.actuals?.end_date || t.end_date);
        const filterStart = new Date(externalFilters.dateRange.from);
        const filterEnd = externalFilters.dateRange.to ? new Date(externalFilters.dateRange.to) : filterStart;
        return taskStart <= filterEnd && taskEnd >= filterStart;
      })();

      return matchesLocalSearch && matchesSearch && matchesAdvancedStatus && matchesAdvancedPriority && matchesDateRange;
    });
  }, [extendedTasks, searchTerm, externalFilters]);

  const sanitizeActualsForApi = (raw: any): TaskActuals => {
    const safe = { ...(raw || {}) } as any;
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

  const handleSaveActuals = async (tasksToUpdate: ExtendedTask[]) => {
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

  const columns: ColumnConfig<ExtendedTask>[] = [
    {
      key: "id",
      label: "ID",
      render: (_, index) => `TK${String(index + 1).padStart(3, "0")}`,
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
      key: "assignedUsers",
      label: "Assigned To",
      render: (t) => {
        const users = t.assignedUsers || [];
        if (!users.length) return "---";
        return (
          <div className="flex items-center gap-1">
            {users.slice(0, 3).map((u) => (
              <div key={u.id} className="w-8 h-8 rounded-full overflow-hidden border border-white shadow-sm" title={u.first_name}>
                <ProfileAvatar user={u} />
              </div>
            ))}
            {users.length > 3 && (
              <span className="text-xs text-gray-500 font-medium h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                +{users.length - 3}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "priority",
      label: "Priority",
      render: (t) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${priorityBadgeClasses[t.priority] || "bg-gray-100 text-gray-800"}`}
        >
          {t.priority}
        </span>
      ),
    },
    {
      key: "actuals.start_date",
      label: "Start Date",
      editable: true,
      inputType: "date",
      render: (t) => (t.actuals?.start_date ? formatDate(t.actuals.start_date) : "---"),
    },
    {
      key: "actuals.end_date",
      label: "End Date",
      editable: true,
      inputType: "date",
      render: (t) => (t.actuals?.end_date ? formatDate(t.actuals.end_date) : "---"),
    },
    {
      key: "duration",
      label: "Duration",
      render: (t) => {
        const start = t.actuals?.start_date;
        const end = t.actuals?.end_date;
        if (!start || !end) return "---";
        const diff = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 3600 * 24));
        return `${diff} Days`;
      },
    },
    {
      key: "remaining",
      label: "Remaining",
      render: (t) => {
        const end = t.actuals?.end_date;
        if (!end) return "---";
        const diff = Math.ceil((new Date(end).getTime() - Date.now()) / (1000 * 3600 * 24));
        return `${diff > 0 ? diff : 0} Days`;
      },
    },
    {
      key: "actuals.budget",
      label: "Budget",
      editable: true,
      inputType: "number",
      render: (t) => t.actuals?.budget ?? t.budget ?? 0,
    },
    {
      key: "actuals.progress",
      label: "Progress",
      editable: true,
      inputType: "number",
      render: (t) => (
        <div className="relative h-6 w-full bg-gray-200 rounded overflow-hidden text-center text-[10px] leading-6 font-bold">
          <div
            className="absolute h-full bg-primary flex items-center justify-center text-white"
            style={{ width: `${t.actuals?.progress || 0}%` }}
          >
            {t.actuals?.progress || 0}%
          </div>
          <span className="relative z-10">{t.actuals?.progress || 0}%</span>
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
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusBadgeClasses[t.actuals?.status || t.status] || "bg-gray-100 text-gray-800"}`}
        >
          {t.actuals?.status || t.status}
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
      data={filteredData}
      columns={columns}
      isLoading={isLoading}
      isError={isError}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      placeholder="Search tasks..."
      isEditable={true}
      onSave={handleSaveActuals}
      onRowSave={async (t) => handleSaveActuals([t])}
    />
  );
};

export default ActualTaskTable;
