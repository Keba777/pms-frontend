"use client";

import { LayoutDashboard } from "lucide-react";
import Link from "next/link";

const BreadcrumbTasks: React.FC = () => {
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
        <button
          type="button"
          className="px-3 py-1 text-white bg-cyan-700 rounded hover:bg-cyan-800"
          title="Draggable"
        >
          <LayoutDashboard className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default BreadcrumbTasks;
