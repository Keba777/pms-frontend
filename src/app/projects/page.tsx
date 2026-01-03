"use client";

import React, { useState } from "react";
import Link from "next/link";
import { List, PlusIcon, Grid } from "lucide-react";
import ProjectCard from "@/components/projects/ProjectCard";
import { useProjects, useCreateProject } from "@/hooks/useProjects";
import { Project, CreateProjectInput } from "@/types/project";
import ProjectForm from "@/components/forms/ProjectForm";
import ProjectSection from "@/components/dashboard/ProjectSection";
import ActualProjectSection from "@/components/dashboard/ActualProjectSection";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import { useProjectStore } from "@/store/projectStore";
import { useAuthStore } from "@/store/authStore";
import { formatDate, getDateDuration } from "@/utils/dateUtils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ClipboardList, Activity } from "lucide-react";
import {
  FilterField,
  FilterValues,
  GenericFilter,
  Option,
} from "@/components/common/GenericFilter";
import GenericImport, { ImportColumn } from "@/components/common/GenericImport";
import { toast } from "react-toastify";

const ProjectPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [isListView, setIsListView] = useState(true);
  const [activeTab, setActiveTab] = useState<"planned" | "actual">("planned");
  const { data: projects } = useProjects();
  const { projects: storeProjects } = useProjectStore();

  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [filterValues, setFilterValues] = useState<FilterValues>({});

  const { mutateAsync: createProjectAsync } = useCreateProject(() => { });

  const canCreate = hasPermission("projects", "create");
  const canManage = hasPermission("projects", "manage");

  // Planned columns
  const columns: Column<Project>[] = [
    { header: "Project Name", accessor: "title" },
    { header: "Priority", accessor: "priority" },
    { header: "Client", accessor: (row) => row.clientInfo?.companyName || "N/A" },
    { header: "Site", accessor: (row) => row.projectSite?.name || "N/A" },
    { header: "Progress", accessor: (row) => `${row.progress ?? 0}%` },
    { header: "Budget", accessor: "budget" },
    { header: "Start Date", accessor: (row) => formatDate(row.start_date) },
    { header: "End Date", accessor: (row) => formatDate(row.end_date) },
    { header: "Status", accessor: "status" },
  ];

  // Actual columns - showing actuals data
  const actualColumns: Column<Project>[] = [
    { header: "Project Name", accessor: "title" },
    { header: "Priority", accessor: "priority" },
    { header: "Client", accessor: (row) => row.clientInfo?.companyName || "N/A" },
    { header: "Site", accessor: (row) => row.projectSite?.name || "N/A" },
    { header: "Actual Budget", accessor: (row) => row.actuals?.budget ?? "N/A" },
    {
      header: "Budget +/-", accessor: (row) => {
        const actual = typeof row.actuals?.budget === "number" ? row.actuals.budget : 0;
        const planned = row.budget || 0;
        const diff = actual - planned;
        return diff !== 0 ? (diff > 0 ? `+${diff}` : `${diff}`) : "0";
      }
    },
    { header: "Actual Start Date", accessor: (row) => row.actuals?.start_date ? formatDate(row.actuals.start_date) : "N/A" },
    { header: "Actual End Date", accessor: (row) => row.actuals?.end_date ? formatDate(row.actuals.end_date) : "N/A" },
    {
      header: "Actual Duration", accessor: (row) => {
        if (row.actuals?.start_date && row.actuals?.end_date) {
          return getDateDuration(row.actuals.start_date, row.actuals.end_date);
        }
        return "N/A";
      }
    },
    { header: "Actual Progress", accessor: (row) => `${row.actuals?.progress ?? 0}%` },
    { header: "Actual Status", accessor: (row) => row.actuals?.status ?? "N/A" },
  ];

  // Prepare actual data - only projects with actuals or all projects
  const actualData = projects?.map(project => ({
    ...project,
    actuals: project.actuals || {
      start_date: null,
      end_date: null,
      progress: null,
      status: null,
      budget: null,
    }
  })) || [];

  const importColumns: ImportColumn<CreateProjectInput>[] = [
    { header: "Project Name", accessor: "title", type: "string" },
    { header: "Priority", accessor: "priority", type: "string" },
    { header: "Client", accessor: "client_id", type: "string" },
    { header: "Progress", accessor: "progress", type: "number" },
    { header: "Budget", accessor: "budget", type: "number" },
    { header: "Start Date", accessor: "start_date", type: "date" },
    { header: "End Date", accessor: "end_date", type: "date" },
    { header: "Status", accessor: "status", type: "string" },
  ];

  const requiredAccessors: (keyof CreateProjectInput)[] = [
    "title",
    "priority",
    "client_id",
    "budget",
    "start_date",
    "end_date",
    "status",
  ];

  const priorityOptions: Option<string>[] = [
    { label: "Low", value: "Low" },
    { label: "Medium", value: "Medium" },
    { label: "High", value: "High" },
    { label: "Critical", value: "Critical" },
  ];
  const statusOptions: Option<string>[] = [
    { label: "Not Started", value: "Not Started" },
    { label: "Started", value: "Started" },
    { label: "In Progress", value: "InProgress" },
    { label: "Completed", value: "Completed" },
    { label: "Canceled", value: "Canceled" },
    { label: "On Hold", value: "Onhold" },
  ];

  const filterFields: FilterField[] = [
    {
      name: "title",
      label: "Project Name",
      type: "text",
      placeholder: "Search by name…",
    },
    {
      name: "status",
      label: "Status",
      type: "multiselect",
      options: statusOptions,
      placeholder: "Filter by Status"
    },
    {
      name: "priority",
      label: "Priority",
      type: "multiselect",
      options: priorityOptions,
      placeholder: "Filter by Priority"
    },
    {
      name: "dateRange",
      label: "Date Range",
      type: "daterange"
    }
  ];

  const filteredProjects = projects?.filter((project) => {
    // title search
    const matchesSearch =
      !filterValues.title ||
      project.title.toLowerCase().includes((filterValues.title as string).toLowerCase());

    // Advanced filters logic
    const matchesStatus =
      !filterValues.status ||
      filterValues.status.length === 0 ||
      filterValues.status.includes(project.status);

    const matchesPriority =
      !filterValues.priority ||
      filterValues.priority.length === 0 ||
      filterValues.priority.includes(project.priority);

    const matchesDateRange = (() => {
      if (!filterValues.dateRange?.from) return true;
      const projStart = new Date(project.start_date);
      const projEnd = new Date(project.end_date);
      const filterStart = new Date(filterValues.dateRange.from);
      const filterEnd = filterValues.dateRange.to ? new Date(filterValues.dateRange.to) : filterStart;

      // Project overlaps with filter range
      return (projStart <= filterEnd && projEnd >= filterStart);
    })();

    return matchesSearch && matchesStatus && matchesPriority && matchesDateRange;
  });

  const handleImport = async (data: CreateProjectInput[]) => {
    try {
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
        const project = data[i];
        if (!validPriorities.includes(project.priority)) {
          toast.error(
            `Invalid priority in row ${i + 2
            }. Must be one of: ${validPriorities.join(", ")}`
          );
          return;
        }
        if (!validStatuses.includes(project.status)) {
          toast.error(
            `Invalid status in row ${i + 2
            }. Must be one of: ${validStatuses.join(", ")}`
          );
          return;
        }
        project.description = project.description || "Imported project";
      }

      await Promise.all(data.map((project) => createProjectAsync(project)));
      toast.success("Projects imported and created successfully!");
    } catch (error) {
      toast.error("Error importing and creating projects");
      console.error("Import error:", error);
    }
  };

  const handleError = (error: string) => {
    toast.error(error);
  };

  return (
    <div className="p-4">
      <div className="flex flex-wrap justify-between items-center mb-4 mt-4 gap-2">
        <nav className="hidden md:block" aria-label="breadcrumb">
          <ol className="flex space-x-2 text-sm sm:text-base">
            <li>
              <Link href="/" className="text-primary hover:underline">
                Home
              </Link>
            </li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-900 font-semibold">Projects</li>
          </ol>
        </nav>

        {/* Button group */}
        <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
          {canCreate && (
            <button
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 flex items-center gap-1"
              onClick={() => setShowForm(true)}
            >
              <span className="md:hidden">Add New</span>
              <PlusIcon width={14} height={14} className="hidden md:inline" />
            </button>
          )}
          <button
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            onClick={() => setIsListView((prev) => !prev)}
          >
            {isListView ? (
              <Grid width={14} height={14} />
            ) : (
              <List width={14} height={14} />
            )}
          </button>

          {/* GenericDownloads: full width on small, inline on md+ */}
          {canManage && (
            <div className="w-full md:w-auto mt-2 md:mt-0">
              <GenericDownloads
                data={storeProjects || []}
                title="Planned Projects"
                columns={columns}
                secondTable={{
                  data: actualData,
                  title: "Actual Projects",
                  columns: actualColumns,
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Import */}
      <div className="flex justify-end mb-4">
        {canManage && (
          <GenericImport<CreateProjectInput>
            expectedColumns={importColumns}
            requiredAccessors={requiredAccessors}
            onImport={handleImport}
            title="Projects"
            onError={handleError}
          />
        )}
      </div>

      {showForm && canCreate && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ProjectForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}

      <div className="mt-8">
        <GenericFilter fields={filterFields} onFilterChange={setFilterValues} />
      </div>

      <div className="mt-4">
        <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="w-full">
          <div className="flex justify-start w-full mb-6 border-b border-gray-200 pb-2">
            <TabsList className="bg-muted p-1 rounded-full inline-flex h-auto">
              <TabsTrigger
                value="planned"
                className="flex items-center space-x-2 py-2 px-6 text-sm font-bold rounded-full transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground uppercase"
              >
                <ClipboardList className="w-4 h-4" />
                <span>Planned Projects</span>
              </TabsTrigger>
              <TabsTrigger
                value="actual"
                className="flex items-center space-x-2 py-2 px-6 text-sm font-bold rounded-full transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground uppercase"
              >
                <Activity className="w-4 h-4" />
                <span>Actual Projects</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="planned" className="mt-6 outline-none">
            {isListView ? (
              <ProjectSection externalFilters={filterValues} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {(filteredProjects || []).map((project: Project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="actual" className="mt-6 outline-none">
            <ActualProjectSection externalFilters={filterValues} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectPage;
