"use client";

import React, { useState } from "react";
import { useTask } from "@/hooks/useTasks";
import ActivityTable from "@/components/master-schedule/ActivityTable";
import ActualActivityTable from "@/components/master-schedule/ActualActivityTable";
import { Activity, CreateActivityInput } from "@/types/activity";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import {
  FilterField,
  FilterValues,
  GenericFilter,
  Option,
} from "@/components/common/GenericFilter";
import GenericImport, { ImportColumn } from "@/components/common/GenericImport";
import { toast } from "react-toastify";
import { formatDate, getDateDuration } from "@/utils/helper";
import { useCreateActivity } from "@/hooks/useActivities";
import { useParams } from "next/navigation";

const TaskActivityPage: React.FC = () => {
  const params = useParams();
  const taskId = params.taskId as string;
  const { data: task, isLoading, isError } = useTask(taskId);
  const [activeTab, setActiveTab] = useState<"planned" | "actual">("planned");
  const { mutateAsync: createActivityAsync } = useCreateActivity(() => { });

  const [filterValues, setFilterValues] = useState<FilterValues>({});

  // Filter activities by search term
  const activities = task?.activities as Activity[];

  const priorityOptions: Option<string>[] = [
    { label: "Low", value: "Low" },
    { label: "Medium", value: "Medium" },
    { label: "High", value: "High" },
    { label: "Critical", value: "Critical" },
  ];
  const statusOptions: Option<string>[] = [
    { label: "Not Started", value: "Not Started" },
    { label: "In Progress", value: "In Progress" },
    { label: "Completed", value: "Completed" },
  ];

  // Filter fields
  const filterFields: FilterField<string>[] = [
    {
      name: "activity_name",
      label: "Activity Name",
      type: "text",
      placeholder: "Search by name…",
    },
    {
      name: "priority",
      label: "Priority",
      type: "select",
      options: priorityOptions,
    },
    { name: "status", label: "Status", type: "select", options: statusOptions },
  ];

  // Filtered list
  const filteredActivities = activities?.filter((act) => {
    let matches = true;
    if (filterValues.activity_name) {
      matches =
        matches &&
        act.activity_name
          .toLowerCase()
          .includes((filterValues.activity_name as string).toLowerCase());
    }
    if (filterValues.priority) {
      matches = matches && act.priority === filterValues.priority;
    }
    if (filterValues.status) {
      matches = matches && act.status === filterValues.status;
    }

    return matches;
  });

  // Download columns setup, including "Remaining"
  const downloadColumns: Column<Activity>[] = [
    { header: "Activity", accessor: "activity_name" },
    { header: "Unit", accessor: "unit" },
    { header: "Quantity", accessor: (row) => row.quantity },
    { header: "Start Date", accessor: (row) => formatDate(row.start_date) },
    { header: "End Date", accessor: (row) => formatDate(row.end_date) },
    {
      header: "Duration",
      accessor: (row) => getDateDuration(row.start_date, row.end_date),
    },
    {
      header: "Remaining",
      accessor: (row) =>
        getDateDuration(new Date().toISOString(), row.end_date),
    },
    {
      header: "Materials",
      accessor: (row) =>
        row.requests?.reduce((sum, req) => sum + (req.materialCount || 0), 0) ||
        0,
    },
    {
      header: "Equipments",
      accessor: (row) =>
        row.requests?.reduce(
          (sum, req) => sum + (req.equipmentCount || 0),
          0
        ) || 0,
    },
    {
      header: "Labors",
      accessor: (row) =>
        row.requests?.reduce((sum, req) => sum + (req.laborCount || 0), 0) || 0,
    },
    { header: "Resource", accessor: (row) => row.resource?.toString() ?? "" },
  ];

  // Activity import configuration
  const importColumns: ImportColumn<CreateActivityInput>[] = [
    { header: "Activity", accessor: "activity_name", type: "string" },
    { header: "Priority", accessor: "priority", type: "string" },
    { header: "Unit", accessor: "unit", type: "string" },
    { header: "Quantity", accessor: "quantity", type: "number" },
    { header: "Start Date", accessor: "start_date", type: "date" },
    { header: "End Date", accessor: "end_date", type: "date" },
    { header: "Status", accessor: "status", type: "string" },
  ];

  const requiredAccessors: (keyof CreateActivityInput)[] = [
    "activity_name",
    "priority",
    "unit",
    "quantity",
    "start_date",
    "end_date",
    "status",
  ];

  const handleActivityImport = async (data: CreateActivityInput[]) => {
    try {
      // Validate priority and status values
      const validPriorities = ["Critical", "High", "Medium", "Low"];
      const validStatuses = [
        "Not Started",
        "Started",
        "InProgress",
        "Canceled",
        "Onhold",
        "Completed",
      ];

      for (let i = 0; i < data.length; i++) {
        const activity = data[i];
        if (!validPriorities.includes(activity.priority)) {
          toast.error(
            `Invalid priority in row ${i + 2
            }. Must be one of: ${validPriorities.join(", ")}`
          );
          return;
        }
        if (!validStatuses.includes(activity.status)) {
          toast.error(
            `Invalid status in row ${i + 2
            }. Must be one of: ${validStatuses.join(", ")}`
          );
          return;
        }
        // Provide default for description and set task_id
        activity.task_id = taskId;
        activity.description = activity.description || "Imported activity";
      }

      await Promise.all(data.map((activity) => createActivityAsync(activity)));
      toast.success("Activities imported and created successfully!");
    } catch (error) {
      toast.error("Error importing and creating activities");
      console.error("Import error:", error);
    }
  };

  const handleError = (error: string) => {
    toast.error(error);
  };

  if (isLoading) return <div>Loading task...</div>;
  if (isError || !task) return <div>Error loading task.</div>;

  return (
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      <div className="flex flex-col gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
        <h1 className="text-xl sm:text-2xl font-black text-cyan-800 uppercase tracking-tight mb-2">{task.task_name}</h1>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:w-auto">
            <GenericImport<CreateActivityInput>
              expectedColumns={importColumns}
              requiredAccessors={requiredAccessors}
              onImport={handleActivityImport}
              title="Activities"
              onError={handleError}
            />
          </div>
          <div className="w-full sm:w-auto">
            <GenericDownloads
              data={filteredActivities}
              title="Activities"
              columns={downloadColumns}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <GenericFilter fields={filterFields} onFilterChange={setFilterValues} />
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-100 overflow-x-auto no-scrollbar">
        <nav className="-mb-px flex space-x-2 sm:space-x-8 min-w-max">
          <button
            onClick={() => setActiveTab("planned")}
            className={`whitespace-nowrap px-4 py-3 text-sm font-black uppercase tracking-widest transition-all ${activeTab === "planned"
                ? "border-b-4 border-cyan-600 text-cyan-700 bg-cyan-50/50"
                : "text-gray-400 hover:text-gray-600 border-b-4 border-transparent"
              }`}
          >
            Planned Activities
          </button>
          <button
            onClick={() => setActiveTab("actual")}
            className={`whitespace-nowrap px-4 py-3 text-sm font-black uppercase tracking-widest transition-all ${activeTab === "actual"
                ? "border-b-4 border-cyan-600 text-cyan-700 bg-cyan-50/50"
                : "text-gray-400 hover:text-gray-600 border-b-4 border-transparent"
              }`}
          >
            Actual Activities
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "planned" ? (
        <ActivityTable
          taskId={task.id}
          filteredActivities={filteredActivities}
        />
      ) : (
        <ActualActivityTable taskId={task.id} />
      )}
    </div>
  );
};

export default TaskActivityPage;
