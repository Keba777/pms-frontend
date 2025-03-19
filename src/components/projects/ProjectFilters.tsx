"use client";

import React, { useState } from "react";
import Select, { MultiValue, OptionsOrGroups, GroupBase } from "react-select";
import { Filter } from "lucide-react";

interface TagOption {
  value: number;
  label: string;
}

interface ProjectFilterProps {
  onFilterChange?: (filters: { status: string; sort: string; tags: TagOption[] }) => void;
}

const ProjectFilter: React.FC<ProjectFilterProps> = ({ onFilterChange }) => {
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("");
  const [selectedTags, setSelectedTags] = useState<MultiValue<TagOption>>([]);

  const tagOptions: OptionsOrGroups<TagOption, GroupBase<TagOption>> = [
    {
      label: "Tags",
      options: [{ value: 1, label: "ee" }],
    },
  ];

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
    onFilterChange?.({ status: e.target.value, sort, tags: selectedTags as TagOption[] });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value);
    onFilterChange?.({ status, sort: e.target.value, tags: selectedTags as TagOption[] });
  };

  const handleTagsChange = (selected: MultiValue<TagOption>) => {
    setSelectedTags(selected);
    onFilterChange?.({ status, sort, tags: selected as TagOption[] });
  };

  // Custom styles for react-select to match Tailwind styling
  const selectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      border: "1px solid #d1d5db", // Tailwind gray-300
      borderRadius: "0.25rem", // rounded
      minHeight: "38px",
      boxShadow: state.isFocused
        ? "0 0 0 0.2rem rgba(105,108,255,0.25)" // a focus shadow similar to blue-500
        : provided.boxShadow,
      "&:hover": {
        borderColor: "#93c5fd", // Tailwind blue-300
      },
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#6b7280", // Tailwind gray-500
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 9999,
    }),
  };

  return (
    <div className="flex flex-wrap gap-3 mb-3">
      {/* Status Filter */}
      <div className="w-full md:w-1/4">
        <select
          className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:border-blue-500"
          id="status_filter"
          value={status}
          onChange={handleStatusChange}
        >
          <option value="">Filter by Status</option>
        </select>
      </div>

      {/* Sort Filter */}
      <div className="w-full md:w-1/4">
        <select
          className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:border-blue-500"
          id="sort"
          value={sort}
          onChange={handleSortChange}
        >
          <option value="">Sort By</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="recently-updated">Most Recently Updated</option>
          <option value="earliest-updated">Least Recently Updated</option>
        </select>
      </div>

      {/* Tags Filter - Adjusted width to fit on the same line at md+ screens */}
      <div className="w-full md:w-1/4">
        <Select
          isMulti
          options={tagOptions}
          value={selectedTags}
          onChange={handleTagsChange}
          placeholder="Filter By Tags"
          styles={selectStyles}
          className="w-full"
        />
      </div>

      {/* Filter Button */}
      <div className="flex items-center">
        <button
          type="button"
          id="tags_filter"
          className="bg-cyan-700 hover:bg-cyan-800 text-white text-sm font-bold py-2 px-3 rounded"
          title="Filter"
        >
          <Filter size={16} />
        </button>
      </div>
    </div>
  );
};

export default ProjectFilter;
