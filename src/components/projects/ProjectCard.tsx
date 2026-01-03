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
import { useRoles } from "@/hooks/useRoles";
import { formatDate as format, getDateDuration, getDuration } from "@/utils/dateUtils";

export interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {

  const [showTasksModal, setShowTasksModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const dropdownRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { data: roles = [] } = useRoles();

  const duration = getDateDuration(project.start_date, project.end_date);
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

  // Map full User objects to display strings
  const memberDetails =
    project.members?.map((member) => {
      const role = roles.find((r) => r.id === member.role_id);
      const name = `${member.first_name} ${member.last_name}`;
      return role ? `${name} (${role.name})` : name;
    }) ?? [];

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
            className="text-primary hover:underline"
          >
            {project.title}
          </Link>
        </h4>
        <div className="flex items-center space-x-2 relative">
          <button
            ref={buttonRef}
            onClick={toggleDropdown}
            className="text-muted-foreground focus:outline-none"
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
              <li className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center space-x-2">
                <Edit size={16} />
                <span>Update</span>
              </li>
              <li className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center space-x-2 text-red-500">
                <Trash2 size={16} />
                <span>Delete</span>
              </li>
              <li className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center space-x-2 text-yellow-500">
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
          <span className="bg-primary/10 text-primary px-2 py-1 rounded">
            ${project.budget}
          </span>
        </div>
      )}

      {/* Status & Priority */}
      <div className="my-3 flex flex-wrap justify-between">
        <div>
          <label className="block text-sm font-medium text-muted-foreground">
            Status
          </label>
          <span
            className={`px-2 py-1 rounded ${project.status === "InProgress"
              ? "bg-green-500 text-white"
              : "bg-gray-800 text-white"
              }`}
          >
            {project.status}
          </span>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground">
            Priority
          </label>
          <span
            className={`px-2 py-1 rounded ${project.priority === "Critical"
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
          className="cursor-pointer flex items-center justify-center text-primary hover:underline"
        >
          <CheckCircle size={16} className="mr-1" />
          <b>{tasksCount}</b> Tasks
        </span>
      </div>

      {/* Members & Client */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Assigned to:</p>
          <ul className="flex flex-wrap items-center gap-2">
            {memberDetails.length > 0 ? (
              memberDetails.map((m, i) => (
                <li
                  key={i}
                  className="bg-muted text-muted-foreground text-[11px] font-bold px-2 py-0.5 rounded-full border border-border"
                >
                  {m}
                </li>
              ))
            ) : (
              <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-[11px]">
                Not Assigned
              </span>
            )}
          </ul>
        </div>
        <div>
          <div className="mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Client:</p>
            {project.clientInfo ? (
              <span className="bg-primary/10 text-primary text-[11px] font-bold px-2 py-0.5 rounded-full border border-primary/20">
                <Link href={`/clients/${project.client_id}`}>{project.clientInfo.companyName}</Link>
              </span>
            ) : (
              <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-[11px]">
                Not Assigned
              </span>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Site:</p>
            {project.projectSite ? (
              <span className="bg-muted text-muted-foreground text-[11px] font-bold px-2 py-0.5 rounded-full border border-border">
                {project.projectSite.name}
              </span>
            ) : (
              <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-[11px]">
                No Site
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Dates & Duration */}
      <div className="mt-6 pt-4 border-t border-border grid grid-cols-2 gap-4 text-[11px] text-muted-foreground font-medium">
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-primary" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-gray-400">Starts</span>
            <span>{format(project.start_date)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 justify-end">
          <Calendar size={14} className="text-red-600" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase text-gray-400">Ends</span>
            <span>{format(project.end_date)}</span>
          </div>
        </div>
        <div className="col-span-2 flex items-center justify-center bg-muted/50 rounded py-1 text-primary">
          Duration: <span className="ml-1 font-bold">{duration}</span>
        </div>
      </div>

      {/* Progress Bar with % inside */}
      <div className="mt-4 w-full">
        <div className="relative bg-muted rounded-full h-5">
          <div
            className="flex items-center justify-center h-full rounded-full bg-primary text-primary-foreground text-xs font-medium transition-all"
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
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
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
