"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import avatar from "@/../public/images/user.png";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import {
  useDeleteUser,
  useUpdateUser,
  useUsers,
  useCreateUser,
  useImportUsers,
} from "@/hooks/useUsers";
import { useDepartments } from "@/hooks/useDepartments";
import { useRoles } from "@/hooks/useRoles";
import { useSites } from "@/hooks/useSites";
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
import GenericImport, { ImportColumn } from "@/components/common/GenericImport";
import {
  FilterField,
  FilterValues,
  GenericFilter,
  Option,
} from "@/components/common/GenericFilter";
import { toast } from "react-toastify";
import { Skeleton } from "@/components/ui/skeleton";

// === TEMPORARY TYPE FOR IMPORT (supports File or URL) ===
interface ImportUserRow {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role_name: string;
  department_name?: string;
  site_name: string;
  profile_picture?: string | File; // ← File or URL
  access?: "Low Access" | "Full Access" | "Average Access";
  status?: "Active" | "InActive";
  responsibilities?: string;
  username?: string;
  gender?: string;
  position?: string;
  terms?: string;
  joining_date?: string;
  est_salary?: number;
  ot?: number;
}

const UsersPage = () => {
  // === DATA ===
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
  const {
    data: sites = [],
    isLoading: loadingSites,
    isError: sitesError,
  } = useSites();

  const error = usersError || departmentsError || rolesError || sitesError;
  const router = useRouter();

  const { mutate: deleteUser } = useDeleteUser();
  const { mutate: updateUser } = useUpdateUser();
  const { mutateAsync: createUser } = useCreateUser();
  const { mutateAsync: importUsers } = useImportUsers();

  // === UI STATE ===
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editingAccessUserId, setEditingAccessUserId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // === COLUMN CUSTOMIZATION ===
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
    username: "Username",
    gender: "Gender",
    position: "Position",
    terms: "Terms",
    joiningDate: "Joining Date",
    estSalary: "Est Salary",
    ot: "OT",
  };

  const [selectedColumns, setSelectedColumns] = useState<string[]>(Object.keys(columnOptions));
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowColumnMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // === FILTERING ===
  const [filterValues, setFilterValues] = useState<FilterValues>({});

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((u) => {
      let ok = true;
      if (filterValues.name && typeof filterValues.name === "string") {
        const q = filterValues.name.toLowerCase();
        ok = ok && (
          `${u.first_name ?? ""} ${u.last_name ?? ""}`.toLowerCase().includes(q) ||
          (u.email ?? "").toLowerCase().includes(q)
        );
      }
      if (filterValues.role && typeof filterValues.role === "string") {
        ok = ok && (u.role?.name ?? "").toLowerCase() === filterValues.role.toLowerCase();
      }
      if (filterValues.department && typeof filterValues.department === "string") {
        ok = ok && (u.department?.name ?? "").toLowerCase().includes(filterValues.department.toLowerCase());
      }
      if (filterValues.status && typeof filterValues.status === "string") {
        ok = ok && (u.status ?? "Active").toLowerCase() === filterValues.status.toLowerCase();
      }
      if (filterValues.gender && typeof filterValues.gender === "string") {
        ok = ok && (u.gender ?? "Male") === filterValues.gender;
      }
      if (filterValues.terms && typeof filterValues.terms === "string") {
        ok = ok && (u.terms ?? "") === filterValues.terms;
      }
      return ok;
    });
  }, [users, filterValues]);

  if (error) {
    return (
      <div className="text-red-600 text-center py-4">
        Failed to load data. Please try again.
      </div>
    );
  }

  // === METRICS ===
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status?.toLowerCase() === "active" || !u.status).length;
  const nonActiveUsers = totalUsers - activeUsers;
  const departmentCount = departments.length;
  const rolesCount = roles.length;

  const metrics = [
    { title: "Total Users", value: totalUsers, icon: <UsersIcon className="h-6 w-6 text-cyan-700" /> },
    { title: "Active Users", value: activeUsers, icon: <ActiveIcon className="h-6 w-6 text-cyan-700" /> },
    { title: "Non-Active Users", value: nonActiveUsers, icon: <InactiveIcon className="h-6 w-6 text-cyan-700" /> },
    { title: "Departments", value: departmentCount, icon: <DepartmentsIcon className="h-6 w-6 text-cyan-700" /> },
    { title: "Roles", value: rolesCount, icon: <RolesIcon className="h-6 w-6 text-cyan-700" /> },
  ];

  // === ACTION HANDLERS ===
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

  const handleAccessChange = (
    userId: string,
    newAccess: "Low Access" | "Full Access" | "Average Access"
  ) => {
    updateUser({ id: userId, access: newAccess });
    setEditingAccessUserId(null);
  };

  // === DOWNLOAD COLUMNS (with real image URL) ===
  const downloadColumns: Column<User>[] = [
    { header: "ID", accessor: (_r, index) => `RC${String(index! + 1).padStart(3, "0")}` },
    { header: "Name", accessor: (r) => `${r.first_name} ${r.last_name}` },
    { header: "Email", accessor: "email" },
    { header: "Role", accessor: (r) => r.role?.name ?? "-" },
    { header: "Permission Level", accessor: (r) => r.access ?? "-" },
    { header: "Department", accessor: (r) => r.department?.name ?? "-" },
    { header: "Site", accessor: (r) => r.site?.name ?? "-" },
    { header: "Phone", accessor: "phone" },
    { header: "Status", accessor: (r) => r.status ?? "Active" },
    { header: "Projects Count", accessor: (r) => r.projects?.length ?? 0 },
    { header: "Tasks Count", accessor: (r) => r.tasks?.length ?? 0 },
    { header: "Activities Count", accessor: (r) => r.activities?.length ?? 0 },
    { header: "Profile Picture", accessor: (r) => r.profile_picture ?? "-" },
    { header: "Username", accessor: (r) => r.username ?? "-" },
    { header: "Gender", accessor: (r) => r.gender ?? "-" },
    { header: "Position", accessor: (r) => r.position ?? "-" },
    { header: "Terms", accessor: (r) => r.terms ?? "-" },
    { header: "Joining Date", accessor: (r) => r.joiningDate ? new Date(r.joiningDate).toISOString() : "-" },
    { header: "Est Salary", accessor: (r) => r.estSalary ?? "-" },
    { header: "OT", accessor: (r) => r.ot ?? "-" },
  ];

  // === IMPORT COLUMNS ===
  const importColumns: ImportColumn<ImportUserRow>[] = [
    { header: "First Name", accessor: "first_name", type: "string" },
    { header: "Last Name", accessor: "last_name", type: "string" },
    { header: "Email", accessor: "email", type: "string" },
    { header: "Phone", accessor: "phone", type: "string" },
    { header: "Role Name", accessor: "role_name", type: "string" },
    { header: "Department Name", accessor: "department_name", type: "string" },
    { header: "Site Name", accessor: "site_name", type: "string" },
    { header: "Profile Picture", accessor: "profile_picture", type: "file" },
    { header: "Permission Level", accessor: "access", type: "string" },
    { header: "Status", accessor: "status", type: "string" },
    { header: "Responsibilities", accessor: "responsibilities", type: "string" },
    { header: "Username", accessor: "username", type: "string" },
    { header: "Gender", accessor: "gender", type: "string" },
    { header: "Position", accessor: "position", type: "string" },
    { header: "Terms", accessor: "terms", type: "string" },
    { header: "Joining Date", accessor: "joining_date", type: "string" },
    { header: "Est Salary", accessor: "est_salary", type: "number" },
    { header: "OT", accessor: "ot", type: "number" },
  ];

  const requiredAccessors: (keyof ImportUserRow)[] = [
    "first_name",
    "last_name",
    "email",
    "phone",
    "role_name",
    "site_name",
  ];

  const handleImport = async (rows: ImportUserRow[]) => {
  if (rows.length === 0) return;

  try {
    setUploading(true);

    const roleMap = new Map(roles.map(r => [r.name.toLowerCase(), r.id]));
    const deptMap = new Map(departments.map(d => [d.name.toLowerCase(), d.id]));
    const siteMap = new Map(sites.map(s => [s.name.toLowerCase(), s.id]));

    const formData = new FormData();

    const usersJson = rows.map((r, index) => {
      const roleId = roleMap.get(r.role_name.trim().toLowerCase());
      if (!roleId) throw new Error(`Row ${index + 2}: Role "${r.role_name}" not found`);

      const siteId = siteMap.get(r.site_name.trim().toLowerCase());
      if (!siteId) throw new Error(`Row ${index + 2}: Site "${r.site_name}" not found`);

      const departmentId = r.department_name
        ? deptMap.get(r.department_name.trim().toLowerCase()) || undefined
        : undefined;

      const responsibilities = r.responsibilities
        ? r.responsibilities.split(",").map(s => s.trim()).filter(Boolean)
        : [];

      const userObj: any = {
        first_name: r.first_name,
        last_name: r.last_name,
        email: r.email,
        phone: r.phone,
        password: "123456",
        role_id: roleId,
        siteId: siteId,
        department_id: departmentId,
        access: r.access,
        status: r.status,
        responsiblities: responsibilities,
        username: r.username ? r.username.trim().toLowerCase() : undefined,
        gender: r.gender,
        position: r.position,
        terms: r.terms,
        joiningDate: r.joining_date ? new Date(r.joining_date) : undefined,
        estSalary: r.est_salary ? parseFloat(r.est_salary as any) : undefined,
        ot: r.ot ? parseFloat(r.ot as any) : undefined,
      };

      // Handle profile picture
      if (r.profile_picture instanceof File && r.profile_picture.size > 0) {
        formData.append("profile_picture", r.profile_picture);
      } else if (typeof r.profile_picture === "string" && r.profile_picture.startsWith("http")) {
        userObj.profile_picture = r.profile_picture;
      }

      return userObj;
    });

    // Append users as JSON string (or as individual fields)
    formData.append("users", JSON.stringify(usersJson));
    console.log("FormData entries:", Array.from(formData.entries()));

    await importUsers(formData);
    toast.success(`Imported ${rows.length} users successfully!`);
  } catch (err: any) {
    toast.error(err.message || "Import failed");
    console.error(err);
  } finally {
    setUploading(false);
  }
};

  const handleError = (msg: string) => toast.error(msg);

  // === FILTER OPTIONS ===
  const roleOptions: Option<string>[] = roles.map(r => ({ label: r.name, value: r.name }));
  const departmentOptions: Option<string>[] = departments.map(d => ({ label: d.name, value: d.name }));
  const statusOptions: Option<string>[] = [
    { label: "Active", value: "Active" },
    { label: "InActive", value: "InActive" },
  ];
  const genderOptions: Option<string>[] = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
  ];
  const termsOptions: Option<string>[] = [
    { label: "Part Time", value: "Part Time" },
    { label: "Contract", value: "Contract" },
    { label: "Temporary", value: "Temporary" },
    { label: "Permanent", value: "Permanent" },
  ];

  const filterFields: FilterField<string>[] = [
    { name: "name", label: "Name", type: "text", placeholder: "Search by name…" },
    { name: "role", label: "Role", type: "select", options: roleOptions, placeholder: "Filter by role" },
    { name: "department", label: "Department", type: "select", options: departmentOptions, placeholder: "Filter by department" },
    { name: "status", label: "Status", type: "select", options: statusOptions, placeholder: "Filter by status" },
    { name: "gender", label: "Gender", type: "select", options: genderOptions, placeholder: "Filter by gender" },
    { name: "terms", label: "Terms", type: "select", options: termsOptions, placeholder: "Filter by terms" },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Breadcrumb + Actions */}
      <div className="flex items-center mb-4 gap-4 flex-wrap">
        <nav aria-label="breadcrumb">
          <ol className="flex space-x-2">
            <li><Link href="/" className="text-blue-600 hover:underline">Home</Link></li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-900 font-semibold">Users</li>
          </ol>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="w-full sm:w-auto">
            <GenericDownloads data={filteredUsers} title="Users_List" columns={downloadColumns} />
          </div>
          <button
            className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-2 px-3 rounded text-sm"
            onClick={() => setShowForm(true)}
          >
            <PlusIcon width={15} height={12} />
          </button>
        </div>
      </div>

      {/* Import Button */}
      <div className="flex justify-end mb-4">
        <GenericImport<ImportUserRow>
          expectedColumns={importColumns}
          requiredAccessors={requiredAccessors}
          onImport={handleImport}
          title="Users"
          onError={handleError}
        />
      </div>

      {/* Modals */}
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

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {metrics.map(({ title, value, icon }) => (
          <MetricsCard key={title} title={title} value={value} icon={icon} />
        ))}
      </div>

      {/* Filters + Columns */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setShowColumnMenu(prev => !prev)}
            className="flex items-center gap-1 px-4 py-2 text-sm bg-cyan-700 text-white rounded hover:bg-cyan-800"
          >
            Customize Columns <ChevronDown className="w-4 h-4" />
          </button>
          {showColumnMenu && (
            <div className="absolute left-0 mt-1 w-48 bg-white border rounded shadow-lg z-10">
              {Object.entries(columnOptions).map(([key, label]) => (
                <label key={key} className="flex items-center w-full px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(key)}
                    onChange={() => setSelectedColumns(prev =>
                      prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
                    )}
                    className="mr-2"
                  />
                  {label}
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1">
          <GenericFilter fields={filterFields} onFilterChange={setFilterValues} />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-max w-full border border-gray-200 divide-y divide-gray-200">
          <thead className="bg-cyan-700">
            <tr>
              {selectedColumns.includes("id") && <th className="border border-gray-200 px-4 py-2 text-center text-sm font-medium text-gray-50">ID</th>}
              {selectedColumns.includes("profile") && <th className="border border-gray-200 px-4 py-2 text-center text-sm font-medium text-gray-50">Profile</th>}
              {selectedColumns.includes("name") && <th className="border border-gray-200 px-6 py-4 text-left text-sm font-medium text-gray-50">Name</th>}
              {selectedColumns.includes("role") && <th className="border border-gray-200 px-6 py-4 text-left text-sm font-medium text-gray-50">Role</th>}
              {selectedColumns.includes("access") && <th className="border border-gray-200 px-6 py-4 text-left text-sm font-medium text-gray-50">Permission Level</th>}
              {selectedColumns.includes("department") && <th className="border border-gray-200 px-6 py-4 text-left text-sm font-medium text-gray-50">Department</th>}
              {selectedColumns.includes("site") && <th className="border border-gray-200 px-6 py-4 text-left text-sm font-medium text-gray-50">Site</th>}
              {selectedColumns.includes("phone") && <th className="border border-gray-200 px-6 py-4 text-left text-sm font-medium text-gray-50">Phone</th>}
              {selectedColumns.includes("status") && <th className="border border-gray-200 px-6 py-4 text-left text-sm font-medium text-gray-50">Status</th>}
              {selectedColumns.includes("assigned") && <th className="border border-gray-200 px-6 py-4 text-center text-sm font-medium text-gray-50">Assigned</th>}
              {selectedColumns.includes("username") && <th className="border border-gray-200 px-6 py-4 text-left text-sm font-medium text-gray-50">Username</th>}
              {selectedColumns.includes("gender") && <th className="border border-gray-200 px-6 py-4 text-left text-sm font-medium text-gray-50">Gender</th>}
              {selectedColumns.includes("position") && <th className="border border-gray-200 px-6 py-4 text-left text-sm font-medium text-gray-50">Position</th>}
              {selectedColumns.includes("terms") && <th className="border border-gray-200 px-6 py-4 text-left text-sm font-medium text-gray-50">Terms</th>}
              {selectedColumns.includes("joiningDate") && <th className="border border-gray-200 px-6 py-4 text-left text-sm font-medium text-gray-50">Joining Date</th>}
              {selectedColumns.includes("estSalary") && <th className="border border-gray-200 px-6 py-4 text-left text-sm font-medium text-gray-50">Est Salary</th>}
              {selectedColumns.includes("ot") && <th className="border border-gray-200 px-6 py-4 text-left text-sm font-medium text-gray-50">OT</th>}
              {selectedColumns.includes("actions") && <th className="border border-gray-200 px-6 py-4 text-center text-sm font-medium text-gray-50">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white">
            {loadingUsers ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  {selectedColumns.map((col) => (
                    <td key={col} className="border border-gray-200 px-4 py-2">
                      {col === "profile" ? (
                        <Skeleton className="h-8 w-8 rounded-full mx-auto" />
                      ) : (
                        <Skeleton className="h-4 w-full" />
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              filteredUsers.map((user, idx) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  {selectedColumns.includes("id") && <td className="border border-gray-200 px-4 py-2 text-center">{idx + 1}</td>}
                  {selectedColumns.includes("profile") && (
                    <td className="border border-gray-200 px-4 py-2 text-center">
                      <Image src={user.profile_picture || avatar} alt="Profile" width={32} height={32} className="rounded-full" />
                    </td>
                  )}
                  {selectedColumns.includes("name") && (
                    <td className="border border-gray-200 px-6 py-3 whitespace-nowrap">
                      <Link href={`/users/profile/${user.id}`} className="text-cyan-700 hover:text-cyan-900 block">
                        {user.first_name} {user.last_name}
                      </Link>
                      <div className="text-xs text-gray-500 mt-1">{user.email}</div>
                    </td>
                  )}
                  {selectedColumns.includes("role") && <td className="border border-gray-200 px-6 py-3 whitespace-nowrap">{user.role?.name || "—"}</td>}
                  {selectedColumns.includes("access") && (
                    <td className="border border-gray-200 px-6 py-3 whitespace-nowrap flex items-center">
                      {editingAccessUserId === user.id ? (
                        <select
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                          defaultValue={user.access ?? "Low Access"}
                          onChange={(e) => handleAccessChange(user.id, e.target.value as any)}
                          onBlur={() => setEditingAccessUserId(null)}
                        >
                          <option>Low Access</option>
                          <option>Average Access</option>
                          <option>Full Access</option>
                        </select>
                      ) : (
                        <>
                          <span>{user.access || "Low Access"}</span>
                          <button onClick={() => setEditingAccessUserId(user.id)} className="ml-2 text-xs text-blue-600">
                            <Edit2 />
                          </button>
                        </>
                      )}
                    </td>
                  )}
                  {selectedColumns.includes("department") && <td className="border border-gray-200 px-6 py-3 whitespace-nowrap">{user.department?.name || "—"}</td>}
                  {selectedColumns.includes("site") && <td className="border border-gray-200 px-6 py-3 whitespace-nowrap">{user.site?.name || "—"}</td>}
                  {selectedColumns.includes("phone") && <td className="border border-gray-200 px-6 py-3 whitespace-nowrap">{user.phone}</td>}
                  {selectedColumns.includes("status") && <td className="border border-gray-200 px-6 py-3 whitespace-nowrap">{user.status || "Active"}</td>}
                  {selectedColumns.includes("assigned") && (
                    <td className="border border-gray-200 px-6 py-3 whitespace-nowrap text-center flex space-x-2 justify-center">
                      <AssignBadge name="Projects" count={user.projects?.length ?? 0} />
                      <AssignBadge name="Tasks" count={user.tasks?.length ?? 0} />
                      <AssignBadge name="Activities" count={user.activities?.length ?? 0} />
                    </td>
                  )}
                  {selectedColumns.includes("username") && <td className="border border-gray-200 px-6 py-3 whitespace-nowrap">{user.username || "—"}</td>}
                  {selectedColumns.includes("gender") && <td className="border border-gray-200 px-6 py-3 whitespace-nowrap">{user.gender || "—"}</td>}
                  {selectedColumns.includes("position") && <td className="border border-gray-200 px-6 py-3 whitespace-nowrap">{user.position || "—"}</td>}
                  {selectedColumns.includes("terms") && <td className="border border-gray-200 px-6 py-3 whitespace-nowrap">{user.terms || "—"}</td>}
                  {selectedColumns.includes("joiningDate") && <td className="border border-gray-200 px-6 py-3 whitespace-nowrap">{user.joiningDate ? new Date(user.joiningDate).toISOString().slice(0, 10) : "—"}</td>}
                  {selectedColumns.includes("estSalary") && <td className="border border-gray-200 px-6 py-3 whitespace-nowrap">{user.estSalary || "—"}</td>}
                  {selectedColumns.includes("ot") && <td className="border border-gray-200 px-6 py-3 whitespace-nowrap">{user.ot || "—"}</td>}
                  {selectedColumns.includes("actions") && (
                    <td className="px-4 py-2 whitespace-nowrap">
                      <Menu>
                        <MenuButton className="flex items-center gap-1 px-3 py-1 text-sm bg-cyan-700 text-white rounded hover:bg-cyan-800">
                          Action <ChevronDown className="w-4 h-4" />
                        </MenuButton>
                        <MenuItems className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                          <MenuItem>
                            {({ focus }) => (
                              <button
                                className={`block w-full px-4 py-2 text-left ${focus ? "bg-blue-100" : ""}`}
                                onClick={() => { setUserToEdit(user); setShowEditForm(true); }}
                              >
                                Update
                              </button>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ focus }) => (
                              <button
                                className={`block w-full px-4 py-2 text-left ${focus ? "bg-blue-100" : ""}`}
                                onClick={() => handleDeleteUserClick(user.id)}
                              >
                                Delete
                              </button>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ focus }) => (
                              <button
                                className={`block w-full px-4 py-2 text-left ${focus ? "bg-blue-100" : ""}`}
                                onClick={() => handleViewUser(user.id)}
                              >
                                Quick View
                              </button>
                            )}
                          </MenuItem>
                        </MenuItems>
                      </Menu>
                    </td>
                  )}             
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Modal */}
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
