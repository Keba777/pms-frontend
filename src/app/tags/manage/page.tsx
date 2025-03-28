"use client";

import React, { useState} from "react";
import Breadcrumb from "@/components/tags/Breadcrumb";
import Table from "@/components/tags/Table";
import Modal from "@/components/tags/Modal";
import TableToolbar from "@/components/tags/TableToolbar";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";

// Import hooks
import {
  useTags,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
} from "@/hooks/useTags";
import { Tag } from "@/types/tag";

const TagsPage = () => {
  // Fetch tags from API and update the store
  const { data: tags = [], isLoading, isError } = useTags();

  // Local modal state and form fields
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const [editTagName, setEditTagName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Hooks for mutations
  const createTagMutation = useCreateTag();
  const updateTagMutation = useUpdateTag();
  const deleteTagMutation = useDeleteTag();

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "Tags" },
  ];

  // Handlers for modals
  const handleCreateTag = () => {
    setNewTagName("");
    setIsCreateModalOpen(true);
  };

  const handleEditTag = (tag: Tag) => {
    setSelectedTag(tag);
    setEditTagName(tag.name);
    setIsEditModalOpen(true);
  };

  // Form submit handler for creating a tag
  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagName.trim() !== "") {
      setIsCreating(true); // Set loading state

      createTagMutation.mutate(
        { name: newTagName },
        {
          onSuccess: () => {
            setIsCreateModalOpen(false);
            setIsCreating(false); // Reset loading state
          },
          onError: () => {
            setIsCreating(false); // Reset if error occurs
          },
        }
      );
    } else {
      toast.error("Tag name cannot be empty");
    }
  };

  // Form submit handler for updating a tag
  const handleSubmitUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTag && editTagName.trim() !== "") {
      updateTagMutation.mutate(
        { id: selectedTag.id, name: editTagName },
        {
          onSuccess: () => {
            setIsEditModalOpen(false);
            setSelectedTag(null);
          },
        }
      );
    } else {
      toast.error("Tag name cannot be empty");
    }
  };

  // Handler for deleting a tag
  const handleDeleteTag = (tag: Tag) => {
    if (
      tag.id &&
      confirm(`Are you sure you want to delete tag "${tag.name}"?`)
    ) {
      deleteTagMutation.mutate(tag.id);
    }
  };

  // Prepare table data
  const tableHeaders = ["ID", "Name", "Actions"];
  const tableData = tags.map((tag, index) => ({
    "ID": index + 1,
    Name: tag.name,
    Actions: (
      <div className="flex space-x-2">
        <button
          onClick={() => handleEditTag(tag)}
          className="text-blue-500 hover:underline"
        >
          Edit
        </button>
        <button
          onClick={() => handleDeleteTag(tag)}
          className="text-red-500 hover:underline"
        >
          Delete
        </button>
      </div>
    ),
  }));

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

      <TableToolbar />

      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <p className="p-4">Loading tags...</p>
        ) : isError ? (
          <p className="p-4 text-red-500">Error loading tags</p>
        ) : (
          <Table headers={tableHeaders} data={tableData} />
        )}
      </div>

      {/* Create Tag Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Tag"
      >
        <form onSubmit={handleSubmitCreate}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="mt-2 py-2 px-3 block w-full rounded-md border-none shadow-sm focus:outline-none focus:ring-0 focus:border-none"
              placeholder="Enter Tag Name"
            />
          </div>
          <button
            type="submit"
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
              isCreating ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Create"}
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
          <form onSubmit={handleSubmitUpdate}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={editTagName}
                onChange={(e) => setEditTagName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
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
