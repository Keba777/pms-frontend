import apiClient from "@/services/api-client";
import ClientTaskActivity from "./ClientTaskActivity";
import { Task } from "@/types/task";

type Params = Promise<{ taskId: string }>;

export async function generateStaticParams() {
  try {
    const res = await apiClient.get<{ success: boolean; data: Task[] }>(
      "tasks"
    );
    const tasks = res.data.data;
    return tasks.map((task) => ({
      id: task.id.toString(),
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

const TaskActivityPage = async (segmentData: { params: Params }) => {
  const params = await segmentData.params;
  const { taskId } = params;
  return <ClientTaskActivity taskId={taskId} />;
};

export default TaskActivityPage;
