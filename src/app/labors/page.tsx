"use client";

import React, { useState } from "react";
import LaborForm from "@/components/forms/LaborForm";
import EditLaborForm from "@/components/forms/EditLaborForm";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useLabors, useUpdateLabor, useDeleteLabor } from "@/hooks/useLabors";
import { usePermissionsStore } from "@/store/permissionsStore";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { ChevronDown, Edit, PlusIcon, Trash2 } from "lucide-react";
import Link from "next/link";
import { Labor, UpdateLaborInput } from "@/types/labor";

const LaborPage = () => {
  const { data: labors, isLoading, error } = useLabors();
  const hasPermission = usePermissionsStore((state) => state.hasPermission);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLabor, setSelectedLabor] = useState<Labor | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string>("");

  const updateLabor = useUpdateLabor();
  const deleteLabor = useDeleteLabor();

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleEdit = (id: string) => {
    const labor = labors?.find((l) => l.id === id) ?? null;
    if (labor) {
      setSelectedLabor(labor);
      setShowEditModal(true);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    deleteLabor.mutate(deleteId, {
      onSuccess: () => setShowDeleteModal(false),
    });
  };

  const handleUpdateSubmit = (data: UpdateLaborInput) => {
    updateLabor.mutate(data, {
      onSuccess: () => setShowEditModal(false),
    });
  };

  if (isLoading) return <div>Loading labors...</div>;
  if (error) return <div>Error loading labors.</div>;

  const headers = [
    "ID",
    "Role",
    "Unit",
    "Min Quantity",
    "Estimated Hours",
    "Rate",
    "Total Amount",
    "Skill Level",
    "Actions",
  ];

  return (
    <div>
      {/* Breadcrumb & Add Button */}
      <div className="flex justify-between mb-4 mt-4">
        <nav aria-label="breadcrumb">
          <ol className="flex space-x-2">
            <li>
              <Link href="/" className="text-blue-600 hover:underline">
                Home
              </Link>
            </li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-900 font-semibold">Labors</li>
          </ol>
        </nav>
        {hasPermission("create projects") && (
          <button
            className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-2 px-3 rounded text-sm"
            onClick={handleAdd}
          >
            <PlusIcon width={15} height={12} />
          </button>
        )}
      </div>

      {/* Add Labor Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <LaborForm onClose={() => setShowAddModal(false)} />
          </div>
        </div>
      )}

      {/* Edit Labor Modal */}
      {showEditModal && selectedLabor && (
        <div className="modal-overlay">
          <div className="modal-content">
            <EditLaborForm
              labor={selectedLabor}
              onClose={() => setShowEditModal(false)}
              onSubmit={handleUpdateSubmit}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isVisible={showDeleteModal}
        title="Delete Labor"
        message="Are you sure you want to delete this labor? This action cannot be undone."
        showInput={true}
        confirmText="DELETE"
        confirmButtonText="Delete"
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />

      {/* Labor Table */}
      <div className="p-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
          <thead className="bg-cyan-700">
            <tr>
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase tracking-wider border border-gray-200"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {labors && labors.length > 0 ? (
              labors.map((lab, idx) => (
                <tr key={lab.id}>
                  <td className="px-4 py-2 border border-gray-200">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {lab.role}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {lab.unit}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {lab.minQuantity ?? "—"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {lab.estimatedHours ?? "—"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {lab.rate ?? "—"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {lab.totalAmount ?? "—"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {lab.skill_level ?? "—"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    <Menu as="div" className="relative inline-block text-left">
                      <MenuButton className="inline-flex justify-center items-center px-3 py-1 bg-cyan-700 text-white text-sm rounded hover:bg-cyan-800">
                        Actions <ChevronDown className="ml-1 w-4 h-4" />
                      </MenuButton>
                      <MenuItems className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-10">
                        <MenuItem>
                          {({ active }) => (
                            <button
                              onClick={() => handleEdit(lab.id)}
                              className={`flex items-center w-full px-4 py-2 text-sm ${
                                active ? "bg-gray-100" : ""
                              }`}
                            >
                              <Edit size={16} className="mr-2" /> Edit
                            </button>
                          )}
                        </MenuItem>
                        <MenuItem>
                          {({ active }) => (
                            <button
                              onClick={() => handleDelete(lab.id)}
                              className={`flex items-center w-full px-4 py-2 text-sm text-red-600 ${
                                active ? "bg-gray-100" : ""
                              }`}
                            >
                              <Trash2 size={16} className="mr-2" /> Delete
                            </button>
                          )}
                        </MenuItem>
                      </MenuItems>
                    </Menu>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-4 py-2 text-center border border-gray-200"
                >
                  No labor records available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LaborPage;
