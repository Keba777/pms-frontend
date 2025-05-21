import apiClient from "@/services/api-client";
import { Project } from "@/types/project";
import ClientProjectTask from "./ClientProjectTask";

type Params = Promise<{ projectId: string }>;

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

const ProjectTaskPage = async (segmentData: { params: Params }) => {
  const params = await segmentData.params;
  const { projectId } = params;
  return <ClientProjectTask projectId={projectId} />;
};

export default ProjectTaskPage;
