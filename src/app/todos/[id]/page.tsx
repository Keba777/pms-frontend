import React from "react";
import ClientTodoDetail from "./ClientTodoDetail";
import apiClient from "@/services/api-client";
import { Todo } from "@/types/todo";

type Params = Promise<{ id: string }>;

export async function generateStaticParams() {
  try {
    const res = await apiClient.get<{ success: boolean; data: Todo[] }>(
      "todos"
    );
    const todos = res.data.data;

    return todos.map((todo) => ({
      id: todo.id.toString(),
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export default async function TodoPage(segmentData: { params: Params }) {
  const params = await segmentData.params;
  const { id } = params;
  return <ClientTodoDetail todoId={id} />;
}
