"use client";

import React, { useState } from "react";
import Link from "next/link";
import DataTableActivities from "@/components/activities/DataTableActivities";
import ActualActivityTable from "@/components/activities/ActualActivityTable";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import { useActivityStore } from "@/store/activityStore";
import { Activity } from "@/types/activity";

const ActivitiesPage = () => {
  const { activities } = useActivityStore();
  const [activeTab, setActiveTab] = useState("planned"); // default to Actual

  const columns: Column<Activity>[] = [
    { header: "Activity Name", accessor: "activity_name" },
    { header: "Priority", accessor: "priority" },
    { header: "Quantity", accessor: "quantity" },
    { header: "Unit", accessor: "unit" },
    { header: "Start Date", accessor: "start_date" },
    { header: "End Date", accessor: "end_date" },
    { header: "Status", accessor: "status" },
    { header: "Approval", accessor: "approvalStatus" },
  ];

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
        data={activities}
        title="Activities"
        columns={columns}
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
