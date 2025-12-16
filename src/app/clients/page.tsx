"use client";

import React, { useState } from "react";
import { useClients, useDeleteClient } from "@/hooks/useClients";
import { IClient } from "@/types/client";
import ClientForm from "@/components/forms/ClientForm";
import EditClientForm from "@/components/forms/EditClientForm";
import ConfirmModal from "@/components/common/ui/ConfirmModal";
import Link from "next/link";
import { PlusIcon, ChevronDown, Edit2 } from "lucide-react";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";

const ClientsPage = () => {
    const { data: clients = [], isLoading, isError } = useClients();
    const { mutate: deleteClient } = useDeleteClient();

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [clientToEdit, setClientToEdit] = useState<IClient | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

    const handleDeleteClick = (id: string) => {
        setSelectedClientId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (selectedClientId) {
            deleteClient(selectedClientId);
            setIsDeleteModalOpen(false);
        }
    };

    const handleEditClick = (client: IClient) => {
        setClientToEdit(client);
        setShowEditForm(true);
    };

    if (isLoading) {
        return <div className="p-8 text-center">Loading clients...</div>;
    }

    if (isError) {
        return <div className="p-8 text-center text-red-500">Failed to load clients.</div>;
    }

    return (
        <div className="p-4 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <nav aria-label="breadcrumb">
                    <ol className="flex space-x-2">
                        <li><Link href="/" className="text-blue-600 hover:underline">Home</Link></li>
                        <li className="text-gray-500">/</li>
                        <li className="text-gray-900 font-semibold">Clients</li>
                    </ol>
                </nav>

                <button
                    className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-2 px-3 rounded text-sm flex items-center gap-2"
                    onClick={() => setShowCreateForm(true)}
                >
                    <PlusIcon className="w-4 h-4" /> Add Client
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto shadow-md sm:rounded-lg">
                <table className="min-w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-white uppercase bg-cyan-700">
                        <tr>
                            <th scope="col" className="px-6 py-3">Company Name</th>
                            <th scope="col" className="px-6 py-3">Responsible Person</th>
                            <th scope="col" className="px-6 py-3">Description</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Projects Info</th>
                            <th scope="col" className="px-6 py-3">Attachments</th>
                            <th scope="col" className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.length === 0 ? (
                            <tr className="bg-white border-b">
                                <td colSpan={7} className="px-6 py-4 text-center">
                                    No clients found.
                                </td>
                            </tr>
                        ) : (
                            clients.map((client) => (
                                <tr key={client.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                        {client.companyName}
                                    </td>
                                    <td className="px-6 py-4">
                                        {client.responsiblePerson || "-"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="truncate max-w-xs" title={client.description}>
                                            {client.description || "-"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${client.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {client.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 min-w-[300px]">
                                        {client.projects && client.projects.length > 0 ? (
                                            <div className="space-y-2">
                                                {client.projects.map((project) => (
                                                    <div key={project.id} className="p-2 bg-gray-50 rounded border text-xs">
                                                        <div className="font-semibold text-cyan-700 mb-1 line-clamp-1" title={project.title}>{project.title}</div>
                                                        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                                            <div><span className="text-gray-500">Start:</span> {project.start_date ? new Date(project.start_date).toLocaleDateString() : "-"}</div>
                                                            <div><span className="text-gray-500">Due:</span> {project.end_date ? new Date(project.end_date).toLocaleDateString() : "-"}</div>
                                                            <div><span className="text-gray-500">Site:</span> {(project as any).projectSite?.name || "-"}</div>
                                                            <div><span className="text-gray-500">Rem:</span> {getRemainingDays(project.end_date)}d</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">No projects</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {client.attachments && client.attachments.length > 0 ? (
                                             <div className="flex flex-col gap-1">
                                                 {client.attachments.map((att, idx) => (
                                                     <a key={idx} href={att} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs truncate max-w-[150px]">
                                                         Attachment {idx + 1}
                                                     </a>
                                                 ))}
                                             </div>
                                        ) : "-"}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                       <Menu as="div" className="relative inline-block text-left">
                                            <MenuButton className="inline-flex justify-center w-full px-2 py-1 text-sm font-medium text-white bg-cyan-700 rounded-md hover:bg-cyan-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                                                Action <ChevronDown className="w-4 h-4 ml-2 -mr-1" aria-hidden="true" />
                                            </MenuButton>
                                            <MenuItems className="absolute right-0 w-32 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                                <div className="px-1 py-1">
                                                    <MenuItem>
                                                        {({ active }) => (
                                                            <button
                                                                onClick={() => handleEditClick(client)}
                                                                className={`${
                                                                    active ? 'bg-cyan-700 text-white' : 'text-gray-900'
                                                                } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                                            >
                                                                <Edit2 className="w-4 h-4 mr-2" />
                                                                Edit
                                                            </button>
                                                        )}
                                                    </MenuItem>
                                                    <MenuItem>
                                                        {({ active }) => (
                                                            <button
                                                                onClick={() => handleDeleteClick(client.id)}
                                                                className={`${
                                                                    active ? 'bg-red-500 text-white' : 'text-gray-900'
                                                                } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                                            >
                                                                Delete
                                                            </button>
                                                        )}
                                                    </MenuItem>
                                                </div>
                                            </MenuItems>
                                        </Menu>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            {showCreateForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-lg mx-4">
                        <ClientForm onClose={() => setShowCreateForm(false)} />
                    </div>
                </div>
            )}

            {showEditForm && clientToEdit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-lg mx-4">
                        <EditClientForm client={clientToEdit} onClose={() => setShowEditForm(false)} />
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <ConfirmModal
                    isVisible={isDeleteModalOpen}
                    title="Delete Client"
                    message="Are you sure you want to delete this client? This action cannot be undone."
                    confirmText="DELETE"
                    confirmButtonText="Delete"
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    showInput={false}
                />
            )}
        </div>
    );
};

// Helper to calculate remaining days
function getRemainingDays(endDate: string | Date | undefined): number | string {
    if (!endDate) return "-";
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

export default ClientsPage;
