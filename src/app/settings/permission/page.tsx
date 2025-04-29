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
        <span className="inline-block bg-green-500 text-white text-xs px-3 py-1 rounded">
          ADMIN HAS ALL THE PERMISSIONS
        </span>
      );
    }
    if (!role.permissions || Object.keys(role.permissions).length === 0) {
      return (
        <span className="text-gray-500 italic">No Permissions Assigned!</span>
      );
    }
    return Object.entries(role.permissions).flatMap(([resource, actions]) => {
      if (!actions) return [];
      return (Object.entries(actions) as [string, boolean][])
        .filter(([, allowed]) => allowed)
        .map(([action]) => (
          <span
            key={`${resource}-${action}`}
            className="inline-block bg-indigo-600 text-white text-xs px-2 py-1 rounded mr-2 mb-1"
          >
            {action.toUpperCase()} {resource.replace(/_/g, " ").toUpperCase()}
          </span>
        ));
    });
  };

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (isError)
    return <div className="p-6 text-red-500">Error loading roles.</div>;

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex justify-between items-center">
        <div>
          <Link href="/" className="hover:underline">
            Home
          </Link>{" "}
          &gt; <span className="hover:underline px-2">Settings</span> &gt;{" "}
          <span className="font-semibold text-gray-800">Permissions</span>
        </div>

        {/* Header */}
        <div className=" px-6 py-4 ">
          <button
            onClick={() => router.push("/roles/create")}
            className="flex items-center bg-cyan-700 hover:bg-cyan-800 text-white text-sm font-medium rounded-md px-3 py-2"
          >
            <Plus className="w-4 h-4 mr-1" />
          </button>
        </div>
      </nav>

      {/* Card */}
      <div className="bg-white shadow rounded-lg">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="pt-6">
                <th className="px-6 py-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-6 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {roles!.map((role) => {
                const isAdmin = role.name.toLowerCase() === "admin";
                return (
                  <tr key={role.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-xl font-bold ">
                      {role.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap">{renderBadges(role)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      {isAdmin ? (
                        <span className="text-gray-400">–</span>
                      ) : (
                        <>
                          <button
                            onClick={() =>
                              router.push(`/roles/edit/${role.id}`)
                            }
                            className="text-blue-600 hover:text-blue-800 mr-4"
                            title="Edit Role"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(role.id!)}
                            className="text-red-600 hover:text-red-800"
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
