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
  const [isListView, setIsListView] = useState(false);
  const [activeTab, setActiveTab] = useState<"planned" | "actual">("planned");
  const { data: projects } = useProjects();
  const { projects: storeProjects } = useProjectStore();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const { mutateAsync: createProjectAsync } = useCreateProject(() => {}); // Suppress per-project toast

  const canCreate = hasPermission("projects", "create");
  const canManage = hasPermission("projects", "manage");

  const columns: Column<Project>[] = [
    { header: "Project Name", accessor: "title" },
    { header: "Priority", accessor: "priority" },
    { header: "Client", accessor: "client" },
    { header: "Progress", accessor: "progress" },
    { header: "Budget", accessor: "budget" },
    { header: "Start Date", accessor: "start_date" },
    { header: "End Date", accessor: "end_date" },
    { header: "Status", accessor: "status" },
  ];

  const importColumns: ImportColumn<CreateProjectInput>[] = [
    { header: "Project Name", accessor: "title", type: "string" },
    { header: "Priority", accessor: "priority", type: "string" },
    { header: "Client", accessor: "client", type: "string" },
    { header: "Progress", accessor: "progress", type: "number" },
    { header: "Budget", accessor: "budget", type: "number" },
    { header: "Start Date", accessor: "start_date", type: "date" },
    { header: "End Date", accessor: "end_date", type: "date" },
    { header: "Status", accessor: "status", type: "string" },
  ];

  const requiredAccessors: (keyof CreateProjectInput)[] = [
    "title",
    "priority",
    "client",
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
    { label: "In Progress", value: "In Progress" },
    { label: "Completed", value: "Completed" },
  ];

  const filterFields: FilterField<string>[] = [
    {
      name: "title",
      label: "Project Name",
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

  const filteredProjects = projects?.filter((project) => {
    let matches = true;
    if (filterValues.title) {
      matches =
        matches &&
        project.title
          .toLowerCase()
          .includes((filterValues.title as string).toLowerCase());
    }
    if (filterValues.priority) {
      matches = matches && project.priority === filterValues.priority;
    }
    if (filterValues.status) {
      matches = matches && project.status === filterValues.status;
    }

    return matches;
  });

  const handleImport = async (data: CreateProjectInput[]) => {
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
        const project = data[i];
        if (!validPriorities.includes(project.priority)) {
          toast.error(
            `Invalid priority in row ${
              i + 2
            }. Must be one of: ${validPriorities.join(", ")}`
          );
          return;
        }
        if (!validStatuses.includes(project.status)) {
          toast.error(
            `Invalid status in row ${
              i + 2
            }. Must be one of: ${validStatuses.join(", ")}`
          );
          return;
        }
        // Provide default for description since–System: it's not in headers
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
      <div className="flex flex-wrap justify-between mb-2 mt-4">
        <nav aria-label="breadcrumb">
          <ol className="flex space-x-2">
            <li>
              <Link href="/" className="text-blue-600 hover:underline">
                Home
              </Link>
            </li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-900 font-semibold">Projects</li>
          </ol>
        </nav>
        <div className="flex space-x-4 mb-8">
          {canCreate && (
            <button
              className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-2 px-3 rounded text-sm"
              onClick={() => setShowForm(true)}
            >
              <PlusIcon width={15} height={12} />
            </button>
          )}
          <button
            className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-2 px-3 rounded text-sm"
            onClick={() => setIsListView((prev) => !prev)}
          >
            {isListView ? (
              <Grid width={15} height={12} />
            ) : (
              <List width={15} height={12} />
            )}
          </button>
          {canManage && (
            <GenericDownloads
              data={storeProjects}
              title="Projects Export"
              columns={columns}
            />
          )}
        </div>
      </div>
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

      <GenericFilter fields={filterFields} onFilterChange={setFilterValues} />

      {/* Tabs */}
      <div className="mt-4">
        <div className="border-b flex space-x-4">
          <button
            className={`py-2 px-4 -mb-px border-b-2 font-medium ${
              activeTab === "planned"
                ? "border-cyan-700 text-cyan-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("planned")}
          >
            Planned
          </button>
          <button
            className={`py-2 px-4 -mb-px border-b-2 font-medium ${
              activeTab === "actual"
                ? "border-cyan-700 text-cyan-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("actual")}
          >
            Actual
          </button>
        </div>
        <div className="mt-4">
          {activeTab === "planned" ? (
            isListView ? (
              <ProjectSection />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(filteredProjects || []).map((project: Project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )
          ) : (
            <ActualProjectSection />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
