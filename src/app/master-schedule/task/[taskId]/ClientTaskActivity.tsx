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

interface ClientTaskActivityProps {
  taskId: string;
}

const ClientTaskActivity: React.FC<ClientTaskActivityProps> = ({ taskId }) => {
  const { data: task, isLoading, isError } = useTask(taskId);
  const [activeTab, setActiveTab] = useState<"planned" | "actual">("planned");
  const { mutateAsync: createActivityAsync } = useCreateActivity(() => {});

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
            `Invalid priority in row ${
              i + 2
            }. Must be one of: ${validPriorities.join(", ")}`
          );
          return;
        }
        if (!validStatuses.includes(activity.status)) {
          toast.error(
            `Invalid status in row ${
              i + 2
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
    <div>
      <div className="flex justify-end mb-4">
        <GenericImport<CreateActivityInput>
          expectedColumns={importColumns}
          requiredAccessors={requiredAccessors}
          onImport={handleActivityImport}
          title="Activities"
          onError={handleError}
        />
      </div>
      <GenericDownloads
        data={filteredActivities}
        title="Activities"
        columns={downloadColumns}
      />
      <div className="flex items-center justify-between">
        <GenericFilter fields={filterFields} onFilterChange={setFilterValues} />
      </div>

      <h1 className="text-2xl font-bold mb-4">{task.task_name}</h1>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-4">
          <button
            onClick={() => setActiveTab("planned")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "planned"
                ? "border-b-2 border-emerald-600 text-emerald-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Planned
          </button>
          <button
            onClick={() => setActiveTab("actual")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "actual"
                ? "border-b-2 border-emerald-600 text-emerald-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Actual
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

export default ClientTaskActivity;
