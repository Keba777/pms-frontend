// components/ResourceAllocationPage.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { useRequests } from "@/hooks/useRequests";
import { useApprovals, useApprovalHistory } from "@/hooks/useApprovals";
import { useAuthStore } from "@/store/authStore";
import { useUser } from "@/hooks/useUsers";
import { Request } from "@/types/request";
import { Approval } from "@/types/approval";
import { toast } from "react-toastify";
import ApprovalForm from "@/components/forms/ApprovalForm";
import { fetchMaterialById } from "@/hooks/useMaterials";
import { fetchEquipmentById } from "@/hooks/useEquipments";
import { fetchLaborById } from "@/hooks/useLabors";

const RequestRow: React.FC<{
  req: Request;
  departmentId: string;
  approvals: Approval[];
  onAllocate: (id: string) => void;
}> = ({ req, departmentId, approvals, onAllocate }) => {
  const { data: requestUser, isLoading: userLoading } = useUser(req.userId);

  // Parallel queries for material, equipment, labor names
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
    .filter((e): e is { id: string; item: string; unit: string; siteId: string } => Boolean(e));
  const labor = laborQueries
    .map((q) => q.data)
    .filter((l): l is { id: string; role: string; unit: string; siteId: string } => Boolean(l));

  const allocated = approvals.some(
    (app) => app.requestId === req.id && app.departmentId === departmentId
  );

  return (
    <tr key={req.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {userLoading ? "Loading..." : requestUser?.first_name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {materials.length > 0 ? materials.map((m) => m.item).join(", ") : "-"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {equipment.length > 0 ? equipment.map((e) => e.item).join(", ") : "-"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {labor.length > 0 ? labor.map((l) => l.role).join(", ") : "-"}
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
          {allocated ? "Allocated" : "Allocate"}
        </button>
      </td>
    </tr>
  );
};

const ResourceAllocationPage: React.FC = () => {
  const { data: requests, isLoading, isError } = useRequests();
  const { data: approvals = [] } = useApprovals();
  const user = useAuthStore((state) => state.user);
  const departmentId = user?.department_id;

  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [activeRequestId, setActiveRequestId] = useState("");

  useEffect(() => {
    if (requests && departmentId) {
      setFilteredRequests(
        requests.filter((r) => r.departmentId === departmentId)
      );
    }
  }, [requests, departmentId]);

  const handleAllocate = (requestId: string) => {
    if (!departmentId) {
      toast.error("Department not found");
      return;
    }
    setActiveRequestId(requestId);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setActiveRequestId("");
  };

  const history = useApprovalHistory(activeRequestId).data || [];

  if (isLoading) return <div className="p-4 text-cyan-700">Loading…</div>;
  if (isError)
    return <div className="p-4 text-red-500">Error loading requests</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-cyan-700 mb-6">
        Resource Allocation
      </h1>
      {filteredRequests.length === 0 ? (
        <p className="text-gray-600">No requests for your department.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Requested By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Materials
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Equipment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Labor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 space-y-6">
            <h2 className="text-xl font-semibold">Approval History</h2>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Step</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dept</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Approved By</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Approved At</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Checked By</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">{history.length > 0 ? (
                    history.map((h) => (
                      <tr key={h.id}>
                        <td className="px-4 py-2 text-sm">{h.stepOrder}</td>
                        <td className="px-4 py-2 text-sm">{h.departmentId}</td>
                        <td className="px-4 py-2 text-sm">{h.status}</td>
                        <td className="px-4 py-2 text-sm">{h.approvedBy || "-"}</td>
                        <td className="px-4 py-2 text-sm">{h.approvedAt ? new Date(h.approvedAt).toLocaleString() : "-"}</td>
                        <td className="px-4 py-2 text-sm">{h.checkedBy || "-"}</td>
                        <td className="px-4 py-2 text-sm">{h.remarks || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-4 text-center text-sm text-gray-500">
                        No history yet.
                      </td>
                    </tr>
                  )}</tbody>
              </table>
            </div>
            <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="modal-content bg-white rounded-lg shadow-xl p-6">
                <ApprovalForm
                  requestId={activeRequestId}
                  departmentId={departmentId!}
                  onClose={closeModal}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceAllocationPage;
