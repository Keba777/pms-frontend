"use client";

import React from "react";
import { useWorkflowLogs } from "@/hooks/useworkflowLogs";
import { useWorkflowLogStore } from "@/store/workflowLogStore";
import { WorkflowLog } from "@/types/workflowLog";
import { Loader2 } from "lucide-react";
import dayjs from "dayjs";

interface WorkflowLogTableProps {
  entityType: "Project" | "Task" | "Activity" | "Approval";
  entityId: string;
}

const WorkflowLogTable: React.FC<WorkflowLogTableProps> = ({
  entityType,
  entityId,
}) => {
  const { isLoading, isError } = useWorkflowLogs(entityType, entityId);
  const logs: WorkflowLog[] =
    useWorkflowLogStore(
      (state) => state.workflowLogs[`${entityType}-${entityId}`]
    ) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-6 text-cyan-700">
        <Loader2 className="animate-spin mr-2" />
        Loading logs...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-100 text-red-600 px-4 py-3 rounded shadow">
        Error fetching logs. Please try again.
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-gray-600 bg-gray-100 px-4 py-3 rounded shadow">
        No logs found for this {entityType}.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto mt-6 rounded-lg border border-gray-200 shadow">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-cyan-700 text-white">
          <tr>
            <th className="px-4 py-3 text-left">Action</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">User ID</th>
            <th className="px-4 py-3 text-left">Details</th>
            <th className="px-4 py-3 text-left">Date</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {logs.map((log) => (
            <tr
              key={log.id}
              className="hover:bg-gray-50 transition duration-200 ease-in-out"
            >
              <td className="px-4 py-3 font-medium text-cyan-800">
                {log.action}
              </td>
              <td>
                <span
                  className={`ml-4 inline-block text-xs font-semibold px-2 py-1 rounded-full ${
                    log.status === "Success"
                      ? "bg-green-100 text-green-700"
                      : log.status === "Failed"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {log.status || "Pending"}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-700">{log.userId}</td>
              <td className="px-4 py-3 text-gray-600">{log.details || "—"}</td>
              <td className="px-4 py-3 text-gray-500">
                {log.id ? dayjs(log.id).format("MMM D, YYYY") : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WorkflowLogTable;
