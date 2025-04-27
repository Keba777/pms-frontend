"use client";

import React, { useState } from "react";
import Link from "next/link";
import { List, PlusIcon, Grid } from "lucide-react";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectFilter from "@/components/projects/ProjectFilters";
import { useProjects } from "@/hooks/useProjects";
import { Project } from "@/types/project";
import ProjectForm from "@/components/forms/ProjectForm";
import ProjectSection from "@/components/dashboard/ProjectSection";
import ProjectCardSkeleton from "@/components/projects/ProjectCardSkeleton";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import { useProjectStore } from "@/store/projectStore";
import { useAuthStore } from "@/store/authStore";

const ProjectPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [isListView, setIsListView] = useState(false);
  const { data: projects, isLoading, isError } = useProjects();
  const [filters, setFilters] = useState({
    status: "",
    sort: "",
    tags: [] as { value: number; label: string }[],
  });
  const { projects: storeProjects } = useProjectStore();

  // Grab hasPermission from auth store
  const hasPermission = useAuthStore((state) => state.hasPermission);

  // Define permission flags for this page context (resource = "projects")
  const canCreate = hasPermission("projects", "create");
  // const canEdit   = hasPermission("projects", "edit");
  // const canDelete = hasPermission("projects", "delete");
  const canManage = hasPermission("projects", "manage");

  const columns: Column<Project>[] = [
    { header: "Project Name", accessor: "title" },
    { header: "Priority",     accessor: "priority" },
    { header: "Client",       accessor: "client" },
    { header: "Progress",     accessor: "progress" },
    { header: "Budget",       accessor: "budget" },
    { header: "Start Date",   accessor: "start_date" },
    { header: "End Date",     accessor: "end_date" },
    { header: "Status",       accessor: "status" },
  ];

  const handleFilterChange = (filters: {
    status: string;
    sort: string;
    tags: { value: number; label: string }[];
  }) => setFilters(filters);

  // Filter the projects based on selected status.
  let filteredProjects: Project[] = projects || [];
  if (filters.status) {
    filteredProjects = filteredProjects.filter(
      (project) => project.status === filters.status
    );
  }

  return (
    <div className="p-4">
      <div className="flex flex-wrap justify-between mb-2 mt-4">
        {/* Breadcrumb */}
        <div>
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
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {/* Create */}
          {canCreate && (
            <button
              className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-2 px-3 rounded text-sm"
              onClick={() => setShowForm(true)}
            >
              <PlusIcon width={15} height={12} />
            </button>
          )}

          {/* Toggle View */}
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

          {/* Manage: e.g. export/downloads button */}
          {canManage && (
            <GenericDownloads
              data={storeProjects}
              title="Projects Export"
              columns={columns}
            />
          )}
        </div>
      </div>

      {/* Modal Overlay and Form */}
      {showForm && canCreate && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ProjectForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {/* Filters */}
      <ProjectFilter onFilterChange={handleFilterChange} />

      {isLoading ? (
        // Loading skeletons
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <ProjectCardSkeleton key={idx} />
          ))}
        </div>
      ) : isError ? (
        <div>Failed to load projects.</div>
      ) : isListView ? (
        // List view: pass edit/delete flags into the section
        <ProjectSection 
        // canEdit={canEdit} 
        // canDelete={canDelete} 
        />
      ) : (
        // Grid view: pass flags into each card
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {filteredProjects.map((project: Project) => (
            <ProjectCard
              key={project.id}
              project={project}
              // canEdit={canEdit}
              // canDelete={canDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectPage;
