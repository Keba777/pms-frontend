"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  CheckSquare,
  Square,
  BarChart2,
  Plus,
  Edit,
  LogOut,
} from "lucide-react";

const WorkspaceDropdown = () => {
  const [open, setOpen] = useState(false);
  const toggleDropdown = () => setOpen(!open);

  return (
    <div className="relative px-2 mb-4">
      <button
        onClick={toggleDropdown}
        type="button"
        className="w-full bg-cyan-700 hover:bg-cyan-800 text-white px-4 py-2 rounded inline-flex items-center"
      >
        Default Workspace
        <ChevronDown className="ml-2 w-4 h-4" />
      </button>
      {open && (
        <ul className="absolute right-0 mt-2 w-64 bg-white border rounded shadow-lg z-10">
          <li>
            <Link
              href="/workspaces/switch/1"
              className="flex items-center px-4 py-2 hover:bg-gray-100"
            >
              <CheckSquare className="w-5 h-5 text-[#696cff] mr-2" />
              Default Workspace
            </Link>
          </li>
          <li>
            <Link
              href="/workspaces/switch/2"
              className="flex items-center px-4 py-2 hover:bg-gray-100"
            >
              <Square className="w-5 h-5 text-gray-700 mr-2" />
              Site Visit
            </Link>
          </li>
          <li>
            <hr className="my-1 border-gray-200" />
          </li>
          <li>
            <Link
              href="/workspaces"
              className="flex items-center px-4 py-2 hover:bg-gray-100"
            >
              <BarChart2 className="w-5 h-5 text-[#71dd37] mr-2" />
              Manage Workspaces
            </Link>
          </li>
          <li>
            <Link
              href="/workspaces/create"
              className="flex items-center px-4 py-2 hover:bg-gray-100"
            >
              <Plus className="w-5 h-5 text-[#ffab00] mr-2" />
              Create Workspace
            </Link>
          </li>
          <li>
            <Link
              href="/workspaces/edit/1"
              className="flex items-center px-4 py-2 hover:bg-gray-100"
            >
              <Edit className="w-5 h-5 text-[#03c3ec] mr-2" />
              Edit Workspace
            </Link>
          </li>
          <li>
            <Link
              href="#"
              id="remove-participant"
              className="flex items-center px-4 py-2 hover:bg-gray-100"
            >
              <LogOut className="w-5 h-5 text-[#ff3e1d] mr-2" />
              Remove Me from Workspace
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
};

export default WorkspaceDropdown;
