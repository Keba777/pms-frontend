"use client";

import React, { useEffect, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { useRequests } from "@/hooks/useRequests";
import { useApprovals, useCreateApproval } from "@/hooks/useApprovals";
import { useAuthStore } from "@/store/authStore";
import { useUser } from "@/hooks/useUsers";
import { Request } from "@/types/request";
import { Approval, CreateApprovalInput } from "@/types/approval";
import { fetchMaterialById } from "@/hooks/useMaterials";
import { fetchEquipmentById } from "@/hooks/useEquipments";
import { fetchLaborById } from "@/hooks/useLabors";
import { toast } from "react-toastify";

// Separate row component to keep hooks order consistent
const RequestRow: React.FC<{
  req: Request;
  departmentId: string;
  approvals?: Approval[];
  onAllocate: (id: string) => void;
}> = ({ req, departmentId, approvals, onAllocate }) => {
  // fetch user
  const { data: requestUser, isLoading: userLoading } = useUser(req.userId);

  // fetch materials, equipment, labor
  const materialQueries = useQueries({
    queries: (req.materialIds || []).map((id) => ({
      queryKey: ["material", id],
      queryFn: () => fetchMaterialById(id),
      enabled: Boolean(id),
    })),
  });
  const equipmentQueries = useQueries({
    queries: (req.equipmentIds || []).map((id) => ({
      queryKey: ["equipment", id],
      queryFn: () => fetchEquipmentById(id),
      enabled: Boolean(id),
    })),
  });
  const laborQueries = useQueries({
    queries: (req.laborIds || []).map((id) => ({
      queryKey: ["labor", id],
      queryFn: () => fetchLaborById(id),
      enabled: Boolean(id),
    })),
  });

  const materials = materialQueries
    .map((q) => q.data)
    .filter((m): m is { id: string; item: string; unit: string } => Boolean(m));
  const equipment = equipmentQueries
    .map((q) => q.data)
    .filter((e): e is { id: string; item: string; unit: string } => Boolean(e));
  const labor = laborQueries
    .map((q) => q.data)
    .filter((l): l is { id: string; role: string; unit: string } => Boolean(l && l.unit));

  const allocated = approvals?.some(
    (app) => app.requestId === req.id && app.departmentId === departmentId
  );

  return (
    <tr key={req.id}>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {userLoading ? "Loading..." : requestUser?.first_name || req.userId}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {materials.map((m) => m.item).join(", ") || "-"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {equipment.map((e) => e.item).join(", ") || "-"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {labor.map((l) => l.role).join(", ") || "-"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {req.status}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => onAllocate(req.id)}
          className={`px-4 py-2 bg-cyan-700 text-white rounded-2xl hover:bg-cyan-800 transition ${
            allocated ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={allocated}
        >
          {allocated ? "Allocated" : "Allocate Resources"}
        </button>
      </td>
    </tr>
  );
};

const ResourceAllocationPage: React.FC = () => {
  const { data: requests, isLoading, isError } = useRequests();
  const { data: approvals } = useApprovals();
  const createApprovalMutation = useCreateApproval(() => {});
  const user = useAuthStore((state) => state.user);
  const departmentId = user?.department_id;
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);

  useEffect(() => {
    if (requests && departmentId) {
      setFilteredRequests(
        requests.filter((r) => r.departmentId === departmentId)
      );
    }
  }, [requests, departmentId]);

  const handleAllocate = (requestId: string) => {
    if (!departmentId) {
      toast.error("User department not found");
      return;
    }
    const newApproval: CreateApprovalInput = {
      requestId,
      departmentId,
      stepOrder: 1,
      status: "Pending",
    };
    createApprovalMutation.mutate(newApproval);
  };

  if (isLoading) return <div className="p-4 text-cyan-700">Loading…</div>;
  if (isError) return <div className="p-4 text-red-500">Error loading requests</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-cyan-700 mb-8">
        Department Resource Allocation Dashboard
      </h1>

      {filteredRequests.length === 0 ? (
        <p className="text-gray-600">
          No resource requests available for your department.
        </p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Materials
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Equipment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Labor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((req) => (
                <RequestRow
                  key={req.id}
                  req={req}
                  departmentId={departmentId!}
                  approvals={approvals}
                  onAllocate={handleAllocate}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ResourceAllocationPage;