"use client";

import { ActivityLogTable } from "./CollaborationTables";

interface ActivityLogTabProps {
  type: "project" | "task" | "activity" | "todo";
  referenceId: string;
}

export default function ActivityLogTab({
  type = "project",
  referenceId,
}: ActivityLogTabProps) {
  return (
    <div>
      <ActivityLogTable type={type} referenceId={referenceId} />
    </div>
  );
}
