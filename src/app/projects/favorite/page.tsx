"use client";

import React from "react";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectCardSkeleton from "@/components/projects/ProjectCardSkeleton";
import { useProjects } from "@/hooks/useProjects";
import Link from "next/link";

const FavoriteProjectPage = () => {
  const { data: projects, isLoading, isError } = useProjects();

  // Filter the projects to only show favorites.
  const favoriteProjects = (projects || []).filter(
    (project) => project.isFavourite
  );

  return (
    <div className="p-4">
      <nav aria-label="breadcrumb">
        <ol className="flex space-x-2 mb-4">
          <li>
            <Link href="/" className="text-blue-600 hover:underline">
              Home
            </Link>
          </li>
          <li className="text-gray-500">/</li>
          <li className="text-gray-900 font-semibold">Favorite Projects</li>
        </ol>
      </nav>
      <h1 className="text-2xl font-bold mb-4">Favorite Projects</h1>
      {isLoading ? (
        // Render skeleton cards while loading.
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <ProjectCardSkeleton key={index} />
          ))}
        </div>
      ) : isError ? (
        <div>Failed to load projects.</div>
      ) : favoriteProjects.length === 0 ? (
        <div>No favorite projects found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favoriteProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoriteProjectPage;
