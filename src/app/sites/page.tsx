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
      <div className="text-red-600 text-center py-4">
        Failed to load sites. {(error as Error).message || "Please try again."}
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
      icon: <PlusIcon className="h-6 w-6 text-cyan-700" />,
    },
    {
      title: "Users",
      value: totalUsers,
      icon: <Eye className="h-6 w-6 text-cyan-700" />,
    },
    {
      title: "Projects",
      value: totalProjects,
      icon: <Edit2 className="h-6 w-6 text-cyan-700" />,
    },
    {
      title: "Warehouses",
      value: totalWarehouses,
      icon: <Edit2 className="h-6 w-6 text-cyan-700" />,
    },
    {
      title: "Equipment",
      value: totalEquipment,
      icon: <Edit2 className="h-6 w-6 text-cyan-700" />,
    },
    {
      title: "Labors",
      value: totalLabors,
      icon: <Edit2 className="h-6 w-6 text-cyan-700" />,
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
    <div className="p-4 space-y-6">
      {/* Breadcrumb + New */}
      <div className="flex items-center mb-4">
        <nav aria-label="breadcrumb">
          <ol className="flex space-x-2 text-gray-600">
            <li>
              <Link href="/" className="hover:underline text-blue-600">
                Home
              </Link>
            </li>
            <li>/</li>
            <li className="font-semibold text-gray-900">Sites</li>
          </ol>
        </nav>
        <div className="ml-auto">
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-2 px-3 rounded text-sm transition"
          >
            <PlusIcon className="w-5 h-5 mr-1" />
            New Site
          </button>
        </div>
      </div>

      {/* Create / Edit Modals */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <SiteForm onClose={() => setShowCreateForm(false)} />
          </div>
        </div>
      )}
      {showEditForm && siteToEdit && (
        <div className="modal-overlay">
          <div className="modal-content">
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
      <div className="overflow-x-auto">
        <table className="min-w-max w-full border border-gray-200 divide-y divide-gray-200">
          <thead className="bg-cyan-700">
            <tr>
              <th className="px-4 py-2 text-center text-sm font-medium text-white">
                #
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-white">
                Name
              </th>
              <th className="px-4 py-2 text-center text-sm font-medium text-white">
                Users
              </th>
              <th className="px-4 py-2 text-center text-sm font-medium text-white">
                Projects
              </th>
              <th className="px-4 py-2 text-center text-sm font-medium text-white">
                Warehouses
              </th>
              <th className="px-4 py-2 text-center text-sm font-medium text-white">
                Equipment
              </th>
              <th className="px-4 py-2 text-center text-sm font-medium text-white">
                Labors
              </th>
              <th className="px-4 py-2 text-center text-sm font-medium text-white">
                Created
              </th>
              <th className="px-4 py-2 text-center text-sm font-medium text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {sites.map((site, idx) => (
              <tr key={site.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2 text-center">{idx + 1}</td>
                <td className="border px-6 py-3">
                  <Link
                    href={`/sites/${site.id}`}
                    className="text-cyan-700 hover:text-cyan-900 font-medium"
                  >
                    {site.name}
                  </Link>
                </td>
                <td className="border px-4 py-2 text-center">
                  {site.users?.length ?? 0}
                </td>
                <td className="border px-4 py-2 text-center">
                  {site.projects?.length ?? 0}
                </td>
                <td className="border px-4 py-2 text-center">
                  {site.warehouses?.length ?? 0}
                </td>
                <td className="border px-4 py-2 text-center">
                  {site.equipments?.length ?? 0}
                </td>
                <td className="border px-4 py-2 text-center">
                  {site.labors?.length ?? 0}
                </td>
                <td className="border px-4 py-2 text-center text-gray-500">
                  {site.createdAt
                    ? new Date(site.createdAt).toLocaleDateString()
                    : "—"}
                </td>
                <td className="border px-4 py-2 text-center">
                  <Menu as="div" className="relative inline-block text-left">
                    <MenuButton className="inline-flex items-center px-3 py-1 bg-cyan-700 text-white rounded hover:bg-cyan-800">
                      Actions <ChevronDown className="w-4 h-4 ml-1" />
                    </MenuButton>
                    <MenuItems className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-10">
                      <MenuItem>
                        {({ active }) => (
                          <button
                            onClick={() => router.push(`/sites/${site.id}`)}
                            className={`block w-full px-4 py-2 text-left ${
                              active ? "bg-gray-100" : ""
                            }`}
                          >
                            <Eye className="inline-block w-4 h-4 mr-2" />
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
                            className={`block w-full px-4 py-2 text-left ${
                              active ? "bg-gray-100" : ""
                            }`}
                          >
                            <Edit2 className="inline-block w-4 h-4 mr-2" />
                            Edit
                          </button>
                        )}
                      </MenuItem>
                      <MenuItem>
                        {({ active }) => (
                          <button
                            onClick={() => openDeleteModal(site.id)}
                            className={`block w-full px-4 py-2 text-left text-red-600 ${
                              active ? "bg-gray-100" : ""
                            }`}
                          >
                            <Trash2 className="inline-block w-4 h-4 mr-2" />
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
                <td colSpan={9} className="px-4 py-4 text-center text-gray-500">
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
