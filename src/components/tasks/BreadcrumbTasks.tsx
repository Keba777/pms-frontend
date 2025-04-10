"use client";

import { Plus, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePermissionsStore } from "@/store/permissionsStore";

interface BreadcrumbTasksProps {
  onPlusClick: () => void;
}

const BreadcrumbTasks: React.FC<BreadcrumbTasksProps> = ({ onPlusClick }) => {
  const hasPermission = usePermissionsStore((state) => state.hasPermission);

  const canCreateTask = hasPermission("create tasks");
  const canViewDashboard = hasPermission("manage tasks");

  return (
    <div className="flex justify-between mb-2 mt-4">
      <div>
        <nav aria-label="breadcrumb">
          <ol className="flex space-x-2 text-sm font-semibold ">
            <li>
              <Link href="/" className="hover:underline flex items-center">
                Home
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-800">Tasks</li>
          </ol>
        </nav>
      </div>
      <div className="flex space-x-2">
        {/* Only show the Create Task button if the user has "create tasks" permission */}
        {canCreateTask && (
          <button
            type="button"
            className="px-3 py-1 text-white bg-cyan-700 rounded hover:bg-cyan-800"
            onClick={onPlusClick}
            title="Create Task"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
        {/* Only show the Dashboard button if the user has "manage tasks" (or similar) permission */}
        {canViewDashboard && (
          <Link href="/graggable">
            <button
              type="button"
              className="px-3 py-1 text-white bg-cyan-700 rounded hover:bg-cyan-800"
              title="Draggable"
            >
              <LayoutDashboard className="w-4 h-4" />
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default BreadcrumbTasks;
