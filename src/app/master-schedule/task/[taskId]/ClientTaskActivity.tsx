"use client";

import ActivityTable from "@/components/master-schedule/ActivityTable";
import { useTask } from "@/hooks/useTasks";
import React from "react";

interface ClientTaskActivityProps {
  taskId: string;
}

const ClientTaskActivity = ({ taskId }: ClientTaskActivityProps) => {
  const { data: task, isLoading, isError } = useTask(taskId!);
  if (isLoading) return <div>Loading task...</div>;
  if (isError || !task) return <div>Error loading task.</div>;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{task.task_name}</h1>
      <ActivityTable taskId={task.id} />
    </div>
  );
};

export default ClientTaskActivity;
