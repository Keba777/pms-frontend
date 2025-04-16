// app/projects/[id]/page.tsx
import React from "react";
import ClientProjectDetail from "./ClientProjectDetail";
import apiClient from "@/services/api-client";
import { Project } from "@/types/project";

type Params = Promise<{ id: string }>;

export async function generateStaticParams() {
  try {
    const res = await apiClient.get<{ success: boolean; data: Project[] }>(
      "projects"
    );
    const projects = res.data.data;
    return projects.map((project) => ({
      id: project.id.toString(),
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export default async function ProjectPage(segmentData: { params: Params }) {
  const params = await segmentData.params;
  const { id } = params;
  return <ClientProjectDetail projectId={id} />;
}
