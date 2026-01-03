"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDepartments, useDeleteDepartment } from "@/hooks/useDepartments";
import { Department } from "@/types/department";
import { format } from "date-fns";
import { Pencil, Plus, Trash2 } from "lucide-react";
import DepartmentForm from "@/components/forms/DepartmentForm";
import ConfirmModal from "@/components/common/ui/ConfirmModal";

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
    <div className="p-6 bg-background min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <nav className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Departments</span>
          <span className="mx-2">/</span>
          <span className="text-foreground">List</span>
        </nav>
        <button
          onClick={handleCreate}
          className="bg-primary flex text-primary-foreground font-black text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-primary/90 transition shadow-lg shadow-primary/20 active:scale-95"
        >
          <Plus size={14} className="mr-1.5" /> Create
        </button>
      </div>

      {/* Create / Edit Modal */}
      {(showCreateForm || showEditForm) && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="modal-content bg-card rounded-2xl shadow-2xl p-6 max-w-lg w-full border border-border">
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

      {isLoading && <p className="text-center text-muted-foreground py-12 font-black uppercase tracking-widest text-[10px]">Loading...</p>}
      {error && (
        <div className="p-12 text-center bg-destructive/10 rounded-2xl border border-destructive/20 max-w-md mx-auto">
          <p className="text-destructive font-black uppercase tracking-tight">Error fetching departments.</p>
        </div>
      )}

      {departments?.length ? (
        <div className="overflow-x-auto bg-card rounded-2xl border border-border shadow-sm">
          <table className="w-full border-collapse overflow-hidden">
            <thead className="bg-primary text-primary-foreground">
              <tr>
                <th className="border-b border-r border-primary-foreground/10 px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Name</th>
                <th className="border-b border-r border-primary-foreground/10 px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">
                  Sub-Departments
                </th>
                <th className="border-b border-r border-primary-foreground/10 px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Created At</th>
                <th className="border-b border-r border-primary-foreground/10 px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest">Status</th>
                <th className="border-b px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {departments.map((dept) => (
                <tr
                  key={dept.id}
                  className="bg-card hover:bg-accent/50 transition-colors group"
                >
                  <td className="px-6 py-4 font-bold text-foreground">
                    {dept.name}
                  </td>
                  <td className="px-6 py-4">
                    {dept.subDepartment?.length ? (
                      <ul className="space-y-1">
                        {dept.subDepartment.map((sub, idx) => (
                          <li key={idx} className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                            {sub.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">No sub-departments</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-muted-foreground">
                    {dept.createdAt
                      ? format(new Date(dept.createdAt), "PP")
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full ${dept.status === "Active"
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : dept.status === "Inactive"
                          ? "bg-destructive/10 text-destructive border border-destructive/20"
                          : "bg-amber-100 text-amber-700 border border-amber-200"
                        }`}
                    >
                      {dept.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(dept)}
                      className="p-2 text-primary border border-border rounded-xl hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm active:scale-90"
                      title="Edit Department"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(dept)}
                      className="p-2 text-destructive border border-border rounded-xl hover:bg-destructive hover:text-white hover:border-destructive transition-all shadow-sm active:scale-90"
                      title="Delete Department"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-20 text-center bg-card rounded-2xl border border-dashed border-border">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">No departments available.</p>
        </div>
      )}
    </div>
  );
};

export default DepartmentPage;
