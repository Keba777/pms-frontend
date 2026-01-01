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
import { formatDate as format } from "@/utils/dateUtils";

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
    .filter(
      (
        m
      ): m is {
        id: string;
        item: string;
        unit: string;
        status: "Available" | "Unavailable";
      } => Boolean(m)
    );
  const equipment = equipmentQueries
    .map((q) => q.data)
    .filter(
      (
        e
      ): e is {
        id: string;
        item: string;
        unit: string;
        siteId: string;
        status: "Available" | "Unavailable";
      } => Boolean(e)
    );
  const labor = laborQueries
    .map((q) => q.data)
    .filter(
      (l): l is { id: string; role: string; unit: string; siteId: string } =>
        Boolean(l)
    );

  const allocated = approvals.some(
    (app) => app.requestId === req.id && app.departmentId === departmentId
  );

  return (
    <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
      <td className="px-5 py-4 whitespace-nowrap text-sm font-bold text-gray-700">
        {userLoading ? "Loading..." : requestUser?.first_name}
      </td>
      <td className="px-5 py-4 text-sm text-gray-600 italic">
        {materials.length > 0 ? materials.map((m) => m.item).join(", ") : "-"}
      </td>
      <td className="px-5 py-4 text-sm text-gray-600 italic">
        {equipment.length > 0 ? equipment.map((e) => e.item).join(", ") : "-"}
      </td>
      <td className="px-5 py-4 text-sm text-gray-600 italic">
        {labor.length > 0 ? labor.map((l) => l.role).join(", ") : "-"}
      </td>
      <td className="px-5 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${req.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
            req.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
              'bg-amber-100 text-amber-800'
          }`}>
          {req.status}
        </span>
      </td>
      <td className="px-5 py-4 whitespace-nowrap text-right">
        <button
          onClick={() => onAllocate(req.id)}
          className={`px-4 py-2 text-xs font-black uppercase tracking-widest bg-cyan-700 text-white rounded-lg hover:bg-cyan-800 transition-all shadow-sm ${allocated ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
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
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
        <h1 className="text-xl sm:text-2xl font-black text-cyan-800 uppercase tracking-tight">
          Resource Allocation
        </h1>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No requests for your department.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Requested By",
                  "Materials",
                  "Equipment",
                  "Labor",
                  "Status",
                  "Action",
                ].map((th) => (
                  <th
                    key={th}
                    className="px-5 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest"
                  >
                    {th}
                  </th>
                ))}
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
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-black text-cyan-800 uppercase tracking-tight">Allocate Resource</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-8">
              <section>
                <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">Approval History</h3>
                <div className="overflow-x-auto border border-gray-100 rounded-xl">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>
                        {[
                          "Step",
                          "Dept",
                          "Status",
                          "Approved By",
                          "Approved At",
                          "Checked By",
                          "Remarks",
                        ].map((th) => (
                          <th key={th} className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                            {th}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                      {history.length > 0 ? (
                        history.map((h) => (
                          <tr key={h.id}>
                            <td className="px-4 py-3 text-sm font-bold text-gray-700">{h.stepOrder}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 italic whitespace-nowrap">{h.departmentId}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${h.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
                                  h.status === 'Rejected' ? 'bg-rose-50 text-rose-700' :
                                    'bg-amber-50 text-amber-700'
                                }`}>
                                {h.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{h.approvedBy || "-"}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{h.approvedAt ? format(h.approvedAt) : "-"}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{h.checkedBy || "-"}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 min-w-[200px]">{h.remarks || "-"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-6 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                            No history found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <ApprovalForm
                  requestId={activeRequestId}
                  departmentId={departmentId!}
                  onClose={closeModal}
                />
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceAllocationPage;
