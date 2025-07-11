"use client";

import { useRequestStore } from '@/store/requestStore';
import { useMaterials } from '@/hooks/useMaterials';
import { useLabors } from '@/hooks/useLabors';
import { useEquipments } from '@/hooks/useEquipments';
import React from 'react';

interface ClientRequestDetailProps {
  requestId: string;
}

const ClientRequestDetail = ({ requestId }: ClientRequestDetailProps) => {
  const requests = useRequestStore((state) => state.requests);
  const request = requests.find((req) => req.id === requestId);

  const { data: materials = [] } = useMaterials();
  const { data: labors = [] } = useLabors();
  const { data: equipments = [] } = useEquipments();

  const matchedMaterials = materials.filter((m) => request?.materialIds?.includes(m.id));
  const matchedLabors = labors.filter((l) => request?.laborIds?.includes(l.id));
  const matchedEquipments = equipments.filter((e) => request?.equipmentIds?.includes(e.id));

  if (!request) {
    return <div className="text-gray-600">Request not found</div>;
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
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h2 className="text-3xl font-bold text-cyan-800 mb-6">Request Details</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-6 rounded-2xl shadow-md">
        <div><strong>User:</strong> {request.user?.first_name || 'N/A'}</div>
        <div><strong>Status:</strong> {request.status}</div>
        <div><strong>Department:</strong> {request.department?.name || 'N/A'}</div>
        <div><strong>Site:</strong> {request.site?.name || 'N/A'}</div>
        <div><strong>Activity:</strong> {request.activity?.activity_name || 'N/A'}</div>
        {matchedMaterials.length > 0 && <div><strong>Material Count:</strong> {matchedMaterials.length}</div>}
        {matchedLabors.length > 0 && <div><strong>Labor Count:</strong> {matchedLabors.length}</div>}
        {matchedEquipments.length > 0 && <div><strong>Equipment Count:</strong> {matchedEquipments.length}</div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {resources.map((res) => (
          res.items.length > 0 && (
            <div key={res.title} className="bg-white p-5 rounded-2xl shadow-sm">
              <h3 className="text-xl font-semibold text-cyan-700 mb-3">{res.title}</h3>
              <ul className="list-disc pl-4 text-gray-700">
                {res.items.map((item) => (
                  <li key={item.id}>{item[res.labelKey as keyof typeof item]}</li>
                ))}
              </ul>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default ClientRequestDetail;
