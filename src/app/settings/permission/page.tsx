// app/settings/permissions/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useRoles, useDeleteRole } from "@/hooks/useRoles";
import { Role } from "@/types/user";

const PermissionsPage: React.FC = () => {
  const router = useRouter();
  const { data: roles, isLoading, isError } = useRoles();
  const deleteRole = useDeleteRole();

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this role?")) {
      deleteRole.mutate(id);
    }
  };

  const renderBadges = (role: Role) => {
    if (role.name.toLowerCase() === "admin") {
      return (
        <span className="inline-block bg-primary text-primary-foreground text-xs px-3 py-1 rounded">
          ADMIN HAS ALL THE PERMISSIONS
        </span>
      );
    }
    if (!role.permissions || Object.keys(role.permissions).length === 0) {
      return (
        <span className="text-muted-foreground italic">No Permissions Assigned!</span>
      );
    }
    return Object.entries(role.permissions).flatMap(([resource, actions]) => {
      if (!actions) return [];
      return (Object.entries(actions) as [string, boolean][])
        .filter(([, allowed]) => allowed)
        .map(([action]) => (
          <span
            key={`${resource}-${action}`}
            className="inline-block bg-primary/20 text-primary text-xs px-2 py-1 rounded mr-2 mb-1 border border-primary/20"
          >
            {action.toUpperCase()} {resource.replace(/_/g, " ").toUpperCase()}
          </span>
        ));
    });
  };

  if (isLoading) return <div className="p-6 text-muted-foreground">Loading…</div>;
  if (isError)
    return <div className="p-6 text-destructive">Error loading roles.</div>;

  return (
    <div className="p-6 bg-background min-h-screen">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6 flex justify-between items-center">
        <div>
          <Link href="/" className="hover:underline hover:text-primary">
            Home
          </Link>{" "}
          &gt; <span className="hover:underline px-2 cursor-pointer">Settings</span> &gt;{" "}
          <span className="font-semibold text-foreground">Permissions</span>
        </div>

        {/* Header */}
        <div className=" px-6 py-4 ">
          <button
            onClick={() => router.push("/roles/create")}
            className="flex items-center bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-md px-3 py-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
          </button>
        </div>
      </nav>

      {/* Card */}
      <div className="bg-card shadow-sm rounded-lg border border-border">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="pt-6">
                <th className="px-6 py-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-6 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-card divide-y divide-border">
              {roles!.map((role) => {
                const isAdmin = role.name.toLowerCase() === "admin";
                return (
                  <tr key={role.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-xl font-bold text-foreground">
                      {role.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap">{renderBadges(role)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      {isAdmin ? (
                        <span className="text-muted-foreground/50">–</span>
                      ) : (
                        <>
                          <button
                            onClick={() =>
                              router.push(`/roles/edit/${role.id}`)
                            }
                            className="text-primary hover:text-primary/80 mr-4 transition-colors"
                            title="Edit Role"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(role.id!)}
                            className="text-destructive hover:text-destructive/80 transition-colors"
                            title="Delete Role"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PermissionsPage;
