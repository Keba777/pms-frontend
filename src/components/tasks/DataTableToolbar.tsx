import React from "react";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { ChevronDown, RefreshCw, Trash2, Search } from "lucide-react";

interface DataTableToolbarProps {
  onRefresh: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

const DataTableToolbar: React.FC<DataTableToolbarProps> = ({
  onRefresh,
  searchValue,
  onSearchChange,
}) => {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex gap-4">
        <button className="flex items-center px-4 py-2 rounded-lg gap-2 text-red-600 hover:text-gray-100 hover:bg-red-600 border border-red-600">
          <Trash2 size={18} /> Delete Selected
        </button>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search"
            className="pl-10 pr-4 py-2 border rounded"
          />
        </div>
        <Menu>
          <MenuButton className="flex text-gray-100 items-center gap-16 px-4 py-3 bg-bs-gray-dark rounded">
            <button onClick={onRefresh} className="rounded">
              <RefreshCw size={14} />
            </button>
            <ChevronDown size={14} />
          </MenuButton>
          <MenuItems className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
            <MenuItem>
              {({ focus }) => (
                <label
                  className={`flex items-center px-4 py-2 whitespace-nowrap ${
                    focus ? "bg-blue-100" : ""
                  }`}
                >
                  <input type="checkbox" className="mr-2" checked readOnly />{" "}
                  Task
                </label>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <label
                  className={`flex items-center px-4 py-2 whitespace-nowrap ${
                    focus ? "bg-blue-100" : ""
                  }`}
                >
                  <input type="checkbox" className="mr-2" checked readOnly />{" "}
                  Priority
                </label>
              )}
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </div>
  );
};

export default DataTableToolbar;
