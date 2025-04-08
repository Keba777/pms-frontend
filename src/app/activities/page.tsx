"use client";

import React from "react";
import Link from "next/link";
import DataTableActivities from "@/components/activities/DataTableActivities";
import TopBarActions from "@/components/activities/TopBarActions";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import { useActivityStore } from "@/store/activityStore";
import { Activity } from "@/types/activity";

const ActivitiesPage = () => {
  const { activities } = useActivityStore();

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

      <div className="rounded-lg border border-gray-200">
        <TopBarActions refetch={() => {}} />
        <DataTableActivities />
      </div>
    </div>
  );
};

export default ActivitiesPage;
