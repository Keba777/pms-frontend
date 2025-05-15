"use client";

import React, { useState } from "react";
import Image from "next/image";
import avatar from "@/../public/images/user.png";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { useDeleteUser, useUpdateUser, useUsers } from "@/hooks/useUsers";
import { useDepartments } from "@/hooks/useDepartments";
import { useRoles } from "@/hooks/useRoles";
import Spinner from "@/components/ui/Spinner";
import MetricsCard from "@/components/users/MetricsCard";
import Link from "next/link";
import {
  Users as UsersIcon,
  CheckCircle as ActiveIcon,
  XCircle as InactiveIcon,
  Building2 as DepartmentsIcon,
  Shield as RolesIcon,
  ChevronDown,
  PlusIcon,
} from "lucide-react";
import AssignBadge from "@/components/users/AssignBadge";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { UpdateUserInput, User } from "@/types/user";
import { useRouter } from "next/navigation";
import UserForm from "@/components/forms/UserForm";
import EditUserForm from "@/components/forms/EditUserForm";

const UsersPage = () => {
  const {
    data: users = [],
    isLoading: loadingUsers,
    isError: usersError,
  } = useUsers();
  const {
    data: departments = [],
    isLoading: loadingDepartments,
    isError: departmentsError,
  } = useDepartments();
  const {
    data: roles = [],
    isLoading: loadingRoles,
    isError: rolesError,
  } = useRoles();

  const loading = loadingUsers || loadingDepartments || loadingRoles;
  const error = usersError || departmentsError || rolesError;
  const router = useRouter();

  const { mutate: deleteUser } = useDeleteUser();
  const { mutate: updateUser } = useUpdateUser();
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center py-4">
        Failed to load data. Please try again.
      </div>
    );
  }

  // Compute metrics
  const totalUsers = users.length;
  const activeUsers = users.filter(
    (u) => u.status?.toLowerCase() === "active" || !u.status
  ).length;
  const nonActiveUsers = totalUsers - activeUsers;
  const departmentCount = departments.length;
  const rolesCount = roles.length;

  const metrics = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: <UsersIcon className="h-6 w-6 text-cyan-700" />,
    },
    {
      title: "Active Users",
      value: activeUsers,
      icon: <ActiveIcon className="h-6 w-6 text-cyan-700" />,
    },
    {
      title: "Non-Active Users",
      value: nonActiveUsers,
      icon: <InactiveIcon className="h-6 w-6 text-cyan-700" />,
    },
    {
      title: "Departments",
      value: departmentCount,
      icon: <DepartmentsIcon className="h-6 w-6 text-cyan-700" />,
    },
    {
      title: "Roles",
      value: rolesCount,
      icon: <RolesIcon className="h-6 w-6 text-cyan-700" />,
    },
  ];

  const handleDeleteUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteUser = () => {
    if (selectedUserId) {
      deleteUser(selectedUserId);
      setIsDeleteModalOpen(false);
    }
  };

  const handleViewUser = (userId: string) => {
    router.push(`/users/profile/${userId}`);
  };

  const handleUpdateUser = (data: UpdateUserInput) => {
    updateUser(data);
    setShowEditForm(false);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center mb-4">
        <nav aria-label="breadcrumb">
          <ol className="flex space-x-2">
            <li>
              <Link href="/" className="text-blue-600 hover:underline">
                Home
              </Link>
            </li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-900 font-semibold">Users</li>
          </ol>
        </nav>
        <div className="ml-auto">
          <button
            className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-2 px-3 rounded text-sm"
            onClick={() => setShowForm(true)}
          >
            <PlusIcon width={15} height={12} />
          </button>
        </div>
      </div>

      {/* Modal Overlay and Form */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <UserForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {showEditForm && userToEdit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <EditUserForm
              user={userToEdit}
              onClose={() => setShowEditForm(false)}
              onSubmit={handleUpdateUser}
            />
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {metrics.map(({ title, value, icon }) => (
          <MetricsCard key={title} title={title} value={value} icon={icon} />
        ))}
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-max w-full border border-gray-200 divide-y divide-gray-200">
          <thead className="bg-cyan-700">
            <tr>
              <th className="border border-gray-200 px-4 py-2 text-center text-sm font-medium text-gray-50">
                ID
              </th>
              <th className="border border-gray-200 px-4 py-2 text-center text-sm font-medium text-gray-50">
                Profile
              </th>
              <th className="border border-gray-200 px-6 py-4 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Name
              </th>
              <th className="border border-gray-200 px-6 py-4 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Role
              </th>
              <th className="border border-gray-200 px-6 py-4 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Permission Level
              </th>
              <th className="border border-gray-200 px-6 py-4 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Department
              </th>
              <th className="border border-gray-200 px-6 py-4 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Site
              </th>
              <th className="border border-gray-200 px-6 py-4 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Email
              </th>
              <th className="border border-gray-200 px-6 py-4 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Phone
              </th>
              <th className="border border-gray-200 px-6 py-4 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Status
              </th>
              <th className="border border-gray-200 px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-50">
                Assigned
              </th>
              <th className="border border-gray-200 px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-50">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {users.map((user, idx) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="border border-gray-200 px-4 py-2 text-center">
                  {idx + 1}
                </td>
                <td className="border border-gray-200 px-4 py-2 text-center">
                  <Image
                    src={user.profile_picture || avatar}
                    alt="Profile Picture"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                </td>
                <td className="border border-gray-200 px-6 py-3 whitespace-nowrap">
                  <Link
                    href={`/users/profile/${user.id}`}
                    className="text-cyan-700 hover:text-cyan-900"
                  >
                    {`${user.first_name} ${user.last_name}`}
                  </Link>
                </td>
                <td className="border border-gray-200 px-6 py-3 whitespace-nowrap">
                  {user.role?.name || "—"}
                </td>
                <td className="border border-gray-200 px-6 py-3 whitespace-nowrap">
                  {user.role?.name === "Admin"
                    ? "Full access"
                    : user.role?.name === "User"
                    ? "Low access"
                    : "Average access"}
                </td>
                <td className="border border-gray-200 px-6 py-3 whitespace-nowrap">
                  {user.department?.name || "—"}
                </td>
                <td className="border border-gray-200 px-6 py-3 whitespace-nowrap">
                  {user?.site || "—"}
                </td>
                <td className="border border-gray-200 px-6 py-3 whitespace-nowrap">
                  {user.email}
                </td>
                <td className="border border-gray-200 px-6 py-3 whitespace-nowrap">
                  {user.phone}
                </td>
                <td className="border border-gray-200 px-6 py-3 whitespace-nowrap">
                  {user.status || "Active"}
                </td>
                <td className="border border-gray-200 px-6 py-3 whitespace-nowrap text-center flex">
                  <AssignBadge
                    name="Projects"
                    count={user.projects?.length ?? 0}
                  />
                  <AssignBadge name="Tasks" count={user.tasks?.length ?? 0} />
                  <AssignBadge
                    name="Activities"
                    count={user.activities?.length ?? 0}
                  />
                  <br />
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="relative inline-block">
                    <Menu>
                      <MenuButton className="flex items-center gap-1 px-3 py-1 text-sm bg-cyan-700 text-white rounded hover:bg-cyan-800">
                        Action <ChevronDown className="w-4 h-4" />
                      </MenuButton>
                      <MenuItems className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                        <MenuItem>
                          {({ focus }) => (
                            <button
                              className={`block w-full px-4 py-2 text-left whitespace-nowrap ${
                                focus ? "bg-blue-100" : ""
                              }`}
                              onClick={() => {
                                setUserToEdit(user);
                                setShowEditForm(true);
                              }}
                            >
                              Update
                            </button>
                          )}
                        </MenuItem>
                        <MenuItem>
                          {({ focus }) => (
                            <button
                              className={`block w-full px-4 py-2 text-left whitespace-nowrap ${
                                focus ? "bg-blue-100" : ""
                              }`}
                              onClick={() => {
                                setIsDeleteModalOpen(true);
                                handleDeleteUserClick(user.id);
                              }}
                            >
                              Delete
                            </button>
                          )}
                        </MenuItem>
                        <MenuItem>
                          {({ focus }) => (
                            <button
                              className={`block w-full px-4 py-2 text-left whitespace-nowrap ${
                                focus ? "bg-blue-100" : ""
                              }`}
                              onClick={() => {
                                handleViewUser(user.id);
                              }}
                            >
                              Quick View
                            </button>
                          )}
                        </MenuItem>
                      </MenuItems>
                    </Menu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isDeleteModalOpen && (
        <ConfirmModal
          isVisible={isDeleteModalOpen}
          title="Confirm Deletion"
          message="Are you sure you want to delete this activity?"
          showInput={true}
          confirmText="DELETE"
          confirmButtonText="Delete"
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteUser}
        />
      )}
    </div>
  );
};

export default UsersPage;
