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
  Settings
} from "lucide-react";
import { Project } from "@/types/project";

interface Member {
  id: number;
  name: string;
  avatar: string;
  profileLink: string;
}

interface Client {
  id: number;
  name: string;
  avatar: string;
  profileLink: string;
}

export interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const dropdownRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const getDuration = (start: string | Date, end: string | Date): string => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return "Invalid date";
    }

    const timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return `${diffDays} days`;
  };

  const members: Member[] = [
    {
      id: 1,
      name: "John Doe",
      avatar: "https://placehold.co/40x40/000/FFF?text=JD",
      profileLink: "#",
    },
    {
      id: 2,
      name: "Jane Smith",
      avatar: "https://placehold.co/40x40/EEE/333?text=JS",
      profileLink: "#",
    },
  ];

  const clients: Client[] = [
    {
      id: 1,
      name: "Acme Corp",
      avatar: "https://placehold.co/40x40/AAA/FFF?text=AC",
      profileLink: "#",
    },
  ];
  const duration = getDuration(project.start_date, project.end_date);

  const tasksCount = project.tasks ? project.tasks.length : 0;

  const toggleDropdown = (event: React.MouseEvent<HTMLButtonElement>) => {
    const buttonRect = event.currentTarget.getBoundingClientRect();
    const containerRect =
      event.currentTarget.parentElement?.getBoundingClientRect();

    if (containerRect) {
      const spaceRight = containerRect.right - buttonRect.right;
      const spaceLeft = buttonRect.left - containerRect.left;

      if (spaceRight > 200) {
        // Check if there's enough space on the right
        setDropdownPosition({
          x: buttonRect.right - containerRect.left,
          y: buttonRect.bottom - containerRect.top,
        });
      } else if (spaceLeft > 200) {
        // Check if there's enough space on the left
        setDropdownPosition({
          x: buttonRect.left - containerRect.left - 190,
          y: buttonRect.bottom - containerRect.top,
        }); // 190 is width of dropdown
      } else {
        setDropdownPosition({
          x: buttonRect.right - containerRect.left,
          y: buttonRect.bottom - containerRect.top,
        });
      }
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white rounded-xl shadow p-5 relative">
      <div className="flex justify-between mb-3">
        <h4 className="text-2xl font-semibold">
          <Link
            href={`/projects/${project.id}`}
            className="text-green-700 hover:underline"
          >
            <strong>{project.title}</strong>
          </Link>
        </h4>
        <div className="flex items-center space-x-2 relative">
          <button
            ref={buttonRef}
            className="text-green-700 focus:outline-none"
            onClick={toggleDropdown}
          >
            <Settings size={18} className="text-bs-success"/>
          </button>
          <button className="text-yellow-500">
            <span title="Click to Mark as Favorite">
              <Star size={18} className="text-bs-warning"/>
            </span>
          </button>
          {isDropdownOpen && (
            <ul
              ref={dropdownRef}
              className="absolute mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
              style={{
                top: `${dropdownPosition.y}px`,
                left: `${dropdownPosition.x}px`,
              }}
            >
              <li className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                <div className="flex items-center space-x-2">
                  <Edit size={16} />
                  <span>Update</span>
                </div>
              </li>
              <li className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                <div className="flex items-center space-x-2 text-red-500">
                  <Trash2 size={16} />
                  <span>Delete</span>
                </div>
              </li>
              <li className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                <div className="flex items-center space-x-2 text-yellow-500">
                  <Copy size={16} />
                  <span>Duplicate</span>
                </div>
              </li>
            </ul>
          )}
        </div>
      </div>
      {project.budget && (
        <div className="mb-3">
          Planned Budget{" "}
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
            ${project.budget}
          </span>
        </div>
      )}
      <div className="my-3">
        <div className="flex flex-wrap items-center justify-between">
          <div className="mb-2 md:mb-0">
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <span
              className={
                project.status === "InProgress"
                  ? "bg-green-500 text-white px-2 py-1 rounded"
                  : "bg-gray-800 text-white px-2 py-1 rounded"
              }
            >
              {project.status}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Priority
            </label>
            <span
              className={
                project.priority === "Critical"
                  ? "bg-red-500 text-white px-2 py-1 rounded"
                  : project.priority === "High"
                  ? "bg-orange-500 text-white px-2 py-1 rounded"
                  : project.priority === "Medium"
                  ? "bg-yellow-500 text-gray-900 px-2 py-1 rounded"
                  : "bg-green-500 text-white px-2 py-1 rounded"
              }
            >
              {project.priority}
            </span>
          </div>
        </div>
      </div>
      <div className="my-4 flex justify-between">
        <span>
          <CheckCircle size={16} className="text-blue-500 inline-block mr-1" />
          <b>{tasksCount}</b> Tasks
        </span>
        <Link
          href={`/projects/tasks/draggable/${project.id}`}
          className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-2 border border-blue-500 hover:border-transparent rounded"
        >
          Tasks
        </Link>
      </div>
      <div className="mt-2">
        <div className="flex flex-wrap justify-between">
          <div className="w-full md:w-1/2 mb-2 md:mb-0">
            <p className="text-sm font-medium text-gray-700">Members:</p>
            <ul className="list-none m-0 p-0 flex items-center">
              {members.map((member) => (
                <li key={member.id} className="mr-1" title={member.name}>
                  <Link href={member.profileLink} target="_blank">
                    <img
                      src={member.avatar}
                      className="rounded-full w-8 h-8"
                      alt={member.name}
                    />
                  </Link>
                </li>
              ))}
              <button className="text-blue-500 hover:text-blue-700 p-1 rounded-full">
                <Edit size={16} />
              </button>
            </ul>
          </div>
          <div className="w-full md:w-1/2">
            <p className="text-sm font-medium text-gray-700">Clients:</p>
            <ul className="list-none m-0 p-0 flex items-center">
              {clients.length > 0 ? (
                clients.map((client) => (
                  <li key={client.id} className="mr-1" title={client.name}>
                    <Link href={client.profileLink} target="_blank">
                      <img
                        src={client.avatar}
                        className="rounded-full w-8 h-8"
                        alt={client.name}
                      />
                    </Link>
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
        </div>
      </div>
      <div className="mt-2">
        <div className="flex flex-wrap justify-between text-xs text-gray-600">
          <div className="w-full md:w-1/3 text-left mb-1 md:mb-0">
            <Calendar size={12} className="text-green-500 inline-block mr-1" />
            Starts At: {new Date(project.start_date).toLocaleDateString()}
          </div>
          <div className="w-full md:w-1/3 text-right">
            <Calendar size={12} className="text-red-500 inline-block mr-1" />
            Ends At: {new Date(project.end_date).toLocaleDateString()}
          </div>
          <div className="w-full md:w-1/3 text-center mb-1 md:mb-0">
            Duration: <span className="text-green-500">{duration}</span>
          </div>

          <div className="w-full mt-2">
            <div className="bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${project.progress}%` }}
                role="progressbar"
                aria-valuenow={project.progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span className="sr-only">{project.progress}% Complete</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;

const getDuration = (start: string | Date, end: string | Date): string => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return "Invalid date";
  }

  const timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return `${diffDays} days`;
};
