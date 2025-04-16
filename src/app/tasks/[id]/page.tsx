import React from "react";
import ClientTaskDetail from "./ClientTaskDetail";
import apiClient from "@/services/api-client";
import { Task } from "@/types/task";

type Params = Promise<{ id: string }>;

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

export default async function TaskPage(segmentData: { params: Params }) {
  const params = await segmentData.params;
  const { id } = params;
  return <ClientTaskDetail taskId={id} />;
}
