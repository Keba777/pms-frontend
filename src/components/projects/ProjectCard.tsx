"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Edit,
  Trash2,
  Copy,
  Star,
  CheckCircle,
  Calendar,
  Settings,
} from "lucide-react";
import { Project } from "@/types/project";
import { useUsers } from "@/hooks/useUsers";
import { useRoles } from "@/hooks/useRoles";

export interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const dropdownRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { data: users = [] } = useUsers();
  const { data: roles = [] } = useRoles();

  const getDuration = (start: string | Date, end: string | Date): string => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return "Invalid date";
    }
    const msPerDay = 1000 * 3600 * 24;
    return `${Math.ceil(
      Math.abs(endDate.getTime() - startDate.getTime()) / msPerDay
    )} days`;
  };

  const duration = getDuration(project.start_date, project.end_date);
  const tasksCount = project.tasks?.length ?? 0;

  const toggleDropdown = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget.getBoundingClientRect();
    const container = e.currentTarget.parentElement?.getBoundingClientRect();
    if (container) {
      const spaceRight = container.right - btn.right;
      const spaceLeft = btn.left - container.left;
      const width = 190;
      if (spaceRight > width) {
        setDropdownPosition({
          x: btn.right - container.left,
          y: btn.bottom - container.top,
        });
      } else if (spaceLeft > width) {
        setDropdownPosition({
          x: btn.left - container.left - width,
          y: btn.bottom - container.top,
        });
      } else {
        setDropdownPosition({
          x: btn.right - container.left,
          y: btn.bottom - container.top,
        });
      }
    }
    setIsDropdownOpen((o) => !o);
  };

  // Map member IDs to "Name (Role)"
  const memberDetails =
    project.members?.map((memberId) => {
      const user = users.find((u) => u.id === memberId);
      const role = roles.find((r) => r.id === user?.role_id);
      const name = user ? `${user.first_name} ${user.last_name}` : memberId;
      return role ? `${name} (${role.name})` : name;
    }) || [];

  // close dropdown on outside click
  useEffect(() => {
    const handler = (evt: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(evt.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(evt.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow p-5 relative">
      {/* Header */}
      <div className="flex justify-between mb-3">
        <h4 className="text-2xl font-semibold">
          <Link
            href={`/projects/${project.id}`}
            className="text-green-700 hover:underline"
          >
            {project.title}
          </Link>
        </h4>
        <div className="flex items-center space-x-2 relative">
          <button
            ref={buttonRef}
            onClick={toggleDropdown}
            className="text-green-700 focus:outline-none"
          >
            <Settings size={18} />
          </button>
          <button className="text-yellow-500">
            <Star size={18} />
          </button>
          {isDropdownOpen && (
            <ul
              ref={dropdownRef}
              className="absolute mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-10"
              style={{ top: dropdownPosition.y, left: dropdownPosition.x }}
            >
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2">
                <Edit size={16} />
                <span>Update</span>
              </li>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2 text-red-500">
                <Trash2 size={16} />
                <span>Delete</span>
              </li>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2 text-yellow-500">
                <Copy size={16} />
                <span>Duplicate</span>
              </li>
            </ul>
          )}
        </div>
      </div>

      {/* Budget */}
      {project.budget !== undefined && (
        <div className="mb-3">
          Planned Budget{" "}
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
            ${project.budget}
          </span>
        </div>
      )}

      {/* Status & Priority */}
      <div className="my-3 flex flex-wrap justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <span
            className={`px-2 py-1 rounded ${
              project.status === "InProgress"
                ? "bg-green-500 text-white"
                : "bg-gray-800 text-white"
            }`}
          >
            {project.status}
          </span>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <span
            className={`px-2 py-1 rounded ${
              project.priority === "Critical"
                ? "bg-red-500 text-white"
                : project.priority === "High"
                ? "bg-orange-500 text-white"
                : project.priority === "Medium"
                ? "bg-yellow-500 text-gray-900"
                : "bg-green-500 text-white"
            }`}
          >
            {project.priority}
          </span>
        </div>
      </div>

      {/* Tasks Count (opens modal) */}
      <div className="my-4">
        <span
          onClick={() => setShowTasksModal(true)}
          className="cursor-pointer flex items-center justify-center text-cyan-700 hover:underline"
        >
          <CheckCircle size={16} className="mr-1" />
          <b>{tasksCount}</b> Tasks
        </span>
      </div>

      {/* Members & Client */}
      <div className="mt-2 flex flex-wrap justify-between">
        <div className="w-full md:w-1/2 mb-4 md:mb-0">
          <p className="text-sm font-medium text-gray-700">Assigned to:</p>
          <ul className="flex flex-wrap items-center gap-2">
            {memberDetails.length > 0 ? (
              memberDetails.map((m, i) => (
                <li
                  key={i}
                  className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded-full"
                >
                  {m}
                </li>
              ))
            ) : (
              <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                Not Assigned
              </span>
            )}
            <button className="text-blue-500 hover:text-blue-700 p-1 rounded-full">
              <Edit size={16} />
            </button>
          </ul>
        </div>
        <div className="w-full md:w-1/2">
          <p className="text-sm font-medium text-gray-700">Client:</p>
          {project.client ? (
            <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded-full">
              <Link href={`/clients/${project.client}`}>{project.client}</Link>
            </span>
          ) : (
            <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
              Not Assigned
            </span>
          )}
        </div>
      </div>

      {/* Dates & Duration */}
      <div className="mt-4 flex flex-wrap text-xs text-gray-600">
        <div className="w-full md:w-1/3 flex items-center mb-1 md:mb-0">
          <Calendar size={12} className="mr-1 text-green-500" />
          Starts: {new Date(project.start_date).toLocaleDateString()}
        </div>
        <div className="w-full md:w-1/3 flex items-center justify-center mb-1 md:mb-0">
          Duration: <span className="ml-1 text-green-500">{duration}</span>
        </div>
        <div className="w-full md:w-1/3 flex items-center justify-end">
          <Calendar size={12} className="mr-1 text-red-500" />
          Ends: {new Date(project.end_date).toLocaleDateString()}
        </div>
      </div>

      {/* Progress Bar with % inside */}
      <div className="mt-4 w-full">
        <div className="relative bg-gray-200 rounded-full h-5">
          <div
            className="flex items-center justify-center h-full rounded-full bg-blue-500 text-white text-xs font-medium transition-all"
            style={{ width: `${project.progress ?? 0}%` }}
            role="progressbar"
            aria-valuenow={project.progress ?? 0}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            {project.progress ?? 0}%
          </div>
        </div>
      </div>

      {/* Tasks Modal */}
      {showTasksModal && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-content bg-white rounded-lg shadow-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Project Tasks</h3>
            {project.tasks && project.tasks.length > 0 ? (
              <ul className="list-disc list-inside space-y-2 mb-4">
                {project.tasks.map((t) => (
                  <li key={t.id} className="text-gray-800">
                    {t.task_name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 mb-4">
                There are no tasks for this project.
              </p>
            )}
            <button
              onClick={() => setShowTasksModal(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
