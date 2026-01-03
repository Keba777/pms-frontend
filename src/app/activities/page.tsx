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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GenericFilter, FilterField, FilterValues } from "@/components/common/GenericFilter";
import { Activity as ActivityIcon, ClipboardList } from "lucide-react";

const ActivitiesPage = () => {
  const { data: activities, isLoading } = useActivities();
  const [activeTab, setActiveTab] = useState<"planned" | "actual">("planned");
  const [filterValues, setFilterValues] = useState<FilterValues>({});

  const filterFields: FilterField[] = [
    {
      name: "activity_name",
      label: "Activity Name",
      type: "text",
      placeholder: "Search by activity name..."
    },
    {
      name: "status",
      label: "Status",
      type: "multiselect",
      options: [
        { label: "Not Started", value: "Not Started" },
        { label: "Started", value: "Started" },
        { label: "InProgress", value: "InProgress" },
        { label: "Onhold", value: "Onhold" },
        { label: "Completed", value: "Completed" },
        { label: "Canceled", value: "Canceled" },
      ],
      placeholder: "Filter by Status"
    },
    {
      name: "priority",
      label: "Priority",
      type: "multiselect",
      options: [
        { label: "Low", value: "Low" },
        { label: "Medium", value: "Medium" },
        { label: "High", value: "High" },
        { label: "Critical", value: "Critical" },
      ],
      placeholder: "Filter by Priority"
    },
    {
      name: "dateRange",
      label: "Date Range",
      type: "daterange"
    }
  ];

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

  return (
    <div className="p-4 bg-gray-50/50 min-h-screen">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row items-baseline justify-between mb-6 mt-4 gap-4">
        <nav aria-label="breadcrumb">
          <ol className="flex items-center space-x-2 text-sm font-medium">
            <li>
              <Link href="/" className="text-emerald-600 hover:underline flex items-center">
                Home
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-bold">Activities</li>
          </ol>
        </nav>
        <div className="flex items-baseline gap-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 uppercase tracking-tight">
            Project Activities
          </h1>
          <span className="text-sm text-gray-400 font-medium tracking-wide">({activities?.length || 0} total)</span>
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

      {/* Global Filtering Section */}
      <div className="mt-8">
        <GenericFilter fields={filterFields} onFilterChange={setFilterValues} />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="w-full mt-8">
        <div className="flex justify-start w-full mb-6 border-b border-gray-200 pb-2">
          <TabsList className="bg-muted p-1 rounded-full inline-flex h-auto">
            <TabsTrigger
              value="planned"
              className="flex items-center space-x-2 py-2 px-6 text-sm font-bold rounded-full transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground uppercase"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Planned Activities</span>
            </TabsTrigger>
            <TabsTrigger
              value="actual"
              className="flex items-center space-x-2 py-2 px-6 text-sm font-bold rounded-full transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground uppercase"
            >
              <ActivityIcon className="w-4 h-4" />
              <span>Actual Activities</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="planned" className="mt-6 outline-none">
          <div className="max-w-full overflow-hidden min-h-[400px]">
            <DataTableActivities externalFilters={filterValues} />
          </div>
        </TabsContent>
        <TabsContent value="actual" className="mt-6 outline-none">
          <div className="max-w-full overflow-hidden min-h-[400px]">
            <ActualActivityTable externalFilters={filterValues} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ActivitiesPage;
