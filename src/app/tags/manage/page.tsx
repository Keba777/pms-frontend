"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/tags/Breadcrumb";
import Table from "@/components/tags/Table";
import Modal from "@/components/tags/Modal";
import TableToolbar from "@/components/tags/TableToolbar";
import { Plus } from "lucide-react";

const TagsPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<{
    id: string;
    title: string;
    color: string;
  } | null>(null);

  const breadcrumbItems = [
    { label: "Home", href: "/home" },
    { label: "Projects", href: "/projects" },
    { label: "Tags" },
  ];

  const tableHeaders = ["ID", "Title", "Preview", "Actions"];
  const tableData = [
    {
      ID: "1",
      Title: "ee",
      Preview: <span className="badge bg-success">ee</span>,
      Actions: "",
    },
  ];

  const handleCreateTag = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditTag = (tag: { id: string; title: string; color: string }) => {
    setSelectedTag(tag);
    setIsEditModalOpen(true);
  };

  const handleDeleteTag = (id: string) => {
    console.log("Delete tag with ID:", id);
  };

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-4">
        <Breadcrumb items={breadcrumbItems} />
        <button
          onClick={handleCreateTag}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" /> Create Tag
        </button>
      </div>

      {/* Table Toolbar */}
      <TableToolbar />

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <Table headers={tableHeaders} data={tableData} />
      </div>

      {/* Create Tag Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Tag"
      >
        <form>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter Title"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Color
            </label>
            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="success">Success</option>
              <option value="danger">Danger</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Create
          </button>
        </form>
      </Modal>

      {/* Edit Tag Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Tag"
      >
        {selectedTag && (
          <form>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                defaultValue={selectedTag.title}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Color
              </label>
              <select
                defaultValue={selectedTag.color}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="success">Success</option>
                <option value="danger">Danger</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Update
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default TagsPage;
