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
import ActualProjectSection from "@/components/dashboard/ActualProjectSection";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import { useProjectStore } from "@/store/projectStore";
import { useAuthStore } from "@/store/authStore";

const ProjectPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [isListView, setIsListView] = useState(false);
  const [activeTab, setActiveTab] = useState<'planned' | 'actual'>('planned');
  const { data: projects } = useProjects();
  const [filters, setFilters] = useState({
    status: "",
    sort: "",
    tags: [] as { value: number; label: string }[],
  });
  const { projects: storeProjects } = useProjectStore();
  const hasPermission = useAuthStore((state) => state.hasPermission);

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

  const handleFilterChange = (f: typeof filters) => setFilters(f);

  let filteredProjects = projects || [];
  if (filters.status) {
    filteredProjects = filteredProjects.filter(
      (project) => project.status === filters.status
    );
  }

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
        <div className="flex space-x-2">
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
            {isListView ? <Grid width={15} height={12} /> : <List width={15} height={12} />}
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

      <ProjectFilter onFilterChange={handleFilterChange} />

      {/* Tabs */}
      <div className="mt-4">
        <div className="border-b flex space-x-4">
          <button
            className={`py-2 px-4 -mb-px border-b-2 font-medium ${
              activeTab === 'planned'
                ? 'border-cyan-700 text-cyan-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('planned')}
          >
            Planned
          </button>
          <button
            className={`py-2 px-4 -mb-px border-b-2 font-medium ${
              activeTab === 'actual'
                ? 'border-cyan-700 text-cyan-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('actual')}
          >
            Actual
          </button>
        </div>
        <div className="mt-4">
          {activeTab === 'planned' ? (
            isListView ? (
              <ProjectSection />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProjects.map((project: Project) => (
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
