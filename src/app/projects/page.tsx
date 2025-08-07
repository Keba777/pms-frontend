"use client";

import React, { useState } from "react";
import Link from "next/link";
import { List, PlusIcon, Grid } from "lucide-react";
import ProjectCard from "@/components/projects/ProjectCard";
import { useProjects } from "@/hooks/useProjects";
import { Project } from "@/types/project";
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

const ProjectPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [isListView, setIsListView] = useState(false);
  const [activeTab, setActiveTab] = useState<"planned" | "actual">("planned");
  const { data: projects } = useProjects();
  const { projects: storeProjects } = useProjectStore();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [filterValues, setFilterValues] = useState<FilterValues>({});

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
