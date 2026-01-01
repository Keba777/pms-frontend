"use client";

import React, { useState } from "react";
import Link from "next/link";
import DataTableActivities from "@/components/activities/DataTableActivities";
import ActualActivityTable from "@/components/activities/ActualActivityTable";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import { useActivities } from "@/hooks/useActivities";
import ActivityTableSkeleton from "@/components/activities/ActivityTableSkeleton";
import { Activity } from "@/types/activity";
import { formatDate } from "@/utils/dateUtils";

const ActivitiesPage = () => {
  const { data: activities, isLoading } = useActivities();
  const [activeTab, setActiveTab] = useState<"planned" | "actual">("planned");

  // Planned columns
  const plannedColumns: Column<Activity>[] = [
    { header: "Activity Name", accessor: "activity_name" },
    { header: "Priority", accessor: "priority" },
    { header: "Quantity", accessor: "quantity" },
    { header: "Unit", accessor: "unit" },
    { header: "Start Date", accessor: (row) => formatDate(row.start_date) },
    { header: "End Date", accessor: (row) => formatDate(row.end_date) },
    { header: "Status", accessor: "status" },
    { header: "Approval", accessor: "approvalStatus" },
  ];

  // Actual columns
  const actualColumns: Column<Activity>[] = [
    { header: "Activity Name", accessor: "activity_name" },
    { header: "Priority", accessor: "priority" },
    { header: "Actual Quantity", accessor: (row) => row.actuals?.quantity ?? "N/A" },
    { header: "Actual Unit", accessor: (row) => row.actuals?.unit ?? "N/A" },
    { header: "Actual Start Date", accessor: (row) => row.actuals?.start_date ? formatDate(row.actuals.start_date) : "N/A" },
    { header: "Actual End Date", accessor: (row) => row.actuals?.end_date ? formatDate(row.actuals.end_date) : "N/A" },
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
    <div className="p-4">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row items-baseline justify-between mb-6 mt-4 gap-4">
        <nav aria-label="breadcrumb">
          <ol className="flex items-center space-x-2 text-sm font-medium">
            <li>
              <Link href="/" className="text-bs-primary hover:underline flex items-center">
                Home
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-bold">Activities</li>
          </ol>
        </nav>
        <div className="flex items-baseline gap-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
            Project Activities
          </h1>
          <span className="text-sm text-gray-400 font-medium">({activities?.length || 0} total)</span>
        </div>
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

      {/* Tabs Navigation */}
      <div className="mt-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-4 overflow-x-auto no-scrollbar whitespace-nowrap">
          <button
            onClick={() => setActiveTab("planned")}
            className={`px-6 py-3 text-sm font-medium transition-all ${activeTab === "planned"
              ? "border-b-2 border-emerald-600 text-emerald-600"
              : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
              }`}
          >
            Planned Activities
          </button>
          <button
            onClick={() => setActiveTab("actual")}
            className={`px-6 py-3 text-sm font-medium transition-all ${activeTab === "actual"
              ? "border-b-2 border-emerald-600 text-emerald-600"
              : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
              }`}
          >
            Actual Activities
          </button>
        </nav>
      </div>

      <div className="mt-6">

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
