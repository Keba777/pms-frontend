"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useLabors } from "@/hooks/useLabors";
import { useSites } from "@/hooks/useSites";
import { Labor } from "@/types/labor";
import { getDuration } from "@/utils/helper";

export default function LaborDetailPage() {
  const router = useRouter();
  const params = useParams();
  const siteId = params.id as string;
  const { data: labors, isLoading: labLoading, error: labError } = useLabors();
  const { data: sites, isLoading: siteLoading, error: siteError } = useSites();

  if (labLoading || siteLoading) return <div className="p-10 text-center text-primary font-bold">Loading...</div>;
  if (labError || siteError)
    return <div className="text-destructive font-bold p-10 text-center">Error loading data.</div>;

  const site = sites?.find((s) => s.id === siteId);
  if (!site) {
    return (
      <div className="text-center text-destructive font-bold mt-10">Site not found.</div>
    );
  }

  const siteLabors: Labor[] = labors?.filter((l) => l.siteId === siteId) ?? [];

  return (
    <div className="p-4 sm:p-6 bg-background min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-muted/30 p-4 rounded-xl border border-border">
        <button
          className="flex items-center text-primary hover:text-primary/80 font-bold transition-colors group"
          onClick={() => router.push("/resources/labors")}
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Sites
        </button>
        <h1 className="text-xl sm:text-2xl font-black text-primary uppercase tracking-tight">
          Labor at "{site.name}"
        </h1>
      </div>

      {siteLabors.length === 0 ? (
        <p className="text-muted-foreground">No labor entries found for this site.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border border border-border">
            <thead className="bg-primary">
              <tr>
                {[
                  "#",
                  "First Name",
                  "Last Name",
                  "Role",
                  "Unit",
                  // "Qyt",
                  // "Min Qty",
                  "Est-Hrs",
                  "Rate",
                  "OT",
                  "Total Amount",
                  "Starting Date",
                  "Due Date",
                  "Duration",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {siteLabors.flatMap((l, laborIndex) => {
                return (
                  l.laborInformations?.map((info, infoIndex) => (
                    <tr key={`${l.id}-${info.id}`} className="hover:bg-accent">
                      <td className="px-4 py-2 border border-border">
                        {laborIndex + 1}.{infoIndex + 1}
                      </td>
                      <td className="px-4 py-2 border border-border">
                        {info.firstName}
                      </td>
                      <td className="px-4 py-2 border border-border">
                        {info.lastName}
                      </td>
                      <td className="px-4 py-2 border border-border">
                        {l.role}
                      </td>
                      <td className="px-4 py-2 border border-border">
                        {l.unit}
                      </td>
                      {/* <td className="px-4 py-2 border border-border">
                        {l.quantity ?? "-"}
                      </td>
                      <td className="px-4 py-2 border border-border">
                        {l.minQuantity ?? "-"}
                      </td> */}
                      <td className="px-4 py-2 border border-border">
                        {l.estimatedHours ?? "-"}
                      </td>
                      <td className="px-4 py-2 border border-border">
                        {l.rate ?? "-"}
                      </td>
                      <td className="px-4 py-2 border border-border">
                        {l.overtimeRate ?? "-"}
                      </td>
                      <td className="px-4 py-2 border border-border">
                        {l.totalAmount ?? "-"}
                      </td>
                      <td className="px-4 py-2 border border-border">
                        {info.startsAt
                          ? new Date(info.startsAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-4 py-2 border border-border">
                        {info.endsAt
                          ? new Date(info.endsAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-4 py-2 border border-border">
                        {info.startsAt && info.endsAt
                          ? getDuration(info.startsAt, info.endsAt)
                          : "-"}
                      </td>
                      <td className="px-4 py-2 border border-border">
                        {info.status}
                      </td>
                    </tr>
                  )) ?? []
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
