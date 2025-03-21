import React, { useState } from "react";
import { Trash2, RefreshCw, List, Check } from "lucide-react";

const TableToolbar: React.FC = () => {
  const [isColumnsDropdownOpen, setIsColumnsDropdownOpen] = useState(false);

  const toggleColumnsDropdown = () => {
    setIsColumnsDropdownOpen(!isColumnsDropdownOpen);
  };

  return (
    <div className="flex justify-between items-center mb-4">
      {/* Delete Selected Button */}
      <div className="flex items-center space-x-2">
        <button
          type="button"
          className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold py-2 px-4 rounded flex items-center transition-colors duration-200"
        >
          <Trash2 className="h-4 w-4 mr-2" /> Delete Selected
        </button>
      </div>

      {/* Refresh and Columns Dropdown */}
      <div className="flex items-center space-x-2">
        {/* Refresh Button */}
        <button
          type="button"
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </button>

        {/* Columns Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={toggleColumnsDropdown}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded flex items-center"
          >
            <List className="h-4 w-4 mr-2" /> Columns
          </button>

          {/* Dropdown Menu */}
          {isColumnsDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <div className="py-1">
                <label className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Check className="h-4 w-4 mr-2" /> ID
                </label>
                <label className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Check className="h-4 w-4 mr-2" /> Title
                </label>
                <label className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Check className="h-4 w-4 mr-2" /> Preview
                </label>
                <label className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Check className="h-4 w-4 mr-2" /> Created At
                </label>
                <label className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Check className="h-4 w-4 mr-2" /> Updated At
                </label>
                <label className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Check className="h-4 w-4 mr-2" /> Actions
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableToolbar;
