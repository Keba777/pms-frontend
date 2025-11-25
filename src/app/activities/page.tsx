"use client";

import React, { useState } from "react";
import Link from "next/link";
import DataTableActivities from "@/components/activities/DataTableActivities";
import ActualActivityTable from "@/components/activities/ActualActivityTable";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import { useActivities } from "@/hooks/useActivities";
import ActivityTableSkeleton from "@/components/activities/ActivityTableSkeleton";
import { Activity } from "@/types/activity";
import { useSettingsStore } from "@/store/settingsStore";
import { formatDate } from "@/utils/dateUtils";

const ActivitiesPage = () => {
  const { data: activities, isLoading } = useActivities();
  const { useEthiopianDate } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<"planned" | "actual">("planned");

  // Planned columns
  const plannedColumns: Column<Activity>[] = [
    { header: "Activity Name", accessor: "activity_name" },
    { header: "Priority", accessor: "priority" },
    { header: "Quantity", accessor: "quantity" },
    { header: "Unit", accessor: "unit" },
    { header: "Start Date", accessor: (row) => formatDate(row.start_date, useEthiopianDate) },
    { header: "End Date", accessor: (row) => formatDate(row.end_date, useEthiopianDate) },
    { header: "Status", accessor: "status" },
    { header: "Approval", accessor: "approvalStatus" },
  ];

  // Actual columns
  const actualColumns: Column<Activity>[] = [
    { header: "Activity Name", accessor: "activity_name" },
    { header: "Priority", accessor: "priority" },
    { header: "Actual Quantity", accessor: (row) => row.actuals?.quantity ?? "N/A" },
    { header: "Actual Unit", accessor: (row) => row.actuals?.unit ?? "N/A" },
    { header: "Actual Start Date", accessor: (row) => row.actuals?.start_date ? formatDate(row.actuals.start_date, useEthiopianDate) : "N/A" },
    { header: "Actual End Date", accessor: (row) => row.actuals?.end_date ? formatDate(row.actuals.end_date, useEthiopianDate) : "N/A" },
    { header: "Actual Progress", accessor: (row) => `${row.actuals?.progress ?? 0}%` },
    { header: "Actual Status", accessor: (row) => row.actuals?.status ?? "N/A" },
    { header: "Actual Labor Cost", accessor: (row) => row.actuals?.labor_cost ?? "N/A" },
    { header: "Actual Material Cost", accessor: (row) => row.actuals?.material_cost ?? "N/A" },
    { header: "Actual Equipment Cost", accessor: (row) => row.actuals?.equipment_cost ?? "N/A" },
    { header: "Actual Total Cost", accessor: (row) => row.actuals?.total_cost ?? "N/A" },
  ];

  // Prepare actual data
  const actualData = activities?.map(activity => ({
    ...activity,
    actuals: activity.actuals || {
      quantity: null,
      unit: null,
      start_date: null,
      end_date: null,
      progress: null,
      status: null,
      labor_cost: null,
      material_cost: null,
      equipment_cost: null,
      total_cost: null,
      work_force: null,
      machinery_list: null,
      materials_list: null,
    }
  })) || [];

  if (isLoading) {
    return <ActivityTableSkeleton />;
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-5 mt-8">
        <nav aria-label="breadcrumb">
          <ol className="flex space-x-2 text-sm font-semibold">
            <li>
              <Link href="/" className="hover:underline flex items-center">
                Home
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-800">Activities</li>
          </ol>
        </nav>
      </div>

      <GenericDownloads
        data={activities || []}
        title="Planned Activities"
        columns={plannedColumns}
        secondTable={{
          data: actualData,
          title: "Actual Activities",
          columns: actualColumns,
        }}
      />

      <div className="rounded-lg border border-gray-200 mt-4">
        {/* Tabs Navigation moved below TopBarActions */}
        <div className="flex space-x-4  mb-4 p-3">
          <button
            onClick={() => setActiveTab("planned")}
            className={`py-2 px-4 focus:outline-none ${
              activeTab === "planned"
                ? "border-b-2 border-blue-500 font-medium"
                : "text-gray-600"
            }`}
          >
            Planned
          </button>
          <button
            onClick={() => setActiveTab("actual")}
            className={`py-2 px-4 focus:outline-none ${
              activeTab === "actual"
                ? "border-b-2 border-blue-500 font-medium"
                : "text-gray-600"
            }`}
          >
            Actual
          </button>
        </div>

        {activeTab === "planned" ? (
          <DataTableActivities />
        ) : (
          <ActualActivityTable />
        )}
      </div>
    </div>
  );
};

export default ActivitiesPage;
