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

const RequestCard: React.FC<{
  req: Request;
  departmentId: string;
  approvals: Approval[] | undefined;
  onAllocate: (id: string) => void;
}> = ({ req, departmentId, approvals, onAllocate }) => {
  const { data: requestUser, isLoading: userLoading } = useUser(req.userId);

  // 1) Top‐level single hook; 2) Pass an array of queries built from your fetch functions:
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
    .filter((l): l is { id: string; role: string; unit: string } =>
      Boolean(l && l.unit)
    );

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <p className="text-sm text-gray-500">
          Requested by:{" "}
          {userLoading ? "Loading..." : requestUser?.first_name || req.userId}
        </p>
        <div className="mt-3 text-gray-800 space-y-1">
          {materials.map((m) => (
            <p key={m.id}>
              <span className="font-medium">Material:</span> {m.item}
            </p>
          ))}
          {equipment.map((e) => (
            <p key={e.id}>
              <span className="font-medium">Equipment:</span> {e.item}
            </p>
          ))}
          {labor.map((l) => (
            <p key={l.id}>
              <span className="font-medium">Labor:</span> {l.role}
            </p>
          ))}
          <p>
            <span className="font-medium">Status:</span> {req.status}
          </p>
        </div>
      </div>

      <button
        onClick={() => onAllocate(req.id)}
        className="mt-4 md:mt-0 px-5 py-3 bg-cyan-700 text-white rounded-2xl hover:bg-cyan-800 transition"
        disabled={approvals?.some(
          (app) => app.requestId === req.id && app.departmentId === departmentId
        )}
      >
        {approvals?.some(
          (app) => app.requestId === req.id && app.departmentId === departmentId
        )
          ? "Allocated"
          : "Allocate Resources"}
      </button>
    </div>
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
  if (isError)
    return <div className="p-4 text-red-500">Error loading requests</div>;

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
        <div className="space-y-6">
          {filteredRequests.map((req) => (
            <RequestCard
              key={req.id}
              req={req}
              departmentId={departmentId!}
              approvals={approvals}
              onAllocate={handleAllocate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceAllocationPage;
