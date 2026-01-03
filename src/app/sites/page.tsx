"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { PlusIcon, ChevronDown, Eye, Edit2, Trash2 } from "lucide-react";

import Spinner from "@/components/common/ui/Spinner";
import MetricsCard from "@/components/users/MetricsCard";
import ConfirmModal from "@/components/common/ui/ConfirmModal";
import SiteForm from "@/components/forms/SiteForm";
import EditSiteForm from "@/components/forms/EditSiteForm";

import { useSites, useDeleteSite, useUpdateSite } from "@/hooks/useSites";
import { Site, UpdateSiteInput } from "@/types/site";

export default function SitesPage() {
  const router = useRouter();
  const { data: sites = [], isLoading, isError, error } = useSites();

  const { mutate: deleteSite } = useDeleteSite();
  const { mutate: updateSite } = useUpdateSite();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [siteToEdit, setSiteToEdit] = useState<Site | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-12 text-center bg-destructive/10 rounded-2xl border border-destructive/20 max-w-md mx-auto mt-8">
        <p className="text-destructive font-black uppercase tracking-tight">Failed to load sites.</p>
        <p className="text-[10px] font-bold text-destructive/60 uppercase mt-2">{(error as Error).message || "Please try again."}</p>
      </div>
    );
  }

  // Aggregate metrics
  const totalSites = sites.length;
  const totalUsers = sites.reduce((sum, s) => sum + (s.users?.length ?? 0), 0);
  const totalProjects = sites.reduce(
    (sum, s) => sum + (s.projects?.length ?? 0),
    0
  );
  const totalWarehouses = sites.reduce(
    (sum, s) => sum + (s.warehouses?.length ?? 0),
    0
  );
  const totalEquipment = sites.reduce(
    (sum, s) => sum + (s.equipments?.length ?? 0),
    0
  );
  const totalLabors = sites.reduce(
    (sum, s) => sum + (s.labors?.length ?? 0),
    0
  );

  const metrics = [
    {
      title: "Sites",
      value: totalSites,
      icon: <PlusIcon className="h-6 w-6 text-primary" />,
    },
    {
      title: "Users",
      value: totalUsers,
      icon: <Eye className="h-6 w-6 text-primary" />,
    },
    {
      title: "Projects",
      value: totalProjects,
      icon: <Edit2 className="h-6 w-6 text-primary" />,
    },
    {
      title: "Warehouses",
      value: totalWarehouses,
      icon: <Edit2 className="h-6 w-6 text-primary" />,
    },
    {
      title: "Equipment",
      value: totalEquipment,
      icon: <Edit2 className="h-6 w-6 text-primary" />,
    },
    {
      title: "Labors",
      value: totalLabors,
      icon: <Edit2 className="h-6 w-6 text-primary" />,
    },
  ];

  const openDeleteModal = (id: string) => {
    setSelectedSiteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (selectedSiteId) {
      deleteSite(selectedSiteId);
      setIsDeleteModalOpen(false);
    }
  };

  const handleUpdate = (data: UpdateSiteInput) => {
    updateSite(data);
    setShowEditForm(false);
  };

  return (
    <div className="p-6 bg-background min-h-screen space-y-6">
      {/* Breadcrumb + New */}
      <div className="flex items-center mb-4">
        <nav aria-label="breadcrumb">
          <ol className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
            </li>
            <li className="text-muted-foreground/40">/</li>
            <li className="text-foreground tracking-tighter">Sites</li>
          </ol>
        </nav>
        <div className="ml-auto">
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[10px] uppercase tracking-widest py-2.5 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            <PlusIcon className="w-4 h-4 mr-1.5" />
            New Site
          </button>
        </div>
      </div>

      {/* Create / Edit Modals */}
      {showCreateForm && (
        <div className="modal-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="modal-content bg-card rounded-[2rem] shadow-2xl p-6 border border-border animate-in zoom-in-95 duration-300 w-full max-w-lg mx-4">
            <SiteForm onClose={() => setShowCreateForm(false)} />
          </div>
        </div>
      )}
      {showEditForm && siteToEdit && (
        <div className="modal-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="modal-content bg-card rounded-[2rem] shadow-2xl p-6 border border-border animate-in zoom-in-95 duration-300 w-full max-w-lg mx-4">
            <EditSiteForm
              site={siteToEdit}
              onClose={() => setShowEditForm(false)}
              onSubmit={handleUpdate}
            />
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map(({ title, value, icon }) => (
          <MetricsCard key={title} title={title} value={value} icon={icon} />
        ))}
      </div>

      {/* Sites Table */}
      <div className="overflow-x-auto bg-card rounded-2xl border border-border shadow-sm">
        <table className="min-w-max w-full border-collapse">
          <thead className="bg-primary text-primary-foreground">
            <tr>
              <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest border-b border-primary-foreground/10">
                #
              </th>
              <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest border-b border-primary-foreground/10">
                Name
              </th>
              <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest border-b border-primary-foreground/10">
                Users
              </th>
              <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest border-b border-primary-foreground/10">
                Projects
              </th>
              <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest border-b border-primary-foreground/10">
                Warehouses
              </th>
              <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest border-b border-primary-foreground/10">
                Equipment
              </th>
              <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest border-b border-primary-foreground/10">
                Labors
              </th>
              <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest border-b border-primary-foreground/10">
                Created
              </th>
              <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest border-b">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {sites.map((site, idx) => (
              <tr key={site.id} className="hover:bg-accent/50 transition-colors group">
                <td className="px-6 py-4 text-center text-xs font-bold text-muted-foreground">{idx + 1}</td>
                <td className="px-6 py-4">
                  <Link
                    href={`/sites/${site.id}`}
                    className="text-primary hover:text-primary/80 font-bold transition-colors"
                  >
                    {site.name}
                  </Link>
                </td>
                <td className="px-6 py-4 text-center text-xs font-black text-foreground/80">
                  {site.users?.length ?? 0}
                </td>
                <td className="px-6 py-4 text-center text-xs font-black text-foreground/80">
                  {site.projects?.length ?? 0}
                </td>
                <td className="px-6 py-4 text-center text-xs font-black text-foreground/80">
                  {site.warehouses?.length ?? 0}
                </td>
                <td className="px-6 py-4 text-center text-xs font-black text-foreground/80">
                  {site.equipments?.length ?? 0}
                </td>
                <td className="px-6 py-4 text-center text-xs font-black text-foreground/80">
                  {site.labors?.length ?? 0}
                </td>
                <td className="px-6 py-4 text-center text-[10px] font-bold text-muted-foreground">
                  {site.createdAt
                    ? new Date(site.createdAt).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-6 py-4 text-center">
                  <Menu as="div" className="relative inline-block text-left">
                    <MenuButton className="inline-flex items-center px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 focus:outline-none shadow-sm transition-all active:scale-95">
                      Actions <ChevronDown className="w-4 h-4 ml-2" />
                    </MenuButton>
                    <MenuItems className="absolute right-0 mt-2 w-40 bg-card border border-border divide-y divide-border rounded-xl shadow-2xl focus:outline-none z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                      <MenuItem>
                        {({ active }) => (
                          <button
                            onClick={() => router.push(`/sites/${site.id}`)}
                            className={`flex items-center w-full px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors ${active ? "bg-primary text-primary-foreground" : "text-foreground"
                              }`}
                          >
                            <Eye className="w-3.5 h-3.5 mr-2" />
                            View
                          </button>
                        )}
                      </MenuItem>
                      <MenuItem>
                        {({ active }) => (
                          <button
                            onClick={() => {
                              setSiteToEdit(site);
                              setShowEditForm(true);
                            }}
                            className={`flex items-center w-full px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors ${active ? "bg-primary text-primary-foreground" : "text-foreground"
                              }`}
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-2" />
                            Edit
                          </button>
                        )}
                      </MenuItem>
                      <MenuItem>
                        {({ active }) => (
                          <button
                            onClick={() => openDeleteModal(site.id)}
                            className={`flex items-center w-full px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors ${active ? "bg-destructive text-white" : "text-destructive"
                              }`}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" />
                            Delete
                          </button>
                        )}
                      </MenuItem>
                    </MenuItems>
                  </Menu>
                </td>
              </tr>
            ))}
            {sites.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-20 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">
                  No sites found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Confirm Delete */}
      {isDeleteModalOpen && (
        <ConfirmModal
          isVisible={isDeleteModalOpen}
          title="Delete Site?"
          message="Are you sure you want to delete this site?"
          confirmText="DELETE"
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          showInput={false}
        />
      )}
    </div>
  );
}
