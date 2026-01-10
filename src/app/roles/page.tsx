"use client";

import React, { useState, useMemo } from "react";
import { useRoles, useDeleteRole } from "@/hooks/useRoles";
import { ReusableTable, ColumnConfig } from "@/components/common/ReusableTable";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Shield, Trash2 } from "lucide-react";
import RoleForm from "@/components/forms/RoleForm";
import ConfirmModal from "@/components/common/ui/ConfirmModal";
import { Role } from "@/types/user";
import MetricsCard from "@/components/users/MetricsCard"; // Reusing MetricsCard
import { formatDate } from "@/utils/dateUtils"; // Assuming this exists or I use generic date
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import { toast } from "react-toastify";

const RolesPage = () => {
    const { data: roles = [], isLoading, isError } = useRoles();
    const { mutate: deleteRole } = useDeleteRole();

    const [showForm, setShowForm] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const handleDeleteClick = (id: string) => {
        setSelectedRoleId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (selectedRoleId) {
            deleteRole(selectedRoleId);
            setIsDeleteModalOpen(false);
        }
    };

    // Columns for ReusableTable
    const columns: ColumnConfig<Role>[] = useMemo(
        () => [
            {
                key: "id",
                label: "ID",
                render: (_, index) => <div className="text-center">{index + 1}</div>,
            },
            {
                key: "name",
                label: "Role Name",
                render: (role) => <span className="font-medium">{role.name}</span>,
            },
            {
                key: "createdAt", // Assuming createdAt exists on generic models or we use a fallback
                label: "Created At",
                render: (role: any) =>
                    role.createdAt ? new Date(role.createdAt).toLocaleDateString() : "—",
            },
            {
                key: "actions",
                label: "Actions",
                render: (role) => (
                    <div className="flex justify-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(role.id!)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                ),
            },
        ],
        []
    );

    // Columns for Export
    const downloadColumns: Column<Role>[] = [
        { header: "ID", accessor: (_r, index) => index !== undefined ? index + 1 : "-" },
        { header: "Name", accessor: "name" },
        {
            header: "Created At",
            accessor: (r: any) =>
                r.createdAt ? new Date(r.createdAt).toISOString() : "-",
        },
    ];

    const filteredRoles = useMemo(() => {
        if (!searchTerm) return roles;
        const lower = searchTerm.toLowerCase();
        return roles.filter((r) => r.name.toLowerCase().includes(lower));
    }, [roles, searchTerm]);

    return (
        <div className="p-6 bg-gray-50/30 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col mb-8 gap-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                            Roles Overview
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage access and permissions for your team.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <GenericDownloads
                            data={roles}
                            title="Export Roles"
                            columns={downloadColumns}
                        />
                        <Button
                            onClick={() => setShowForm(true)}
                            className="bg-primary hover:bg-primary/90 text-white font-semibold shadow-md px-6"
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Add New Role
                        </Button>
                    </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricsCard
                        title="Total Roles"
                        value={roles.length}
                        icon={<Shield className="h-6 w-6 text-primary" />}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <ReusableTable
                    title="All Roles"
                    data={filteredRoles}
                    columns={columns}
                    isLoading={isLoading}
                    isError={isError}
                    errorMessage="Failed to load roles"
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    placeholder="Search roles..."
                />
            </div>

            {/* Modal for Creating Role */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <RoleForm onClose={() => setShowForm(false)} />
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmModal
                isVisible={isDeleteModalOpen}
                title="Delete Role"
                message="Are you sure you want to delete this role? This action cannot be undone."
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                confirmText="DELETE"
                confirmButtonText="Delete"
                showInput={false}
            />
        </div>
    );
};

export default RolesPage;
