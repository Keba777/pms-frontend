"use client";

import { NotificationTable } from "./CollaborationTables";

interface NotificationTabProps {
  type: "project" | "task" | "activity" | "todo";
  referenceId: string;
}

export default function NotificationTab({
  type = "project",
  referenceId,
}: NotificationTabProps) {
  return (
    <div>
      <NotificationTable type={type} referenceId={referenceId} />
    </div>
  );
}
