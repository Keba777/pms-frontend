"use client";

import React, { useState } from "react";
import Link from "next/link";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectFilter from "@/components/projects/ProjectFilters";
import { useProjects } from "@/hooks/useProjects";
import { Project } from "@/types/project";
import { List, PlusIcon, Grid } from "lucide-react";
import ProjectForm from "@/components/forms/ProjectForm";
import ProjectSection from "@/components/dashboard/ProjectSection";

const ProjectPage = () => {
  const [showForm, setShowForm] = useState(false);
  // false means grid view, true means list view (ProjectSection)
  const [isListView, setIsListView] = useState(false);
  const { data: projects, isLoading, isError } = useProjects();
  const [filters, setFilters] = useState({
    status: "",
    sort: "",
    tags: [] as { value: number; label: string }[],
  });

  const handleFilterChange = (filters: {
    status: string;
    sort: string;
    tags: { value: number; label: string }[];
  }) => {
    setFilters(filters);
  };

  // Filter the projects based on selected status.
  let filteredProjects: Project[] = projects || [];
  if (filters.status) {
    filteredProjects = filteredProjects.filter(
      (project) => project.status === filters.status
    );
  }

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Failed to load projects.</div>;

  return (
    <div className="p-4">
      <div className="flex flex-wrap justify-between mb-2 mt-4">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="flex space-x-2">
              <li>
                <Link href="/home" className="text-blue-600 hover:underline">
                  Home
                </Link>
              </li>
              <li className="text-gray-500">/</li>
              <li className="text-gray-900 font-semibold">Projects</li>
            </ol>
          </nav>
        </div>
        <div className="flex space-x-2">
          <button
            className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-2 px-3 rounded text-sm"
            onClick={() => setShowForm(true)}
          >
            <PlusIcon width={15} height={12} />
          </button>
          {/* Toggle view button */}
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
        </div>
      </div>

      {/* Modal Overlay and Form */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ProjectForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}

      <ProjectFilter onFilterChange={handleFilterChange} />

      {isListView ? (
        // Render list view with ProjectSection (pass projects if needed)
        <ProjectSection />
      ) : (
        // Render grid view with ProjectCard
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {filteredProjects.map((project: Project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectPage;
