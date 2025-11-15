"use client";

import { DiscussionTable } from "./CollaborationTables";

interface DiscussionTabProps {
  type: "project" | "task" | "activity" | "todo";
  referenceId: string;
}

export default function DiscussionTab({
  type = "project",
  referenceId,
}: DiscussionTabProps) {
  return (
    <div>
      <DiscussionTable type={type} referenceId={referenceId} />
    </div>
  );
}
