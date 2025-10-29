"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import avatar from "@/../public/images/user.png";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { useDeleteUser, useUpdateUser, useUsers } from "@/hooks/useUsers";
import { useDepartments } from "@/hooks/useDepartments";
import { useRoles } from "@/hooks/useRoles";
import Spinner from "@/components/common/ui/Spinner";
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
  LucideEdit2 as Edit2,
} from "lucide-react";
import AssignBadge from "@/components/users/AssignBadge";
import ConfirmModal from "@/components/common/ui/ConfirmModal";
import { UpdateUserInput, User } from "@/types/user";
import { useRouter } from "next/navigation";
import UserForm from "@/components/forms/UserForm";
import EditUserForm from "@/components/forms/EditUserForm";

import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import {
  FilterField,
  FilterValues,
  GenericFilter,
  Option,
} from "@/components/common/GenericFilter";

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

  // State for showing the “Create User” and “Edit User” modals:
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  // State for delete confirmation:
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // NEW: Track which user’s “access” is being edited inline
  const [editingAccessUserId, setEditingAccessUserId] = useState<string | null>(
    null
  );
  const [, setTempAccessValue] = useState<
    "Low Access" | "Average Access" | "Full Access"
  >("Low Access");

  // Columns configuration for customize columns
  const columnOptions: Record<string, string> = {
    id: "ID",
    profile: "Profile",
    name: "Name",
    role: "Role",
    access: "Permission Level",
    department: "Department",
    site: "Site",
    phone: "Phone",
    status: "Status",
    assigned: "Assigned",
    actions: "Actions",
  };

  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    Object.keys(columnOptions)
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close column menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowColumnMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // --- IMPORTANT: hooks that were previously placed after early returns ---
  // Move filter state and derived hooks here so hook order is stable across renders
  const [filterValues, setFilterValues] = useState<FilterValues>({});

  // compute filtered users based on filterValues
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((u) => {
      let ok = true;
      if (filterValues.name && typeof filterValues.name === "string") {
        const q = filterValues.name.toLowerCase();
        ok =
          ok &&
          (`${u.first_name ?? ""} ${u.last_name ?? ""}`
            .toLowerCase()
            .includes(q) ||
            (u.email ?? "").toLowerCase().includes(q));
      }
      if (filterValues.role && typeof filterValues.role === "string") {
        ok =
          ok &&
          (u.role?.name ?? "").toLowerCase() ===
            filterValues.role.toLowerCase();
      }
      if (
        filterValues.department &&
        typeof filterValues.department === "string"
      ) {
        ok =
          ok &&
          (u.department?.name ?? "")
            .toLowerCase()
            .includes(filterValues.department.toLowerCase());
      }
      if (filterValues.status && typeof filterValues.status === "string") {
        ok =
          ok &&
          (u.status ?? "Active").toLowerCase() ===
            filterValues.status.toLowerCase();
      }
      return ok;
    });
  }, [users, filterValues]);

  // ---------- end moved hooks ----------

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

  // Metrics
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

  // When the inline-select value changes, immediately call updateUser({ id, access })
  const handleAccessChange = (
    userId: string,
    newAccess: "Low Access" | "Average Access" | "Full Access"
  ) => {
    updateUser({ id: userId, access: newAccess });
    setEditingAccessUserId(null);
  };

  // Build download columns similar to example
  const downloadColumns: Column<User>[] = [
    { header: "ID", accessor: (r: User) => r.id },
    {
      header: "Name",
      accessor: (r: User) => `${r.first_name ?? ""} ${r.last_name ?? ""}`,
    },
    { header: "Email", accessor: "email" },
    { header: "Role", accessor: (r: User) => r.role?.name ?? "-" },
    { header: "Permission Level", accessor: (r: User) => r.access ?? "-" },
    { header: "Department", accessor: (r: User) => r.department?.name ?? "-" },
    { header: "Site", accessor: (r: User) => r.site?.name ?? "-" },
    { header: "Phone", accessor: "phone" },
    { header: "Status", accessor: "status" },
    {
      header: "Projects Count",
      accessor: (r: User) => r.projects?.length ?? 0,
    },
    {
      header: "Tasks Count",
      accessor: (r: User) => r.tasks?.length ?? 0,
    },
    {
      header: "Activities Count",
      accessor: (r: User) => r.activities?.length ?? 0,
    },
  ];

  // Filter fields: you can add more fields or adjust as needed
  const roleOptions: Option<string>[] = roles.map((r) => ({
    label: r.name,
    value: r.name,
  }));
  const departmentOptions: Option<string>[] = departments.map((d) => ({
    label: d.name,
    value: d.name,
  }));
  const statusOptions: Option<string>[] = [
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
  ];

  const filterFields: FilterField<string>[] = [
    {
      name: "name",
      label: "Name",
      type: "text",
      placeholder: "Search by name…",
    },
    {
      name: "role",
      label: "Role",
      type: "select",
      options: roleOptions,
      placeholder: "Filter by role",
    },
    {
      name: "department",
      label: "Department",
      type: "select",
      options: departmentOptions,
      placeholder: "Filter by department",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: statusOptions,
      placeholder: "Filter by status",
    },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Breadcrumb + Top actions (downloads + create) */}
      <div className="flex items-center mb-4 gap-4 flex-wrap">
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

        <div className="ml-auto flex items-center gap-3">
          {/* Generic Downloads: uses filteredUsers */}
          <div className="w-full sm:w-auto">
            <GenericDownloads
              data={filteredUsers}
              title="Users_List"
              columns={downloadColumns}
            />
          </div>

          <button
            className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-2 px-3 rounded text-sm"
            onClick={() => setShowForm(true)}
          >
            <PlusIcon width={15} height={12} />
          </button>
        </div>
      </div>

      {/* Create User Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <UserForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {/* Edit User Modal (opens when “Update” in the Action menu is clicked) */}
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

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {metrics.map(({ title, value, icon }) => (
          <MetricsCard key={title} title={title} value={value} icon={icon} />
        ))}
      </div>

      {/* Filters + Customize Columns */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setShowColumnMenu((prev) => !prev)}
            className="flex items-center gap-1 px-4 py-2 text-sm bg-cyan-700 text-white rounded hover:bg-cyan-800"
          >
            Customize Columns <ChevronDown className="w-4 h-4" />
          </button>
          {showColumnMenu && (
            <div className="absolute left-0 mt-1 w-48 bg-white border rounded shadow-lg z-10">
              {Object.entries(columnOptions).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center w-full px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(key)}
                    onChange={() =>
                      setSelectedColumns((prev) =>
                        prev.includes(key)
                          ? prev.filter((c) => c !== key)
                          : [...prev, key]
                      )
                    }
                    className="mr-2"
                  />
                  {label || <span>&nbsp;</span>}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1">
          <GenericFilter
            fields={filterFields}
            onFilterChange={setFilterValues}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-max w-full border border-gray-200 divide-y divide-gray-200">
          <thead className="bg-cyan-700">
            <tr>
              {selectedColumns.includes("id") && (
                <th className="border border-gray-200 px-4 py-2 text-center text-sm font-medium text-gray-50">
                  ID
                </th>
              )}
              {selectedColumns.includes("profile") && (
                <th className="border border-gray-200 px-4 py-2 text-center text-sm font-medium text-gray-50">
                  Profile
                </th>
              )}
              {selectedColumns.includes("name") && (
                <th className="border border-gray-200 px-6 py-4 text-left text-sm font-medium text-gray-50">
                  Name
                </th>
              )}
              {selectedColumns.includes("role") && (
                <th className="border border-gray-200 px-6 py-4 text-left text-sm font-medium text-gray-50">
                  Role
                </th>
              )}
              {selectedColumns.includes("access") && (
                <th className="border border-gray-200 px-6 py-4 text-left text-sm font-medium text-gray-50">
                  Permission Level
                </th>
              )}
              {selectedColumns.includes("department") && (
                <th className="border border-gray-200 px-6 py-4 text-left text-sm font-medium text-gray-50">
                  Department
                </th>
              )}
              {selectedColumns.includes("site") && (
                <th className="border border-gray-200 px-6 py-4 text-left text-sm font-medium text-gray-50">
                  Site
                </th>
              )}
              {selectedColumns.includes("phone") && (
                <th className="border border-gray-200 px-6 py-4 text-left text-sm font-medium text-gray-50">
                  Phone
                </th>
              )}
              {selectedColumns.includes("status") && (
                <th className="border border-gray-200 px-6 py-4 text-left text-sm font-medium text-gray-50">
                  Status
                </th>
              )}
              {selectedColumns.includes("assigned") && (
                <th className="border border-gray-200 px-6 py-4 text-center text-sm font-medium text-gray-50">
                  Assigned
                </th>
              )}
              {selectedColumns.includes("actions") && (
                <th className="border border-gray-200 px-6 py-4 text-center text-sm font-medium text-gray-50">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white">
            {filteredUsers.map((user, idx) => (
              <tr key={user.id} className="hover:bg-gray-50">
                {selectedColumns.includes("id") && (
                  <td className="border border-gray-200 px-4 py-2 text-center">
                    {idx + 1}
                  </td>
                )}
                {selectedColumns.includes("profile") && (
                  <td className="border border-gray-200 px-4 py-2 text-center">
                    <Image
                      src={user.profile_picture || avatar}
                      alt="Profile Picture"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  </td>
                )}
                {selectedColumns.includes("name") && (
                  <td className="border border-gray-200 px-6 py-3 whitespace-nowrap">
                    <Link
                      href={`/users/profile/${user.id}`}
                      className="text-cyan-700 hover:text-cyan-900 block"
                    >
                      {`${user.first_name} ${user.last_name}`}
                    </Link>
                    <div className="text-xs text-gray-500 mt-1">
                      {user.email}
                    </div>
                  </td>
                )}
                {selectedColumns.includes("role") && (
                  <td className="border border-gray-200 px-6 py-3 whitespace-nowrap">
                    {user.role?.name || "—"}
                  </td>
                )}
                {selectedColumns.includes("access") && (
                  <td className="border border-gray-200 px-6 py-3 whitespace-nowrap flex items-center">
                    {editingAccessUserId === user.id ? (
                      // If this row is in “edit mode”, show a <select>
                      <select
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                        defaultValue={user.access ?? "Low Access"}
                        onChange={(e) =>
                          handleAccessChange(
                            user.id,
                            e.target.value as
                              | "Low Access"
                              | "Average Access"
                              | "Full Access"
                          )
                        }
                        onBlur={() => setEditingAccessUserId(null)}
                      >
                        <option value="Low Access">Low Access</option>
                        <option value="Average Access">Average Access</option>
                        <option value="Full Access">Full Access</option>
                      </select>
                    ) : (
                      <>
                        <span>{user.access || "Low Access"}</span>
                        <button
                          onClick={() => {
                            setTempAccessValue(
                              (user.access as
                                | "Low Access"
                                | "Average Access"
                                | "Full Access") || "Low Access"
                            );
                            setEditingAccessUserId(user.id);
                          }}
                          className="ml-2 text-xs text-blue-600 hover:underline"
                        >
                          <Edit2 />
                        </button>
                      </>
                    )}
                  </td>
                )}
                {selectedColumns.includes("department") && (
                  <td className="border border-gray-200 px-6 py-3 whitespace-nowrap">
                    {user.department?.name || "—"}
                  </td>
                )}
                {selectedColumns.includes("site") && (
                  <td className="border border-gray-200 px-6 py-3 whitespace-nowrap">
                    {user.site?.name || "—"}
                  </td>
                )}
                {selectedColumns.includes("phone") && (
                  <td className="border border-gray-200 px-6 py-3 whitespace-nowrap">
                    {user.phone}
                  </td>
                )}
                {selectedColumns.includes("status") && (
                  <td className="border border-gray-200 px-6 py-3 whitespace-nowrap">
                    {user.status || "Active"}
                  </td>
                )}
                {selectedColumns.includes("assigned") && (
                  <td className="border border-gray-200 px-6 py-3 whitespace-nowrap text-center flex space-x-2 justify-center">
                    <AssignBadge
                      name="Projects"
                      count={user.projects?.length ?? 0}
                    />
                    <AssignBadge name="Tasks" count={user.tasks?.length ?? 0} />
                    <AssignBadge
                      name="Activities"
                      count={user.activities?.length ?? 0}
                    />
                  </td>
                )}
                {selectedColumns.includes("actions") && (
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
                                onClick={() => handleDeleteUserClick(user.id)}
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
                                onClick={() => handleViewUser(user.id)}
                              >
                                Quick View
                              </button>
                            )}
                          </MenuItem>
                        </MenuItems>
                      </Menu>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <ConfirmModal
          isVisible={isDeleteModalOpen}
          title="Confirm Deletion"
          message="Are you sure you want to delete this user?"
          showInput={false}
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
