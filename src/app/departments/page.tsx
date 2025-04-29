"use client";

import React, { useState } from "react";
import { useDepartments, useDeleteDepartment } from "@/hooks/useDepartments";
import { Department } from "@/types/department";
import { format } from "date-fns";
import { Pencil, Plus, Trash2 } from "lucide-react";
import DepartmentForm from "@/components/forms/DepartmentForm";
import ConfirmModal from "@/components/ui/ConfirmModal";

const DepartmentPage = () => {
  const { data: departments, isLoading, error } = useDepartments();
  const { mutate: deleteDepartment, isPending: isDeleting } =
    useDeleteDepartment();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentDept, setCurrentDept] = useState<Department | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleCreate = () => {
    setCurrentDept(null);
    setShowCreateForm(true);
  };

  const handleEdit = (dept: Department) => {
    setCurrentDept(dept);
    setShowEditForm(true);
  };

  const handleDeleteClick = (dept: Department) => {
    setCurrentDept(dept);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (!currentDept) return;
    deleteDepartment(currentDept.id, {
      onSuccess: () => setShowDeleteModal(false),
    });
  };

  return (
    <div className="p-6 bg-transparent">
      <div className="flex justify-between items-center mb-8">
        <p className="font-semibold">
          Home {" > "} Departments {" > "} List
        </p>
        <button
          onClick={handleCreate}
          className="bg-cyan-700 flex text-gray-200 font-medium text-xs px-3 py-2 rounded-md hover:bg-cyan-600 transition"
        >
          <Plus size={14} className="mr-1" /> Create
        </button>
      </div>

      {/* Create / Edit Modal */}
      {(showCreateForm || showEditForm) && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-content bg-white rounded-lg shadow-xl p-6 max-w-lg w-full">
            <DepartmentForm
              onClose={() => {
                setShowCreateForm(false);
                setShowEditForm(false);
                setCurrentDept(null);
              }}
              defaultDepartment={currentDept || undefined}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && currentDept && (
        <ConfirmModal
          isVisible={showDeleteModal}
          title="Confirm Department Deletion"
          message={`Are you sure you want to delete ${currentDept.name}?`}
          showInput={false}
          confirmText="DELETE"
          confirmButtonText={isDeleting ? "Deleting..." : "Delete"}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {isLoading && <p className="text-center text-gray-600">Loading...</p>}
      {error && (
        <p className="text-center text-red-500">Error fetching departments.</p>
      )}

      {departments?.length ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 shadow-lg rounded-lg overflow-hidden">
            <thead className="bg-cyan-700 text-white">
              <tr>
                <th className="border border-gray-300 px-4 py-2">Name</th>
                <th className="border border-gray-300 px-4 py-2">
                  Sub-Departments
                </th>
                <th className="border border-gray-300 px-4 py-2">Created At</th>
                <th className="border border-gray-300 px-4 py-2">Status</th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr
                  key={dept.id}
                  className="bg-white hover:bg-gray-100 transition"
                >
                  <td className="border border-gray-300 px-4 py-2 font-semibold">
                    {dept.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {dept.subDepartment?.length ? (
                      <ul className="list-disc pl-5">
                        {dept.subDepartment.map((sub, idx) => (
                          <li key={idx} className="text-gray-700">
                            {sub.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-500">No sub-departments</span>
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-600">
                    {dept.createdAt
                      ? format(new Date(dept.createdAt), "PPpp")
                      : "N/A"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-full ${
                        dept.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : dept.status === "Inactive"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {dept.status}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(dept)}
                      className="p-2 text-cyan-700 border border-cyan-700 rounded-lg hover:bg-cyan-700 hover:text-white transition"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(dept)}
                      className="p-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-600">No departments available.</p>
      )}
    </div>
  );
};

export default DepartmentPage;
