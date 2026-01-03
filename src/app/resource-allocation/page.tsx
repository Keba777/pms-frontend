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
      } => Boolean(e && e.siteId)
    );
  const labor = laborQueries
    .map((q) => q.data)
    .filter(
      (l): l is { id: string; role: string; unit: string; siteId: string } =>
        Boolean(l && l.unit && l.siteId)
    );

  const allocated = approvals?.some(
    (app) => app.requestId === req.id && app.departmentId === departmentId
  );

  return (
    <tr key={req.id} className="group hover:bg-primary/5 transition-all">
      <td className="px-8 py-6 whitespace-nowrap text-[10px] font-black uppercase tracking-widest text-foreground">
        {userLoading ? (
          <div className="w-24 h-4 bg-muted/20 animate-pulse rounded" />
        ) : (
          requestUser?.first_name || req.userId
        )}
      </td>
      <td className="px-8 py-6 whitespace-nowrap text-[10px] font-bold text-muted-foreground/60">
        {materials.map((m) => m.item).join(", ") || "-"}
      </td>
      <td className="px-8 py-6 whitespace-nowrap text-[10px] font-bold text-muted-foreground/60">
        {equipment.map((e) => e.item).join(", ") || "-"}
      </td>
      <td className="px-8 py-6 whitespace-nowrap text-[10px] font-bold text-muted-foreground/60">
        {labor.map((l) => l.role).join(", ") || "-"}
      </td>
      <td className="px-8 py-6 whitespace-nowrap">
        <span className="px-3 py-1 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-[0.2em] rounded-full border border-primary/20">
          {req.status}
        </span>
      </td>
      <td className="px-8 py-6 whitespace-nowrap text-right">
        <button
          onClick={() => onAllocate(req.id)}
          className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 ${allocated
              ? "bg-muted text-muted-foreground/40 cursor-not-allowed shadow-none"
              : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"
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
  const createApprovalMutation = useCreateApproval(() => { });
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

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Scanning Requests...</p>
      </div>
    </div>
  );

  if (isError) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="p-8 bg-destructive/5 border border-destructive/20 rounded-3xl text-center max-w-sm">
        <p className="text-destructive font-black uppercase tracking-widest text-[10px]">Security Fault</p>
        <p className="text-foreground mt-2 font-bold">Failed to synchronize request stream.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-12 pb-20">
        <div className="flex flex-col gap-6 bg-card p-6 sm:p-12 rounded-[3.5rem] border border-border shadow-2xl shadow-black/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-[100px] pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl font-black text-primary uppercase tracking-tighter">
              Resource Orchestration
            </h1>
            <p className="text-[10px] sm:text-xs font-black text-muted-foreground/60 uppercase tracking-[0.3em] mt-3 flex items-center gap-3">
              <span className="w-12 h-px bg-primary/30" /> Logistics Control & Asset Allocation
            </p>
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 bg-card/30 border-2 border-dashed border-border rounded-[3rem]">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">
              Department stream clear. No active requests detected.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden bg-card border border-border rounded-[3rem] shadow-2xl shadow-black/5 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <table className="min-w-full">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="px-8 py-6 text-left text-[10px] font-black text-primary uppercase tracking-widest">
                    Request Origin
                  </th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-primary uppercase tracking-widest">
                    Material Payload
                  </th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-primary uppercase tracking-widest">
                    Mobile Units
                  </th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-primary uppercase tracking-widest">
                    Personnel
                  </th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-primary uppercase tracking-widest">
                    Vector
                  </th>
                  <th className="px-8 py-6" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
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
    </div>
  );
};

export default ResourceAllocationPage;
