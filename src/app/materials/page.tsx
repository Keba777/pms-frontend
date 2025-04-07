"use client";

import { useMaterials } from "@/hooks/useMaterials";
import { Edit, Trash2 } from "lucide-react";

const MaterialsPage = () => {
  const { data: materials, isLoading, error } = useMaterials();

  if (isLoading) {
    return <div>Loading materials...</div>;
  }

  if (error) {
    return <div>Error loading materials.</div>;
  }

  return (
    <div className="p-4">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Item
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantity
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Warehouse ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rate (with VAT)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Unit
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Financial Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created At
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {(materials ?? []).map((material) => (
            <tr key={material.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {material.item}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {material.quantity}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {material.warehouse_id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {material.rate_with_vat}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {material.unit}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {material.financial_status || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {material.createdAt
                  ? new Date(material.createdAt).toLocaleDateString()
                  : "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-900">
                    <Edit size={16} />
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MaterialsPage;
