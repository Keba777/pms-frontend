"use client";

import { useRequestStore } from '@/store/requestStore';
import { useMaterials } from '@/hooks/useMaterials';
import { useLabors } from '@/hooks/useLabors';
import { useEquipments } from '@/hooks/useEquipments';
import React from 'react';
import { useParams } from 'next/navigation';

const RequestDetailPage = () => {
  const params = useParams();
  const requestId = params.id as string;
  const requests = useRequestStore((state) => state.requests);
  const request = requests.find((req) => req.id === requestId);

  const { data: materials = [] } = useMaterials();
  const { data: labors = [] } = useLabors();
  const { data: equipments = [] } = useEquipments();

  const matchedMaterials = materials.filter((m) => request?.materialIds?.includes(m.id));
  const matchedLabors = labors.filter((l) => request?.laborIds?.includes(l.id));
  const matchedEquipments = equipments.filter((e) => request?.equipmentIds?.includes(e.id));

  if (!request) {
    return <div className="text-muted-foreground p-10 text-center font-bold">Request not found</div>;
  }

  const resources = [
    {
      title: 'Materials',
      items: matchedMaterials,
      labelKey: 'item',
    },
    {
      title: 'Labors',
      items: matchedLabors,
      labelKey: 'role',
    },
    {
      title: 'Equipments',
      items: matchedEquipments,
      labelKey: 'item',
    },
  ];

  return (
    <div className="p-4 sm:p-6 bg-background min-h-screen">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-muted/30 p-4 rounded-xl border border-border">
        <h1 className="text-xl sm:text-2xl font-black text-primary uppercase tracking-tight">
          Request Details
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-card p-6 rounded-2xl border border-border shadow-sm mb-8">
        {[
          { label: "User", value: request.user?.first_name || "N/A" },
          { label: "Status", value: request.status },
          { label: "Department", value: request.department?.name || "N/A" },
          { label: "Site", value: request.site?.name || "N/A" },
          { label: "Activity", value: request.activity?.activity_name || "N/A" },
          ...(matchedMaterials.length > 0 ? [{ label: "Material Count", value: matchedMaterials.length }] : []),
          ...(matchedLabors.length > 0 ? [{ label: "Labor Count", value: matchedLabors.length }] : []),
          ...(matchedEquipments.length > 0 ? [{ label: "Equipment Count", value: matchedEquipments.length }] : []),
        ].map((item) => (
          <div key={item.label} className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{item.label}</span>
            <span className="text-sm font-bold text-foreground">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((res) => (
          res.items.length > 0 && (
            <div key={res.title} className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <h3 className="text-sm font-black text-primary uppercase tracking-wider">{res.title}</h3>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold">
                  {res.items.length}
                </span>
              </div>
              <ul className="flex flex-col gap-3">
                {res.items.map((item) => (
                  <li key={item.id} className="text-sm font-bold text-foreground/90 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {item[res.labelKey as keyof typeof item]}
                  </li>
                ))}
              </ul>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default RequestDetailPage;
