"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useOrganizations } from "@/hooks/useOrganizations";
import { Building, Plus, Settings } from "lucide-react";
import Spinner from "@/components/common/ui/Spinner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import MetricsCard from "@/components/users/MetricsCard";
import OrganizationForm from "@/components/forms/OrganizationForm";

const SystemAdminOrganizationsPage = () => {
    const { user } = useAuthStore();
    const router = useRouter();
    const [showForm, setShowForm] = useState(false);

    const { data: organizations = [], isLoading, isError } = useOrganizations();

    const metrics = useMemo(() => [
        { title: "Total Organizations", value: organizations.length, icon: <Building className="h-6 w-6 text-cyan-700" /> },
    ], [organizations]);

    if (isLoading) return <div className="flex justify-center p-12"><Spinner /></div>;
    if (isError) return <div className="text-red-600 text-center p-12">Error loading organizations</div>;

    return (
        <div className="p-4">
            {/* Header with breadcrumb and actions */}
            <div className="flex flex-wrap justify-between items-center mb-4 mt-4 gap-2">
                <nav className="hidden md:block" aria-label="breadcrumb">
                    <ol className="flex space-x-2 text-sm sm:text-base">
                        <li>
                            <Link href="/" className="text-blue-600 hover:underline">
                                Home
                            </Link>
                        </li>
                        <li className="text-gray-500">/</li>
                        <li className="text-gray-900 font-semibold">Organizations</li>
                    </ol>
                </nav>

                <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
                    <button
                        className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 flex items-center gap-1"
                        onClick={() => setShowForm(true)}
                    >
                        <span className="md:hidden">Add New</span>
                        <Plus width={14} height={14} className="hidden md:inline" />
                    </button>
                </div>
            </div>

            {/* Modal */}
            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <OrganizationForm onClose={() => setShowForm(false)} />
                    </div>
                </div>
            )}

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {metrics.map((m) => (
                    <MetricsCard key={m.title} {...m} />
                ))}
            </div>

            {/* Table - Responsive like projects */}
            <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
                <table className="min-w-max w-full divide-y divide-gray-200">
                    <thead className="bg-cyan-700">
                        <tr>
                            <th className="border border-gray-200 px-4 py-2 text-center text-sm font-medium text-gray-50">Logo</th>
                            <th className="border border-gray-200 px-6 py-4 text-left text-sm font-medium text-gray-50">Name</th>
                            <th className="border border-gray-200 px-6 py-4 text-left text-sm font-medium text-gray-50">Status</th>
                            <th className="border border-gray-200 px-6 py-4 text-left text-sm font-medium text-gray-50">Users</th>
                            <th className="border border-gray-200 px-6 py-4 text-left text-sm font-medium text-gray-50">Created At</th>
                            <th className="border border-gray-200 px-6 py-4 text-center text-sm font-medium text-gray-50">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {organizations.map((org) => (
                            <tr key={org.id} className="hover:bg-gray-50 transition-colors">
                                <td className="border border-gray-200 px-4 py-2 text-center">
                                    {org.logo ? (
                                        <Image src={org.logo} alt={org.orgName} width={40} height={40} className="h-10 w-10 object-contain rounded mx-auto" />
                                    ) : (
                                        <div className="h-10 w-10 bg-gray-100 flex items-center justify-center rounded text-gray-400 mx-auto">
                                            <Building size={20} />
                                        </div>
                                    )}
                                </td>
                                <td className="border border-gray-200 px-6 py-3 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{org.orgName}</div>
                                </td>
                                <td className="border border-gray-200 px-6 py-3 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        Active
                                    </span>
                                </td>
                                <td className="border border-gray-200 px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {org.users?.length || 0}
                                </td>
                                <td className="border border-gray-200 px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(org.createdAt!).toLocaleDateString()}
                                </td>
                                <td className="border border-gray-200 px-6 py-3 whitespace-nowrap text-center text-sm font-medium">
                                    <Link
                                        href={`/organizations/${org.id}`}
                                        className="text-cyan-600 hover:text-cyan-900 inline-flex items-center gap-1"
                                    >
                                        <Settings size={16} /> Branding
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SystemAdminOrganizationsPage;

