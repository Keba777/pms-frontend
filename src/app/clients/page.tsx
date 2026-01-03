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
        return (
            <div className="p-12 text-center bg-destructive/10 rounded-2xl border border-destructive/20 max-w-md mx-auto mt-8">
                <p className="text-destructive font-black uppercase tracking-tight">Failed to load clients.</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-background min-h-screen space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <nav aria-label="breadcrumb">
                    <ol className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
                        <li className="text-muted-foreground/40">/</li>
                        <li className="text-foreground tracking-tighter">Clients</li>
                    </ol>
                </nav>

                <button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[10px] uppercase tracking-widest py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
                    onClick={() => setShowCreateForm(true)}
                >
                    <PlusIcon className="w-4 h-4" /> Add Client
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-card rounded-2xl border border-border shadow-sm">
                <table className="min-w-full text-sm text-left">
                    <thead className="text-[10px] text-primary-foreground uppercase bg-primary font-black tracking-widest">
                        <tr>
                            <th scope="col" className="px-6 py-4 border-b border-primary-foreground/10">Company Name</th>
                            <th scope="col" className="px-6 py-4 border-b border-primary-foreground/10">Responsible Person</th>
                            <th scope="col" className="px-6 py-4 border-b border-primary-foreground/10">Description</th>
                            <th scope="col" className="px-6 py-4 border-b border-primary-foreground/10 text-center">Status</th>
                            <th scope="col" className="px-6 py-4 border-b border-primary-foreground/10">Projects Info</th>
                            <th scope="col" className="px-6 py-4 border-b border-primary-foreground/10">Attachments</th>
                            <th scope="col" className="px-6 py-4 border-b border-primary-foreground/10 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {clients.length === 0 ? (
                            <tr className="bg-card">
                                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground/40 font-black uppercase tracking-widest text-[10px] italic">
                                    No clients found.
                                </td>
                            </tr>
                        ) : (
                            clients.map((client) => (
                                <tr key={client.id} className="bg-card hover:bg-accent/50 transition-colors group">
                                    <td className="px-6 py-4 font-bold text-foreground">
                                        {client.companyName}
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground font-medium">
                                        {client.responsiblePerson || "-"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="truncate max-w-xs text-xs text-muted-foreground/80" title={client.description}>
                                            {client.description || "-"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${client.status === 'Active' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                                            {client.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 min-w-[300px]">
                                        {client.projects && client.projects.length > 0 ? (
                                            <div className="space-y-2">
                                                {client.projects.map((project) => (
                                                    <div key={project.id} className="p-3 bg-muted/30 rounded-xl border border-border text-[10px] transition-colors hover:bg-muted/50">
                                                        <div className="font-black text-primary uppercase tracking-tight mb-1 line-clamp-1" title={project.title}>{project.title}</div>
                                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
                                                            <div><span className="font-black opacity-50 uppercase text-[8px]">Start:</span> {project.start_date ? new Date(project.start_date).toLocaleDateString() : "-"}</div>
                                                            <div><span className="font-black opacity-50 uppercase text-[8px]">Due:</span> {project.end_date ? new Date(project.end_date).toLocaleDateString() : "-"}</div>
                                                            <div><span className="font-black opacity-50 uppercase text-[8px]">Site:</span> {(project as any).projectSite?.name || "-"}</div>
                                                            <div><span className="font-black opacity-50 uppercase text-[8px]">Rem:</span> {getRemainingDays(project.end_date)}d</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 italic">No projects</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {client.attachments && client.attachments.length > 0 ? (
                                            <div className="flex flex-col gap-1.5">
                                                {client.attachments.map((att, idx) => (
                                                    <a key={idx} href={att} target="_blank" rel="noreferrer" className="text-primary hover:text-primary/80 text-[10px] font-bold uppercase tracking-wide truncate max-w-[150px] flex items-center gap-1">
                                                        <div className="w-1 h-1 rounded-full bg-primary/40" />
                                                        Attachment {idx + 1}
                                                    </a>
                                                ))}
                                            </div>
                                        ) : "-"}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Menu as="div" className="relative inline-block text-left">
                                            <MenuButton className="inline-flex justify-center items-center px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 focus:outline-none shadow-sm transition-all active:scale-95">
                                                Action <ChevronDown className="w-4 h-4 ml-2" aria-hidden="true" />
                                            </MenuButton>
                                            <MenuItems className="absolute right-0 w-32 mt-2 origin-top-right bg-card border border-border divide-y divide-border rounded-xl shadow-2xl focus:outline-none z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                                <div className="p-1">
                                                    <MenuItem>
                                                        {({ active }) => (
                                                            <button
                                                                onClick={() => handleEditClick(client)}
                                                                className={`${active ? 'bg-primary text-primary-foreground' : 'text-foreground'
                                                                    } group flex rounded-lg items-center w-full px-3 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors`}
                                                            >
                                                                <Edit2 className="w-3.5 h-3.5 mr-2" />
                                                                Edit
                                                            </button>
                                                        )}
                                                    </MenuItem>
                                                    <MenuItem>
                                                        {({ active }) => (
                                                            <button
                                                                onClick={() => handleDeleteClick(client.id)}
                                                                className={`${active ? 'bg-destructive text-white' : 'text-foreground'
                                                                    } group flex rounded-lg items-center w-full px-3 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors`}
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-lg mx-4 bg-card rounded-[2rem] shadow-2xl p-6 border border-border animate-in zoom-in-95 duration-300">
                        <ClientForm onClose={() => setShowCreateForm(false)} />
                    </div>
                </div>
            )}

            {showEditForm && clientToEdit && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-lg mx-4 bg-card rounded-[2rem] shadow-2xl p-6 border border-border animate-in zoom-in-95 duration-300">
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
