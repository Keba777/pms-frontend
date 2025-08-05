import React from "react";
import WorkflowLogTable from "../common/WorkflowLogTable";

interface ActivityLogTabProps {
  projectId: string;
}

export default function ActivityLogTab({ projectId }: ActivityLogTabProps) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-cyan-700 mb-6 mt-8">
        Project Workflow Logs
      </h1>
      <WorkflowLogTable entityType="Project" entityId={projectId} />
    </div>
  );
}
